import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vinyl } from '../../entities'; // Corrected import path
import { VinylService } from './vinyl.service';
import { VinylController } from './vinyl.controller';
import { UserModule } from '../user/user.module';
import { GenreModule } from '../genre/genre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vinyl]), // Use actual entity class
    UserModule,
    GenreModule
  ],
  controllers: [VinylController],
  providers: [VinylService],
  exports: [VinylService],
})
export class VinylModule {}
