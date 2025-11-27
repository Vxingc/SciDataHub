import { dbRun, dbGet, dbAll } from '../db.mjs';
import logger from '../../utils/log.mjs';

// 初始化区块链表
export async function dbInitBlockchainTable() {
	try {
		logger.debug('init blockchain table');
		await dbRun(
			`CREATE TABLE IF NOT EXISTS blockchains (
				name TEXT PRIMARY KEY NOT NULL,
				fullName TEXT NOT NULL,
				description TEXT,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)`);
		logger.debug('区块链表初始化成功');
	} catch (err) {
		logger.error('创建区块链表失败:', err);
		throw err;
	}
};
// 删除区块链表
export async function dbDeleteBlockchainTable() {
	try {
		logger.debug('delete blockchain table');
		await dbRun('DROP TABLE IF EXISTS blockchains');
		logger.debug('区块链表删除成功');
	} catch (err) {
		logger.error('删除区块链表失败:', err);
		throw err;
	}
};

// 创建区块链记录
export async function dbAddBlockchain(name, fullName, description) {
	try {
		logger.debug(`creating blockchain: ${name}, ${fullName}, ${description} ...`);
		await dbRun('INSERT INTO blockchains (name, fullName, description) VALUES (?, ?, ?)', [name, fullName, description]);
		logger.debug(`create blockchain success: ${name}, ${fullName}, ${description}`);
		return { name, fullName, description };
	} catch (err) {
		logger.error(`create blockchain failed: ${err}`);
		throw err;
	}
};

// 根据name查找区块链
export async function dbGetBlockchain(name) {
	try {
		logger.debug(`find blockchain by name: ${name} ...`);
		const row = await dbGet('SELECT * FROM blockchains WHERE name = ?', [name]);
		logger.debug(`find blockchain by name: ${name} success`);
		return row;
	} catch (err) {
		logger.error(`find blockchain by name: ${name} failed: ${err}`);
		throw err;
	}
};

// 获取所有区块链记录
export async function dbGetAllBlockchains() {
	try {
		logger.debug('get all blockchains ...');
		const rows = await dbAll('SELECT * FROM blockchains ORDER BY created_at DESC');
		logger.debug('get all blockchains success');
		return rows;
	} catch (err) {
		logger.error('get all blockchains failed: ' + err);
		throw err;
	}
};

// 更新区块链记录
export async function dbUpdateBlockchain(name, fullName, description) {
	try {
		logger.debug(`update blockchain: ${name}, ${fullName}, ${description} ...`);
		const result = await dbRun(`
			UPDATE blockchains 
			SET name = ?, fullName = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
			WHERE name = ?
		`, [name, fullName, description, name]);
		logger.debug(`update blockchain success: ${name}, ${fullName}, ${description}`);
		return { changes: result.changes, name };
	} catch (err) {
		logger.error(`update blockchain failed: ${err}`);
		throw err;
	}
};

// 通过name 删除区块链
export async function dbDeleteBlockchainByName(name) {
	try {
		logger.debug(`delete blockchain by name: ${name} ...`);
		const result = await dbRun('DELETE FROM blockchains WHERE name = ?', [name]);
		logger.debug(`delete blockchain by name success: ${name}`);
		return { changes: result.changes, name };
	} catch (err) {
		logger.error(`delete blockchain by name failed: ${err}`);
		throw err;
	}
};