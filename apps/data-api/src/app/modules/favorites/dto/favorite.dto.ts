import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Vinyl } from '@vinylplatz/entities';

export class FavoriteResponseDto {
  @ApiProperty({ type: [Vinyl], description: 'List of favorite vinyls' })
  favorites: Vinyl[];
}

export class FavoriteToggleResponseDto {
  @ApiProperty({ example: true, description: 'Whether the vinyl is favorited' })
  isFavorited: boolean;

  @ApiProperty({ example: 'Vinyl added to favorites', description: 'Message about the operation' })
  message: string;
}

export class FavoriteStatusDto {
  @ApiProperty({ example: true, description: 'Whether the vinyl is favorited by the current user' })
  isFavorited: boolean;
}
