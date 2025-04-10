import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Genre, Vinyl, Order, UserRole, VinylCondition, OrderStatus } from '../../entities';
import * as bcrypt from 'bcrypt'; // Keep for reference, but hook handles hashing

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
    // Run seed only if explicitly enabled via environment variable or if in development
    const shouldSeed = process.env.RUN_SEED === 'true' || process.env.NODE_ENV === 'development';

    if (shouldSeed) {
      this.logger.log('Checking if seeding is needed...');
      await this.runSeed();
    } else {
      this.logger.log('Skipping seeding (NODE_ENV is not development or RUN_SEED is not true).');
    }
  }

  async runSeed() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log('Database appears to be seeded (users found). Skipping.');
      return;
    }

    this.logger.log('Starting database seeding...');

    try {
      // --- 1. Seed Users ---
      this.logger.log('Seeding Users...');
      const usersData = [
        { name: 'Alice Wonderland', email: 'alice@example.com', password: 'password123', role: UserRole.ADMIN, address: '123 Rabbit Hole, Wonderland', profileImage: 'https://randomuser.me/api/portraits/women/1.jpg' },
        { name: 'Bob The Builder', email: 'bob@example.com', password: 'password123', role: UserRole.USER, address: '456 Construction Ave, Builderville', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { name: 'Charlie Chaplin', email: 'charlie@example.com', password: 'password123', role: UserRole.USER, address: '789 Silent Film St, Hollywood', profileImage: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: UserRole.USER, address: '1 Paradise Island, Themyscira', profileImage: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { name: 'Ethan Hunt', email: 'ethan@example.com', password: 'password123', role: UserRole.USER, address: 'IMF Headquarters, Langley', profileImage: 'https://randomuser.me/api/portraits/men/3.jpg' }
      ];
      const seededUsers: User[] = [];
      for (const userData of usersData) {
        const user = this.userRepository.create(userData); // Hashing handled by @BeforeInsert hook
        seededUsers.push(await this.userRepository.save(user));
      }
      // Fixed: Added log message argument
      this.logger.log();

      // --- 2. Seed Genres ---
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
        // Check if exists first to avoid potential conflicts in edge cases
        let genre = await this.genreRepository.findOne({ where: { name: genreData.name } });
        if (!genre) {
          genre = this.genreRepository.create(genreData);
          await this.genreRepository.save(genre);
        }
        seededGenres.push(genre);
      }
      // Fixed: Added log message argument
      this.logger.log();

      // Ensure we have genres before proceeding
      const rockGenre = seededGenres.find(g => g.name === 'Rock');
      const jazzGenre = seededGenres.find(g => g.name === 'Jazz');
      const popGenre = seededGenres.find(g => g.name === 'Pop');
      const electronicGenre = seededGenres.find(g => g.name === 'Electronic');
      const hipHopGenre = seededGenres.find(g => g.name === 'Hip Hop');
      const bluesGenre = seededGenres.find(g => g.name === 'Blues');
      const classicalGenre = seededGenres.find(g => g.name === 'Classical');

      // --- 3. Seed Vinyls ---
      this.logger.log('Seeding Vinyls...');
      const vinylsData = [
        // Alice's Vinyls (User 0)
        { title: 'Led Zeppelin IV', artist: 'Led Zeppelin', releaseYear: 1971, condition: VinylCondition.VERY_GOOD_PLUS, price: 55.00, seller: seededUsers[0], genre: rockGenre, coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg', description: 'Classic hard rock, includes Stairway to Heaven.' },
        { title: 'The Wall', artist: 'Pink Floyd', releaseYear: 1979, condition: VinylCondition.EXCELLENT, price: 70.00, seller: seededUsers[0], genre: rockGenre, description: 'Iconic concept album. Gatefold sleeve.'},
        { title: 'Harvest', artist: 'Neil Young', releaseYear: 1972, condition: VinylCondition.VERY_GOOD, price: 48.00, seller: seededUsers[0], genre: rockGenre, description: 'Features Heart of Gold.' },
        // Bob's Vinyls (User 1)
        { title: 'Kind of Blue', artist: 'Miles Davis', releaseYear: 1959, condition: VinylCondition.GOOD, price: 40.00, seller: seededUsers[1], genre: jazzGenre, coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg', description: 'Essential modal jazz album.' },
        { title: 'A Love Supreme', artist: 'John Coltrane', releaseYear: 1965, condition: VinylCondition.VERY_GOOD, price: 60.00, seller: seededUsers[1], genre: jazzGenre, description: 'Spiritual jazz masterpiece.' },
        // Charlie's Vinyls (User 2)
        { title: 'Thriller', artist: 'Michael Jackson', releaseYear: 1982, condition: VinylCondition.NEAR_MINT, price: 50.00, seller: seededUsers[2], genre: popGenre, coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png', description: 'Best-selling album worldwide.' },
        { title: 'Random Access Memories', artist: 'Daft Punk', releaseYear: 2013, condition: VinylCondition.MINT, price: 45.00, seller: seededUsers[2], genre: electronicGenre, description: 'Grammy winner, sealed copy.' },
        // Diana's Vinyls (User 3)
        { title: 'Ready to Die', artist: 'The Notorious B.I.G.', releaseYear: 1994, condition: VinylCondition.VERY_GOOD_PLUS, price: 75.00, seller: seededUsers[3], genre: hipHopGenre, description: 'East Coast hip hop classic.' },
        { title: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', releaseYear: 1959, condition: VinylCondition.VERY_GOOD, price: 50.00, seller: seededUsers[3], genre: jazzGenre, description: 'Hard bop standard.' },
        // Ethan's Vinyls (User 4)
        { title: 'Texas Flood', artist: 'Stevie Ray Vaughan', releaseYear: 1983, condition: VinylCondition.EXCELLENT, price: 65.00, seller: seededUsers[4], genre: bluesGenre, description: 'Debut album, defining blues rock sound.' },
        { title: 'The Four Seasons', artist: 'Antonio Vivaldi', releaseYear: 1725, condition: VinylCondition.GOOD, price: 30.00, seller: seededUsers[4], genre: classicalGenre, description: 'Baroque masterpiece performed by The Academy of Ancient Music.' }
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
      // Fixed: Added log message argument
      this.logger.log();

      // --- 4. Seed Orders ---
      this.logger.log('Seeding Orders...');
      // Ensure orders link different buyers and sellers, using valid vinyls
      if (seededUsers.length >= 5 && seededVinyls.length >= 10) { // Need at least 10 vinyls for the indices used
        const ordersData = [
          { buyer: seededUsers[1], seller: seededUsers[0], vinyl: seededVinyls[0], status: OrderStatus.COMPLETED, price: seededVinyls[0].price }, // Bob buys Led Zep from Alice
          { buyer: seededUsers[2], seller: seededUsers[1], vinyl: seededVinyls[3], status: OrderStatus.SHIPPED, price: seededVinyls[3].price },   // Charlie buys Kind of Blue from Bob
          { buyer: seededUsers[0], seller: seededUsers[3], vinyl: seededVinyls[7], status: OrderStatus.PAID, price: seededVinyls[7].price },      // Alice buys Ready to Die from Diana
          { buyer: seededUsers[4], seller: seededUsers[2], vinyl: seededVinyls[5], status: OrderStatus.PENDING, price: seededVinyls[5].price },   // Ethan buys Thriller from Charlie
          { buyer: seededUsers[3], seller: seededUsers[4], vinyl: seededVinyls[9], status: OrderStatus.CANCELLED, price: seededVinyls[9].price } // Diana buys Texas Flood from Ethan (cancelled)
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
        // Fixed: Added log message argument
        this.logger.log();
      } else {
        // Fixed: Added log message argument
        this.logger.warn();
      }

      // --- 5. Seed Favorites (M:N) ---
      this.logger.log('Seeding Favorites...');
      if (seededUsers.length >= 5 && seededVinyls.length >= 10) { // Adjusted check
          // Alice (User 0) favorites Kind of Blue (Vinyl 3) and Ready to Die (Vinyl 7)
          seededUsers[0].favorites = [seededVinyls[3], seededVinyls[7]];
          await this.userRepository.save(seededUsers[0]);

          // Bob (User 1) favorites Led Zeppelin IV (Vinyl 0)
          seededUsers[1].favorites = [seededVinyls[0]];
          await this.userRepository.save(seededUsers[1]);

          // Charlie (User 2) favorites Texas Flood (Vinyl 9)
          seededUsers[2].favorites = [seededVinyls[9]];
          await this.userRepository.save(seededUsers[2]);

          // Diana (User 3) favorites Thriller (Vinyl 5)
          seededUsers[3].favorites = [seededVinyls[5]];
          await this.userRepository.save(seededUsers[3]);

          // Ethan (User 4) favorites The Wall (Vinyl 1) and A Love Supreme (Vinyl 4)
          seededUsers[4].favorites = [seededVinyls[1], seededVinyls[4]];
          await this.userRepository.save(seededUsers[4]);

          this.logger.log(' -> Favorites seeded.');
      } else {
           // Fixed: Added log message argument
           this.logger.warn();
      }


      this.logger.log('Database seeding completed successfully.');

    } catch (error) {
      this.logger.error('Error during database seeding:', error);
      // Optional: Log specific details if available
      if (error instanceof Error) {
        this.logger.error(error.stack);
      }
    }
  }
}
