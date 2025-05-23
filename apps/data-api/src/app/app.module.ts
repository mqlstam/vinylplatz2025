import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { GenreModule } from './modules/genre/genre.module';
import { VinylModule } from './modules/vinyl/vinyl.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SeedModule } from './modules/seed/seed.module'; // Import SeedModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Point to the correct .env file relative to the CWD (project root)
      envFilePath: '.env', // Or './apps/data-api/.env' if specific
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    GenreModule,
    VinylModule,
    FavoritesModule,
    OrdersModule,
    SeedModule, // Include SeedModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
