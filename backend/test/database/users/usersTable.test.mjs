import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const dbModulePath = '../../../src/database/db.mjs';
const tableModulePath = '../../../src/database/users/usersTable.mjs';

jest.unstable_mockModule(dbModulePath, () => ({
	dbRun: jest.fn(),
	dbGet: jest.fn()
}));

const dbModule = await import(dbModulePath);
const tableModule = await import(tableModulePath);

const { dbRun, dbGet } = dbModule;
const {
	dbInitUserTable,
	dbDeleteUserTable,
	dbAddUser,
	dbGetUserByUsername,
	dbDeleteUser
} = tableModule;

function createApp() {
	const app = express();
	app.use(express.json());

	app.post('/table/init', async (req, res) => {
		try {
			await dbInitUserTable();
			res.status(200).json({ success: true });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.delete('/table/drop', async (req, res) => {
		try {
			await dbDeleteUserTable();
			res.status(200).json({ success: true });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.post('/user', async (req, res) => {
		try {
			const { username, password } = req.body;
			const result = await dbAddUser(username, password);
			res.status(201).json({ success: true, result });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.get('/user/:username', async (req, res) => {
		try {
			const { username } = req.params;
			const user = await dbGetUserByUsername(username);
			if (!user) {
				return res.status(404).json({ success: false, message: 'not found' });
			}
			res.status(200).json({ success: true, user });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.delete('/user/:username', async (req, res) => {
		try {
			const { username } = req.params;
			await dbDeleteUser(username);
			res.status(200).json({ success: true });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	return app;
}

describe('userTable.mjs with mocked db.mjs (supertest)', () => {
	let app;

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => { });
		jest.spyOn(console, 'log').mockImplementation(() => { });
		app = createApp();
	});

	afterAll(() => {
		console.error.mockRestore();
		console.log.mockRestore();
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('dbInitUserTable issues correct SQL', async () => {
		dbRun.mockResolvedValueOnce(undefined);

		const res = await request(app).post('/table/init');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(dbRun).toHaveBeenCalledTimes(1);
		const [sql] = dbRun.mock.calls[0];
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS users');
	});

	test('dbDeleteUserTable issues correct SQL', async () => {
		dbRun.mockResolvedValueOnce(undefined);

		const res = await request(app).delete('/table/drop');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(dbRun).toHaveBeenCalledTimes(1);
		const [sql] = dbRun.mock.calls[0];
		expect(sql).toContain('DROP TABLE IF EXISTS users');
	});

	test('dbAddUser inserts user with correct params', async () => {
		dbRun.mockResolvedValueOnce({ lastID: 1, changes: 1 });

		const res = await request(app)
			.post('/user')
			.send({ username: 'alice', password: 'secret' });

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(dbRun).toHaveBeenCalledTimes(1);
		const [sql, params] = dbRun.mock.calls[0];
		expect(sql).toContain('INSERT INTO users');
		expect(params).toEqual(['alice', 'secret']);
	});

	test('dbGetUserByUsername returns user when found', async () => {
		const row = { username: 'alice', password: 'hashed' };
		dbGet.mockResolvedValueOnce(row);

		const res = await request(app).get('/user/alice');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(dbGet).toHaveBeenCalledTimes(1);
		const [sql, params] = dbGet.mock.calls[0];
		expect(sql).toContain('SELECT * FROM users WHERE username = ?');
		expect(params).toEqual(['alice']);
		expect(res.body.user).toEqual(row);
	});

	test('dbGetUserByUsername returns 404 when not found', async () => {
		dbGet.mockResolvedValueOnce(undefined);

		const res = await request(app).get('/user/unknown');

		expect(res.status).toBe(404);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe('not found');
	});

	test('dbDeleteUser deletes user with correct SQL', async () => {
		dbRun.mockResolvedValueOnce({ changes: 1 });

		const res = await request(app).delete('/user/alice');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(dbRun).toHaveBeenCalledTimes(1);
		const [sql, params] = dbRun.mock.calls[0];
		expect(sql).toContain('DELETE FROM users WHERE username = ?');
		expect(params).toEqual(['alice']);
	});
});

