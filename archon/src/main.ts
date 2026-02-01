import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
const app = await NestFactory.create(AppModule);
// Optional: Global validation pipe
// app.useGlobalPipes(new ValidationPipe());
await app.listen(process.env.PORT || 3000);
}
bootstrap();