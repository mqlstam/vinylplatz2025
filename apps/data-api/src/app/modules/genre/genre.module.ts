import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from '../../entities'; // Corrected import path
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Genre])], // Use actual entity class
  controllers: [GenreController],
  providers: [GenreService],
  exports: [GenreService],
})
export class GenreModule {}
