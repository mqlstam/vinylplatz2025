import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@vinylplatz/entities';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { VinylModule } from '../vinyl/vinyl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    VinylModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
