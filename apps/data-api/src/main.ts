import 'reflect-metadata'; // Ensure this is the first import
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
// Remove the SeedRunner import since it doesn't exist

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
  
  // Remove the SeedRunner code since it's not implemented
  // We can add a simple comment instead
  if (process.env.NODE_ENV !== 'production') {
    Logger.log('Running in development mode', 'Bootstrap');
  }
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
}

bootstrap();