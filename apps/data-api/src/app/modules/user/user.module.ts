import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities'; // Corrected import path

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Use actual entity class
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
