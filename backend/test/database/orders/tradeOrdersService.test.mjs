import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const tradeTableModulePath = '../../../src/database/orders/tradeOrdersTable.mjs';

jest.unstable_mockModule(tradeTableModulePath, () => ({
    dbAddTradeOrder: jest.fn(),
    dbGetAllTradeOrders: jest.fn(),
    dbGetTradeOrdersByRequester: jest.fn(),
    dbGetTradeOrdersByDatasetOwner: jest.fn(),
    dbGetTradeOrdersByDataset: jest.fn(),
    dbGetTradeOrderById: jest.fn(),
    dbUpdateTradeOrderStatus: jest.fn(),
    dbDeleteTradeOrder: jest.fn()
}));

const orderRoutesModule = await import('../../../src/database/orders/orderRoutes.mjs');
const tradeTableModule = await import(tradeTableModulePath);

const orderRoutes = orderRoutesModule.default;

const {
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

    app.use((req, res, next) => {
        const username = req.header('x-test-user');
        if (username) {
            req.user = { username };
        }
        next();
    });

    app.use('/', orderRoutes);
    return app;
}

describe('Trade order routes', () => {
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

    test('POST /:blockchainName/trade-orders validates fields', async () => {
        const app = createApp();

        let res = await request(app)
            .post('/chain1/trade-orders')
            .send({ title: 'T' });
        expect(res.status).toBe(400);
    });

    test('POST /:blockchainName/trade-orders creates trade order when valid', async () => {
        dbAddTradeOrder.mockResolvedValueOnce(7);

        const app = createApp();
        const res = await request(app)
            .post('/chain1/trade-orders')
            .send({
                title: 'T',
                description: 'd',
                blockchainName: 'chain1',
                datasetName: 'ds1',
                datasetOwner: 'alice',
                requester: 'bob',
                maskingRules: { r: 1 }
            });

        expect(res.status).toBe(201);
        expect(res.body.data.orderId).toBe(7);
        expect(dbAddTradeOrder).toHaveBeenCalledWith(
            'chain1',
            'T',
            'd',
            'ds1',
            'alice',
            'bob',
            { r: 1 }
        );
    });

    test('GET /:blockchainName/trade-orders returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetAllTradeOrders.mockResolvedValueOnce(orders);

        const app = createApp();
        const res = await request(app).get('/chain1/trade-orders');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetAllTradeOrders).toHaveBeenCalledWith('chain1');
    });

    test('GET /:blockchainName/trade-orders/requester requires auth and returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetTradeOrdersByRequester.mockResolvedValueOnce(orders);

        const app = createApp();

        let res = await request(app).get('/chain1/trade-orders/requester');
        expect(res.status).toBe(401);

        res = await request(app)
            .get('/chain1/trade-orders/requester')
            .set('x-test-user', 'bob');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetTradeOrdersByRequester).toHaveBeenCalledWith('chain1', 'bob');
    });

    test('GET /:blockchainName/trade-orders/owner/:owner returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetTradeOrdersByDatasetOwner.mockResolvedValueOnce(orders);

        const app = createApp();
        const res = await request(app).get('/chain1/trade-orders/owner/alice');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetTradeOrdersByDatasetOwner).toHaveBeenCalledWith('chain1', 'alice');
    });

    test('GET /:blockchainName/trade-orders/dataset/:datasetName returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetTradeOrdersByDataset.mockResolvedValueOnce(orders);

        const app = createApp();
        const res = await request(app).get('/chain1/trade-orders/dataset/ds1');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetTradeOrdersByDataset).toHaveBeenCalledWith('chain1', 'ds1');
    });

    test('GET /:blockchainName/trade-orders/:orderId returns order or 404', async () => {
        const order = { id: 1 };
        dbGetTradeOrderById.mockResolvedValueOnce(order);

        const app = createApp();
        let res = await request(app).get('/chain1/trade-orders/1');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(order);

        dbGetTradeOrderById.mockResolvedValueOnce(null);
        res = await request(app).get('/chain1/trade-orders/2');
        expect(res.status).toBe(404);
    });

    test('PUT /:blockchainName/trade-orders/:orderId/status validates status and returns updated order', async () => {
        const order = { id: 1, status: 'completed' };
        dbUpdateTradeOrderStatus.mockResolvedValueOnce(order);

        const app = createApp();
        let res = await request(app)
            .put('/chain1/trade-orders/1/status')
            .send({});
        expect(res.status).toBe(400);

        res = await request(app)
            .put('/chain1/trade-orders/1/status')
            .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(order);
        expect(dbUpdateTradeOrderStatus).toHaveBeenCalledWith('chain1', 1, 'completed');
    });

    test('DELETE /:blockchainName/trade-orders/:orderId enforces auth and ownership', async () => {
        const order = { id: 1, requester: 'bob', datasetOwner: 'alice' };
        dbGetTradeOrderById.mockResolvedValue(order);

        const app = createApp();

        let res = await request(app).delete('/chain1/trade-orders/1');
        expect(res.status).toBe(401);

        res = await request(app)
            .delete('/chain1/trade-orders/1')
            .set('x-test-user', 'charlie');
        expect(res.status).toBe(403);

        dbGetTradeOrderById.mockResolvedValueOnce(order);
        dbDeleteTradeOrder.mockResolvedValueOnce(true);
        res = await request(app)
            .delete('/chain1/trade-orders/1')
            .set('x-test-user', 'bob');
        expect(res.status).toBe(200);
        expect(dbDeleteTradeOrder).toHaveBeenCalledWith('chain1', 1);
    });
});
