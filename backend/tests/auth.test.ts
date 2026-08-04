import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { OTP } from '../src/models/OTP';

jest.mock('../src/models/User');
jest.mock('../src/models/OTP');

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      // Mock User.findOne to return null (no user exists)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock User.create to return a mock user instance
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        toJSON: function() { return { _id: this._id, name: this.name, email: this.email, role: this.role }; }
      };
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'securePassword123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('john@example.com');
      expect(res.header['set-cookie']).toBeDefined(); // access and refresh tokens set
    });

    it('should return 409 if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'john@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'securePassword123',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      const mockCompare = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isBlocked: false,
        comparePassword: mockCompare,
        toJSON: function() { return { _id: this._id, name: this.name, email: this.email, role: this.role }; }
      };

      (User.findByEmail as unknown as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'securePassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('john@example.com');
    });

    it('should return 401 with invalid credentials', async () => {
      const mockCompare = jest.fn().mockResolvedValue(false);
      const mockUser = {
        email: 'john@example.com',
        comparePassword: mockCompare,
      };

      (User.findByEmail as unknown as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongPassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/send-otp', () => {
    it('should send OTP email successfully for existing user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'john@example.com',
        role: 'user',
        isBlocked: false,
      });
      (OTP.findOneAndUpdate as jest.Mock).mockResolvedValue({ identifier: 'john@example.com' });

      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({
          identifier: 'john@example.com',
          type: 'login',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/OTP sent/i);
    });

    it('should reject login OTP when user is not registered', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({
          identifier: 'newuser@example.com',
          phone: '9876543210',
          type: 'login',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/register first/i);
    });
  });
});
