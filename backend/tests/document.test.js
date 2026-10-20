import { jest } from '@jest/globals';
import path from 'node:path';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Activity from '../src/models/Activity.js';
import Document from '../src/models/Document.js';
import User from '../src/models/User.js';
import Workspace from '../src/models/Workspace.js';
import WorkspaceMember from '../src/models/WorkspaceMember.js';

jest.setTimeout(60000);
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve('test-cache/mongodb-binaries');

let mongoServer;
let workspaceId;
let owner;
let editor;
let viewer;
let ownerToken;
let editorToken;
let viewerToken;

const users = [
  {
    name: 'Document Owner',
    email: 'document.owner@example.com',
    password: 'Owner@123',
  },
  {
    name: 'Document Editor',
    email: 'document.editor@example.com',
    password: 'Editor@123',
  },
  {
    name: 'Document Viewer',
    email: 'document.viewer@example.com',
    password: 'Viewer@123',
  },
];

const registerAndLogin = async (user) => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(user);
  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  expect(loginResponse.status).toBe(200);

  return {
    user: await User.findOne({ email: user.email }),
    token: loginResponse.body.token,
  };
};

const createDocumentAsOwner = async (title = 'Test Document') => {
  const response = await request(app)
    .post(`/api/workspaces/${workspaceId}/documents`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ title });

  expect(response.status).toBe(201);
  return response.body.document;
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
  await Promise.all([
    Activity.deleteMany({}),
    Document.deleteMany({}),
    WorkspaceMember.deleteMany({}),
    Workspace.deleteMany({}),
    User.deleteMany({}),
  ]);

  const ownerResult = await registerAndLogin(users[0]);
  const editorResult = await registerAndLogin(users[1]);
  const viewerResult = await registerAndLogin(users[2]);

  owner = ownerResult.user;
  editor = editorResult.user;
  viewer = viewerResult.user;
  ownerToken = ownerResult.token;
  editorToken = editorResult.token;
  viewerToken = viewerResult.token;

  const workspaceResponse = await request(app)
    .post('/api/workspaces')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Document Test Workspace' });

  expect(workspaceResponse.status).toBe(201);
  workspaceId = workspaceResponse.body.workspace._id;

  await WorkspaceMember.create([
    { workspaceId, userId: editor._id, role: 'editor' },
    { workspaceId, userId: viewer._id, role: 'viewer' },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Document API', () => {
  test('owner can create a document', async () => {
    const document = await createDocumentAsOwner('Owner Document');

    expect(document.title).toBe('Owner Document');
    expect(document.isDeleted).toBe(false);
  });

  test('editor can create a document', async () => {
    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/documents`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ title: 'Editor Document' });

    expect(response.status).toBe(201);
  });

  test('viewer cannot create a document', async () => {
    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/documents`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Viewer Document' });

    expect(response.status).toBe(403);
  });

  test('member can list and open documents', async () => {
    const document = await createDocumentAsOwner();

    const listResponse = await request(app)
      .get(`/api/workspaces/${workspaceId}/documents`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.documents).toHaveLength(1);

    const detailResponse = await request(app)
      .get(`/api/workspaces/${workspaceId}/documents/${document._id}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.document.title).toBe('Test Document');
  });

  test('editor can rename a document', async () => {
    const document = await createDocumentAsOwner();

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/documents/${document._id}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ title: 'Renamed Document' });

    expect(response.status).toBe(200);
    expect(response.body.document.title).toBe('Renamed Document');
  });

  test('viewer cannot rename a document', async () => {
    const document = await createDocumentAsOwner();

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/documents/${document._id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Unauthorized Rename' });

    expect(response.status).toBe(403);
  });

  test('owner can soft-delete a document and it disappears from reads', async () => {
    const document = await createDocumentAsOwner();

    const deleteResponse = await request(app)
      .delete(`/api/workspaces/${workspaceId}/documents/${document._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(deleteResponse.status).toBe(200);

    const storedDocument = await Document.findById(document._id);
    expect(storedDocument).not.toBeNull();
    expect(storedDocument.isDeleted).toBe(true);
    expect(storedDocument.deletedAt).toEqual(expect.any(Date));

    const listResponse = await request(app)
      .get(`/api/workspaces/${workspaceId}/documents`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.documents).toHaveLength(0);

    const detailResponse = await request(app)
      .get(`/api/workspaces/${workspaceId}/documents/${document._id}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(detailResponse.status).toBe(404);
  });
});
