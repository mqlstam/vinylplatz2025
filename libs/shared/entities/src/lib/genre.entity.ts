import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vinyl } from './vinyl.entity'; // Ensure this path is correct relative to genre.entity.ts

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the genre' })
  id!: string; // Added definite assignment assertion

  @Column({ unique: true })
  @ApiProperty({ example: 'Rock', description: 'The name of the genre' })
  name!: string; // Added definite assignment assertion

  @Column({ nullable: true })
  @ApiProperty({ 
    example: 'Rock music is a broad genre of popular music that originated as "rock and roll"', 
    description: 'Optional description of the genre',
    required: false 
  })
  description?: string;
  
  // Added explicit type (vinyl: Vinyl)
  @OneToMany(() => Vinyl, (vinyl: Vinyl) => vinyl.genre)
  vinyls!: Vinyl[]; // Added definite assignment assertion
}
