import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const dbModulePath = '../../../src/database/db.mjs';
const tableModulePath = '../../../src/database/datasets/datasetsTable.mjs';

jest.unstable_mockModule(dbModulePath, () => ({
	dbRun: jest.fn(),
	dbGet: jest.fn(),
	dbAll: jest.fn()
}));

const dbModule = await import(dbModulePath);
const tableModule = await import(tableModulePath);

const { dbRun, dbGet, dbAll } = dbModule;
const {
	dbInitDatasetTable,
	dbDeleteDatasetTable,
	dbAddDataset,
	dbDeleteDataset,
	dbGetAllDatasets,
	dbGetPublicDatasets,
	dbUpdateDatasetInfo,
	dbUpdateDatasetPublicLevel,
	dbUpdateDatasetHash,
	dbUpdateMaskingDatasetIPFSAddress,
	dbGetDatasetByName,
	dbGetDatasetsByOwner
} = tableModule;

function createApp() {
	const app = express();
	app.use(express.json());

	app.post('/table/:blockchainName/init', async (req, res) => {
		try {
			const { blockchainName } = req.params;
			await dbInitDatasetTable(blockchainName);
			res.status(200).json({ success: true });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.delete('/table/:blockchainName/drop', async (req, res) => {
		try {
			const { blockchainName } = req.params;
			await dbDeleteDatasetTable(blockchainName);
			res.status(200).json({ success: true });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.post('/:blockchainName/dataset', async (req, res) => {
		try {
			const { blockchainName } = req.params;
			const {
				name,
				fullName,
				description,
				owner,
				isPublic = false,
				canMaskingShare = false,
				canCustomMaskingTrade = false,
				canDataService = false,
				hash = '',
				maskingDatasetIPFSAddress = ''
			} = req.body;

			await dbAddDataset(
				blockchainName,
				name,
				fullName,
				description,
				owner,
				isPublic,
				canMaskingShare,
				canCustomMaskingTrade,
				canDataService,
				hash,
				maskingDatasetIPFSAddress
			);

			res.status(201).json({
				success: true,
				dataset: {
					name,
					fullName,
					description,
					owner,
					isPublic,
					canMaskingShare,
					canCustomMaskingTrade,
					canDataService,
					hash,
					maskingDatasetIPFSAddress
				}
			});
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.delete('/:blockchainName/dataset/:name', async (req, res) => {
		try {
			const { blockchainName, name } = req.params;
			await dbDeleteDataset(blockchainName, name);
			res.status(200).json({ success: true });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.get('/:blockchainName/datasets', async (req, res) => {
		try {
			const { blockchainName } = req.params;
			const rows = await dbGetAllDatasets(blockchainName);
			res.status(200).json({ success: true, datasets: rows });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.get('/:blockchainName/public-datasets', async (req, res) => {
		try {
			const { blockchainName } = req.params;
			const rows = await dbGetPublicDatasets(blockchainName);
			res.status(200).json({ success: true, datasets: rows });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.get('/:blockchainName/dataset/:name', async (req, res) => {
		try {
			const { blockchainName, name } = req.params;
			const row = await dbGetDatasetByName(blockchainName, name);
			if (!row) {
				return res.status(404).json({ success: false, message: 'not found' });
			}
			res.status(200).json({ success: true, dataset: row });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.get('/:blockchainName/datasets/owner/:owner', async (req, res) => {
		try {
			const { blockchainName, owner } = req.params;
			const rows = await dbGetDatasetsByOwner(blockchainName, owner);
			res.status(200).json({ success: true, datasets: rows });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.put('/:blockchainName/dataset/:name/info', async (req, res) => {
		try {
			const { blockchainName, name } = req.params;
			const { fullName, description } = req.body;
			const row = await dbUpdateDatasetInfo(blockchainName, name, fullName, description);
			res.status(200).json({ success: true, dataset: row });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.put('/:blockchainName/dataset/:name/public-level', async (req, res) => {
		try {
			const { blockchainName, name } = req.params;
			const { isPublic, canMaskingShare, canCustomMaskingTrade, canDataService } = req.body;
			const row = await dbUpdateDatasetPublicLevel(
				blockchainName,
				name,
				isPublic,
				canMaskingShare,
				canCustomMaskingTrade,
				canDataService
			);
			res.status(200).json({ success: true, dataset: row });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.put('/:blockchainName/dataset/:name/hash', async (req, res) => {
		try {
			const { blockchainName, name } = req.params;
			const { hash } = req.body;
			const row = await dbUpdateDatasetHash(blockchainName, name, hash);
			res.status(200).json({ success: true, dataset: row });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	app.put('/:blockchainName/dataset/:name/masking-ipfs', async (req, res) => {
		try {
			const { blockchainName, name } = req.params;
			const { maskingDatasetIPFSAddress } = req.body;
			const row = await dbUpdateMaskingDatasetIPFSAddress(blockchainName, name, maskingDatasetIPFSAddress);
			res.status(200).json({ success: true, dataset: row });
		} catch (err) {
			res.status(500).json({ success: false, message: 'db error', error: String(err) });
		}
	});

	return app;
}

describe('datasetsTable.mjs with mocked db.mjs (supertest)', () => {
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

	describe('dbInitDatasetTable & dbDeleteDatasetTable', () => {
		test('should call dbRun with correct SQL on init', async () => {
			dbRun.mockResolvedValueOnce(undefined);

			const res = await request(app).post('/table/Physics/init');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql] = dbRun.mock.calls[0];
			expect(sql).toContain('CREATE TABLE IF NOT EXISTS datasets_Physics');
		});

		test('should return 500 when init fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('init error'));

			const res = await request(app).post('/table/Physics/init');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});

		test('should call dbRun with correct SQL on drop', async () => {
			dbRun.mockResolvedValueOnce(undefined);

			const res = await request(app).delete('/table/Physics/drop');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql] = dbRun.mock.calls[0];
			expect(sql).toContain('DROP TABLE IF EXISTS datasets_Physics');
		});

		test('should return 500 when drop fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('drop error'));

			const res = await request(app).delete('/table/Physics/drop');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbAddDataset & dbDeleteDataset', () => {
		test('should insert dataset via dbRun and return mapped object', async () => {
			dbRun.mockResolvedValueOnce(undefined);

			const res = await request(app)
				.post('/Physics/dataset')
				.send({
					name: 'ds1',
					fullName: 'Dataset 1',
					description: 'desc',
					owner: 'alice',
					isPublic: true,
					canMaskingShare: true,
					canCustomMaskingTrade: false,
					canDataService: true,
					hash: 'hash1',
					maskingDatasetIPFSAddress: 'ipfs://addr'
				});

			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql, params] = dbRun.mock.calls[0];
			expect(sql).toContain('INSERT INTO datasets_Physics');
			expect(params).toEqual([
				'ds1',
				'Dataset 1',
				'desc',
				'alice',
				true,
				true,
				false,
				true,
				'hash1',
				'ipfs://addr'
			]);
		});

		test('should return 500 when dbAddDataset fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('insert error'));

			const res = await request(app)
				.post('/Physics/dataset')
				.send({
					name: 'ds1',
					fullName: 'Dataset 1',
					description: 'desc',
					owner: 'alice'
				});

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});

		test('should delete dataset via dbRun', async () => {
			dbRun.mockResolvedValueOnce({ changes: 1 });

			const res = await request(app).delete('/Physics/dataset/ds1');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql, params] = dbRun.mock.calls[0];
			expect(sql).toContain('DELETE FROM datasets_Physics WHERE name = ?');
			expect(params).toEqual(['ds1']);
		});

		test('should return 500 when dbDeleteDataset fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('delete error'));

			const res = await request(app).delete('/Physics/dataset/ds1');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbGetAllDatasets & dbGetPublicDatasets', () => {
		test('should get all datasets via dbAll', async () => {
			const rows = [
				{ name: 'ds1', owner: 'alice' },
				{ name: 'ds2', owner: 'bob' }
			];
			dbAll.mockResolvedValueOnce(rows);

			const res = await request(app).get('/Physics/datasets');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbAll).toHaveBeenCalledTimes(1);
			const [sql] = dbAll.mock.calls[0];
			expect(sql).toContain('SELECT * FROM datasets_Physics');
			expect(res.body.datasets).toEqual(rows);
		});

		test('should return 500 when dbGetAllDatasets fails', async () => {
			dbAll.mockRejectedValueOnce(new Error('list error'));

			const res = await request(app).get('/Physics/datasets');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});

		test('should get public datasets via dbAll with isPublic condition', async () => {
			const rows = [{ name: 'ds1', isPublic: true }];
			dbAll.mockResolvedValueOnce(rows);

			const res = await request(app).get('/Physics/public-datasets');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbAll).toHaveBeenCalledTimes(1);
			const [sql, params] = dbAll.mock.calls[0];
			expect(sql).toContain('SELECT * FROM datasets_Physics WHERE isPublic = ?');
			expect(params).toEqual([true]);
			expect(res.body.datasets).toEqual(rows);
		});

		test('should return 500 when dbGetPublicDatasets fails', async () => {
			dbAll.mockRejectedValueOnce(new Error('list error'));

			const res = await request(app).get('/Physics/public-datasets');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbGetDatasetByName & dbGetDatasetsByOwner', () => {
		test('should get dataset by name via dbGet', async () => {
			const row = { name: 'ds1', owner: 'alice' };
			dbGet.mockResolvedValueOnce(row);

			const res = await request(app).get('/Physics/dataset/ds1');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbGet).toHaveBeenCalledTimes(1);
			const [sql, params] = dbGet.mock.calls[0];
			expect(sql).toContain('SELECT * FROM datasets_Physics WHERE name = ?');
			expect(params).toEqual(['ds1']);
			expect(res.body.dataset).toEqual(row);
		});

		test('should return 404 when dataset not found', async () => {
			dbGet.mockResolvedValueOnce(undefined);

			const res = await request(app).get('/Physics/dataset/unknown');

			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('not found');
		});

		test('should return 500 when dbGetDatasetByName fails', async () => {
			dbGet.mockRejectedValueOnce(new Error('select error'));

			const res = await request(app).get('/Physics/dataset/ds1');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});

		test('should get datasets by owner via dbAll', async () => {
			const rows = [
				{ name: 'ds1', owner: 'alice' },
				{ name: 'ds2', owner: 'alice' }
			];
			dbAll.mockResolvedValueOnce(rows);

			const res = await request(app).get('/Physics/datasets/owner/alice');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbAll).toHaveBeenCalledTimes(1);
			const [sql, params] = dbAll.mock.calls[0];
			expect(sql).toContain('SELECT * FROM datasets_Physics WHERE owner = ?');
			expect(params).toEqual(['alice']);
			expect(res.body.datasets).toEqual(rows);
		});

		test('should return 500 when dbGetDatasetsByOwner fails', async () => {
			dbAll.mockRejectedValueOnce(new Error('owner error'));

			const res = await request(app).get('/Physics/datasets/owner/alice');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbUpdateDatasetInfo', () => {
		test('should update dataset info and return updated row', async () => {
			dbRun.mockResolvedValueOnce({ changes: 1 });
			const updatedRow = {
				name: 'ds1',
				fullName: 'Dataset 1 v2',
				description: 'new desc',
				owner: 'alice'
			};
			dbGet.mockResolvedValueOnce(updatedRow);

			const res = await request(app)
				.put('/Physics/dataset/ds1/info')
				.send({ fullName: 'Dataset 1 v2', description: 'new desc' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql, params] = dbRun.mock.calls[0];
			expect(sql).toContain('UPDATE datasets_Physics SET fullName = ?, description = ? WHERE name = ?');
			expect(params).toEqual(['Dataset 1 v2', 'new desc', 'ds1']);
			expect(dbGet).toHaveBeenCalledTimes(1);
			expect(res.body.dataset).toEqual(updatedRow);
		});

		test('should return 500 when dbUpdateDatasetInfo fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('update error'));

			const res = await request(app)
				.put('/Physics/dataset/ds1/info')
				.send({ fullName: 'Dataset 1 v2', description: 'new desc' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbUpdateDatasetPublicLevel', () => {
		test('should update dataset public level and return updated row', async () => {
			dbRun.mockResolvedValueOnce({ changes: 1 });
			const updatedRow = {
				name: 'ds1',
				isPublic: true,
				canMaskingShare: true,
				canCustomMaskingTrade: true,
				canDataService: true
			};
			dbGet.mockResolvedValueOnce(updatedRow);

			const res = await request(app)
				.put('/Physics/dataset/ds1/public-level')
				.send({
					isPublic: true,
					canMaskingShare: true,
					canCustomMaskingTrade: true,
					canDataService: true
				});

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql, params] = dbRun.mock.calls[0];
			expect(sql).toContain('UPDATE datasets_Physics SET isPublic = ?, canMaskingShare = ?, canCustomMaskingTrade = ?, canDataService = ? WHERE name = ?');
			expect(params).toEqual([true, true, true, true, 'ds1']);
			expect(dbGet).toHaveBeenCalledTimes(1);
			expect(res.body.dataset).toEqual(updatedRow);
		});

		test('should return 500 when dbUpdateDatasetPublicLevel fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('update error'));

			const res = await request(app)
				.put('/Physics/dataset/ds1/public-level')
				.send({
					isPublic: true,
					canMaskingShare: true,
					canCustomMaskingTrade: true,
					canDataService: true
				});

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbUpdateDatasetHash', () => {
		test('should update dataset hash and return updated row', async () => {
			dbRun.mockResolvedValueOnce({ changes: 1 });
			const updatedRow = { name: 'ds1', hash: 'hash2' };
			dbGet.mockResolvedValueOnce(updatedRow);

			const res = await request(app)
				.put('/Physics/dataset/ds1/hash')
				.send({ hash: 'hash2' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql, params] = dbRun.mock.calls[0];
			expect(sql).toContain('UPDATE datasets_Physics SET hash = ? WHERE name = ?');
			expect(params).toEqual(['hash2', 'ds1']);
			expect(dbGet).toHaveBeenCalledTimes(1);
			expect(res.body.dataset).toEqual(updatedRow);
		});

		test('should return 500 when dbUpdateDatasetHash fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('update error'));

			const res = await request(app)
				.put('/Physics/dataset/ds1/hash')
				.send({ hash: 'hash2' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});

	describe('dbUpdateMaskingDatasetIPFSAddress', () => {
		test('should update masking dataset ipfs address and return updated row', async () => {
			dbRun.mockResolvedValueOnce({ changes: 1 });
			const updatedRow = { name: 'ds1', maskingDatasetIPFSAddress: 'ipfs://new' };
			dbGet.mockResolvedValueOnce(updatedRow);

			const res = await request(app)
				.put('/Physics/dataset/ds1/masking-ipfs')
				.send({ maskingDatasetIPFSAddress: 'ipfs://new' });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(dbRun).toHaveBeenCalledTimes(1);
			const [sql, params] = dbRun.mock.calls[0];
			expect(sql).toContain('UPDATE datasets_Physics SET maskingDatasetIPFSAddress = ? WHERE name = ?');
			expect(params).toEqual(['ipfs://new', 'ds1']);
			expect(dbGet).toHaveBeenCalledTimes(1);
			expect(res.body.dataset).toEqual(updatedRow);
		});

		test('should return 500 when dbUpdateMaskingDatasetIPFSAddress fails', async () => {
			dbRun.mockRejectedValueOnce(new Error('update error'));

			const res = await request(app)
				.put('/Physics/dataset/ds1/masking-ipfs')
				.send({ maskingDatasetIPFSAddress: 'ipfs://new' });

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('db error');
		});
	});
});

