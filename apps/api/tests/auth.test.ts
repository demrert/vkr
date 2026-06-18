import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();
const request = supertest(app);

const TEST_EMAIL = `test-auth-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpass123';

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it('rejects duplicate email', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(409);
  });

  it('validates email format', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: TEST_PASSWORD });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects wrong password', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns user with valid token', async () => {
    const loginRes = await request
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const token = loginRes.body.token as string;

    const res = await request.get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
  });

  it('returns 401 without token', async () => {
    const res = await request.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
