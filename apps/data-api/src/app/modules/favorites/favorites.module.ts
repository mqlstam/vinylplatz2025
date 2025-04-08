import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Vinyl } from '@vinylplatz/entities';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { UserModule } from '../user/user.module';
import { VinylModule } from '../vinyl/vinyl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vinyl]),
    UserModule,
    VinylModule
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
