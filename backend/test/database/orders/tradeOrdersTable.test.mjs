import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const dbModulePath = '../../../src/database/db.mjs';
const tradeTableModulePath = '../../../src/database/orders/tradeOrdersTable.mjs';

jest.unstable_mockModule(dbModulePath, () => ({
    dbRun: jest.fn(),
    dbGet: jest.fn(),
    dbAll: jest.fn()
}));

const dbModule = await import(dbModulePath);
const tradeTableModule = await import(tradeTableModulePath);

const { dbRun, dbGet, dbAll } = dbModule;

const {
    dbInitTradeOrderTable,
    dbDeleteTradeOrderTable,
    dbAddTradeOrder,
    dbGetAllTradeOrders,
    dbGetTradeOrdersByRequester,
    dbGetTradeOrdersByDatasetOwner,
    dbGetTradeOrdersByDataset,
    dbGetTradeOrderById,
    dbUpdateTradeOrderStatus,
    dbDeleteTradeOrder
} = tradeTableModule;

function createApp() {
    const app = express();
    app.use(express.json());

    app.post('/trade/:blockchainName/table/init', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            await dbInitTradeOrderTable(blockchainName);
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.delete('/trade/:blockchainName/table/drop', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            await dbDeleteTradeOrderTable(blockchainName);
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.post('/trade/:blockchainName/orders', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            const { title, description, datasetName, datasetOwner, requester, maskingRules } = req.body;
            const id = await dbAddTradeOrder(blockchainName, title, description, datasetName, datasetOwner, requester, maskingRules);
            res.status(201).json({ success: true, id });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/trade/:blockchainName/orders', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            const rows = await dbGetAllTradeOrders(blockchainName);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/trade/:blockchainName/orders/requester/:requester', async (req, res) => {
        try {
            const { blockchainName, requester } = req.params;
            const rows = await dbGetTradeOrdersByRequester(blockchainName, requester);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/trade/:blockchainName/orders/owner/:owner', async (req, res) => {
        try {
            const { blockchainName, owner } = req.params;
            const rows = await dbGetTradeOrdersByDatasetOwner(blockchainName, owner);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/trade/:blockchainName/orders/dataset/:datasetName', async (req, res) => {
        try {
            const { blockchainName, datasetName } = req.params;
            const rows = await dbGetTradeOrdersByDataset(blockchainName, datasetName);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/trade/:blockchainName/orders/:orderId', async (req, res) => {
        try {
            const { blockchainName, orderId } = req.params;
            const row = await dbGetTradeOrderById(blockchainName, Number(orderId));
            if (!row) {
                return res.status(404).json({ success: false, message: 'not found' });
            }
            res.status(200).json({ success: true, order: row });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.put('/trade/:blockchainName/orders/:orderId/status', async (req, res) => {
        try {
            const { blockchainName, orderId } = req.params;
            const { status } = req.body;
            const row = await dbUpdateTradeOrderStatus(blockchainName, Number(orderId), status);
            res.status(200).json({ success: true, order: row });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.delete('/trade/:blockchainName/orders/:orderId', async (req, res) => {
        try {
            const { blockchainName, orderId } = req.params;
            await dbDeleteTradeOrder(blockchainName, Number(orderId));
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    return app;
}

describe('tradeOrdersTable.mjs with mocked db.mjs (supertest)', () => {
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

    test('dbInitTradeOrderTable and dbDeleteTradeOrderTable issue correct SQL', async () => {
        dbRun.mockResolvedValueOnce(undefined);
        let res = await request(app).post('/trade/Physics/table/init');
        expect(res.status).toBe(200);
        expect(dbRun).toHaveBeenCalledTimes(1);
        let [sql] = dbRun.mock.calls[0];
        expect(sql).toContain('CREATE TABLE IF NOT EXISTS trade_orders_Physics');

        dbRun.mockResolvedValueOnce(undefined);
        res = await request(app).delete('/trade/Physics/table/drop');
        expect(res.status).toBe(200);
        expect(dbRun).toHaveBeenCalledTimes(2);
        ;[sql] = dbRun.mock.calls[1];
        expect(sql).toContain('DROP TABLE IF EXISTS trade_orders_Physics');
    });

    test('dbAddTradeOrder inserts row and returns id', async () => {
        dbRun.mockResolvedValueOnce({ lastID: 5 });

        const res = await request(app)
            .post('/trade/Physics/orders')
            .send({
                title: 'Trade A',
                description: 'desc',
                datasetName: 'ds1',
                datasetOwner: 'alice',
                requester: 'bob',
                maskingRules: { k: 'v' }
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(5);
        expect(dbRun).toHaveBeenCalledTimes(1);
        const [sql, params] = dbRun.mock.calls[0];
        expect(sql).toContain('INSERT INTO trade_orders_Physics');
        expect(params[0]).toBe('Trade A');
        expect(params[6]).toBe(JSON.stringify({ k: 'v' }));
    });

    test('dbGetAllTradeOrders parses maskingRules JSON', async () => {
        const rows = [
            { id: 1, maskingRules: JSON.stringify({ a: 1 }) }
        ];
        dbAll.mockResolvedValueOnce(rows);

        const res = await request(app).get('/trade/Physics/orders');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(dbAll).toHaveBeenCalledTimes(1);
        const [sql] = dbAll.mock.calls[0];
        expect(sql).toContain('SELECT * FROM trade_orders_Physics');
        expect(res.body.orders[0].maskingRules).toEqual({ a: 1 });
    });

    test('dbGetTradeOrderById and dbUpdateTradeOrderStatus work together', async () => {
        dbRun.mockResolvedValueOnce({ changes: 1 });
        dbGet.mockResolvedValueOnce({ id: 1, status: 'completed', maskingRules: JSON.stringify({ z: 9 }) });

        const res = await request(app)
            .put('/trade/Physics/orders/1/status')
            .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const [sqlRun, paramsRun] = dbRun.mock.calls[0];
        expect(sqlRun).toContain('UPDATE trade_orders_Physics SET status = ?');
        expect(paramsRun).toEqual(['completed', 1]);
        const [sqlGet, paramsGet] = dbGet.mock.calls[0];
        expect(sqlGet).toContain('SELECT * FROM trade_orders_Physics WHERE id = ?');
        expect(paramsGet).toEqual([1]);
        expect(res.body.order.maskingRules).toEqual({ z: 9 });
    });
});
