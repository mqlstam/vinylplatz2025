import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { User } from '../../entities';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await user.comparePassword(password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword as any,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create new user
    const newUser = await this.userService.create(registerDto);
    
    // Generate JWT token
    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword as any,
    };
  }
}
