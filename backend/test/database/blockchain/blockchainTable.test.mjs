import {dbInitBlockchainTable, dbGetAllBlockchains, dbDeleteBlockchainByName, dbGetBlockchain, dbAddBlockchain, dbDeleteBlockchainTable} from '../database/blockchains/blockchainsTable.mjs';

import logger from '../log.mjs';


// 执行测试
await dbDeleteBlockchainTable();
await dbInitBlockchainTable();
const blockchains = await dbGetAllBlockchains();
logger.debug('所有区块链记录:');
logger.debug(JSON.stringify(blockchains, null, 2));
await dbAddBlockchain('testBlockchain1', '测试区块链1', '测试区块链描述1');
await dbAddBlockchain('testBlockchain2', '测试区块链2', '测试区块链描述2');
await dbAddBlockchain('testBlockchain3', '测试区块链3', '测试区块链描述3');
await dbAddBlockchain('testBlockchain4', '测试区块链4', '测试区块链描述4');
const findResponse = await dbGetBlockchain('testBlockchain1');
// 输出找到的单个blockchain记录
logger.debug('找到的区块链记录:', JSON.stringify(findResponse, null, 2));
const blockchainsAfterDelete = await dbGetAllBlockchains();
logger.debug('所有区块链记录:');
logger.debug(JSON.stringify(blockchainsAfterDelete, null, 2));
await dbDeleteBlockchainByName('testBlockchain1');
await dbDeleteBlockchainByName('testBlockchain2');
await dbDeleteBlockchainByName('testBlockchain3');
await dbDeleteBlockchainByName('testBlockchain4');
const blockchainsAfterDelete2 = await dbGetAllBlockchains();
logger.debug('所有区块链记录:');
logger.debug(JSON.stringify(blockchainsAfterDelete2, null, 2));

