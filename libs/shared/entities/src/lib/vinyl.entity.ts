import { 
  Column, 
  Entity, 
  ManyToOne,
  ManyToMany, 
  OneToMany,
  JoinColumn, 
  PrimaryGeneratedColumn,
  CreateDateColumn, // Added for potential sorting/filtering
  UpdateDateColumn // Added for potential sorting/filtering
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity'; // Ensure this path is correct relative to vinyl.entity.ts
import { Genre } from './genre.entity'; // Ensure this path is correct relative to vinyl.entity.ts
import { Order } from './order.entity'; // Ensure this path is correct relative to vinyl.entity.ts

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
  id!: string; // Added definite assignment assertion

  @Column()
  @ApiProperty({ example: 'Thriller', description: 'The title of the vinyl album' })
  title!: string; // Added definite assignment assertion

  @Column()
  @ApiProperty({ example: 'Michael Jackson', description: 'The artist of the vinyl album' })
  artist!: string; // Added definite assignment assertion

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
  condition!: VinylCondition; // Added definite assignment assertion

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ 
    example: 29.99, 
    description: 'The price of the vinyl' 
  })
  price!: number; // Added definite assignment assertion

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

  // Added explicit type (user: User)
  @ManyToOne(() => User, (user: User) => user.vinyls)
  @JoinColumn({ name: 'sellerId' })
  @ApiProperty({ 
    description: 'The user who is selling this vinyl'
  })
  seller!: User; // Added definite assignment assertion

  @Column()
  sellerId!: string; // Added definite assignment assertion

  // Added explicit type (genre: Genre)
  @ManyToOne(() => Genre, (genre: Genre) => genre.vinyls, { nullable: true })
  @JoinColumn({ name: 'genreId' })
  @ApiProperty({ 
    description: 'The genre of the vinyl',
    required: false
  })
  genre?: Genre;

  @Column({ nullable: true })
  genreId?: string;

  // Added explicit type (order: Order)
  @OneToMany(() => Order, (order: Order) => order.vinyl)
  orders!: Order[]; // Added definite assignment assertion

  // Added explicit type (user: User)
  @ManyToMany(() => User, (user: User) => user.favorites)
  favoritedBy!: User[]; // Added definite assignment assertion

  @CreateDateColumn()
  createdAt!: Date; // Added definite assignment assertion

  @UpdateDateColumn()
  updatedAt!: Date; // Added definite assignment assertion
}
