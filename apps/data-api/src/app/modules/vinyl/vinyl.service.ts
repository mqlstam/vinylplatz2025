import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Vinyl } from '@vinylplatz/entities';
import { CreateVinylDto, UpdateVinylDto } from './dto/vinyl.dto';
import { UserService } from '../user/user.service';
import { GenreService } from '../genre/genre.service';

@Injectable()
export class VinylService {
  constructor(
    @InjectRepository(Vinyl)
    private vinylRepository: Repository<Vinyl>,
    private userService: UserService,
    private genreService: GenreService,
  ) {}

  async findAll(filters?: any): Promise<Vinyl[]> {
    // Create a query builder to get vinyls with related entities
    const queryBuilder = this.vinylRepository
      .createQueryBuilder('vinyl')
      .leftJoinAndSelect('vinyl.seller', 'seller')
      .leftJoinAndSelect('vinyl.genre', 'genre');

    // Apply filters if provided
    if (filters) {
      if (filters.sellerId) {
        queryBuilder.andWhere('vinyl.sellerId = :sellerId', { sellerId: filters.sellerId });
      }
      if (filters.genreId) {
        queryBuilder.andWhere('vinyl.genreId = :genreId', { genreId: filters.genreId });
      }
      if (filters.title) {
        queryBuilder.andWhere('vinyl.title LIKE :title', { title: `%${filters.title}%` });
      }
      if (filters.artist) {
        queryBuilder.andWhere('vinyl.artist LIKE :artist', { artist: `%${filters.artist}%` });
      }
      if (filters.condition) {
        queryBuilder.andWhere('vinyl.condition = :condition', { condition: filters.condition });
      }
      if (filters.minPrice !== undefined) {
        queryBuilder.andWhere('vinyl.price >= :minPrice', { minPrice: filters.minPrice });
      }
      if (filters.maxPrice !== undefined) {
        queryBuilder.andWhere('vinyl.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }
    }

    // Execute the query
    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Vinyl> {
    const vinyl = await this.vinylRepository.findOne({
      where: { id },
      relations: ['seller', 'genre']
    });
    
    if (!vinyl) {
      throw new NotFoundException(`Vinyl with ID ${id} not found`);
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
    const seller = await this.userService.findOne(sellerId);
    
    // Check if genre exists if provided
    let genre = undefined;
    if (createVinylDto.genreId) {
      genre = await this.genreService.findOne(createVinylDto.genreId);
    }
    
    // Create the vinyl entity
    const vinyl = this.vinylRepository.create({
      ...createVinylDto,
      sellerId,
      genreId: genre?.id
    });
    
    // Save and return the vinyl with relations
    await this.vinylRepository.save(vinyl);
    
    // Fetch the saved vinyl with relations
    return this.findOne(vinyl.id);
  }

  async update(id: string, userId: string, updateVinylDto: UpdateVinylDto): Promise<Vinyl> {
    // Get the vinyl
    const vinyl = await this.findOne(id);
    
    // Check ownership
    if (vinyl.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own vinyl listings');
    }
    
    // Check if genre exists if provided
    if (updateVinylDto.genreId) {
      await this.genreService.findOne(updateVinylDto.genreId);
    }
    
    // Update the vinyl
    this.vinylRepository.merge(vinyl, updateVinylDto);
    
    // Save and return the updated vinyl
    await this.vinylRepository.save(vinyl);
    
    // Fetch the updated vinyl with relations
    return this.findOne(vinyl.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Get the vinyl
    const vinyl = await this.findOne(id);
    
    // Check ownership
    if (vinyl.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own vinyl listings');
    }
    
    // TODO: Check if vinyl is part of an order before deleting
    // For now, we'll just delete it
    
    const result = await this.vinylRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Vinyl with ID ${id} not found`);
    }
  }
}
