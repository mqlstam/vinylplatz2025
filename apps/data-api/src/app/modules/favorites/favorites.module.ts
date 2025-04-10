import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Vinyl } from '../../entities'; // Corrected import path
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { UserModule } from '../user/user.module';
import { VinylModule } from '../vinyl/vinyl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vinyl]), // Use actual entity classes
    UserModule,
    VinylModule
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
