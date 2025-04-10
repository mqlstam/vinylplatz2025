import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, Vinyl } from '../../entities'; // Corrected import path
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto } from './dto/order.dto';
import { VinylService } from '../vinyl/vinyl.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) // Use actual entity class
    private orderRepository: Repository<Order>,
    private vinylService: VinylService,
  ) {}

  async findAll(userId: string, filters?: OrderFilterDto): Promise<Order[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.vinyl', 'vinyl');

    // Apply user filter (either buyer or seller or both)
    if (filters?.asBuyer && filters?.asSeller) {
      queryBuilder.where('(order.buyerId = :userId OR order.sellerId = :userId)', { userId });
    } else if (filters?.asBuyer) {
      queryBuilder.where('order.buyerId = :userId', { userId });
    } else if (filters?.asSeller) {
      queryBuilder.where('order.sellerId = :userId', { userId });
    } else {
      // Default: show orders where user is either buyer or seller
      queryBuilder.where('(order.buyerId = :userId OR order.sellerId = :userId)', { userId });
    }

    // Filter by status if provided
    if (filters?.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }

    // Order by most recent first
    queryBuilder.orderBy('order.orderDate', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller', 'vinyl'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user is related to this order (buyer or seller)
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return order;
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Get the vinyl
    const vinyl = await this.vinylService.findOne(createOrderDto.vinylId);

    // Check if user is trying to buy their own vinyl
    if (vinyl.sellerId === userId) {
      throw new BadRequestException('You cannot buy your own vinyl');
    }

    // Create a new order
    const order = this.orderRepository.create({
      price: vinyl.price, // Snapshot current price
      status: OrderStatus.PENDING,
      buyerId: userId,
      sellerId: vinyl.sellerId,
      vinylId: vinyl.id,
    });

    return this.orderRepository.save(order);
  }

  async updateStatus(id: string, userId: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id, userId);

    // Only seller can update order status
    if (order.sellerId !== userId) {
      throw new ForbiddenException('Only the seller can update the order status');
    }

    // Check for valid status transitions
    this.validateStatusTransition(order.status, updateStatusDto.status);

    // Update status
    order.status = updateStatusDto.status;
    return this.orderRepository.save(order);
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Define valid transitions
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [], // Terminal state
      [OrderStatus.CANCELLED]: [], // Terminal state
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        // Added error message here
        
      );
    }
  }
}
