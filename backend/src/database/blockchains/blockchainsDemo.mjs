import { dbAddBlockchain, dbGetAllBlockchains } from './blockchainsTable.mjs';
import logger from '../../utils/log.mjs';

export async function addDemoBlockchains() {
    try {
        await dbAddBlockchain('Physics', '物理学', '物理学相关科研数据');
        await dbAddBlockchain('Biology', '生物学', '生物学相关科研数据');
        await dbAddBlockchain('Medicine', '临床医学', '临床医学相关科研数据');
        await dbAddBlockchain('ArtificialIntelligence', '人工智能', '人工智能相关科研数据');
        await dbAddBlockchain('CyberSecurity', '网络安全', '网络安全相关科研数据');
    } catch (error) {
        logger.error('初始化区块链记录失败:', error);
    }
};