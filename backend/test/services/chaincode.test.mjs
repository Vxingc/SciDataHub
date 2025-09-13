import { displayInputParameters, initializeContract, createUser, getUser, mint, createDataset, getDataset, createOrder, getOrder, getDatasetList, getOrderList, handleOrder, burn } from '../chaincode.mjs';
import logger from '../log.mjs';
import { randStr } from '../utils.mjs';

async function main() {
    try {
        logger.info("display input parameters:");
        await displayInputParameters();
        const contract = await initializeContract();
        const user1 = await randStr(10);
        const user2 = await randStr(10);
        await createUser(contract, user1);
        await createUser(contract, user2);
        await mint(contract, user1, "500");
        await mint(contract, user2, "500");
        await getUser(contract, user1);
        await getUser(contract, user2);
        const tags = ["1","2","3"];
        const tagsJson = JSON.stringify(tags)
        console.log(tagsJson);
        await createDataset(contract, "dataset1", "the first dataset", "hash", "ipfs", "5", user1, "100", tagsJson);
        await getDataset(contract, "dataset1");
        await createOrder(contract, user2, "dataset1", "100");
        await getOrder(contract, "order1");
        await getDatasetList(contract);
        await getOrderList(contract);
        await getUser(contract, user1);
        await getUser(contract, user2);
        await getUser(contract, "contract");
        await handleOrder(contract, "order1", "1", "1234");
        await burn(contract, user1, "10");
        await getUser(contract, user1);
        await getUser(contract, user2);
        await getUser(contract, "contract");
        await getOrder(contract, "order1");
    } catch (error) {
        logger.error('******** FAILED to run the application:', error);
    }


}

main();
