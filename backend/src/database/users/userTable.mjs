import { dbRun, dbGet } from '../db.mjs';
import logger from '../../utils/log.mjs';

// 初始化用户表
export async function initUserTable() {
	try {
		logger.debug('初始化用户表...');
		await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
		logger.debug('用户表初始化成功');
	} catch (err) {
		logger.error('创建用户表失败:', err);
		throw err;
	}
};

export async function deleteUserTable() {
	try {
		logger.debug('删除用户表...');
		await dbRun('DROP TABLE IF EXISTS users');
		logger.debug('用户表删除成功');
	} catch (err) {
		logger.error('删除用户表失败:', err);
		throw err;
	}
};

// 创建用户
export async function addUser(username, password) {
	try {
		logger.debug(`创建用户: ${username}`);
		const result = await dbRun('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
		logger.debug(`创建用户成功: ${username}`);
		return { result };
	} catch (err) {
		logger.error(`创建用户失败: ${username}`, err);
		throw err;
	}
};

// 根据用户名查找用户
export async function getUserByUsername(username) {
	try {
		logger.debug(`查找用户: ${username}`);
		const row = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
		if (row) {
			logger.debug(`查找用户成功: ${username} ${JSON.stringify(row)}`);
		} else {
			logger.debug(`用户不存在: ${username}`);
		}
		return row;
	} catch (err) {
		logger.error(`查找用户失败: ${username}`, err);
		throw err;
	}
};


// 删除用户
export async function deleteUser(username) {
	try {
		logger.debug(`删除用户: ${username}`);
		await dbRun('DELETE FROM users WHERE username = ?', [username]);
		logger.debug(`删除用户成功: ${username}`);
		return true;
	} catch (err) {
		logger.error(`删除用户失败: ${username}`);
		throw err;
	}
};
