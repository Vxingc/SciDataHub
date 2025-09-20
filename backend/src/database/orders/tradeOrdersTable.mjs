import { dbRun, dbGet, dbAll } from '../db.mjs';
import logger from '../../utils/log.mjs';

// 交易订单表初始化
export async function initTradeOrderTable(blockchainName) {
	try {
		logger.debug(`init trade order table for blockchain: ${blockchainName}`);
		await dbRun(`
			CREATE TABLE IF NOT EXISTS trade_orders_${blockchainName} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				description TEXT,
				blockchainName TEXT NOT NULL,
				datasetName TEXT NOT NULL,
				datasetOwner TEXT NOT NULL,
				requester TEXT NOT NULL,
				maskingRules TEXT NOT NULL,
				status TEXT DEFAULT 'pending',
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);
		logger.debug(`trade order table for blockchain: ${blockchainName} initialized`);
	} catch (err) {
		logger.error(`init trade order table for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 删除交易订单表
export async function deleteTradeOrderTable(blockchainName) {
	try {
		logger.debug(`delete trade order table for blockchain: ${blockchainName}`);
		await dbRun(`DROP TABLE IF EXISTS trade_orders_${blockchainName}`);
		logger.debug(`trade order table for blockchain: ${blockchainName} deleted`);
	} catch (err) {
		logger.error(`delete trade order table for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 创建交易订单
export async function addTradeOrder(blockchainName, title, description, datasetName, datasetOwner, requester, maskingRules) {
	try {
		logger.debug(`creating trade order for blockchain: ${blockchainName}...`);
		// 将maskingRules对象转换为JSON字符串存储
		const maskingRulesJson = JSON.stringify(maskingRules);
		
		const result = await dbRun(`
			INSERT INTO trade_orders_${blockchainName} 
			(title, description, blockchainName, datasetName, datasetOwner, requester, maskingRules) 
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, [title, description, blockchainName, datasetName, datasetOwner, requester, maskingRulesJson]);

		logger.debug(`result: ${JSON.stringify(result)}`);
		logger.debug(`create trade order for blockchain: ${blockchainName} success, order id: ${result.lastID}`);
		return result.lastID;
	} catch (err) {
		logger.error(`create trade order for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 获取所有交易订单
export async function getAllTradeOrders(blockchainName) {
	try {
		logger.debug(`get all trade orders for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM trade_orders_${blockchainName} ORDER BY created_at DESC`);
		
		// 将maskingRules JSON字符串解析回对象
		const ordersWithParsedRules = rows.map(order => ({
			...order,
			maskingRules: JSON.parse(order.maskingRules)
		}));
		
		logger.debug(`get all trade orders for blockchain: ${blockchainName} success`);
		return ordersWithParsedRules;
	} catch (err) {
		logger.error(`get all trade orders for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据请求者获取交易订单
export async function getTradeOrdersByRequester(blockchainName, requester) {
	try {
		logger.debug(`get trade orders by requester ${requester} for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM trade_orders_${blockchainName} WHERE requester = ? ORDER BY created_at DESC`, [requester]);
		
		// 将maskingRules JSON字符串解析回对象
		const ordersWithParsedRules = rows.map(order => ({
			...order,
			maskingRules: JSON.parse(order.maskingRules)
		}));
		
		logger.debug(`get trade orders by requester ${requester} for blockchain: ${blockchainName} success`);
		return ordersWithParsedRules;
	} catch (err) {
		logger.error(`get trade orders by requester ${requester} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据数据拥有者获取交易订单
export async function getTradeOrdersByDatasetOwner(blockchainName, owner) {
	try {
		logger.debug(`get trade orders by dataset owner ${owner} for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM trade_orders_${blockchainName} WHERE datasetOwner = ? ORDER BY created_at DESC`, [owner]);
		
		// 将maskingRules JSON字符串解析回对象
		const ordersWithParsedRules = rows.map(order => ({
			...order,
			maskingRules: JSON.parse(order.maskingRules)
		}));
		
		logger.debug(`get trade orders by dataset owner ${owner} for blockchain: ${blockchainName} success`);
		return ordersWithParsedRules;
	} catch (err) {
		logger.error(`get trade orders by dataset owner ${owner} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据数据集获取交易订单
export async function getTradeOrdersByDataset(blockchainName, datasetName) {
	try {
		logger.debug(`get trade orders by dataset ${datasetName} for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM trade_orders_${blockchainName} WHERE datasetName = ? ORDER BY created_at DESC`, [datasetName]);
		
		// 将maskingRules JSON字符串解析回对象
		const ordersWithParsedRules = rows.map(order => ({
			...order,
			maskingRules: JSON.parse(order.maskingRules)
		}));
		
		logger.debug(`get trade orders by dataset ${datasetName} for blockchain: ${blockchainName} success`);
		return ordersWithParsedRules;
	} catch (err) {
		logger.error(`get trade orders by dataset ${datasetName} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据ID获取交易订单
export async function getTradeOrderById(blockchainName, orderId) {
	try {
		logger.debug(`get trade order by id ${orderId} for blockchain: ${blockchainName}`);
		const row = await dbGet(`SELECT * FROM trade_orders_${blockchainName} WHERE id = ?`, [orderId]);
		
		if (row) {
			// 将maskingRules JSON字符串解析回对象
			row.maskingRules = JSON.parse(row.maskingRules);
		}
		
		logger.debug(`get trade order by id ${orderId} for blockchain: ${blockchainName} success`);
		return row;
	} catch (err) {
		logger.error(`get trade order by id ${orderId} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 更新交易订单状态
export async function updateTradeOrderStatus(blockchainName, orderId, status) {
	try {
		logger.debug(`update trade order status for blockchain: ${blockchainName}, order id: ${orderId}, status: ${status}`);
		await dbRun(`UPDATE trade_orders_${blockchainName} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, orderId]);
		
		const updatedOrder = await getTradeOrderById(blockchainName, orderId);
		logger.debug(`update trade order status for blockchain: ${blockchainName} success`);
		return updatedOrder;
	} catch (err) {
		logger.error(`update trade order status for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 删除交易订单
export async function deleteTradeOrder(blockchainName, orderId) {
	try {
		logger.debug(`delete trade order for blockchain: ${blockchainName}, order id: ${orderId}`);
		await dbRun(`DELETE FROM trade_orders_${blockchainName} WHERE id = ?`, [orderId]);
		logger.debug(`delete trade order for blockchain: ${blockchainName} success`);
		return true;
	} catch (err) {
		logger.error(`delete trade order for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}