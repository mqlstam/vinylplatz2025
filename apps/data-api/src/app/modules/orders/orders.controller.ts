import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto, OrderResponseDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order, OrderStatus } from '@vinylplatz/entities';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders related to the current user' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false, description: 'Filter by order status' })
  @ApiQuery({ name: 'asBuyer', type: Boolean, required: false, description: 'Filter orders as a buyer' })
  @ApiQuery({ name: 'asSeller', type: Boolean, required: false, description: 'Filter orders as a seller' })
  @ApiResponse({ status: 200, description: 'Returns all orders related to the user', type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req, @Query() filters: OrderFilterDto): Promise<Order[]> {
    return this.ordersService.findAll(req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Returns the order', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - You do not have permission to view this order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Order> {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - You cannot buy your own vinyl' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (seller only)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'The order status has been successfully updated', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only the seller can update the order status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, req.user.id, updateStatusDto);
  }
}
