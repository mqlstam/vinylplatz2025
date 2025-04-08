import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vinyl } from './vinyl.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the genre' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'Rock', description: 'The name of the genre' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ 
    example: 'Rock music is a broad genre of popular music that originated as "rock and roll"', 
    description: 'Optional description of the genre',
    required: false 
  })
  description?: string;
  
  @OneToMany(() => Vinyl, vinyl => vinyl.genre)
  vinyls: Vinyl[];
}
