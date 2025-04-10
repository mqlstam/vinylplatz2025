const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Create the types directory and file if they don't exist
const typesDir = path.join(__dirname, 'apps/data-api/src/app/types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Write the entity-types.ts file
const entityTypesContent = `// Define all entity types used across the application to avoid import issues

// User types
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  address?: string;
  role: UserRole;
  registrationDate: Date;
  comparePassword(attempt: string): Promise<boolean>;
}

// Vinyl types
export enum VinylCondition {
  MINT = 'Mint',
  NEAR_MINT = 'Near Mint',
  EXCELLENT = 'Excellent',
  VERY_GOOD_PLUS = 'Very Good Plus',
  VERY_GOOD = 'Very Good',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  releaseYear?: number;
  condition: VinylCondition;
  price: number;
  description?: string;
  coverImageUrl?: string;
  seller: User;
  sellerId: string;
  genre?: Genre;
  genreId?: string;
  orders: Order[];
  favoritedBy: User[];
  createdAt: Date;
  updatedAt: Date;
}

// Genre types
export interface Genre {
  id: string;
  name: string;
  description?: string;
  vinyls: Vinyl[];
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  price: number;
  status: OrderStatus;
  orderDate: Date;
  buyer: User;
  buyerId: string;
  seller: User;
  sellerId: string;
  vinyl: Vinyl;
  vinylId: string;
}`;

fs.writeFileSync(path.join(typesDir, 'entity-types.ts'), entityTypesContent);
console.log('Created entity-types.ts');

// Update import statements in all TypeScript files
const srcDir = path.join(__dirname, 'apps/data-api/src');
const files = glob.sync(`${srcDir}/**/*.ts`);

let filesUpdated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if the file imports from @vinylplatz/entities
  if (content.includes("from '@vinylplatz/entities'") || 
      content.includes('from "@vinylplatz/entities"') || 
      content.includes('from "../../../../../../libs/shared/entities/src')) {
    
    const originalContent = content;
    
    // Determine the relative path to the types directory
    const relativePathToTypes = path.relative(path.dirname(file), typesDir).replace(/\\/g, '/');
    
    // Replace import statements
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]@vinylplatz\/entities['"];?/g, 
      (match, imports) => `import {${imports}} from '${relativePathToTypes}/entity-types';`);
    
    // Replace any direct path imports 
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/libs\/shared\/entities\/src.*?['"];?/g, 
      (match, imports) => `import {${imports}} from '${relativePathToTypes}/entity-types';`);
    
    // Also fix any specific entity imports
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/libs\/shared\/entities\/src\/lib\/[a-z]+\.entity['"];?/g, 
      (match, imports) => `import {${imports}} from '${relativePathToTypes}/entity-types';`);
    
    // If the content changed, write it back to the file
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      filesUpdated++;
      console.log(`Updated imports in ${file}`);
    }
  }
});

// Also fix main.ts to remove the SeedRunner reference
const mainTsPath = path.join(srcDir, 'main.ts');
if (fs.existsSync(mainTsPath)) {
  let mainTsContent = fs.readFileSync(mainTsPath, 'utf8');
  
  // Remove SeedRunner import
  mainTsContent = mainTsContent.replace(/import\s+{\s*SeedRunner\s*}\s+from\s+['"]\.\/app\/database\/seed\.runner['"];?/g, '');
  
  // Update the bootstrap function to remove SeedRunner code
  mainTsContent = mainTsContent.replace(/\/\/ Run seeds if SeedRunner[\s\S]*?}\s*}/m, 
    `// No seed runner needed for now
  if (process.env.NODE_ENV !== 'production') {
    Logger.log('Running in development mode', 'Bootstrap');
  }`);
  
  fs.writeFileSync(mainTsPath, mainTsContent, 'utf8');
  console.log('Updated main.ts');
}

console.log(`Updated imports in ${filesUpdated} files`);
console.log('Import update complete! Try building your project now.');