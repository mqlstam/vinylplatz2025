import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newPassword123', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'http://example.com/profile.jpg', required: false })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
