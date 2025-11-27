import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const tableModulePath = '../../../src/database/users/userTable.mjs';

jest.unstable_mockModule(tableModulePath, () => ({
	dbAddUser: jest.fn(),
	dbGetUserByUsername: jest.fn()
}));

const userRoutesModule = await import('../../../src/database/users/userRoutes.mjs');
const tableModule = await import(tableModulePath);

const userRoutes = userRoutesModule.default;
const { dbAddUser, dbGetUserByUsername } = tableModule;

function createApp() {
	const app = express();
	app.use(express.json());
	app.use('/', userRoutes);
	return app;
}

describe('User service routes', () => {
	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => { });
		jest.spyOn(console, 'log').mockImplementation(() => { });
	});

	afterAll(() => {
		console.error.mockRestore();
		console.log.mockRestore();
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('POST /register', () => {
		test('should return 400 when username or password missing', async () => {
			const app = createApp();

			let res = await request(app)
				.post('/register')
				.send({ username: 'alice' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('用户名和密码不能为空');

			res = await request(app)
				.post('/register')
				.send({ password: 'secret' });
			expect(res.status).toBe(400);
		});

		test('should validate username and password length', async () => {
			const app = createApp();

			dbGetUserByUsername.mockResolvedValueOnce(null);
			let res = await request(app)
				.post('/register')
				.send({ username: 'ab', password: '123456' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('用户名至少需要3个字符');

			dbGetUserByUsername.mockResolvedValueOnce(null);
			res = await request(app)
				.post('/register')
				.send({ username: 'alice', password: '12345' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('密码至少需要6个字符');
		});

		test('should return 400 when username already exists', async () => {
			const existing = { username: 'alice', password: 'hashed' };
			dbGetUserByUsername.mockResolvedValueOnce(existing);

			const app = createApp();
			const res = await request(app)
				.post('/register')
				.send({ username: 'alice', password: '123456' });

			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('用户名已存在');
		});

		test('should create user when data is valid and username not exists', async () => {
			dbGetUserByUsername.mockResolvedValueOnce(null);
			// dbAddUser 返回结构在实现中只是 { result }，这里模拟一个带 id 等字段的对象
			dbAddUser.mockResolvedValueOnce({ id: 1, username: 'alice', created_at: '2024-01-01' });

			const app = createApp();
			const res = await request(app)
				.post('/register')
				.send({ username: 'alice', password: '123456' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('注册成功');
			expect(dbGetUserByUsername).toHaveBeenCalledWith('alice');
			expect(dbAddUser).toHaveBeenCalledTimes(1);
		});
	});

	describe('POST /login', () => {
		test('should return 400 when username or password missing', async () => {
			const app = createApp();

			let res = await request(app)
				.post('/login')
				.send({ username: 'alice' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('用户名和密码不能为空');

			res = await request(app)
				.post('/login')
				.send({ password: '123456' });
			expect(res.status).toBe(400);
		});

		test('should return 401 when user not found', async () => {
			dbGetUserByUsername.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app)
				.post('/login')
				.send({ username: 'alice', password: '123456' });

			expect(res.status).toBe(401);
			expect(res.body.message).toBe('用户名或密码错误');
		});

		test('should return 401 when password is incorrect', async () => {
			// 构造一个不匹配的哈希：使用不同的密码生成
			const crypto = await import('crypto');
			const salt = crypto.randomBytes(16).toString('hex');
			const wrongHash = crypto.pbkdf2Sync('wrong', salt, 1000, 64, 'sha512').toString('hex');
			const stored = `${salt}:${wrongHash}`;
			dbGetUserByUsername.mockResolvedValueOnce({ username: 'alice', password: stored });

			const app = createApp();
			const res = await request(app)
				.post('/login')
				.send({ username: 'alice', password: '123456' });

			expect(res.status).toBe(401);
			expect(res.body.message).toBe('用户名或密码错误');
		});

		test('should login successfully when credentials are correct', async () => {
			const crypto = await import('crypto');
			const salt = crypto.randomBytes(16).toString('hex');
			const hash = crypto.pbkdf2Sync('123456', salt, 1000, 64, 'sha512').toString('hex');
			const stored = `${salt}:${hash}`;
			const user = { id: 1, username: 'alice', created_at: '2024-01-01', password: stored };
			dbGetUserByUsername.mockResolvedValueOnce(user);

			const app = createApp();
			const res = await request(app)
				.post('/login')
				.send({ username: 'alice', password: '123456' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('登录成功');
			expect(res.body.user.username).toBe('alice');
		});
	});

	describe('GET /user/username/:username', () => {
		test('should return user when exists', async () => {
			const user = { id: 1, username: 'alice', created_at: '2024-01-01' };
			dbGetUserByUsername.mockResolvedValueOnce(user);

			const app = createApp();
			const res = await request(app).get('/user/username/alice');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.user.username).toBe('alice');
		});

		test('should return 404 when user does not exist', async () => {
			dbGetUserByUsername.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app).get('/user/username/unknown');

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('用户不存在');
		});
	});
});

