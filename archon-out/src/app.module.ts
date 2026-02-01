import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Patient DomainModule } from './modules/patient domain/patient domain.module';

@Module({
imports: [
ConfigModule.forRoot({ isGlobal: true }),
TypeOrmModule.forRoot({
type: 'postgres',
url: process.env.DATABASE_URL,
entities: [__dirname + '/**/*.entity{.ts,.js}'],
synchronize: true, // DEV only
}),
AuthModule,
Patient DomainModule,
],
controllers: [],
providers: [],
})
export class AppModule {}