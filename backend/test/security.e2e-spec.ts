import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// Needs a reachable test database (DATABASE_URL) — see docs/PHASE12_SETUP.md.
// Does NOT need real Firebase credentials: every case here is rejected
// before the code ever reaches admin.auth().verifyIdToken().
describe('Security boundaries (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects /wallet with no token', () => {
    return request(app.getHttpServer()).get('/wallet').expect(401);
  });

  it('rejects /tournaments/mine with no token', () => {
    return request(app.getHttpServer()).get('/tournaments/mine').expect(401);
  });

  it('rejects /profile with no token', () => {
    return request(app.getHttpServer()).get('/profile').expect(401);
  });

  it('rejects every /admin/* route with no admin token', async () => {
    await request(app.getHttpServer()).get('/admin/dashboard/stats').expect(401);
    await request(app.getHttpServer()).get('/admin/payment-requests').expect(401);
    await request(app.getHttpServer()).get('/admin/redeem-requests').expect(401);
    await request(app.getHttpServer()).get('/admin/withdrawals').expect(401);
    await request(app.getHttpServer()).get('/admin/tournaments').expect(401);
    await request(app.getHttpServer()).get('/admin/users').expect(401);
    await request(app.getHttpServer()).get('/admin/audit-logs').expect(401);
  });

  it('rejects a garbage token on admin routes — the two auth systems share nothing', () => {
    return request(app.getHttpServer())
      .get('/admin/tournaments')
      .set('Authorization', 'Bearer not-a-real-admin-jwt')
      .expect(401);
  });

  it('rejects a garbage token on player routes the same way', () => {
    return request(app.getHttpServer())
      .get('/wallet')
      .set('Authorization', 'Bearer not-a-real-firebase-token')
      .expect(401);
  });

  it('rejects a malformed admin login payload before touching the database', () => {
    return request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({ username: 'a' }) // missing password
      .expect(400);
  });

  it('rejects wrong admin credentials with 401, not a 500 or a stack trace', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({ username: 'definitely-not-a-real-admin', password: 'wrongpassword' })
      .expect(401);

    // The global exception filter's whole job is making sure this stays
    // a clean, generic message — never a raw Prisma/stack trace leak.
    expect(res.body.message).not.toMatch(/prisma|stack|at Object\./i);
  });
});
