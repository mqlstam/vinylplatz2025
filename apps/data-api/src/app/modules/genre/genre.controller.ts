import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto, UpdateGenreDto, GenreResponseDto } from './dto/genre.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Genre } from '@vinylplatz/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@vinylplatz/entities';

@ApiTags('genres')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  @ApiOperation({ summary: 'Get all genres' })
  @ApiQuery({ name: 'search', required: false, description: 'Optional search term to filter genres by name' })
  @ApiResponse({ status: 200, description: 'Return all genres', type: [GenreResponseDto] })
  async findAll(@Query('search') search?: string): Promise<Genre[]> {
    return this.genreService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a genre by id' })
  @ApiResponse({ status: 200, description: 'Return the genre', type: GenreResponseDto })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  async findOne(@Param('id') id: string): Promise<Genre> {
    return this.genreService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new genre (Admin only)' })
  @ApiResponse({ status: 201, description: 'The genre has been successfully created', type: GenreResponseDto })
  @ApiResponse({ status: 409, description: 'Genre with this name already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createGenreDto: CreateGenreDto): Promise<Genre> {
    return this.genreService.create(createGenreDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a genre (Admin only)' })
  @ApiResponse({ status: 200, description: 'The genre has been successfully updated', type: GenreResponseDto })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  @ApiResponse({ status: 409, description: 'Genre with this name already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto): Promise<Genre> {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a genre (Admin only)' })
  @ApiResponse({ status: 200, description: 'The genre has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.genreService.remove(id);
  }
}
