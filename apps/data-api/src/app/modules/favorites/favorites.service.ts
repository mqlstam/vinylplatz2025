import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Vinyl } from '../../entities'; // Corrected import path
import { UserService } from '../user/user.service';
import { VinylService } from '../vinyl/vinyl.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(User) // Use actual entity class
    private userRepository: Repository<User>,
    private userService: UserService,
    private vinylService: VinylService,
  ) {}

  async getFavorites(userId: string): Promise<Vinyl[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites', 'favorites.genre', 'favorites.seller'], // Accessing the relation defined in the User entity class
    });

    if (!user) {
      throw new NotFoundException();
    }

    // The 'favorites' property exists on the User class entity
    return user.favorites || [];
  }

  async addFavorite(userId: string, vinylId: string): Promise<boolean> {
    // Get the user with favorites relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException();
    }

    // Get the vinyl
    const vinyl = await this.vinylService.findOne(vinylId);

    // Initialize favorites array if it doesn't exist (it should exist based on the class definition)
    if (!user.favorites) {
      user.favorites = [];
    }

    // Check if vinyl is already in favorites
    const alreadyFavorited = user.favorites.some(fav => fav.id === vinylId);
    if (alreadyFavorited) {
      return true; // Already favorited, nothing to do
    }

    // Add vinyl to favorites
    user.favorites.push(vinyl);
    await this.userRepository.save(user);
    return true;
  }

  async removeFavorite(userId: string, vinylId: string): Promise<boolean> {
    // Get the user with favorites relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException();
    }

    // Check if favorites exist (it should exist based on the class definition)
    if (!user.favorites || user.favorites.length === 0) {
      return false; // No favorites, nothing to remove
    }

    // Filter out the vinyl to remove
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(favorite => favorite.id !== vinylId);

    // If nothing was removed, return false
    if (user.favorites.length === initialLength) {
      return false;
    }

    // Save the updated user
    await this.userRepository.save(user);
    return true;
  }

  async isFavorited(userId: string, vinylId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    // Check if user and favorites exist (favorites should exist on the class entity)
    if (!user || !user.favorites) {
      return false;
    }

    return user.favorites.some(favorite => favorite.id === vinylId);
  }
}
