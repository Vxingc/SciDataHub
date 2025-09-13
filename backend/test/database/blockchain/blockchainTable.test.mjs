import {initBlockchainTable, getAllBlockchains, deleteBlockchainByName, getBlockchain, addBlockchain, deleteBlockchainTable} from '../database/blockchains/blockchainsTable.mjs';

import logger from '../log.mjs';


// 执行测试
await deleteBlockchainTable();
await initBlockchainTable();
const blockchains = await getAllBlockchains();
logger.debug('所有区块链记录:');
logger.debug(JSON.stringify(blockchains, null, 2));
await addBlockchain('testBlockchain1', '测试区块链1', '测试区块链描述1');
await addBlockchain('testBlockchain2', '测试区块链2', '测试区块链描述2');
await addBlockchain('testBlockchain3', '测试区块链3', '测试区块链描述3');
await addBlockchain('testBlockchain4', '测试区块链4', '测试区块链描述4');
const findResponse = await getBlockchain('testBlockchain1');
// 输出找到的单个blockchain记录
logger.debug('找到的区块链记录:', JSON.stringify(findResponse, null, 2));
const blockchainsAfterDelete = await getAllBlockchains();
logger.debug('所有区块链记录:');
logger.debug(JSON.stringify(blockchainsAfterDelete, null, 2));
await deleteBlockchainByName('testBlockchain1');
await deleteBlockchainByName('testBlockchain2');
await deleteBlockchainByName('testBlockchain3');
await deleteBlockchainByName('testBlockchain4');
const blockchainsAfterDelete2 = await getAllBlockchains();
logger.debug('所有区块链记录:');
logger.debug(JSON.stringify(blockchainsAfterDelete2, null, 2));

