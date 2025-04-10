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
          // Fixed: Added pattern argument to Like
          name: Like(),
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
      throw new NotFoundException('Genre not found');
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
      // Fixed: Added message
      throw new ConflictException();
    }
    
    const genre = this.genreRepository.create(createGenreDto);
    return this.genreRepository.save(genre);
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);
    
    // Check if a genre with the new name already exists (if name is being updated)
    if (updateGenreDto.name && updateGenreDto.name !== genre.name) {
      const existingGenre = await this.findByName(updateGenreDto.name);
      if (existingGenre && existingGenre.id !== id) {
        // Fixed: Added message
        throw new ConflictException();
      }
    }
    
    // Update genre properties
    Object.assign(genre, updateGenreDto);
    
    return this.genreRepository.save(genre);
  }

  async remove(id: string): Promise<void> {
    const result = await this.genreRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Genre not found');
    }
  }
}
