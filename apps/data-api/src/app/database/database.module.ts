import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Vinyl, Genre, Order } from '../entities';
import { URL } from 'node:url'; // Use the modern URL constructor

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      // Ensure ConfigModule is globally available or imported here/AppModule
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          // This should not happen in Cloud Run if the secret is set,
          // but good practice for local dev fallback or error handling.
          console.error('DATABASE_URL environment variable is not set!');
          // Fallback to individual variables ONLY if DATABASE_URL is missing
          // AND you have them defined in a local .env (ignored in Docker)
          // In production (Cloud Run), this should ideally throw an error.
          if (process.env.NODE_ENV === 'production') {
             throw new Error('DATABASE_URL environment variable is required for production');
          } else {
            // Fallback for local development if needed (reads from .env)
            return {
                type: 'mysql',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get<string>('DB_USERNAME', 'root'),
                password: configService.get<string>('DB_PASSWORD', ''),
                database: configService.get<string>('DB_DATABASE', 'vinylplatz'),
                entities: [User, Vinyl, Genre, Order],
                synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true), // Dev default true
                logging: true,
             };
          }
        }

        // --- Parse the DATABASE_URL ---
        const url = new URL(databaseUrl); // Use URL constructor

        return {
          type: 'mysql',
          host: url.hostname,
          port: parseInt(url.port, 10) || 3306, // Default MySQL port
          username: url.username,
          password: url.password,
          database: url.pathname.slice(1), // Remove leading '/'
          entities: [User, Vinyl, Genre, Order],
          // Production settings: synchronize should be false
          synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false').toLowerCase() === 'true', // Default false in prod
          logging: process.env.NODE_ENV !== 'production', // Log SQL only in dev
          // Add SSL options if required for Cloud SQL connection,
          // but you disabled it, so likely not needed now.
          // ssl: {
          //    rejectUnauthorized: false // Adjust as needed per Cloud SQL recommendations
          // }
        };
      },
    }),
  ],
})
export class DatabaseModule {}