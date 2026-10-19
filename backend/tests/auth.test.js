import { jest } from '@jest/globals';
import path from 'node:path';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';

jest.setTimeout(60000);
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve('test-cache/mongodb-binaries');

let mongoServer;

const validUser = {
  name: 'Auth Test User',
  email: 'auth.test@example.com',
  password: 'Auth@123',
};

const registerUser = (user = validUser) => {
  return request(app)
    .post('/api/auth/register')
    .send(user);
};

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';

  if (process.env.TEST_MONGODB_URI) {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  } else {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Auth API', () => {
  test('registers a valid user', async () => {
    const response = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Đăng ký tài khoản thành công!');
  });

  test('rejects registration with missing fields', async () => {
    const response = await registerUser({
      name: 'Incomplete User',
      email: 'incomplete@example.com',
    });

    expect(response.status).toBe(400);
  });

  test('rejects an invalid email', async () => {
    const response = await registerUser({
      ...validUser,
      email: 'invalid-email',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Định dạng email');
  });

  test('rejects a weak password', async () => {
    const response = await registerUser({
      ...validUser,
      password: 'password',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Mật khẩu phải có ít nhất');
  });

  test('rejects a duplicate email', async () => {
    await registerUser();

    const response = await registerUser();

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Email này đã được sử dụng');
  });

  test('logs in with valid credentials and does not expose passwordHash', async () => {
    await registerUser();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(validUser.email);
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('rejects login with an incorrect password', async () => {
    await registerUser();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: 'Wrong@123',
      });

    expect(response.status).toBe(400);
  });

  test('rejects protected requests without a token', async () => {
    const response = await request(app).get('/api/workspaces');

    expect(response.status).toBe(401);
  });

  test('rejects protected requests with an invalid token', async () => {
    const response = await request(app)
      .get('/api/workspaces')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
