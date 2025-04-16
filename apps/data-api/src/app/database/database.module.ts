import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Vinyl, Genre, Order } from '../entities';
import { URL } from 'node:url'; // Import URL for parsing

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
          // In production, DATABASE_URL MUST be set
          if (process.env.NODE_ENV === 'production') {
             throw new Error('DATABASE_URL environment variable is required for production');
          } else {
            // Fallback for local development
            console.warn('DATABASE_URL not set, attempting fallback to DB_* vars for local dev.');
            return {
                type: 'mysql',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get<string>('DB_USERNAME', 'root'),
                password: configService.get<string>('DB_PASSWORD', ''), 
                database: configService.get<string>('DB_DATABASE', 'vinylplatz'),
                entities: [User, Vinyl, Genre, Order],
                synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
                logging: true,
             };
          }
        }

        // Parse the DATABASE_URL
        const url = new URL(databaseUrl);
        const socketPath = url.searchParams.get('socketPath');
        const sslMode = url.searchParams.get('sslmode') || 'require'; // Default to require SSL

        // Base TypeORM options
        const typeOrmOptions: any = {
          type: 'mysql',
          username: url.username || configService.get<string>('DB_USERNAME'),
          password: url.password || configService.get<string>('DB_PASSWORD'),
          database: url.pathname.slice(1) || configService.get<string>('DB_DATABASE'),
          entities: [User, Vinyl, Genre, Order],
          synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false').toLowerCase() === 'true',
          logging: process.env.NODE_ENV !== 'production',
          // Azure MySQL requires SSL
          ssl: true,
          extra: {
            // Helps with Azure MySQL connections
            trustServerCertificate: true,
          },
        };

        if (socketPath) {
          // If socketPath exists (Cloud SQL Proxy connection expected)
          console.log(`Connecting via Cloud SQL Proxy socket: ${socketPath}`);
          typeOrmOptions.socketPath = socketPath;
        } else {
          // Otherwise, use host/port
          console.log(`Connecting via TCP to host: ${url.hostname}`);
          typeOrmOptions.host = url.hostname;
          typeOrmOptions.port = parseInt(url.port, 10) || 3306;
        }

        return typeOrmOptions;
      },
    }),
  ],
})
export class DatabaseModule {}