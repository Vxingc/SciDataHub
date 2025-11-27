import {
    dbAddBlockchain,
    dbGetBlockchain,
    dbGetAllBlockchains,
    dbUpdateBlockchain,
    dbDeleteBlockchainByName
} from './blockchainsTable.mjs';
import logger from '../../utils/log.mjs';

// 创建区块链路由处理函数
export const addBlockchain = async (req, res) => {
    try {
        const { name, fullName, description } = req.body;

        // 检查区块链名称是否已存在
        const existingBlockchain = await dbGetBlockchain(name);
        if (existingBlockchain) {
            return res.status(400).json({
                success: false,
                message: '区块链名称已存在'
            });
        }

        // 验证输入
        if (!name || !fullName) {
            return res.status(400).json({
                success: false,
                message: '区块链名称和全称不能为空'
            });
        }
        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                message: '区块链名称至少需要2个字符'
            });
        }
        if (fullName.length < 3) {
            return res.status(400).json({
                success: false,
                message: '区块链全称至少需要3个字符'
            });
        }

        // 创建区块链记录
        const blockchain = await dbAddBlockchain(name, fullName, description || '');
        res.json({
            success: true,
            message: '区块链记录创建成功',
            blockchain: {
                id: blockchain.id,
                name: blockchain.name,
                fullName: blockchain.fullName,
                description: blockchain.description
            }
        });
    } catch (error) {
        console.error('创建区块链记录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 获取所有区块链路由处理函数
export const getAllBlockchains = async (req, res) => {
    try {
        logger.debug('接受请求，访问数据库获取所有区块链记录...');
        const blockchains = await dbGetAllBlockchains();
        logger.debug('成功获取所有区块链记录');
        res.json({
            success: true,
            blockchains
        });
    } catch (error) {
        console.error('获取区块链列表错误:', error);
        logger.error('获取区块链列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 根据名称获取区块链路由处理函数
export const getBlockchainByName = async (req, res) => {
    try {
        const { name } = req.params;
        const blockchain = await dbGetBlockchain(name);

        if (!blockchain) {
            return res.status(404).json({
                success: false,
                message: '区块链记录不存在'
            });
        }

        res.json({
            success: true,
            blockchain
        });
    } catch (error) {
        console.error('获取区块链信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 更新区块链路由处理函数
export const updateBlockchain = async (req, res) => {
    try {
        const { name, fullName, description } = req.body;

        // 验证输入
        if (!name || !fullName) {
            return res.status(400).json({
                success: false,
                message: '区块链名称和全称不能为空'
            });
        }

        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                message: '区块链名称至少需要2个字符'
            });
        }

        if (fullName.length < 3) {
            return res.status(400).json({
                success: false,
                message: '区块链全称至少需要3个字符'
            });
        }

        // 检查区块链是否存在
        const existingBlockchain = await dbGetBlockchain(name);
        if (!existingBlockchain) {
            return res.status(404).json({
                success: false,
                message: '区块链记录不存在'
            });
        }

        // 更新区块链记录
        const result = await dbUpdateBlockchain(name, fullName, description || '');

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: '更新失败，记录可能不存在'
            });
        }

        // 获取更新后的记录
        const updatedBlockchain = await dbGetBlockchain(name);

        res.json({
            success: true,
            message: '区块链记录更新成功',
            blockchain: updatedBlockchain
        });
    } catch (error) {
        console.error('更新区块链记录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 删除区块链路由处理函数
export const deleteBlockchain = async (req, res) => {
    try {
        const { name } = req.params;

        // 检查区块链是否存在
        const existingBlockchain = await dbGetBlockchain(name);
        if (!existingBlockchain) {
            return res.status(404).json({
                success: false,
                message: '区块链记录不存在'
            });
        }

        // 删除区块链记录
        const result = await dbDeleteBlockchainByName(name);

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: '删除失败，记录可能不存在'
            });
        }

        res.json({
            success: true,
            message: '区块链记录删除成功'
        });
    } catch (error) {
        console.error('删除区块链记录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};