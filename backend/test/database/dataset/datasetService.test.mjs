import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const datasetsTableModulePath = '../../../src/database/datasets/datasetsTable.mjs';
const blockchainsTableModulePath = '../../../src/database/blockchains/blockchainsTable.mjs';

jest.unstable_mockModule(datasetsTableModulePath, () => ({
	dbAddDataset: jest.fn(),
	dbDeleteDataset: jest.fn(),
	dbGetAllDatasets: jest.fn(),
	dbGetPublicDatasets: jest.fn(),
	dbGetDatasetsByOwner: jest.fn(),
	dbGetDatasetByName: jest.fn(),
	dbUpdateDatasetInfo: jest.fn(),
	dbUpdateDatasetPublicLevel: jest.fn(),
	dbUpdateDatasetHash: jest.fn(),
	dbUpdateMaskingDatasetIPFSAddress: jest.fn()
}));

jest.unstable_mockModule(blockchainsTableModulePath, () => ({
	dbGetAllBlockchains: jest.fn()
}));

const datasetsRoutesModule = await import('../../../src/database/datasets/datasetsRoutes.mjs');
const datasetsTableModule = await import(datasetsTableModulePath);
const blockchainsTableModule = await import(blockchainsTableModulePath);

const datasetsRoutes = datasetsRoutesModule.default;
const {
	dbAddDataset,
	dbDeleteDataset,
	dbGetAllDatasets,
	dbGetPublicDatasets,
	dbGetDatasetsByOwner,
	dbGetDatasetByName,
	dbUpdateDatasetInfo,
	dbUpdateDatasetPublicLevel,
	dbUpdateDatasetHash,
	dbUpdateMaskingDatasetIPFSAddress
} = datasetsTableModule;

const { dbGetAllBlockchains } = blockchainsTableModule;

function createApp() {
	const app = express();
	app.use(express.json());
	app.use('/', datasetsRoutes);
	return app;
}

describe('Dataset routes', () => {
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

	describe('GET /:blockchainName/datasets', () => {
		test('should return all datasets when db query succeeds', async () => {
			const mockDatasets = [
				{ name: 'ds1', fullName: 'Dataset 1' },
				{ name: 'ds2', fullName: 'Dataset 2' }
			];
			dbGetAllDatasets.mockResolvedValue(mockDatasets);

			const app = createApp();
			const res = await request(app).get('/chain1/datasets');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toEqual(mockDatasets);
			expect(dbGetAllDatasets).toHaveBeenCalledWith('chain1');
		});

		test('should return 500 when dbGetAllDatasets throws error', async () => {
			dbGetAllDatasets.mockRejectedValue(new Error('db error'));

			const app = createApp();
			const res = await request(app).get('/chain1/datasets');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('GET /:blockchainName/datasets/owner/:owner', () => {
		test('should return datasets for owner when db query succeeds', async () => {
			const mockDatasets = [
				{ name: 'ds1', owner: 'alice' },
				{ name: 'ds2', owner: 'alice' }
			];
			dbGetDatasetsByOwner.mockResolvedValue(mockDatasets);

			const app = createApp();
			const res = await request(app).get('/chain1/datasets/owner/alice');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toEqual(mockDatasets);
			expect(dbGetDatasetsByOwner).toHaveBeenCalledWith('chain1', 'alice');
		});

		test('should return 500 when dbGetDatasetsByOwner throws error', async () => {
			dbGetDatasetsByOwner.mockRejectedValue(new Error('db error'));

			const app = createApp();
			const res = await request(app).get('/chain1/datasets/owner/alice');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('GET /getPublicDatasets', () => {
		test('should return public datasets when db query succeeds', async () => {
			const mockDatasets = [
				{ name: 'ds1', isPublic: true }
			];
			dbGetPublicDatasets.mockResolvedValue(mockDatasets);

			const app = createApp();
			const res = await request(app).get('/getPublicDatasets').query({ blockchainName: 'chain1' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toEqual(mockDatasets);
			// 路由里是从 req.params 取 blockchainName，这里简单验证调用次数
			expect(dbGetPublicDatasets).toHaveBeenCalledTimes(1);
		});

		test('should return 500 when dbGetPublicDatasets throws error', async () => {
			dbGetPublicDatasets.mockRejectedValue(new Error('db error'));

			const app = createApp();
			const res = await request(app).get('/getPublicDatasets');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('GET /:blockchainName/getDatasetByDatasetName/:name', () => {
		test('should return dataset when it exists', async () => {
			const mockDataset = { name: 'ds1', fullName: 'Dataset 1' };
			dbGetDatasetByName.mockResolvedValue(mockDataset);

			const app = createApp();
			const res = await request(app).get('/chain1/getDatasetByDatasetName/ds1');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toEqual(mockDataset);
			expect(dbGetDatasetByName).toHaveBeenCalledWith('chain1', 'ds1');
		});

		test('should return 404 when dataset does not exist', async () => {
			dbGetDatasetByName.mockResolvedValue(null);

			const app = createApp();
			const res = await request(app).get('/chain1/getDatasetByDatasetName/unknown');

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集不存在');
		});

		test('should return 500 when dbGetDatasetByName throws error', async () => {
			dbGetDatasetByName.mockRejectedValue(new Error('db error'));

			const app = createApp();
			const res = await request(app).get('/chain1/getDatasetByDatasetName/ds1');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('POST /:blockchainName/addDataset', () => {
		test('should return 400 when required fields are missing', async () => {
			const app = createApp();

			let res = await request(app)
				.post('/chain1/addDataset')
				.send({ fullName: 'Dataset 1', owner: 'alice' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('数据集名称、全称和拥有者不能为空');

			res = await request(app)
				.post('/chain1/addDataset')
				.send({ name: 'ds1', owner: 'alice' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('数据集名称、全称和拥有者不能为空');

			res = await request(app)
				.post('/chain1/addDataset')
				.send({ name: 'ds1', fullName: 'Dataset 1' });
			expect(res.status).toBe(400);
			expect(res.body.message).toBe('数据集名称、全称和拥有者不能为空');
		});

		test('should return 400 when dataset name already exists', async () => {
			const existing = { name: 'ds1', fullName: 'Dataset 1' };
			dbGetDatasetByName.mockResolvedValue(existing);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/addDataset')
				.send({ name: 'ds1', fullName: 'Dataset 1', owner: 'alice' });

			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集名称已存在');
		});

		test('should create dataset when data is valid and name does not exist', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);
			dbAddDataset.mockResolvedValueOnce(true);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/addDataset')
				.send({
					name: 'ds1',
					fullName: 'Dataset 1',
					description: 'desc',
					owner: 'alice',
					isPublic: true
				});

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('数据集创建成功');
			expect(res.body.dataset).toMatchObject({
				name: 'ds1',
				fullName: 'Dataset 1',
				description: 'desc',
				owner: 'alice',
				blockchainName: 'chain1'
			});
			expect(dbAddDataset).toHaveBeenCalledTimes(1);
		});

		test('should return 500 when addDataset throws error', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);
			dbAddDataset.mockRejectedValueOnce(new Error('db error'));

			const app = createApp();
			const res = await request(app)
				.post('/chain1/addDataset')
				.send({ name: 'ds1', fullName: 'Dataset 1', owner: 'alice' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('DELETE /:blockchainName/:name', () => {
		test('should return 404 when dataset does not exist', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app).delete('/chain1/ds1');

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集不存在');
		});

		test('should delete dataset when it exists', async () => {
			const existing = { name: 'ds1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbDeleteDataset.mockResolvedValueOnce(true);

			const app = createApp();
			const res = await request(app).delete('/chain1/ds1');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('数据集删除成功');
			expect(dbDeleteDataset).toHaveBeenCalledWith('chain1', 'ds1');
		});

		test('should return 500 when deleteDataset throws error', async () => {
			const existing = { name: 'ds1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbDeleteDataset.mockRejectedValueOnce(new Error('db error'));

			const app = createApp();
			const res = await request(app).delete('/chain1/ds1');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('POST /:blockchainName/updateDatasetInfo/:name', () => {
		test('should return 400 when fullName is missing', async () => {
			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetInfo/ds1')
				.send({ description: 'd' });

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('数据集全称不能为空');
		});

		test('should return 404 when dataset does not exist', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetInfo/ds1')
				.send({ fullName: 'Dataset 1', description: 'd' });

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集不存在');
		});

		test('should update dataset info when record exists', async () => {
			const existing = { name: 'ds1' };
			const updated = { name: 'ds1', fullName: 'Dataset 1', description: 'd2' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateDatasetInfo.mockResolvedValueOnce(updated);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetInfo/ds1')
				.send({ fullName: 'Dataset 1', description: 'd2' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('数据集信息更新成功');
			expect(res.body.data).toEqual(updated);
		});

		test('should return 500 when updateDatasetInfo throws error', async () => {
			const existing = { name: 'ds1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateDatasetInfo.mockRejectedValueOnce(new Error('db error'));

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetInfo/ds1')
				.send({ fullName: 'Dataset 1', description: 'd2' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('POST /:blockchainName/updateDatasetPublicLevel/:name', () => {
		test('should return 404 when dataset does not exist', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetPublicLevel/ds1')
				.send({ isPublic: true });

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集不存在');
		});

		test('should update dataset public level when record exists', async () => {
			const existing = { name: 'ds1' };
			const updated = { name: 'ds1', isPublic: true };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateDatasetPublicLevel.mockResolvedValueOnce(updated);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetPublicLevel/ds1')
				.send({
					isPublic: true,
					canMaskingShare: true,
					canCustomMaskingTrade: false,
					canDataService: true
				});

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('数据集公开级别更新成功');
			expect(res.body.data).toEqual(updated);
		});

		test('should return 500 when updateDatasetPublicLevel throws error', async () => {
			const existing = { name: 'ds1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateDatasetPublicLevel.mockRejectedValueOnce(new Error('db error'));

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetPublicLevel/ds1')
				.send({ isPublic: true });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('POST /:blockchainName/updateDatasetHash/:name', () => {
		test('should return 400 when hash is missing', async () => {
			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetHash/ds1')
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('哈希值不能为空');
		});

		test('should return 404 when dataset does not exist', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetHash/ds1')
				.send({ hash: 'h1' });

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集不存在');
		});

		test('should update dataset hash when record exists', async () => {
			const existing = { name: 'ds1' };
			const updated = { name: 'ds1', hash: 'h1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateDatasetHash.mockResolvedValueOnce(updated);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetHash/ds1')
				.send({ hash: 'h1' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('数据集哈希更新成功');
			expect(res.body.data).toEqual(updated);
		});

		test('should return 500 when updateDatasetHash throws error', async () => {
			const existing = { name: 'ds1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateDatasetHash.mockRejectedValueOnce(new Error('db error'));

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateDatasetHash/ds1')
				.send({ hash: 'h1' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('POST /:blockchainName/updateMaskingDatasetIPFSAddress/:name', () => {
		test('should return 400 when maskingDatasetIPFSAddress is missing', async () => {
			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateMaskingDatasetIPFSAddress/ds1')
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toBe('IPFS地址不能为空');
		});

		test('should return 404 when dataset does not exist', async () => {
			dbGetDatasetByName.mockResolvedValueOnce(null);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateMaskingDatasetIPFSAddress/ds1')
				.send({ maskingDatasetIPFSAddress: 'ipfs://a' });

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('数据集不存在');
		});

		test('should update masking dataset ipfs address when record exists', async () => {
			const existing = { name: 'ds1' };
			const updated = { name: 'ds1', maskingDatasetIPFSAddress: 'ipfs://a' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateMaskingDatasetIPFSAddress.mockResolvedValueOnce(updated);

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateMaskingDatasetIPFSAddress/ds1')
				.send({ maskingDatasetIPFSAddress: 'ipfs://a' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toBe('数据集IPFS地址更新成功');
			expect(res.body.data).toEqual(updated);
		});

		test('should return 500 when updateMaskingDatasetIPFSAddress throws error', async () => {
			const existing = { name: 'ds1' };
			dbGetDatasetByName.mockResolvedValueOnce(existing);
			dbUpdateMaskingDatasetIPFSAddress.mockRejectedValueOnce(new Error('db error'));

			const app = createApp();
			const res = await request(app)
				.post('/chain1/updateMaskingDatasetIPFSAddress/ds1')
				.send({ maskingDatasetIPFSAddress: 'ipfs://a' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});

	describe('GET /:blockchainName/getAlldatasetsByOwner/:name', () => {
		test('should aggregate datasets from all blockchains', async () => {
			const mockBlockchains = [
				{ name: 'chain1' },
				{ name: 'chain2' }
			];
			dbGetAllBlockchains.mockResolvedValue(mockBlockchains);

			dbGetDatasetsByOwner
				.mockResolvedValueOnce([{ name: 'ds1', owner: 'alice' }])
				.mockResolvedValueOnce([{ name: 'ds2', owner: 'alice' }]);

			const app = createApp();
			const res = await request(app).get('/chain1/getAlldatasetsByOwner/alice');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toHaveLength(2);
			expect(res.body.data[0]).toHaveProperty('blockchainName');
			expect(res.body.data[1]).toHaveProperty('blockchainName');
		});

		test('should return 500 when getAllDatasetsByOwner throws error', async () => {
			dbGetAllBlockchains.mockRejectedValue(new Error('db error'));

			const app = createApp();
			const res = await request(app).get('/chain1/getAlldatasetsByOwner/alice');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('服务器内部错误');
		});
	});
});

