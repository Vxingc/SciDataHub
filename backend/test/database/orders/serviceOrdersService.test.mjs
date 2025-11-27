import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const serviceTableModulePath = '../../../src/database/orders/serviceOrdersTable.mjs';

jest.unstable_mockModule(serviceTableModulePath, () => ({
    dbAddServiceOrder: jest.fn(),
    dbGetAllServiceOrders: jest.fn(),
    dbGetServiceOrdersByRequester: jest.fn(),
    dbGetServiceOrdersByDatasetOwner: jest.fn(),
    dbGetServiceOrdersByDataset: jest.fn(),
    dbGetServiceOrderById: jest.fn(),
    dbUpdateServiceOrderStatus: jest.fn(),
    dbDeleteServiceOrder: jest.fn()
}));

const orderRoutesModule = await import('../../../src/database/orders/orderRoutes.mjs');
const serviceTableModule = await import(serviceTableModulePath);

const orderRoutes = orderRoutesModule.default;

const {
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

describe('Service order routes', () => {
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

    test('POST /:blockchainName/service-orders validates required fields and auth', async () => {
        const app = createApp();

        let res = await request(app)
            .post('/chain1/service-orders')
            .send({ title: 'S', blockchainName: 'chain1' });
        expect(res.status).toBe(400);

        res = await request(app)
            .post('/chain1/service-orders')
            .send({
                title: 'S',
                description: 'd',
                blockchainName: 'chain1',
                datasetName: 'ds1',
                datasetOwner: 'alice',
                serviceType: 'analysis'
            });
        expect(res.status).toBe(401);
    });

    test('POST /:blockchainName/service-orders creates order when valid', async () => {
        dbAddServiceOrder.mockResolvedValueOnce(42);

        const app = createApp();
        const res = await request(app)
            .post('/chain1/service-orders')
            .set('x-test-user', 'bob')
            .send({
                title: 'S',
                description: 'd',
                blockchainName: 'chain1',
                datasetName: 'ds1',
                datasetOwner: 'alice',
                serviceType: 'analysis',
                serviceConfig: { a: 1 }
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.orderId).toBe(42);
        expect(dbAddServiceOrder).toHaveBeenCalledWith(
            'chain1',
            'S',
            'd',
            'ds1',
            'alice',
            'bob',
            'analysis',
            { a: 1 }
        );
    });

    test('GET /:blockchainName/service-orders returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetAllServiceOrders.mockResolvedValueOnce(orders);

        const app = createApp();
        const res = await request(app).get('/chain1/service-orders');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(orders);
        expect(dbGetAllServiceOrders).toHaveBeenCalledWith('chain1');
    });

    test('GET /:blockchainName/service-orders/requester requires auth and returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetServiceOrdersByRequester.mockResolvedValueOnce(orders);

        const app = createApp();

        let res = await request(app).get('/chain1/service-orders/requester');
        expect(res.status).toBe(401);

        res = await request(app)
            .get('/chain1/service-orders/requester')
            .set('x-test-user', 'bob');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetServiceOrdersByRequester).toHaveBeenCalledWith('chain1', 'bob');
    });

    test('GET /:blockchainName/service-orders/owner/:owner returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetServiceOrdersByDatasetOwner.mockResolvedValueOnce(orders);

        const app = createApp();
        const res = await request(app).get('/chain1/service-orders/owner/alice');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetServiceOrdersByDatasetOwner).toHaveBeenCalledWith('chain1', 'alice');
    });

    test('GET /:blockchainName/service-orders/dataset/:datasetName returns list', async () => {
        const orders = [{ id: 1 }];
        dbGetServiceOrdersByDataset.mockResolvedValueOnce(orders);

        const app = createApp();
        const res = await request(app).get('/chain1/service-orders/dataset/ds1');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(orders);
        expect(dbGetServiceOrdersByDataset).toHaveBeenCalledWith('chain1', 'ds1');
    });

    test('GET /:blockchainName/service-orders/:orderId returns order or 404', async () => {
        const order = { id: 1 };
        dbGetServiceOrderById.mockResolvedValueOnce(order);

        const app = createApp();
        let res = await request(app).get('/chain1/service-orders/1');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(order);

        dbGetServiceOrderById.mockResolvedValueOnce(null);
        res = await request(app).get('/chain1/service-orders/2');
        expect(res.status).toBe(404);
    });

    test('PUT /:blockchainName/service-orders/:orderId/status validates status and returns updated order', async () => {
        const order = { id: 1, status: 'completed' };
        dbUpdateServiceOrderStatus.mockResolvedValueOnce(order);

        const app = createApp();
        let res = await request(app)
            .put('/chain1/service-orders/1/status')
            .send({});
        expect(res.status).toBe(400);

        res = await request(app)
            .put('/chain1/service-orders/1/status')
            .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(order);
        expect(dbUpdateServiceOrderStatus).toHaveBeenCalledWith('chain1', 1, 'completed');
    });

    test('DELETE /:blockchainName/service-orders/:orderId enforces auth and ownership', async () => {
        const order = { id: 1, requester: 'bob', datasetOwner: 'alice' };
        dbGetServiceOrderById.mockResolvedValue(order);

        const app = createApp();

        let res = await request(app).delete('/chain1/service-orders/1');
        expect(res.status).toBe(401);

        res = await request(app)
            .delete('/chain1/service-orders/1')
            .set('x-test-user', 'charlie');
        expect(res.status).toBe(403);

        dbGetServiceOrderById.mockResolvedValueOnce(order);
        dbDeleteServiceOrder.mockResolvedValueOnce(true);
        res = await request(app)
            .delete('/chain1/service-orders/1')
            .set('x-test-user', 'bob');
        expect(res.status).toBe(200);
        expect(dbDeleteServiceOrder).toHaveBeenCalledWith('chain1', 1);
    });
});
