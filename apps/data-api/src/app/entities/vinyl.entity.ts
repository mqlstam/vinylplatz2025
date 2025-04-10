import { 
  Column, 
  Entity, 
  ManyToOne,
  ManyToMany, 
  OneToMany,
  JoinColumn, 
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Genre } from './genre.entity';
import { Order } from './order.entity';

export enum VinylCondition {
  MINT = 'Mint',
  NEAR_MINT = 'Near Mint',
  EXCELLENT = 'Excellent',
  VERY_GOOD_PLUS = 'Very Good Plus', 
  VERY_GOOD = 'Very Good',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

@Entity('vinyls')
export class Vinyl {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the vinyl' })
  id!: string;

  @Column()
  @ApiProperty({ example: 'Thriller', description: 'The title of the vinyl album' })
  title!: string;

  @Column()
  @ApiProperty({ example: 'Michael Jackson', description: 'The artist of the vinyl album' })
  artist!: string;

  @Column({ nullable: true })
  @ApiProperty({ 
    example: 1982, 
    description: 'The release year of the vinyl album',
    required: false
  })
  releaseYear?: number;

  @Column({
    type: 'enum',
    enum: VinylCondition,
    default: VinylCondition.GOOD
  })
  @ApiProperty({ 
    enum: VinylCondition,
    example: VinylCondition.VERY_GOOD,
    description: 'The condition of the vinyl'
  })
  condition!: VinylCondition;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl' 
  })
  price!: number;

  @Column({ nullable: true, type: 'text' })
  @ApiProperty({ 
    example: 'Great album in excellent condition with original sleeve', 
    description: 'Description of the vinyl',
    required: false 
  })
  description?: string;

  @Column({ nullable: true })
  @ApiProperty({ 
    example: 'https://example.com/thriller.jpg', 
    description: 'URL to the vinyl cover image',
    required: false 
  })
  coverImageUrl?: string;

  @ManyToOne(() => User, (user: User) => user.vinyls)
  @JoinColumn({ name: 'sellerId' })
  @ApiProperty({ 
    description: 'The user who is selling this vinyl'
  })
  seller!: User;

  @Column()
  sellerId!: string;

  @ManyToOne(() => Genre, (genre: Genre) => genre.vinyls, { nullable: true })
  @JoinColumn({ name: 'genreId' })
  @ApiProperty({ 
    description: 'The genre of the vinyl',
    required: false
  })
  genre?: Genre;

  @Column({ nullable: true })
  genreId?: string;

  @OneToMany(() => Order, (order: Order) => order.vinyl)
  orders!: Order[];

  @ManyToMany(() => User, (user: User) => user.favorites)
  favoritedBy!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
