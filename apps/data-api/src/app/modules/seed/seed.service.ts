import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Genre, Vinyl, Order, UserRole, VinylCondition, OrderStatus } from '../../entities';
import * as bcrypt from 'bcrypt'; // Needed if hashing manually, but entity hook handles it

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Vinyl)
    private readonly vinylRepository: Repository<Vinyl>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async onApplicationBootstrap() {
    // Only run seed in development environment
    if (process.env.NODE_ENV === 'development') {
      this.logger.log('Checking if seeding is needed...');
      await this.runSeed();
    } else {
      this.logger.log('Skipping seeding in non-development environment.');
    }
  }

  async runSeed() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded. Skipping.');
      return;
    }

    this.logger.log('Starting database seeding...');

    try {
      // 1. Seed Users (including admin)
      this.logger.log('Seeding Users...');
      const usersData = [
        { name: 'Alice Wonderland', email: 'alice@example.com', password: 'password123', role: UserRole.ADMIN, address: '123 Rabbit Hole, Wonderland' },
        { name: 'Bob The Builder', email: 'bob@example.com', password: 'password123', role: UserRole.USER, address: '456 Construction Ave, Builderville' },
        { name: 'Charlie Chaplin', email: 'charlie@example.com', password: 'password123', role: UserRole.USER, address: '789 Silent Film St, Hollywood' },
        { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: UserRole.USER, address: '1 Paradise Island, Themyscira' },
        { name: 'Ethan Hunt', email: 'ethan@example.com', password: 'password123', role: UserRole.USER, address: 'IMF Headquarters, Langley' }
      ];
      const seededUsers: User[] = [];
      for (const userData of usersData) {
        // Let the entity hook handle hashing
        const user = this.userRepository.create(userData);
        seededUsers.push(await this.userRepository.save(user));
      }
      this.logger.log();

      // 2. Seed Genres
      this.logger.log('Seeding Genres...');
      const genresData = [
        { name: 'Rock', description: 'Genre originating from rock and roll.' },
        { name: 'Jazz', description: 'Music genre that originated in the African-American communities.' },
        { name: 'Pop', description: 'Popular music genre.' },
        { name: 'Electronic', description: 'Music primarily featuring electronic instruments.' },
        { name: 'Hip Hop', description: 'Music genre developed in the United States by inner-city African Americans.' },
        { name: 'Blues', description: 'Music genre originated by African Americans in the Deep South.' },
        { name: 'Classical', description: 'Art music produced or rooted in the traditions of Western culture.' }
      ];
      const seededGenres: Genre[] = [];
      for (const genreData of genresData) {
        const genre = this.genreRepository.create(genreData);
        seededGenres.push(await this.genreRepository.save(genre));
      }
      this.logger.log();

      // 3. Seed Vinyls
      this.logger.log('Seeding Vinyls...');
      const vinylsData = [
        // Alice's Vinyls
        { title: 'Led Zeppelin IV', artist: 'Led Zeppelin', releaseYear: 1971, condition: VinylCondition.VERY_GOOD_PLUS, price: 55.00, seller: seededUsers[0], genre: seededGenres.find(g => g.name === 'Rock'), coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg' },
        { title: 'The Wall', artist: 'Pink Floyd', releaseYear: 1979, condition: VinylCondition.EXCELLENT, price: 70.00, seller: seededUsers[0], genre: seededGenres.find(g => g.name === 'Rock') },
        // Bob's Vinyls
        { title: 'Kind of Blue', artist: 'Miles Davis', releaseYear: 1959, condition: VinylCondition.GOOD, price: 40.00, seller: seededUsers[1], genre: seededGenres.find(g => g.name === 'Jazz'), coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg' },
        { title: 'A Love Supreme', artist: 'John Coltrane', releaseYear: 1965, condition: VinylCondition.VERY_GOOD, price: 60.00, seller: seededUsers[1], genre: seededGenres.find(g => g.name === 'Jazz') },
        // Charlie's Vinyls
        { title: 'Thriller', artist: 'Michael Jackson', releaseYear: 1982, condition: VinylCondition.NEAR_MINT, price: 50.00, seller: seededUsers[2], genre: seededGenres.find(g => g.name === 'Pop'), coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png' },
        { title: 'Random Access Memories', artist: 'Daft Punk', releaseYear: 2013, condition: VinylCondition.MINT, price: 45.00, seller: seededUsers[2], genre: seededGenres.find(g => g.name === 'Electronic') },
        // Diana's Vinyls
        { title: 'Ready to Die', artist: 'The Notorious B.I.G.', releaseYear: 1994, condition: VinylCondition.VERY_GOOD_PLUS, price: 75.00, seller: seededUsers[3], genre: seededGenres.find(g => g.name === 'Hip Hop') },
        { title: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', releaseYear: 1959, condition: VinylCondition.VERY_GOOD, price: 50.00, seller: seededUsers[3], genre: seededGenres.find(g => g.name === 'Jazz') },
        // Ethan's Vinyls
        { title: 'Texas Flood', artist: 'Stevie Ray Vaughan', releaseYear: 1983, condition: VinylCondition.EXCELLENT, price: 65.00, seller: seededUsers[4], genre: seededGenres.find(g => g.name === 'Blues') },
        { title: 'The Four Seasons', artist: 'Antonio Vivaldi', releaseYear: 1725, condition: VinylCondition.GOOD, price: 30.00, seller: seededUsers[4], genre: seededGenres.find(g => g.name === 'Classical') },
        { title: 'Harvest', artist: 'Neil Young', releaseYear: 1972, condition: VinylCondition.VERY_GOOD, price: 48.00, seller: seededUsers[0], genre: seededGenres.find(g => g.name === 'Rock') }
      ];
      const seededVinyls: Vinyl[] = [];
      for (const vinylData of vinylsData) {
        const vinyl = this.vinylRepository.create({
          ...vinylData,
          sellerId: vinylData.seller.id,
          genreId: vinylData.genre?.id
        });
        seededVinyls.push(await this.vinylRepository.save(vinyl));
      }
      this.logger.log();

      // 4. Seed Orders
      this.logger.log('Seeding Orders...');
      // Ensure orders link different buyers and sellers
      const ordersData = [
        { buyer: seededUsers[1], seller: seededUsers[0], vinyl: seededVinyls[0], status: OrderStatus.COMPLETED, price: seededVinyls[0].price }, // Bob buys from Alice
        { buyer: seededUsers[2], seller: seededUsers[1], vinyl: seededVinyls[2], status: OrderStatus.SHIPPED, price: seededVinyls[2].price }, // Charlie buys from Bob
        { buyer: seededUsers[0], seller: seededUsers[3], vinyl: seededVinyls[6], status: OrderStatus.PAID, price: seededVinyls[6].price }, // Alice buys from Diana
        { buyer: seededUsers[4], seller: seededUsers[2], vinyl: seededVinyls[4], status: OrderStatus.PENDING, price: seededVinyls[4].price }, // Ethan buys from Charlie
        { buyer: seededUsers[3], seller: seededUsers[4], vinyl: seededVinyls[8], status: OrderStatus.CANCELLED, price: seededVinyls[8].price } // Diana buys from Ethan (cancelled)
      ];
      const seededOrders: Order[] = [];
      for (const orderData of ordersData) {
        const order = this.orderRepository.create({
          price: orderData.price,
          status: orderData.status,
          buyerId: orderData.buyer.id,
          sellerId: orderData.seller.id,
          vinylId: orderData.vinyl.id
        });
        seededOrders.push(await this.orderRepository.save(order));
      }
      this.logger.log();

      // 5. Seed Favorites (M:N)
      this.logger.log('Seeding Favorites...');
      // Alice favorites Kind of Blue and Ready to Die
      seededUsers[0].favorites = [seededVinyls[2], seededVinyls[6]];
      await this.userRepository.save(seededUsers[0]);
      // Bob favorites Led Zeppelin IV
      seededUsers[1].favorites = [seededVinyls[0]];
      await this.userRepository.save(seededUsers[1]);
      // Charlie favorites Texas Flood
      seededUsers[2].favorites = [seededVinyls[8]];
      await this.userRepository.save(seededUsers[2]);
      // Diana favorites Thriller
      seededUsers[3].favorites = [seededVinyls[4]];
      await this.userRepository.save(seededUsers[3]);
      this.logger.log('Favorites seeded.');

      this.logger.log('Database seeding completed successfully.');

    } catch (error) {
      this.logger.error('Error during database seeding:', error);
    }
  }
}
