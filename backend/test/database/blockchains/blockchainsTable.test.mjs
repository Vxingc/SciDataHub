import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const dbModulePath = '../../../src/database/db.mjs';
const tableModulePath = '../../../src/database/blockchains/blockchainsTable.mjs';

jest.unstable_mockModule(dbModulePath, () => ({
    dbRun: jest.fn(),
    dbGet: jest.fn(),
    dbAll: jest.fn()
}));

const dbModule = await import(dbModulePath);
const tableModule = await import(tableModulePath);

const { dbRun, dbGet, dbAll } = dbModule;
const {
    dbInitBlockchainTable,
    dbDeleteBlockchainTable,
    dbAddBlockchain,
    dbGetBlockchain,
    dbGetAllBlockchains,
    dbUpdateBlockchain,
    dbDeleteBlockchainByName
} = tableModule;

function createApp() {
    const app = express();
    app.use(express.json());

    app.post('/table/init', async (req, res) => {
        try {
            await dbInitBlockchainTable();
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.delete('/table/drop', async (req, res) => {
        try {
            await dbDeleteBlockchainTable();
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.post('/blockchain', async (req, res) => {
        try {
            const { name, fullName, description } = req.body;
            const blockchain = await dbAddBlockchain(name, fullName, description);
            res.status(201).json({ success: true, blockchain });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/blockchain/:name', async (req, res) => {
        try {
            const blockchain = await dbGetBlockchain(req.params.name);
            if (!blockchain) {
                return res.status(404).json({ success: false, message: 'not found' });
            }
            res.status(200).json({ success: true, blockchain });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/blockchains', async (req, res) => {
        try {
            const blockchains = await dbGetAllBlockchains();
            res.status(200).json({ success: true, blockchains });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.put('/blockchain/:name', async (req, res) => {
        try {
            const { name, fullName, description } = req.body;
            const result = await dbUpdateBlockchain(name, fullName, description);
            if (!result || result.changes === 0) {
                return res.status(400).json({ success: false, message: 'update failed' });
            }
            const blockchain = await dbGetBlockchain(name);
            res.status(200).json({ success: true, blockchain });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.delete('/blockchain/:name', async (req, res) => {
        try {
            const result = await dbDeleteBlockchainByName(req.params.name);
            if (!result || result.changes === 0) {
                return res.status(404).json({ success: false, message: 'not found' });
            }
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    return app;
}

describe('blockchainsTable.mjs with mocked db.mjs (supertest)', () => {
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

    describe('dbInitBlockchainTable & dbDeleteBlockchainTable', () => {
        test('should call dbRun with correct SQL on init', async () => {
            dbRun.mockResolvedValueOnce(undefined);

            const res = await request(app).post('/table/init');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(dbRun).toHaveBeenCalledTimes(1);
            const [sql] = dbRun.mock.calls[0];
            expect(sql).toContain('CREATE TABLE IF NOT EXISTS blockchains');
        });

        test('should return 500 when init fails', async () => {
            dbRun.mockRejectedValueOnce(new Error('init error'));

            const res = await request(app).post('/table/init');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });

        test('should call dbRun with correct SQL on drop', async () => {
            dbRun.mockResolvedValueOnce(undefined);

            const res = await request(app).delete('/table/drop');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(dbRun).toHaveBeenCalledTimes(1);
            const [sql] = dbRun.mock.calls[0];
            expect(sql).toContain('DROP TABLE IF EXISTS blockchains');
        });

        test('should return 500 when drop fails', async () => {
            dbRun.mockRejectedValueOnce(new Error('drop error'));

            const res = await request(app).delete('/table/drop');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });
    });

    describe('dbAddBlockchain & dbGetBlockchain', () => {
        test('should insert blockchain via dbRun and return mapped object', async () => {
            dbRun.mockResolvedValueOnce(undefined);

            const res = await request(app)
                .post('/blockchain')
                .send({
                    name: 'Physics',
                    fullName: 'Physics Chain',
                    description: 'desc'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(dbRun).toHaveBeenCalledTimes(1);
            const [sql, params] = dbRun.mock.calls[0];
            expect(sql).toContain('INSERT INTO blockchains');
            expect(params).toEqual(['Physics', 'Physics Chain', 'desc']);
            expect(res.body.blockchain).toEqual({
                name: 'Physics',
                fullName: 'Physics Chain',
                description: 'desc'
            });
        });

        test('should return 500 when dbAddBlockchain fails', async () => {
            dbRun.mockRejectedValueOnce(new Error('insert error'));

            const res = await request(app)
                .post('/blockchain')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'desc' });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });

        test('should get blockchain by name via dbGet', async () => {
            const row = { name: 'Physics', fullName: 'Physics Chain', description: 'desc' };
            dbGet.mockResolvedValueOnce(row);

            const res = await request(app).get('/blockchain/Physics');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(dbGet).toHaveBeenCalledTimes(1);
            const [sql, params] = dbGet.mock.calls[0];
            expect(sql).toContain('SELECT * FROM blockchains WHERE name = ?');
            expect(params).toEqual(['Physics']);
            expect(res.body.blockchain).toEqual(row);
        });

        test('should return 404 when blockchain not found', async () => {
            dbGet.mockResolvedValueOnce(undefined);

            const res = await request(app).get('/blockchain/Unknown');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('not found');
        });

        test('should return 500 when dbGetBlockchain fails', async () => {
            dbGet.mockRejectedValueOnce(new Error('select error'));

            const res = await request(app).get('/blockchain/Physics');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });
    });

    describe('dbGetAllBlockchains', () => {
        test('should get all blockchains via dbAll', async () => {
            const rows = [
                { name: 'B', fullName: 'B Chain', description: 'b' },
                { name: 'A', fullName: 'A Chain', description: 'a' }
            ];
            dbAll.mockResolvedValueOnce(rows);

            const res = await request(app).get('/blockchains');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(dbAll).toHaveBeenCalledTimes(1);
            const [sql] = dbAll.mock.calls[0];
            expect(sql).toContain('SELECT * FROM blockchains');
            expect(sql).toContain('ORDER BY created_at DESC');
            expect(res.body.blockchains).toEqual(rows);
        });

        test('should return 500 when dbGetAllBlockchains fails', async () => {
            dbAll.mockRejectedValueOnce(new Error('list error'));

            const res = await request(app).get('/blockchains');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });
    });

    describe('dbUpdateBlockchain', () => {
        test('should update blockchain and return updated row', async () => {
            dbRun.mockResolvedValueOnce({ changes: 1 });
            const updatedRow = { name: 'Physics', fullName: 'Physics Chain v2', description: 'desc2' };
            dbGet.mockResolvedValueOnce(updatedRow);

            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain v2', description: 'desc2' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(dbRun).toHaveBeenCalledTimes(1);
            const [sql, params] = dbRun.mock.calls[0];
            expect(sql).toContain('UPDATE blockchains');
            expect(params).toEqual(['Physics', 'Physics Chain v2', 'desc2', 'Physics']);
            expect(dbGet).toHaveBeenCalledTimes(1);
            expect(res.body.blockchain).toEqual(updatedRow);
        });

        test('should return 400 when no row is updated', async () => {
            dbRun.mockResolvedValueOnce({ changes: 0 });

            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain v2', description: 'desc2' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('update failed');
        });

        test('should return 500 when dbUpdateBlockchain fails', async () => {
            dbRun.mockRejectedValueOnce(new Error('update error'));

            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain v2', description: 'desc2' });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });
    });

    describe('dbDeleteBlockchainByName', () => {
        test('should delete blockchain and return success', async () => {
            dbRun.mockResolvedValueOnce({ changes: 1 });

            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(dbRun).toHaveBeenCalledTimes(1);
            const [sql, params] = dbRun.mock.calls[0];
            expect(sql).toContain('DELETE FROM blockchains WHERE name = ?');
            expect(params).toEqual(['Physics']);
        });

        test('should return 404 when no row is deleted', async () => {
            dbRun.mockResolvedValueOnce({ changes: 0 });

            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('not found');
        });

        test('should return 500 when dbDeleteBlockchainByName fails', async () => {
            dbRun.mockRejectedValueOnce(new Error('delete error'));

            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('db error');
        });
    });
});
