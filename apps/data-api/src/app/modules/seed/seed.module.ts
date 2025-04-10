import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Genre, Vinyl, Order } from '../../entities';
import { SeedService } from './seed.service';
// Import other modules if their services are needed for complex seeding logic,
// but for basic repository access, TypeOrmModule.forFeature is sufficient.

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Genre, Vinyl, Order]),
  ],
  providers: [SeedService],
  exports: [SeedService], // Export if needed elsewhere, though likely not for seeding
})
export class SeedModule {}
