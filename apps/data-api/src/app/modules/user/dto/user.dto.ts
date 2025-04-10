import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../types/entity-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'http://example.com/profile.jpg', required: false })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'http://example.com/profile.jpg', required: false })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  profileImage?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  registrationDate: Date;
}
