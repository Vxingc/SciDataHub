import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const tableModulePath = '../../../src/database/blockchains/blockchainsTable.mjs';

jest.unstable_mockModule(tableModulePath, () => ({
    dbAddBlockchain: jest.fn(),
    dbGetBlockchain: jest.fn(),
    dbGetAllBlockchains: jest.fn(),
    dbUpdateBlockchain: jest.fn(),
    dbDeleteBlockchainByName: jest.fn()
}));

const blockchainRoutesModule = await import('../../../src/database/blockchains/blockchainsRoutes.mjs');
const tableModule = await import(tableModulePath);


const blockchainRoutes = blockchainRoutesModule.default;
const {
    dbAddBlockchain,
    dbGetBlockchain,
    dbGetAllBlockchains,
    dbUpdateBlockchain,
    dbDeleteBlockchainByName
} = tableModule;

function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/', blockchainRoutes);
    return app;
}

describe('Blockchain routes', () => {
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

    describe('GET /getblockchains', () => {
        test('should return all blockchains when db query succeeds', async () => {
            const mockBlockchains = [
                { name: 'Physics', fullName: 'Physics Chain', description: 'desc1' },
                { name: 'Biology', fullName: 'Biology Chain', description: 'desc2' }
            ];

            dbGetAllBlockchains.mockResolvedValue(mockBlockchains);

            const app = createApp();
            const res = await request(app).get('/getblockchains');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.blockchains).toEqual(mockBlockchains);
            expect(dbGetAllBlockchains).toHaveBeenCalledTimes(1);
        });

        test('should return 500 when dbGetAllBlockchains throws error', async () => {
            dbGetAllBlockchains.mockRejectedValue(new Error('db error'));

            const app = createApp();
            const res = await request(app).get('/getblockchains');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('服务器内部错误');
        });
    });

    describe('GET /blockchain/:name', () => {
        test('should return blockchain when it exists', async () => {
            const mockBlockchain = { name: 'Physics', fullName: 'Physics Chain', description: 'desc' };
            dbGetBlockchain.mockResolvedValue(mockBlockchain);

            const app = createApp();
            const res = await request(app).get('/blockchain/Physics');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.blockchain).toEqual(mockBlockchain);
            expect(dbGetBlockchain).toHaveBeenCalledWith('Physics');
        });

        test('should return 404 when blockchain does not exist', async () => {
            dbGetBlockchain.mockResolvedValue(null);

            const app = createApp();
            const res = await request(app).get('/blockchain/Unknown');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('区块链记录不存在');
        });

        test('should return 500 when dbGetBlockchain throws error', async () => {
            dbGetBlockchain.mockRejectedValue(new Error('db error'));

            const app = createApp();
            const res = await request(app).get('/blockchain/Physics');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('服务器内部错误');
        });
    });

    describe('POST /blockchain', () => {
        test('should return 400 when name or fullName is missing', async () => {
            const app = createApp();

            let res = await request(app).post('/blockchain').send({ fullName: 'Full', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链名称和全称不能为空');

            res = await request(app).post('/blockchain').send({ name: 'N', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链名称和全称不能为空');
        });

        test('should validate name and fullName length', async () => {
            const app = createApp();

            let res = await request(app).post('/blockchain').send({ name: 'A', fullName: 'Full', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链名称至少需要2个字符');

            res = await request(app).post('/blockchain').send({ name: 'AB', fullName: 'Fo', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链全称至少需要3个字符');
        });

        test('should return 400 when blockchain name already exists', async () => {
            const existing = { name: 'Physics', fullName: 'Physics Chain', description: 'old' };
            dbGetBlockchain.mockResolvedValue(existing);

            const app = createApp();
            const res = await request(app)
                .post('/blockchain')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'new' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('区块链名称已存在');
        });

        test('should create blockchain when data is valid and name does not exist', async () => {
            dbGetBlockchain.mockResolvedValueOnce(null);
            const created = { name: 'Physics', fullName: 'Physics Chain', description: 'desc' };
            dbAddBlockchain.mockResolvedValue(created);

            const app = createApp();
            const res = await request(app)
                .post('/blockchain')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'desc' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('区块链记录创建成功');
            expect(res.body.blockchain).toEqual({
                id: created.id,
                name: created.name,
                fullName: created.fullName,
                description: created.description
            });
            expect(dbAddBlockchain).toHaveBeenCalledWith('Physics', 'Physics Chain', 'desc');
        });

        test('should return 500 when addBlockchain throws error', async () => {
            dbGetBlockchain.mockResolvedValueOnce(null);
            dbAddBlockchain.mockRejectedValue(new Error('db error'));

            const app = createApp();
            const res = await request(app)
                .post('/blockchain')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'desc' });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('服务器内部错误');
        });
    });

    describe('PUT /blockchain/:name', () => {
        test('should return 400 when name or fullName is missing', async () => {
            const app = createApp();

            let res = await request(app)
                .put('/blockchain/Physics')
                .send({ fullName: 'Physics Chain', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链名称和全称不能为空');

            res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链名称和全称不能为空');
        });

        test('should validate name and fullName length', async () => {
            const app = createApp();

            let res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'A', fullName: 'Physics Chain', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链名称至少需要2个字符');

            res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Ph', description: 'd' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('区块链全称至少需要3个字符');
        });

        test('should return 404 when blockchain does not exist', async () => {
            dbGetBlockchain.mockResolvedValueOnce(null);

            const app = createApp();
            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'd' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('区块链记录不存在');
        });

        test('should return 400 when update does not change any row', async () => {
            const existing = { name: 'Physics', fullName: 'Old', description: 'old' };
            dbGetBlockchain.mockResolvedValueOnce(existing);
            dbUpdateBlockchain.mockResolvedValueOnce({ changes: 0, name: 'Physics' });

            const app = createApp();
            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'd' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('更新失败，记录可能不存在');
        });

        test('should update blockchain when data is valid and record exists', async () => {
            const existing = { name: 'Physics', fullName: 'Old', description: 'old' };
            const updated = { name: 'Physics', fullName: 'Physics Chain', description: 'new' };

            dbGetBlockchain
                .mockResolvedValueOnce(existing) // existence check
                .mockResolvedValueOnce(updated); // fetch updated record

            dbUpdateBlockchain.mockResolvedValueOnce({ changes: 1, name: 'Physics' });

            const app = createApp();
            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'new' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('区块链记录更新成功');
            expect(res.body.blockchain).toEqual(updated);
        });

        test('should return 500 when updateBlockchain throws error', async () => {
            const existing = { name: 'Physics', fullName: 'Old', description: 'old' };
            dbGetBlockchain.mockResolvedValueOnce(existing);
            dbUpdateBlockchain.mockRejectedValueOnce(new Error('db error'));

            const app = createApp();
            const res = await request(app)
                .put('/blockchain/Physics')
                .send({ name: 'Physics', fullName: 'Physics Chain', description: 'new' });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('服务器内部错误');
        });
    });

    describe('DELETE /blockchain/:name', () => {
        test('should return 404 when blockchain does not exist', async () => {
            dbGetBlockchain.mockResolvedValueOnce(null);

            const app = createApp();
            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('区块链记录不存在');
        });

        test('should return 400 when delete does not affect any row', async () => {
            const existing = { name: 'Physics', fullName: 'Old', description: 'old' };
            dbGetBlockchain.mockResolvedValueOnce(existing);
            dbDeleteBlockchainByName.mockResolvedValueOnce({ changes: 0, name: 'Physics' });

            const app = createApp();
            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('删除失败，记录可能不存在');
        });

        test('should delete blockchain when record exists', async () => {
            const existing = { name: 'Physics', fullName: 'Old', description: 'old' };
            dbGetBlockchain.mockResolvedValueOnce(existing);
            dbDeleteBlockchainByName.mockResolvedValueOnce({ changes: 1, name: 'Physics' });

            const app = createApp();
            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('区块链记录删除成功');
        });

        test('should return 500 when deleteBlockchain throws error', async () => {
            const existing = { name: 'Physics', fullName: 'Old', description: 'old' };
            dbGetBlockchain.mockResolvedValueOnce(existing);
            dbDeleteBlockchainByName.mockRejectedValueOnce(new Error('db error'));

            const app = createApp();
            const res = await request(app).delete('/blockchain/Physics');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('服务器内部错误');
        });
    });
});

