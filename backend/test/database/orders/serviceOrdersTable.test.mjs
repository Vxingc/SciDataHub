import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const dbModulePath = '../../../src/database/db.mjs';
const serviceTableModulePath = '../../../src/database/orders/serviceOrdersTable.mjs';

jest.unstable_mockModule(dbModulePath, () => ({
    dbRun: jest.fn(),
    dbGet: jest.fn(),
    dbAll: jest.fn()
}));

const dbModule = await import(dbModulePath);
const serviceTableModule = await import(serviceTableModulePath);

const { dbRun, dbGet, dbAll } = dbModule;

const {
    dbInitServiceOrderTable,
    dbDeleteServiceOrderTable,
    dbAddServiceOrder,
    dbGetAllServiceOrders,
    dbGetServiceOrdersByRequester,
    dbGetServiceOrdersByDatasetOwner,
    dbGetServiceOrdersByDataset,
    dbGetServiceOrderById,
    dbUpdateServiceOrderStatus,
    dbDeleteServiceOrder
} = serviceTableModule;

function createApp() {
    const app = express();
    app.use(express.json());

    app.post('/service/:blockchainName/table/init', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            await dbInitServiceOrderTable(blockchainName);
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.delete('/service/:blockchainName/table/drop', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            await dbDeleteServiceOrderTable(blockchainName);
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.post('/service/:blockchainName/orders', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            const { title, description, datasetName, datasetOwner, requester, serviceType, serviceConfig } = req.body;
            const id = await dbAddServiceOrder(blockchainName, title, description, datasetName, datasetOwner, requester, serviceType, serviceConfig);
            res.status(201).json({ success: true, id });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/service/:blockchainName/orders', async (req, res) => {
        try {
            const { blockchainName } = req.params;
            const rows = await dbGetAllServiceOrders(blockchainName);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/service/:blockchainName/orders/requester/:requester', async (req, res) => {
        try {
            const { blockchainName, requester } = req.params;
            const rows = await dbGetServiceOrdersByRequester(blockchainName, requester);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/service/:blockchainName/orders/owner/:owner', async (req, res) => {
        try {
            const { blockchainName, owner } = req.params;
            const rows = await dbGetServiceOrdersByDatasetOwner(blockchainName, owner);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/service/:blockchainName/orders/dataset/:datasetName', async (req, res) => {
        try {
            const { blockchainName, datasetName } = req.params;
            const rows = await dbGetServiceOrdersByDataset(blockchainName, datasetName);
            res.status(200).json({ success: true, orders: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.get('/service/:blockchainName/orders/:orderId', async (req, res) => {
        try {
            const { blockchainName, orderId } = req.params;
            const row = await dbGetServiceOrderById(blockchainName, Number(orderId));
            if (!row) {
                return res.status(404).json({ success: false, message: 'not found' });
            }
            res.status(200).json({ success: true, order: row });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.put('/service/:blockchainName/orders/:orderId/status', async (req, res) => {
        try {
            const { blockchainName, orderId } = req.params;
            const { status } = req.body;
            const row = await dbUpdateServiceOrderStatus(blockchainName, Number(orderId), status);
            res.status(200).json({ success: true, order: row });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    app.delete('/service/:blockchainName/orders/:orderId', async (req, res) => {
        try {
            const { blockchainName, orderId } = req.params;
            await dbDeleteServiceOrder(blockchainName, Number(orderId));
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'db error', error: String(err) });
        }
    });

    return app;
}

describe('serviceOrdersTable.mjs with mocked db.mjs (supertest)', () => {
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

    test('dbInitServiceOrderTable and dbDeleteServiceOrderTable issue correct SQL', async () => {
        dbRun.mockResolvedValueOnce(undefined);
        let res = await request(app).post('/service/Physics/table/init');
        expect(res.status).toBe(200);
        expect(dbRun).toHaveBeenCalledTimes(1);
        let [sql] = dbRun.mock.calls[0];
        expect(sql).toContain('CREATE TABLE IF NOT EXISTS service_orders_Physics');

        dbRun.mockResolvedValueOnce(undefined);
        res = await request(app).delete('/service/Physics/table/drop');
        expect(res.status).toBe(200);
        expect(dbRun).toHaveBeenCalledTimes(2);
        ;[sql] = dbRun.mock.calls[1];
        expect(sql).toContain('DROP TABLE IF EXISTS service_orders_Physics');
    });

    test('dbAddServiceOrder inserts row and returns id', async () => {
        dbRun.mockResolvedValueOnce({ lastID: 10 });

        const res = await request(app)
            .post('/service/Physics/orders')
            .send({
                title: 'Service A',
                description: 'desc',
                datasetName: 'ds1',
                datasetOwner: 'alice',
                requester: 'bob',
                serviceType: 'analysis',
                serviceConfig: { a: 1 }
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(10);
        expect(dbRun).toHaveBeenCalledTimes(1);
        const [sql, params] = dbRun.mock.calls[0];
        expect(sql).toContain('INSERT INTO service_orders_Physics');
        expect(params[0]).toBe('Service A');
        expect(params[6]).toBe('analysis');
        expect(params[7]).toBe(JSON.stringify({ a: 1 }));
    });

    test('dbGetAllServiceOrders parses serviceConfig JSON', async () => {
        const rows = [
            { id: 1, serviceConfig: JSON.stringify({ x: 1 }) },
            { id: 2, serviceConfig: null }
        ];
        dbAll.mockResolvedValueOnce(rows);

        const res = await request(app).get('/service/Physics/orders');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(dbAll).toHaveBeenCalledTimes(1);
        const [sql] = dbAll.mock.calls[0];
        expect(sql).toContain('SELECT * FROM service_orders_Physics');
        expect(res.body.orders[0].serviceConfig).toEqual({ x: 1 });
        expect(res.body.orders[1].serviceConfig).toBeNull();
    });

    test('dbGetServiceOrderById and dbUpdateServiceOrderStatus work together', async () => {
        dbRun.mockResolvedValueOnce({ changes: 1 });
        dbGet.mockResolvedValueOnce({ id: 1, status: 'completed', serviceConfig: JSON.stringify({ y: 2 }) });

        const res = await request(app)
            .put('/service/Physics/orders/1/status')
            .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const [sqlRun, paramsRun] = dbRun.mock.calls[0];
        expect(sqlRun).toContain('UPDATE service_orders_Physics SET status = ?');
        expect(paramsRun).toEqual(['completed', 1]);
        const [sqlGet, paramsGet] = dbGet.mock.calls[0];
        expect(sqlGet).toContain('SELECT * FROM service_orders_Physics WHERE id = ?');
        expect(paramsGet).toEqual([1]);
        expect(res.body.order.serviceConfig).toEqual({ y: 2 });
    });
});
