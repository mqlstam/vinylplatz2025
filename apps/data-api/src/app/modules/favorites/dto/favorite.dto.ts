import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Vinyl } from '../../../entities'; // Use entity class if needed for types like Vinyl

export class FavoriteResponseDto {
  // Type definition might need adjustment if complex nesting is involved,
  // but referencing the Vinyl entity class for the type hint is generally okay here.
  @ApiProperty({ type: () => Vinyl, isArray: true, description: 'List of favorite vinyls' })
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
