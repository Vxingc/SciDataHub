import { addBlockchain } from './blockchainsTable.mjs';

export async function addDemoBlockchains() {
    try {
        await addBlockchain('Physics', '物理学', '物理学相关科研数据');
        await addBlockchain('Biology', '生物学', '生物学相关科研数据');
        await addBlockchain('Medicine', '临床医学', '临床医学相关科研数据');
        await addBlockchain('ArtificialIntelligence', '人工智能', '人工智能相关科研数据');
        await addBlockchain('CyberSecurity', '网络安全', '网络安全相关科研数据');
    } catch (error) {
        console.error('初始化区块链记录失败:', error);
    }
};