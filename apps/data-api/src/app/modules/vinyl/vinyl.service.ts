import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, ILike } from 'typeorm';
import { Vinyl, VinylCondition } from '../../entities'; // Corrected import path
import { CreateVinylDto, UpdateVinylDto } from './dto/vinyl.dto';
import { UserService } from '../user/user.service';
import { GenreService } from '../genre/genre.service';

export interface VinylFilterParams {
  title?: string;
  artist?: string;
  genreId?: string;
  sellerId?: string;
  condition?: VinylCondition; // Use enum from entity
  minPrice?: number;
  maxPrice?: number;
  releaseYear?: number;
  minReleaseYear?: number;
  maxReleaseYear?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedVinyls {
  items: Vinyl[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class VinylService {
  constructor(
    @InjectRepository(Vinyl) // Use actual entity class
    private vinylRepository: Repository<Vinyl>,
    private userService: UserService,
    private genreService: GenreService,
  ) {}

  async findAll(filters?: VinylFilterParams): Promise<PaginatedVinyls> {
    // Initialize query builder for vinyls with relations
    const queryBuilder = this.vinylRepository
      .createQueryBuilder('vinyl')
      .leftJoinAndSelect('vinyl.seller', 'seller')
      .leftJoinAndSelect('vinyl.genre', 'genre');

    // Default pagination values
    const page = filters?.page ? Number(filters.page) : 1;
    const limit = filters?.limit ? Number(filters.limit) : 12; // Default 12 items per page
    const skip = (page - 1) * limit;

    // Apply filters if provided
    if (filters) {
      // Text search filters (case-insensitive)
      if (filters.title) {
        // Corrected: Ensure the parameter object is correct
        queryBuilder.andWhere('LOWER(vinyl.title) LIKE LOWER(:title)', { title: `%${filters.title}%` });
      }

      if (filters.artist) {
        // Corrected: Ensure the parameter object is correct
        queryBuilder.andWhere('LOWER(vinyl.artist) LIKE LOWER(:artist)', { artist: `%${filters.artist}%` });
      }

      // Exact match filters
      if (filters.genreId) {
        queryBuilder.andWhere('vinyl.genreId = :genreId', { genreId: filters.genreId });
      }

      if (filters.sellerId) {
        queryBuilder.andWhere('vinyl.sellerId = :sellerId', { sellerId: filters.sellerId });
      }

      if (filters.condition) {
        queryBuilder.andWhere('vinyl.condition = :condition', { condition: filters.condition });
      }

      // Range filters
      if (filters.minPrice !== undefined) {
        queryBuilder.andWhere('vinyl.price >= :minPrice', { minPrice: filters.minPrice });
      }

      if (filters.maxPrice !== undefined) {
        queryBuilder.andWhere('vinyl.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }

      // Single year or year range
      if (filters.releaseYear !== undefined) {
        queryBuilder.andWhere('vinyl.releaseYear = :releaseYear', { releaseYear: filters.releaseYear });
      } else {
        if (filters.minReleaseYear !== undefined) {
          queryBuilder.andWhere('vinyl.releaseYear >= :minReleaseYear', { minReleaseYear: filters.minReleaseYear });
        }

        if (filters.maxReleaseYear !== undefined) {
          queryBuilder.andWhere('vinyl.releaseYear <= :maxReleaseYear', { maxReleaseYear: filters.maxReleaseYear });
        }
      }

      // Sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';

      // Apply sorting (with validation of sort column)
      const validSortColumns = ['title', 'artist', 'price', 'condition', 'releaseYear', 'createdAt'];
      if (validSortColumns.includes(sortBy)) {
        // Corrected: orderBy takes column name and order
        queryBuilder.orderBy(`vinyl.${sortBy}`, sortOrder);
      } else {
        // Default sorting by createdAt if invalid sort column
        // Corrected: orderBy takes column name and order
        queryBuilder.orderBy('vinyl.createdAt', 'DESC');
      }
    } else {
      // Default sorting if no filters provided
      // Corrected: orderBy takes column name and order
      queryBuilder.orderBy('vinyl.createdAt', 'DESC');
    }

    // Add pagination
    queryBuilder.skip(skip).take(limit);

    // Execute the query
    const [items, total] = await queryBuilder.getManyAndCount();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  }

  async findOne(id: string): Promise<Vinyl> {
    const vinyl = await this.vinylRepository.findOne({
      where: { id },
      relations: ['seller', 'genre']
    });

    if (!vinyl) {
      // Corrected: Added message to NotFoundException
      throw new NotFoundException(`Vinyl with ID "${id}" not found`);
    }

    return vinyl;
  }

  async findBySeller(sellerId: string): Promise<Vinyl[]> {
    return this.vinylRepository.find({
      where: { sellerId },
      relations: ['genre']
    });
  }

  async create(sellerId: string, createVinylDto: CreateVinylDto): Promise<Vinyl> {
    // Get the seller
    const seller = await this.userService.findOne(sellerId); // This throws NotFound if seller doesn't exist

    // Check if genre exists if provided
    let genre = undefined;
    if (createVinylDto.genreId) {
      genre = await this.genreService.findOne(createVinylDto.genreId); // This throws NotFound if genre doesn't exist
    }

    // Create the vinyl entity
    const vinyl = this.vinylRepository.create({
      ...createVinylDto,
      sellerId, // Use the validated sellerId
      genreId: genre?.id // Use the validated genreId
    });

    // Save and return the vinyl with relations
    await this.vinylRepository.save(vinyl);

    // Fetch the saved vinyl with relations to ensure they are loaded
    return this.findOne(vinyl.id);
  }

  async update(id: string, userId: string, updateVinylDto: UpdateVinylDto): Promise<Vinyl> {
    // Get the vinyl (also checks if it exists)
    const vinyl = await this.findOne(id);

    // Check ownership
    if (vinyl.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this vinyl listing');
    }

    // Check if genre exists if provided and is different
    if (updateVinylDto.genreId && updateVinylDto.genreId !== vinyl.genreId) {
      await this.genreService.findOne(updateVinylDto.genreId); // This throws NotFound if genre doesn't exist
    }

    // Update the vinyl
    this.vinylRepository.merge(vinyl, updateVinylDto);

    // Save and return the updated vinyl
    await this.vinylRepository.save(vinyl);

    // Fetch the updated vinyl with relations
    return this.findOne(vinyl.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Get the vinyl (also checks if it exists)
    const vinyl = await this.findOne(id);

    // Check ownership
    if (vinyl.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this vinyl listing');
    }

    // TODO: Check if vinyl is part of an ACTIVE order before deleting
    // Add logic here if needed

    const result = await this.vinylRepository.delete(id);
    if (result.affected === 0) {
      // Corrected: Added message to NotFoundException
      throw new NotFoundException(`Vinyl with ID "${id}" not found or delete operation failed`);
    }
  }
}