import { 
  Column, 
  Entity, 
  ManyToOne,
  JoinColumn, 
  PrimaryGeneratedColumn,
  CreateDateColumn 
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Vinyl } from './vinyl.entity';

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
  id!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl at the time of order' 
  })
  price!: number;

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
  status!: OrderStatus;

  @CreateDateColumn()
  @ApiProperty({ 
    description: 'The date when the order was created' 
  })
  orderDate!: Date;

  @ManyToOne(() => User, (user: User) => user.purchases)
  @JoinColumn({ name: 'buyerId' })
  @ApiProperty({ 
    description: 'The user who bought this vinyl'
  })
  buyer!: User;

  @Column()
  buyerId!: string;

  @ManyToOne(() => User, (user: User) => user.sales)
  @JoinColumn({ name: 'sellerId' })
  @ApiProperty({ 
    description: 'The user who sold this vinyl'
  })
  seller!: User;

  @Column()
  sellerId!: string;

  @ManyToOne(() => Vinyl, (vinyl: Vinyl) => vinyl.orders)
  @JoinColumn({ name: 'vinylId' })
  @ApiProperty({ 
    description: 'The vinyl being ordered'
  })
  vinyl!: Vinyl;

  @Column()
  vinylId!: string;
}
