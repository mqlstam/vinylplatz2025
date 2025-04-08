import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Vinyl } from '@vinylplatz/entities';
import { UserService } from '../user/user.service';
import { VinylService } from '../vinyl/vinyl.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UserService,
    private vinylService: VinylService,
  ) {}

  async getFavorites(userId: string): Promise<Vinyl[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites', 'favorites.genre', 'favorites.seller'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.favorites || [];
  }

  async addFavorite(userId: string, vinylId: string): Promise<boolean> {
    // Get the user with favorites relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get the vinyl
    const vinyl = await this.vinylService.findOne(vinylId);

    // Initialize favorites array if it doesn't exist
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
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if favorites exist
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

    if (!user || !user.favorites) {
      return false;
    }

    return user.favorites.some(favorite => favorite.id === vinylId);
  }
}
