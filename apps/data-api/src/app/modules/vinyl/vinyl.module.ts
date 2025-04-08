import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vinyl } from '@vinylplatz/entities';
import { VinylService } from './vinyl.service';
import { VinylController } from './vinyl.controller';
import { UserModule } from '../user/user.module';
import { GenreModule } from '../genre/genre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vinyl]),
    UserModule,
    GenreModule
  ],
  controllers: [VinylController],
  providers: [VinylService],
  exports: [VinylService],
})
export class VinylModule {}
