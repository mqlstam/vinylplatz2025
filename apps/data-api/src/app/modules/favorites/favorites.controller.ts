import { Controller, Get, Post, Delete, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Vinyl } from '@vinylplatz/entities';
import { FavoriteResponseDto, FavoriteToggleResponseDto, FavoriteStatusDto } from './dto/favorite.dto';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all favorite vinyls for the current user' })
  @ApiResponse({ status: 200, description: 'Return all favorited vinyls', type: FavoriteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFavorites(@Request() req): Promise<Vinyl[]> {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':vinylId/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if a vinyl is favorited by the current user' })
  @ApiParam({ name: 'vinylId', description: 'The ID of the vinyl to check' })
  @ApiResponse({ status: 200, description: 'Returns favorite status', type: FavoriteStatusDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkFavoriteStatus(@Request() req, @Param('vinylId') vinylId: string): Promise<FavoriteStatusDto> {
    const isFavorited = await this.favoritesService.isFavorited(req.user.id, vinylId);
    return { isFavorited };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':vinylId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a vinyl to the current user\'s favorites' })
  @ApiParam({ name: 'vinylId', description: 'The ID of the vinyl to add to favorites' })
  @ApiResponse({ status: 200, description: 'Vinyl has been added to favorites', type: FavoriteToggleResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  async addFavorite(@Request() req, @Param('vinylId') vinylId: string): Promise<FavoriteToggleResponseDto> {
    const success = await this.favoritesService.addFavorite(req.user.id, vinylId);
    return {
      isFavorited: true,
      message: success ? 'Vinyl added to favorites' : 'Vinyl already in favorites'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':vinylId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a vinyl from the current user\'s favorites' })
  @ApiParam({ name: 'vinylId', description: 'The ID of the vinyl to remove from favorites' })
  @ApiResponse({ status: 200, description: 'Vinyl has been removed from favorites', type: FavoriteToggleResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeFavorite(@Request() req, @Param('vinylId') vinylId: string): Promise<FavoriteToggleResponseDto> {
    const success = await this.favoritesService.removeFavorite(req.user.id, vinylId);
    return {
      isFavorited: false,
      message: success ? 'Vinyl removed from favorites' : 'Vinyl was not in favorites'
    };
  }
}
