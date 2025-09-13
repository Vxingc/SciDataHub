import {
    addDataset,
    deleteDataset,
    getAllDatasets,
    getPublicDatasets,
    getDatasetsByOwner,
    getDatasetByDatasetName,
    updateDatasetInfo,
    updateDatasetPublicLevel,
    updateDatasetHash,
    updateMaskingDatasetIPFSAddress
} from './datasetsTable.mjs';
import { getAllBlockchains } from '../blockchains/blockchainsTable.mjs';
import logger from '../../utils/log.mjs';

// 创建数据集路由处理函数
export const handleAddDataset = async (req, res) => {
    try {
        const { blockchainName } = req.params;
        const { name, fullName, description, owner, isPublic = false, canMaskingShare = false, canCustomMaskingTrade = false, canDataService = false, maskingDatasetIPFSAddress = '' } = req.body;
        
        // 验证输入
        if (!name || !fullName || !owner) {
            return res.status(400).json({
                success: false,
                message: '数据集名称、全称和拥有者不能为空'
            });
        }
        
        // 检查数据集是否已存在
        const existingDataset = await getDatasetByDatasetName(blockchainName, name);
        if (existingDataset) {
            return res.status(400).json({
                success: false,
                message: '数据集名称已存在'
            });
        }
        
        await addDataset(blockchainName, name, fullName, description, owner, isPublic, canMaskingShare, canCustomMaskingTrade, canDataService, '', maskingDatasetIPFSAddress);
        logger.debug(`创建数据集 for blockchain: ${blockchainName} success`);
        
        res.json({ 
            success: true, 
            message: '数据集创建成功',
            dataset: {
                name,
                fullName,
                description,
                owner,
                blockchainName
            }
        });
    } catch (error) {
        logger.error(`创建数据集 for blockchain: ${req.params.blockchainName} failed: ${error}`);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
};

// 删除数据集路由处理函数
export const handleDeleteDataset = async (req, res) => {
    try {
        const { blockchainName, name } = req.params;
        
        // 检查数据集是否存在
        const existingDataset = await getDatasetByDatasetName(blockchainName, name);
        if (!existingDataset) {
            return res.status(404).json({
                success: false,
                message: '数据集不存在'
            });
        }
        
        await deleteDataset(blockchainName, name);
        logger.debug(`删除数据集 for blockchain: ${blockchainName} success`);
        
        res.json({ 
            success: true, 
            message: '数据集删除成功' 
        });
    } catch (error) {
        logger.error(`删除数据集 for blockchain: ${req.params.blockchainName} failed: ${error}`);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
};

// 获取所有数据集路由处理函数
export const handleGetAllDatasets = async (req, res) => {
    try {
        const { blockchainName } = req.params;
        const result = await getAllDatasets(blockchainName);
        logger.debug(`获取所有数据集 for blockchain: ${blockchainName} success`);
        
        res.json({ 
            success: true, 
            message: '数据集获取成功', 
            data: result 
        });
    } catch (error) {
        logger.error(`获取所有数据集 for blockchain: ${req.params.blockchainName} failed: ${error}`);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
};

// 获取公开数据集路由处理函数
export const handleGetPublicDatasets = async (req, res) => {
    try {
        const { blockchainName } = req.params;
        const result = await getPublicDatasets(blockchainName);
        logger.debug(`获取所有公开数据集 for blockchain: ${blockchainName} success`);
        
        res.json({ 
            success: true, 
            message: '公开数据集获取成功', 
            data: result 
        });
    } catch (error) {
        logger.error(`获取所有公开数据集 for blockchain: ${req.params.blockchainName} failed: ${error}`);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
};

// 根据拥有者获取数据集路由处理函数
export const handleGetDatasetsByOwner = async (req, res) => {
    try {
        const { blockchainName, owner } = req.params;
        const result = await getDatasetsByOwner(blockchainName, owner);
        
        res.json({ 
            success: true, 
            message: '数据集获取成功', 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};

// 根据用户名获取所有区块链上的数据集路由处理函数
export const handleGetDatasetsByUsername = async (req, res) => {
    try {
        const { name } = req.params;
        // 遍历所有dataset表
        const blockchains = await getAllBlockchains();
        const datasets = [];
        
        for (const blockchain of blockchains) {
            const results = await getDatasetsByOwner(blockchain.name, name);
            // 遍历results列表，给每一项添加blockchainName 
            for (const result of results){
                result.blockchainName = blockchain.name;
            }
            datasets.push(...results);
        }
        
        res.json({ 
            success: true, 
            message: '数据集获取成功', 
            data: datasets 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};

// 根据数据集名称获取数据集路由处理函数
export const handleGetDatasetByDatasetName = async (req, res) => {
    try {
        const { blockchainName, name } = req.params;
        const result = await getDatasetByDatasetName(blockchainName, name);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: '数据集不存在'
            });
        }
        
        res.json({ 
            success: true, 
            message: '数据集获取成功', 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};

// 更新数据集信息路由处理函数
export const handleUpdateDatasetInfo = async (req, res) => {
    try {
        const { blockchainName, name } = req.params;
        const { fullName, description } = req.body;
        
        // 验证输入
        if (!fullName) {
            return res.status(400).json({
                success: false,
                message: '数据集全称不能为空'
            });
        }
        
        // 检查数据集是否存在
        const existingDataset = await getDatasetByDatasetName(blockchainName, name);
        if (!existingDataset) {
            return res.status(404).json({
                success: false,
                message: '数据集不存在'
            });
        }
        
        const updatedDataset = await updateDatasetInfo(blockchainName, name, fullName, description);
        
        res.json({ 
            success: true, 
            message: '数据集信息更新成功', 
            data: updatedDataset 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};

// 更新数据集公开级别路由处理函数
export const handleUpdateDatasetPublicLevel = async (req, res) => {
    try {
        const { blockchainName, name } = req.params;
        const { isPublic, canMaskingShare, canCustomMaskingTrade, canDataService } = req.body;
        
        logger.debug(`handleUpdateDatasetPublicLevel: ${JSON.stringify({ blockchainName, name, isPublic, canMaskingShare, canCustomMaskingTrade, canDataService }, null, 2)}`);
        
        // 检查数据集是否存在
        const existingDataset = await getDatasetByDatasetName(blockchainName, name);
        if (!existingDataset) {
            return res.status(404).json({
                success: false,
                message: '数据集不存在'
            });
        }
        
        const updatedDataset = await updateDatasetPublicLevel(blockchainName, name, isPublic, canMaskingShare, canCustomMaskingTrade, canDataService);
        
        res.json({ 
            success: true, 
            message: '数据集公开级别更新成功', 
            data: updatedDataset 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};

// 更新数据集哈希路由处理函数
export const handleUpdateDatasetHash = async (req, res) => {
    try {
        const { blockchainName, name } = req.params;
        const { hash } = req.body;
        
        logger.debug(`handleUpdateDatasetHash: ${JSON.stringify({ blockchainName, name, hash }, null, 2)}`);
        
        // 验证输入
        if (!hash) {
            return res.status(400).json({
                success: false,
                message: '哈希值不能为空'
            });
        }
        
        // 检查数据集是否存在
        const existingDataset = await getDatasetByDatasetName(blockchainName, name);
        if (!existingDataset) {
            return res.status(404).json({
                success: false,
                message: '数据集不存在'
            });
        }
        
        const updatedDataset = await updateDatasetHash(blockchainName, name, hash);
        
        res.json({ 
            success: true, 
            message: '数据集哈希更新成功', 
            data: updatedDataset 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};

// 更新脱敏数据集IPFS地址路由处理函数
export const handleUpdateMaskingDatasetIPFSAddress = async (req, res) => {
    try {
        const { blockchainName, name } = req.params;
        const { maskingDatasetIPFSAddress } = req.body;
        
        logger.debug(`handleUpdateMaskingDatasetIPFSAddress: ${JSON.stringify({ blockchainName, name, maskingDatasetIPFSAddress }, null, 2)}`);
        
        // 验证输入
        if (!maskingDatasetIPFSAddress) {
            return res.status(400).json({
                success: false,
                message: 'IPFS地址不能为空'
            });
        }
        
        // 检查数据集是否存在
        const existingDataset = await getDatasetByDatasetName(blockchainName, name);
        if (!existingDataset) {
            return res.status(404).json({
                success: false,
                message: '数据集不存在'
            });
        }
        
        const updatedDataset = await updateMaskingDatasetIPFSAddress(blockchainName, name, maskingDatasetIPFSAddress);
        
        res.json({ 
            success: true, 
            message: '数据集IPFS地址更新成功', 
            data: updatedDataset 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误', 
            error: error.message 
        });
    }
};
