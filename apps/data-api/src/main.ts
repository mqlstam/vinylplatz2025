import 'reflect-metadata'; // Ensure this is the first import
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { SeedRunner } from './app/database/seed.runner'; // Assuming seed runner exists

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Enable CORS
  app.enableCors();
  
  // Setup validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('VinylPlatz API')
    .setDescription('The VinylPlatz marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Run seeds if SeedRunner is available and in development mode
  if (process.env.NODE_ENV !== 'production') {
    try {
       const seedRunner = app.get(SeedRunner, { strict: false }); // Use strict: false to avoid error if not found
       if (seedRunner) {
           await seedRunner.run();
           Logger.log('Database seeding completed successfully.', 'SeedRunner');
       } else {
           Logger.log('SeedRunner not found, skipping seeding.', 'Bootstrap');
       }
    } catch (error) {
      Logger.error('Error running seeds:', error, 'SeedRunner');
    }
  }
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    
  );
   Logger.log(
    
  );
}

bootstrap();
