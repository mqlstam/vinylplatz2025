#!/bin/bash

# Create entities directory if it doesn't exist
mkdir -p apps/data-api/src/app/entities

# Update imports in all modules
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { User } from .@vinylplatz\/entities./import { User } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Vinyl } from .@vinylplatz\/entities./import { Vinyl } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Genre } from .@vinylplatz\/entities./import { Genre } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Order } from .@vinylplatz\/entities./import { Order } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { VinylCondition } from .@vinylplatz\/entities./import { VinylCondition } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { OrderStatus } from .@vinylplatz\/entities./import { OrderStatus } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { UserRole } from .@vinylplatz\/entities./import { UserRole } from ..\/..\/entities./g' {} \;

# Handle multi-import cases
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { User, UserRole } from .@vinylplatz\/entities./import { User, UserRole } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { User, Vinyl } from .@vinylplatz\/entities./import { User, Vinyl } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Vinyl, VinylCondition } from .@vinylplatz\/entities./import { Vinyl, VinylCondition } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Order, OrderStatus } from .@vinylplatz\/entities./import { Order, OrderStatus } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Order, OrderStatus, Vinyl } from .@vinylplatz\/entities./import { Order, OrderStatus, Vinyl } from ..\/..\/entities./g' {} \;
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { Vinyl, VinylCondition, User, Genre } from .@vinylplatz\/entities./import { Vinyl, VinylCondition, User, Genre } from ..\/..\/entities./g' {} \;

# Update any specific local imports that use direct paths
find apps/data-api/src/app/modules -type f -name "*.ts" -exec sed -i '' 's/import { UserRole } from ..\/..\/..\/..\/..\/..\/libs\/shared\/entities\/src\/lib\/user.entity/import { UserRole } from ..\/..\/entities/g' {} \;

echo "Import updates completed"
