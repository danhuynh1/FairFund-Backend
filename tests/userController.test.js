const request = require('supertest');
const app = require('../app');

// Mock the entire User model
jest.mock('../models/User');

const User = require('../models/User');

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'mockUserId', email: 'mock@example.com', name: 'Mock User' };
    next();
  }
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('GET /api/users/search', () => {
  it('should return user if found', async () => {
    User.findOne.mockResolvedValue({
      _id: '123abc',
      name: 'Alice',
      email: 'alice@example.com',
    });

    const res = await request(app).get('/api/users/search?email=alice@example.com');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      _id: '123abc',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app).get('/api/users/search');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide an email address to search for.');
  });

  it('should return 404 if user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/users/search?email=missing@example.com');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('No user found with that email address.');
  });

  it('should return 500 if DB throws error', async () => {
    User.findOne.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get('/api/users/search?email=alice@example.com');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error while searching for user.');
  });
});

describe('POST /api/users/create', () => {
    it('should return 400 if user exists', async () => {
         User.findOne.mockResolvedValue({
            _id: '123abc',
            name: 'Alice',
            email: 'alice@example.com',
        });
        const res = await request(app).post('/api/users/create').send({
            name: 'Alice',
            email: 'alice@example.com',
            role: 'member'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    it('should return 201 if user exists', async () => {
        User.findOne.mockResolvedValue(null);

        const mockSave = jest.fn().mockResolvedValue({
            _id: 'abc123',
            name: 'Alice',
            email: 'alice@example.com',
            role: 'member'
        });

        User.mockImplementation(() => ({ save: mockSave }));

        const res = await request(app).post('/api/users/create').send({
            name: 'Alice',
            email: 'alice@example.com',
            role: 'member'
        });
        expect(res.statusCode).toBe(201);
    });

    it('should return 500 if error creating a user', async () => {
        User.findOne.mockRejectedValue(new Error('Error creating a new record'));
        const res = await request(app).post('/api/users/create').send({
            name: 'Alice',
            email: 'alice@example.com',
            role: 'member'
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Error creating user');
    });
});

