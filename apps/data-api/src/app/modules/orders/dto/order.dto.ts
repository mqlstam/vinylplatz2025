import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../../../types/entity-types';

export class CreateOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the vinyl to order' })
  @IsUUID()
  vinylId: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus,
    example: OrderStatus.PAID,
    description: 'New status for the order'
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class OrderFilterDto {
  @ApiProperty({ 
    enum: OrderStatus, 
    required: false, 
    description: 'Filter by order status' 
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ required: false, description: 'Filter orders as a buyer' })
  @IsOptional()
  asBuyer?: boolean;

  @ApiProperty({ required: false, description: 'Filter orders as a seller' })
  @IsOptional()
  asSeller?: boolean;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  orderDate: Date;

  @ApiProperty()
  buyer: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty()
  seller: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty()
  vinyl: {
    id: string;
    title: string;
    artist: string;
    coverImageUrl?: string;
  };
}
