import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities'; // Corrected import path
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { VinylModule } from '../vinyl/vinyl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]), // Use actual entity class
    VinylModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
