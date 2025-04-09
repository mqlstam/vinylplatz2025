import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vinyl, VinylCondition, User, Genre } from '@vinylplatz/entities';

@Injectable()
export class VinylSeedService {
  constructor(
    @InjectRepository(Vinyl)
    private vinylRepository: Repository<Vinyl>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  async seed(): Promise<void> {
    const vinylCount = await this.vinylRepository.count();
    if (vinylCount > 0) {
      return; // Skip seeding if vinyls already exist
    }

    // Get users and genres for associations
    const users = await this.userRepository.find();
    const genres = await this.genreRepository.find();

    if (users.length === 0 || genres.length === 0) {
      console.log('No users or genres found. Cannot seed vinyls.');
      return;
    }

    // Create sample vinyls
    const vinyls = [
      {
        title: 'Thriller',
        artist: 'Michael Jackson',
        releaseYear: 1982,
        condition: VinylCondition.NEAR_MINT,
        price: 49.99,
        description: 'Classic album featuring hits like "Billie Jean" and "Beat It". The record is in excellent condition with original sleeve.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png',
        sellerId: users[0].id,
        genreId: genres.find(g => g.name === 'Pop')?.id,
      },
      {
        title: 'Dark Side of the Moon',
        artist: 'Pink Floyd',
        releaseYear: 1973,
        condition: VinylCondition.EXCELLENT,
        price: 65.00,
        description: 'Iconic album in great condition. Original pressing with all inserts included.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
        sellerId: users[1].id,
        genreId: genres.find(g => g.name === 'Rock')?.id,
      },
      {
        title: 'Kind of Blue',
        artist: 'Miles Davis',
        releaseYear: 1959,
        condition: VinylCondition.VERY_GOOD,
        price: 75.50,
        description: 'The best-selling jazz record of all time. This copy has some light wear but plays perfectly.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg',
        sellerId: users[2].id,
        genreId: genres.find(g => g.name === 'Jazz')?.id,
      },
      {
        title: 'Abbey Road',
        artist: 'The Beatles',
        releaseYear: 1969,
        condition: VinylCondition.GOOD,
        price: 55.00,
        description: 'Classic Beatles album. Some wear on cover but vinyl plays well with minimal surface noise.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg',
        sellerId: users[3].id,
        genreId: genres.find(g => g.name === 'Rock')?.id,
      },
      {
        title: 'Random Access Memories',
        artist: 'Daft Punk',
        releaseYear: 2013,
        condition: VinylCondition.MINT,
        price: 40.00,
        description: 'Grammy-winning album in pristine condition. Double LP package.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg',
        sellerId: users[4].id,
        genreId: genres.find(g => g.name === 'Electronic')?.id,
      },
      {
        title: 'The Chronic',
        artist: 'Dr. Dre',
        releaseYear: 1992,
        condition: VinylCondition.VERY_GOOD_PLUS,
        price: 80.00,
        description: 'Landmark hip-hop album. Original pressing in very good condition with minor wear.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/19/Dr.DreTheChronic.jpg',
        sellerId: users[0].id,
        genreId: genres.find(g => g.name === 'Hip Hop')?.id,
      },
      {
        title: 'Back to Black',
        artist: 'Amy Winehouse',
        releaseYear: 2006,
        condition: VinylCondition.NEAR_MINT,
        price: 45.00,
        description: 'Hit album featuring "Rehab". Excellent condition with minimal play.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/67/Amy_Winehouse_-_Back_to_Black_%28album%29.png',
        sellerId: users[1].id,
        genreId: genres.find(g => g.name === 'R&B')?.id,
      },
      {
        title: 'Nevermind',
        artist: 'Nirvana',
        releaseYear: 1991,
        condition: VinylCondition.EXCELLENT,
        price: 60.00,
        description: 'Groundbreaking grunge album. 180g reissue in excellent condition.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg',
        sellerId: users[2].id,
        genreId: genres.find(g => g.name === 'Rock')?.id,
      },
      {
        title: 'A Love Supreme',
        artist: 'John Coltrane',
        releaseYear: 1965,
        condition: VinylCondition.GOOD,
        price: 85.00,
        description: 'Spiritual jazz masterpiece. Vintage copy with some wear but good sound.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/John_Coltrane_-_A_Love_Supreme.jpg',
        sellerId: users[3].id,
        genreId: genres.find(g => g.name === 'Jazz')?.id,
      },
      {
        title: 'Rumours',
        artist: 'Fleetwood Mac',
        releaseYear: 1977,
        condition: VinylCondition.VERY_GOOD,
        price: 50.00,
        description: 'Classic rock album with hits like "Go Your Own Way". Original pressing in good condition.',
        coverImageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG',
        sellerId: users[4].id,
        genreId: genres.find(g => g.name === 'Rock')?.id,
      },
    ];

    // Save the vinyls
    for (const vinylData of vinyls) {
      const vinyl = this.vinylRepository.create(vinylData);
      await this.vinylRepository.save(vinyl);
    }

    console.log('Vinyls seeded successfully');
  }
}
