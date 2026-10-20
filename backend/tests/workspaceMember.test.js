import { jest } from '@jest/globals';
import path from 'node:path';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Workspace from '../src/models/Workspace.js';
import WorkspaceMember from '../src/models/WorkspaceMember.js';
import Activity from '../src/models/Activity.js';

jest.setTimeout(60000);
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve('test-cache/mongodb-binaries');

let mongoServer;
let owner;
let member;
let ownerToken;
let memberToken;
let workspaceId;

const ownerCredentials = {
  name: 'Owner Test',
  email: 'owner.test@example.com',
  password: 'Owner@123',
};

const memberCredentials = {
  name: 'Member Test',
  email: 'member.test@example.com',
  password: 'Member@123',
};

const login = async (credentials) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: credentials.email, password: credentials.password });

  return response.body.token;
};

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  if (process.env.TEST_MONGODB_URI) {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  } else {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }

  const ownerResponse = await request(app)
    .post('/api/auth/register')
    .send(ownerCredentials);
  expect(ownerResponse.status).toBe(201);

  const memberResponse = await request(app)
    .post('/api/auth/register')
    .send(memberCredentials);
  expect(memberResponse.status).toBe(201);

  owner = await User.findOne({ email: ownerCredentials.email });
  member = await User.findOne({ email: memberCredentials.email });
  ownerToken = await login(ownerCredentials);
  memberToken = await login(memberCredentials);
});

beforeEach(async () => {
  await Promise.all([
    Activity.deleteMany({}),
    WorkspaceMember.deleteMany({}),
    Workspace.deleteMany({}),
  ]);

  const workspaceResponse = await request(app)
    .post('/api/workspaces')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Test Workspace' });

  expect(workspaceResponse.status).toBe(201);
  workspaceId = workspaceResponse.body.workspace._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Workspace member API', () => {
  test('owner can invite a user and the new role is viewer', async () => {
    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ userId: member._id.toString() });

    expect(response.status).toBe(201);
    expect(response.body.member.role).toBe('viewer');
  });

  test('viewer cannot invite another user', async () => {
    await WorkspaceMember.create({
      workspaceId,
      userId: member._id,
      role: 'viewer',
    });

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ userId: owner._id.toString() });

    expect(response.status).toBe(403);
  });

  test('member can view the member list', async () => {
    await WorkspaceMember.create({
      workspaceId,
      userId: member._id,
      role: 'viewer',
    });

    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(200);
    expect(response.body.members).toHaveLength(2);
  });

  test('owner can change viewer to editor', async () => {
    await WorkspaceMember.create({
      workspaceId,
      userId: member._id,
      role: 'viewer',
    });

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/${member._id}/role`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ role: 'editor' });

    expect(response.status).toBe(200);
    expect(response.body.member.role).toBe('editor');
  });

  test('viewer cannot change a member role', async () => {
    await WorkspaceMember.create({
      workspaceId,
      userId: member._id,
      role: 'viewer',
    });

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/${owner._id}/role`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ role: 'editor' });

    expect(response.status).toBe(403);
  });

  test('owner can remove a non-owner member', async () => {
    await WorkspaceMember.create({
      workspaceId,
      userId: member._id,
      role: 'viewer',
    });

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${member._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    const removedMembership = await WorkspaceMember.findOne({ workspaceId, userId: member._id });
    expect(removedMembership).not.toBeNull();
    expect(removedMembership.isActive).toBe(false);
    expect(removedMembership.removedAt).toEqual(expect.any(Date));
  });

  test('owner cannot remove the owner membership', async () => {
    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${owner._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(403);
  });

  test('removed member loses access and can be re-invited', async () => {
    await WorkspaceMember.create({
      workspaceId,
      userId: member._id,
      role: 'editor',
    });

    const removeResponse = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${member._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(removeResponse.status).toBe(200);

    const accessResponse = await request(app)
      .get(`/api/workspaces/${workspaceId}/access-check`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(accessResponse.status).toBe(403);

    const reinviteResponse = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ userId: member._id.toString() });

    expect(reinviteResponse.status).toBe(200);
    expect(reinviteResponse.body.member.role).toBe('viewer');
    expect(reinviteResponse.body.member.isActive).toBe(true);
  });
});
