import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { VinylService } from './vinyl.service';
import { CreateVinylDto, UpdateVinylDto, VinylResponseDto } from './dto/vinyl.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Vinyl, VinylCondition } from '@vinylplatz/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('vinyls')
@Controller('vinyls')
export class VinylController {
  constructor(private readonly vinylService: VinylService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vinyls with optional filtering' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Filter by seller ID' })
  @ApiQuery({ name: 'genreId', required: false, description: 'Filter by genre ID' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by title (partial match)' })
  @ApiQuery({ name: 'artist', required: false, description: 'Filter by artist (partial match)' })
  @ApiQuery({ name: 'condition', required: false, enum: VinylCondition, description: 'Filter by condition' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Filter by minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Filter by maximum price' })
  @ApiResponse({ status: 200, description: 'Return all vinyls matching the filters', type: [VinylResponseDto] })
  async findAll(@Query() query: any): Promise<Vinyl[]> {
    return this.vinylService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vinyl by id' })
  @ApiResponse({ status: 200, description: 'Return the vinyl', type: VinylResponseDto })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  async findOne(@Param('id') id: string): Promise<Vinyl> {
    return this.vinylService.findOne(id);
  }

  @Get('seller/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all vinyls listed by the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all vinyls by the current user', type: [VinylResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyVinyls(@Request() req): Promise<Vinyl[]> {
    return this.vinylService.findBySeller(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new vinyl listing' })
  @ApiResponse({ status: 201, description: 'The vinyl has been successfully created', type: VinylResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createVinylDto: CreateVinylDto): Promise<Vinyl> {
    return this.vinylService.create(req.user.id, createVinylDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a vinyl listing' })
  @ApiResponse({ status: 200, description: 'The vinyl has been successfully updated', type: VinylResponseDto })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only update your own vinyl listings' })
  async update(
    @Param('id') id: string, 
    @Request() req, 
    @Body() updateVinylDto: UpdateVinylDto
  ): Promise<Vinyl> {
    return this.vinylService.update(id, req.user.id, updateVinylDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a vinyl listing' })
  @ApiResponse({ status: 200, description: 'The vinyl has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only delete your own vinyl listings' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.vinylService.remove(id, req.user.id);
  }
}
