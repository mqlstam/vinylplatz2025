import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Genre, Vinyl, Order } from '../../entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Genre, Vinyl, Order]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
