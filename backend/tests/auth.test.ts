import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { OTP } from '../src/models/OTP';

jest.mock('../src/models/User');
jest.mock('../src/models/OTP');

/** Mimics a Mongoose Query: chainable (.select/.lean) and awaitable. */
function mockQuery(resolvedValue: unknown) {
  const query: Record<string, unknown> = {
    select: jest.fn(() => query),
    lean: jest.fn(() => query),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return query;
}

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
      (User.findOne as jest.Mock)
        // assertNotAdminAccount: User.findOne({email}).select('role')
        .mockReturnValueOnce(mockQuery(null))
        // login lookup: User.findOne({email})
        .mockReturnValueOnce(
          mockQuery({ email: 'john@example.com', role: 'user', isBlocked: false }),
        );
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
      (User.findOne as jest.Mock)
        // assertNotAdminAccount: User.findOne({email}).select('role')
        .mockReturnValueOnce(mockQuery(null))
        // login lookup: User.findOne({email}) -> not found
        .mockReturnValueOnce(mockQuery(null));

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

  describe('POST /api/auth/verify-otp', () => {
    it('should reject a guessed "123456" code for an account that never requested that OTP (auth-bypass regression)', async () => {
      // No OTP record exists for this identifier — nothing was ever sent/requested.
      (OTP.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          identifier: 'victim@example.com',
          type: 'login',
          code: '123456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/expired or not found/i);
    });

    it('should reject an incorrect code even when a real OTP record exists', async () => {
      const mockOtpRecord = {
        identifier: 'victim@example.com',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        compare: jest.fn().mockResolvedValue(false),
        save: jest.fn().mockResolvedValue(true),
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      (OTP.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockOtpRecord),
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          identifier: 'victim@example.com',
          type: 'login',
          code: '123456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(mockOtpRecord.compare).toHaveBeenCalledWith('123456');
    });
  });
});
