import { dbRun, dbGet, dbAll } from '../db.mjs';
import logger from '../../utils/log.mjs';

// 服务订单表初始化
export async function dbInitServiceOrderTable(blockchainName) {
	try {
		logger.debug(`init service order table for blockchain: ${blockchainName}`);
		await dbRun(`
			CREATE TABLE IF NOT EXISTS service_orders_${blockchainName} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				description TEXT,
				blockchainName TEXT NOT NULL,
				datasetName TEXT NOT NULL,
				datasetOwner TEXT NOT NULL,
				requester TEXT NOT NULL,
				serviceType TEXT NOT NULL,
				serviceConfig TEXT,
				status TEXT DEFAULT 'pending',
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);
		logger.debug(`service order table for blockchain: ${blockchainName} initialized`);
	} catch (err) {
		logger.error(`init service order table for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 删除服务订单表
export async function dbDeleteServiceOrderTable(blockchainName) {
	try {
		logger.debug(`delete service order table for blockchain: ${blockchainName}`);
		await dbRun(`DROP TABLE IF EXISTS service_orders_${blockchainName}`);
		logger.debug(`service order table for blockchain: ${blockchainName} deleted`);
	} catch (err) {
		logger.error(`delete service order table for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 创建服务订单
export async function dbAddServiceOrder(blockchainName, title, description, datasetName, datasetOwner, requester, serviceType, serviceConfig) {
	try {
		logger.debug(`creating service order for blockchain: ${blockchainName}...`);
		// 将serviceConfig对象转换为JSON字符串存储
		const serviceConfigJson = serviceConfig ? JSON.stringify(serviceConfig) : null;
		
		const result = await dbRun(`
			INSERT INTO service_orders_${blockchainName} 
			(title, description, blockchainName, datasetName, datasetOwner, requester, serviceType, serviceConfig) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`, [title, description, blockchainName, datasetName, datasetOwner, requester, serviceType, serviceConfigJson]);
		
		logger.debug(`create service order for blockchain: ${blockchainName} success, order id: ${result.lastID}`);
		return result.lastID;
	} catch (err) {
		logger.error(`create service order for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 获取所有服务订单
export async function dbGetAllServiceOrders(blockchainName) {
	try {
		logger.debug(`get all service orders for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM service_orders_${blockchainName} ORDER BY created_at DESC`);
		
		// 将serviceConfig JSON字符串解析回对象
		const ordersWithParsedConfig = rows.map(order => ({
			...order,
			serviceConfig: order.serviceConfig ? JSON.parse(order.serviceConfig) : null
		}));
		
		logger.debug(`get all service orders for blockchain: ${blockchainName} success`);
		return ordersWithParsedConfig;
	} catch (err) {
		logger.error(`get all service orders for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据请求者获取服务订单
export async function dbGetServiceOrdersByRequester(blockchainName, requester) {
	try {
		logger.debug(`get service orders by requester ${requester} for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM service_orders_${blockchainName} WHERE requester = ? ORDER BY created_at DESC`, [requester]);
		
		// 将serviceConfig JSON字符串解析回对象
		const ordersWithParsedConfig = rows.map(order => ({
			...order,
			serviceConfig: order.serviceConfig ? JSON.parse(order.serviceConfig) : null
		}));
		
		logger.debug(`get service orders by requester ${requester} for blockchain: ${blockchainName} success`);
		return ordersWithParsedConfig;
	} catch (err) {
		logger.error(`get service orders by requester ${requester} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据数据拥有者获取服务订单
export async function dbGetServiceOrdersByDatasetOwner(blockchainName, owner) {
	try {
		logger.debug(`get service orders by dataset owner ${owner} for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM service_orders_${blockchainName} WHERE datasetOwner = ? ORDER BY created_at DESC`, [owner]);
		
		// 将serviceConfig JSON字符串解析回对象
		const ordersWithParsedConfig = rows.map(order => ({
			...order,
			serviceConfig: order.serviceConfig ? JSON.parse(order.serviceConfig) : null
		}));
		
		logger.debug(`get service orders by dataset owner ${owner} for blockchain: ${blockchainName} success`);
		return ordersWithParsedConfig;
	} catch (err) {
		logger.error(`get service orders by dataset owner ${owner} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据数据集获取服务订单
export async function dbGetServiceOrdersByDataset(blockchainName, datasetName) {
	try {
		logger.debug(`get service orders by dataset ${datasetName} for blockchain: ${blockchainName}`);
		const rows = await dbAll(`SELECT * FROM service_orders_${blockchainName} WHERE datasetName = ? ORDER BY created_at DESC`, [datasetName]);
		
		// 将serviceConfig JSON字符串解析回对象
		const ordersWithParsedConfig = rows.map(order => ({
			...order,
			serviceConfig: order.serviceConfig ? JSON.parse(order.serviceConfig) : null
		}));
		
		logger.debug(`get service orders by dataset ${datasetName} for blockchain: ${blockchainName} success`);
		return ordersWithParsedConfig;
	} catch (err) {
		logger.error(`get service orders by dataset ${datasetName} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 根据ID获取服务订单
export async function dbGetServiceOrderById(blockchainName, orderId) {
	try {
		logger.debug(`get service order by id ${orderId} for blockchain: ${blockchainName}`);
		const row = await dbGet(`SELECT * FROM service_orders_${blockchainName} WHERE id = ?`, [orderId]);
		
		if (row) {
			// 将serviceConfig JSON字符串解析回对象
			row.serviceConfig = row.serviceConfig ? JSON.parse(row.serviceConfig) : null;
		}
		
		logger.debug(`get service order by id ${orderId} for blockchain: ${blockchainName} success`);
		return row;
	} catch (err) {
		logger.error(`get service order by id ${orderId} for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 更新服务订单状态
export async function dbUpdateServiceOrderStatus(blockchainName, orderId, status) {
	try {
		logger.debug(`update service order status for blockchain: ${blockchainName}, order id: ${orderId}, status: ${status}`);
		await dbRun(`UPDATE service_orders_${blockchainName} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, orderId]);
		
		const updatedOrder = await dbGetServiceOrderById(blockchainName, orderId);
		logger.debug(`update service order status for blockchain: ${blockchainName} success`);
		return updatedOrder;
	} catch (err) {
		logger.error(`update service order status for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}

// 删除服务订单
export async function dbDeleteServiceOrder(blockchainName, orderId) {
	try {
		logger.debug(`delete service order for blockchain: ${blockchainName}, order id: ${orderId}`);
		await dbRun(`DELETE FROM service_orders_${blockchainName} WHERE id = ?`, [orderId]);
		logger.debug(`delete service order for blockchain: ${blockchainName} success`);
		return true;
	} catch (err) {
		logger.error(`delete service order for blockchain: ${blockchainName} failed: ${err}`);
		throw err;
	}
}