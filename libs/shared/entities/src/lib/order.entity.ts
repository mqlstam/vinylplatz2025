import { 
  Column, 
  Entity, 
  ManyToOne,
  JoinColumn, 
  PrimaryGeneratedColumn,
  CreateDateColumn 
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity'; // Ensure this path is correct relative to order.entity.ts
import { Vinyl } from './vinyl.entity'; // Ensure this path is correct relative to order.entity.ts

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the order' })
  id!: string; // Added definite assignment assertion

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl at the time of order' 
  })
  price!: number; // Added definite assignment assertion

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  @ApiProperty({ 
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'The status of the order'
  })
  status!: OrderStatus; // Added definite assignment assertion

  @CreateDateColumn()
  @ApiProperty({ 
    description: 'The date when the order was created' 
  })
  orderDate!: Date; // Added definite assignment assertion

  // Added explicit type (user: User)
  @ManyToOne(() => User, (user: User) => user.purchases)
  @JoinColumn({ name: 'buyerId' })
  @ApiProperty({ 
    description: 'The user who bought this vinyl'
  })
  buyer!: User; // Added definite assignment assertion

  @Column()
  buyerId!: string; // Added definite assignment assertion

  // Added explicit type (user: User)
  @ManyToOne(() => User, (user: User) => user.sales)
  @JoinColumn({ name: 'sellerId' })
  @ApiProperty({ 
    description: 'The user who sold this vinyl'
  })
  seller!: User; // Added definite assignment assertion

  @Column()
  sellerId!: string; // Added definite assignment assertion

  // Added explicit type (vinyl: Vinyl)
  @ManyToOne(() => Vinyl, (vinyl: Vinyl) => vinyl.orders)
  @JoinColumn({ name: 'vinylId' })
  @ApiProperty({ 
    description: 'The vinyl being ordered'
  })
  vinyl!: Vinyl; // Added definite assignment assertion

  @Column()
  vinylId!: string; // Added definite assignment assertion
}
