import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { VinylCondition } from '@vinylplatz/entities';

export class CreateVinylDto {
  @ApiProperty({ example: 'Thriller', description: 'The title of the vinyl album' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Michael Jackson', description: 'The artist of the vinyl album' })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiProperty({ 
    example: 1982, 
    description: 'The release year of the vinyl album',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  releaseYear?: number;

  @ApiProperty({ 
    enum: VinylCondition,
    example: VinylCondition.VERY_GOOD,
    description: 'The condition of the vinyl'
  })
  @IsEnum(VinylCondition)
  @IsNotEmpty()
  condition: VinylCondition;

  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl' 
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ 
    example: 'Great album in excellent condition with original sleeve', 
    description: 'Description of the vinyl',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 'https://example.com/thriller.jpg', 
    description: 'URL to the vinyl cover image',
    required: false 
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({ 
    description: 'The ID of the genre for this vinyl',
    required: false
  })
  @IsString()
  @IsOptional()
  genreId?: string;
}

export class UpdateVinylDto {
  @ApiProperty({ example: 'Thriller', description: 'The title of the vinyl album', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Michael Jackson', description: 'The artist of the vinyl album', required: false })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiProperty({ 
    example: 1982, 
    description: 'The release year of the vinyl album',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  releaseYear?: number;

  @ApiProperty({ 
    enum: VinylCondition,
    example: VinylCondition.VERY_GOOD,
    description: 'The condition of the vinyl',
    required: false
  })
  @IsEnum(VinylCondition)
  @IsOptional()
  condition?: VinylCondition;

  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({ 
    example: 'Great album in excellent condition with original sleeve', 
    description: 'Description of the vinyl',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 'https://example.com/thriller.jpg', 
    description: 'URL to the vinyl cover image',
    required: false 
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({ 
    description: 'The ID of the genre for this vinyl',
    required: false
  })
  @IsString()
  @IsOptional()
  genreId?: string;
}

export class VinylResponseDto {
  @ApiProperty({ description: 'The unique identifier of the vinyl' })
  id: string;

  @ApiProperty({ example: 'Thriller', description: 'The title of the vinyl album' })
  title: string;

  @ApiProperty({ example: 'Michael Jackson', description: 'The artist of the vinyl album' })
  artist: string;

  @ApiProperty({ 
    example: 1982, 
    description: 'The release year of the vinyl album',
    required: false
  })
  releaseYear?: number;

  @ApiProperty({ 
    enum: VinylCondition,
    example: VinylCondition.VERY_GOOD,
    description: 'The condition of the vinyl'
  })
  condition: VinylCondition;

  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl' 
  })
  price: number;

  @ApiProperty({ 
    example: 'Great album in excellent condition with original sleeve', 
    description: 'Description of the vinyl',
    required: false 
  })
  description?: string;

  @ApiProperty({ 
    example: 'https://example.com/thriller.jpg', 
    description: 'URL to the vinyl cover image',
    required: false 
  })
  coverImageUrl?: string;

  @ApiProperty({ 
    description: 'The user who is selling this vinyl'
  })
  seller: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({ 
    description: 'The genre of the vinyl',
    required: false
  })
  genre?: {
    id: string;
    name: string;
  };
}

export class PaginatedVinylsResponseDto {
  @ApiProperty({ type: [VinylResponseDto], description: 'List of vinyl records' })
  items: VinylResponseDto[];

  @ApiProperty({ example: 100, description: 'Total number of vinyl records matching the criteria' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 12, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 9, description: 'Total number of pages' })
  totalPages: number;
}
