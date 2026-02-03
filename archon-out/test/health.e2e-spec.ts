import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Mimic main.ts prefix logic if needed, but for E2E we usually test against the app instance directly
        // If AppModule doesn't set prefix, we might need to set it here to match expectations if we were testing valid routes
        // But for simplicity, we'll check if we can hit the health controller.
        // NOTE: The health controller in this app is mounted at /api/v1/health based on main.ts setGlobalPrefix
        // We need to replicate that here or enable it.

        app.setGlobalPrefix('api/v1');
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('/api/v1/health/ready (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1/health/ready')
            .expect(200)
            .expect((res) => {
                if (!res.body.status && !res.body.details) {
                    throw new Error('Expected status or details in health response');
                }
            });
    });
});
