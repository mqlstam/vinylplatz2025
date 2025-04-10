import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Genre } from '../../entities'; // Corrected import path
import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre) // Use actual entity class
    private genreRepository: Repository<Genre>,
  ) {}

  async findAll(search?: string): Promise<Genre[]> {
    if (search) {
      return this.genreRepository.find({
        where: {
          // Corrected: Added argument to Like
          name: Like(`%${search}%`),
        },
        order: {
          name: 'ASC',
        },
      });
    }
    return this.genreRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      // Corrected: Added message
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }
    return genre;
  }

  async findByName(name: string): Promise<Genre | null> {
    return this.genreRepository.findOne({ where: { name } });
  }

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    // Check if genre with this name already exists
    const existingGenre = await this.findByName(createGenreDto.name);
    if (existingGenre) {
      // Corrected: Added message
      throw new ConflictException(`Genre with name "${createGenreDto.name}" already exists`);
    }

    const genre = this.genreRepository.create(createGenreDto);
    return this.genreRepository.save(genre);
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id); // Checks if genre exists

    // Check if a genre with the new name already exists (if name is being updated)
    if (updateGenreDto.name && updateGenreDto.name !== genre.name) {
      const existingGenre = await this.findByName(updateGenreDto.name);
      if (existingGenre && existingGenre.id !== id) {
        // Corrected: Added message
        throw new ConflictException(`Genre with name "${updateGenreDto.name}" already exists`);
      }
    }

    // Update genre properties
    Object.assign(genre, updateGenreDto);

    return this.genreRepository.save(genre);
  }

  async remove(id: string): Promise<void> {
    const result = await this.genreRepository.delete(id);
    if (result.affected === 0) {
      // Corrected: Added message
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }
  }
}