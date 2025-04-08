import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({ example: 'Rock', description: 'The name of the genre' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'Rock music is a broad genre of popular music that originated as "rock and roll"', 
    description: 'Optional description of the genre',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateGenreDto {
  @ApiProperty({ example: 'Rock', description: 'The name of the genre', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    example: 'Rock music is a broad genre of popular music that originated as "rock and roll"', 
    description: 'Optional description of the genre',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class GenreResponseDto {
  @ApiProperty({ description: 'The unique identifier of the genre' })
  id: string;

  @ApiProperty({ example: 'Rock', description: 'The name of the genre' })
  name: string;

  @ApiProperty({ 
    example: 'Rock music is a broad genre of popular music that originated as "rock and roll"', 
    description: 'Optional description of the genre',
    required: false 
  })
  description?: string;
}
