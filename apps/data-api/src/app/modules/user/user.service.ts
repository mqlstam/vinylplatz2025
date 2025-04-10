import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities'; // Corrected import path
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // Use actual entity class
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update user properties
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(userId);

    // Check if email is being updated and is not already in use
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update user properties
    // Only update fields that are provided in the DTO
    if (updateProfileDto.name) user.name = updateProfileDto.name;
    if (updateProfileDto.email) user.email = updateProfileDto.email;
    if (updateProfileDto.profileImage) user.profileImage = updateProfileDto.profileImage;
    if (updateProfileDto.address) user.address = updateProfileDto.address;

    // The password will be automatically hashed by the entity's BeforeUpdate hook
    if (updateProfileDto.password) {
      user.password = updateProfileDto.password;
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
