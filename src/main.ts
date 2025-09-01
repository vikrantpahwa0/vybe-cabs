import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './utils/error/error';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 App running on port ${port}`);
}
bootstrap();
