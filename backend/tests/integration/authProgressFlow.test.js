const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Auth + Progress integration flow', () => {
  test('registers, creates progress, updates progress without empty overwrite, and reads streak', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'securePass123',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeTruthy();

    const token = registerResponse.body.token;

    const createProgressResponse = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        workoutDone: true,
        workoutType: 'Strength',
        burnedCalories: 550,
        sleepHours: 7,
        notes: 'Initial log',
      });

    expect(createProgressResponse.status).toBe(201);
    expect(createProgressResponse.body.progress.burnedCalories).toBe(550);
    expect(createProgressResponse.body.progress.notes).toBe('Initial log');

    const updateProgressResponse = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        workoutDone: true,
        burnedCalories: '',
        notes: '   ',
      });

    expect(updateProgressResponse.status).toBe(200);
    expect(updateProgressResponse.body.progress.burnedCalories).toBe(550);
    expect(updateProgressResponse.body.progress.notes).toBe('Initial log');

    const listResponse = await request(app)
      .get('/api/progress?limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.count).toBe(1);

    const streakResponse = await request(app)
      .get('/api/progress/streak')
      .set('Authorization', `Bearer ${token}`);

    expect(streakResponse.status).toBe(200);
    expect(streakResponse.body.totalWorkoutDays).toBe(1);
    expect(streakResponse.body.currentStreak).toBeGreaterThanOrEqual(1);
  });
});
