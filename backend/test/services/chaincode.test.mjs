import { displayInputParameters, initializeContract, initLedger, getUser, getTokenBalance, addUser, setTokenBalance, addTokenBalance, transferTokens, getDataset, getDatasetOwner, addDataset, dbGetAllDatasets, createOrder, getOrder, getAllOrders, updateOrderStatus } from '../../src/services/chaincode/chaincode.mjs';
import logger from '../../src/utils/log.mjs';
import { generateHashChain, randStr } from '../../src/utils/utils.mjs';

async function initChaincode() {
    await displayInputParameters();
    const contract = await initializeContract();
    await initLedger(contract);
}

async function TestUser() {
    const contract = await initializeContract();
    await getUser(contract, "demoDataOwner");
    await getUser(contract, "demoDataRequester");
    await getTokenBalance(contract, "demoDataOwner");
    await getTokenBalance(contract, "demoDataRequester");
    await addUser(contract, "testDataOwner", "0");
    await getUser(contract, "testDataOwner");
    await setTokenBalance(contract, "testDataOwner", "2000");
    await getTokenBalance(contract, "testDataOwner");
    
    await addTokenBalance(contract, "testDataOwner", "100");
    await getTokenBalance(contract, "testDataOwner");
    await transferTokens(contract, "testDataOwner", "demoDataOwner", "100");
    await getTokenBalance(contract, "testDataOwner");
    await getTokenBalance(contract, "demoDataOwner");
}

async function TestDataset() {
    const contract = await initializeContract();
    await getDataset(contract, "822a5f5e4d0d8455397d757cc661c67160a8ac7e5e91533832c45acb5b657b76");
    await getDatasetOwner(contract, "822a5f5e4d0d8455397d757cc661c67160a8ac7e5e91533832c45acb5b657b76");
    const newDatasetHash = await randStr(64);
    console.log("newDatasetHash: ", newDatasetHash);
    await addDataset(contract, newDatasetHash, "testDataOwner");
    await getDataset(contract, newDatasetHash)
    await dbGetAllDatasets(contract);
}

async function TestOrder() {
    const contract = await initializeContract();
    const hashChainEnd = await generateHashChain(20);
    const orderID = await createOrder(contract, "822a5f5e4d0d8455397d757cc661c67160a8ac7e5e91533832c45acb5b657b76", hashChainEnd[19], "100", "testDataOwner", "demoDataOwner");
    logger.info('orderID: ', orderID);
    await getOrder(contract, orderID);
    await updateOrderStatus(contract, orderID, "cancelled");
    await getOrder(contract, orderID);
    await updateOrderStatus(contract, orderID, "completed");
    await getOrder(contract, orderID);
    await getAllOrders(contract);

    
}

async function main() {
    try {
        // 读取用户输入
        const args = process.argv.slice(2);
        const command = args[0];
        if (command === 'init') {
            await initChaincode();
        } else if (command === 'user') {
            await TestUser();
        } else if (command === 'dataset') {
            await TestDataset();
        } else if (command === 'order') {
            await TestOrder();
        } else {
            logger.error('Invalid command: ' + command);
        }

    } catch (error) {
        logger.error('******** FAILED to run the application:', error);
    }


}

main();
