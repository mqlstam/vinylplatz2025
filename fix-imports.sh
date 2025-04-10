#!/bin/bash

# Update main files:
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/auth/guards/roles.guard.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/auth/auth.service.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/favorites/dto/favorite.dto.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/favorites/favorites.controller.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/favorites/favorites.module.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/favorites/favorites.service.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/genre/dto/genre.dto.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/genre/genre.controller.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/genre/genre.module.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/genre/genre.service.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/orders/dto/order.dto.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/orders/orders.controller.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/orders/orders.module.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/orders/orders.service.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/user/dto/user.dto.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/user/user.controller.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/user/user.module.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/user/user.service.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/vinyl/dto/vinyl.dto.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/vinyl/vinyl.controller.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/vinyl/vinyl.module.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/vinyl/vinyl.seed.ts
sed -i '' 's/@vinylplatz\/entities/..\/..\/entities/g' apps/data-api/src/app/modules/vinyl/vinyl.service.ts

# Update direct path references
sed -i '' 's/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/libs\/shared\/entities\/src\/lib\/user\.entity/..\/..\/entities/g' apps/data-api/src/app/modules/auth/auth.controller.ts

# Update database module to use local entities
cat > apps/data-api/src/app/database/database.module.ts << 'EOF_INNER'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Vinyl, Genre, Order } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'vinylplatz'),
        entities: [User, Vinyl, Genre, Order],
        synchronize: configService.get('DB_SYNCHRONIZE', true),
      }),
    }),
  ],
})
export class DatabaseModule {}
EOF_INNER

# Fix the ApiProperty type issue in favorites.dto.ts
cat > apps/data-api/src/app/modules/favorites/dto/favorite.dto.ts << 'EOF_INNER'
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Vinyl } from '../../../entities';

export class FavoriteResponseDto {
  @ApiProperty({ type: () => [Vinyl], description: 'List of favorite vinyls' })
  favorites: Vinyl[];
}

export class FavoriteToggleResponseDto {
  @ApiProperty({ example: true, description: 'Whether the vinyl is favorited' })
  isFavorited: boolean;

  @ApiProperty({ example: 'Vinyl added to favorites', description: 'Message about the operation' })
  message: string;
}

export class FavoriteStatusDto {
  @ApiProperty({ example: true, description: 'Whether the vinyl is favorited by the current user' })
  isFavorited: boolean;
}
EOF_INNER

echo "Import updates completed"
