import * as fs from 'node:fs/promises';
import * as grpc from '@grpc/grpc-js';
import path from "node:path";
import * as crypto from 'node:crypto';
import { connect, signers } from '@hyperledger/fabric-gateway';
import config from './chain_config.mjs';
import logger from './log.mjs';

// UTF-8 decoder for parsing transaction results
const utf8Decoder = new TextDecoder();


async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}


async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(config.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = await getFirstDirFileName(config.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    const mspId = config.mspId;
    return { mspId, credentials };
}

async function newSigner() {
    const keyPath = await getFirstDirFileName(config.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters() {
    console.log(`channelName:       ${config.channelName}`);
    console.log(`chaincodeName:     ${config.chaincodeName}`);
    console.log(`mspId:             ${config.mspId}`);
    console.log(`cryptoPath:        ${config.cryptoPath}`);
    console.log(`keyDirectoryPath:  ${config.keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${config.certDirectoryPath}`);
    console.log(`tlsCertPath:       ${config.tlsCertPath}`);
    console.log(`peerEndpoint:      ${config.peerEndpoint}`);
    console.log(`peerHostAlias:     ${config.peerHostAlias}`);
}


async function initializeContract() {
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    const network = gateway.getNetwork(config.channelName);
    const contract = network.getContract(config.chaincodeName);
    return contract;
}

// Remove the global contract variable - it should be initialized per use


/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */


async function invokeContract(contract, func, args) {
    logger.debug(`invoke Contract ${func}...`);
    try {
        await contract.submitTransaction(func, ...args);
        logger.info('invoke Contract ' + func + ' successfully');
    } catch (error) {
        logger.error('invoke Contract ' + func + ' fail', error);
    }
}

async function initLedger(contract) {
    logger.info("initLedger")
    await invokeContract(contract, 'InitLedger', []);
}

async function createUser(contract, ID) {
    logger.info(`createUser ${ID}...`);
    await invokeContract(contract, 'CreateUser', [ID, '0']);
}

async function getUser(contract, ID) {
    logger.info(`getUser ${ID}...`);

    const resultBytes = await contract.evaluateTransaction('GetUser', ID);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    logger.info(`getUser ${ID}: ${resultJson}`);
    return result;
}

async function mint(contract, ID, value) {
    logger.info(`mint ${ID} ${value}...`);
    await invokeContract(contract, 'Mint', [ID, value]);
}

async function burn(contract, ID, value) {
    logger.info(`burn ${ID} ${value}...`);
    await invokeContract(contract, 'Burn', [ID, value]);
}

async function createDataset(contract, title, description, hash, ipfsAddress, n_subset, owner, price, tags) {
    logger.info(`createDataset ${title}...`);
    await invokeContract(contract, 'CreateDataset', [title, description, hash, ipfsAddress, n_subset, owner, price, tags]);
}

async function createOrder(contract, buyer, datasetID, payHash) {
    logger.info(`createOrder ${buyer} ${datasetID} ${payHash}...`);
    await invokeContract(contract, 'CreateOrder', [buyer, datasetID, payHash]);
}

async function getDataset(contract, datasetID) {
    logger.info(`getDataset ${datasetID}...`);

    const resultBytes = await contract.evaluateTransaction('GetDataset', datasetID);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    logger.debug(`getDataset ${datasetID}: ${resultJson}`);
    return result;
}

async function getOrder(contract, orderID) {
    logger.info(`getOrder ${orderID}...`);
    const resultBytes = await contract.evaluateTransaction('GetOrder', orderID);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    logger.debug(`getOrder ${orderID}: ${resultJson}`);
    return result;
}

async function getDatasetList(contract) {
    logger.info("getDatasetList");

    const resultBytes = await contract.evaluateTransaction('GetDatasetList');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    logger.debug(`getDatasetList: ${resultJson}`);
    return result;
}

async function getOrderList(contract) {
    logger.info("getOrderList");
    const resultBytes = await contract.evaluateTransaction('GetOrderList');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    logger.debug(`getOrderList: ${resultJson}`);
    return result;
}

async function handleOrder(contract, orderID, n, payword) {
    logger.info(`handleOrder ${orderID}...`);
    await invokeContract(contract, 'HandleOrder', [orderID, n, payword]);
}


export {
    initializeContract,
    getUser,
    createUser,
    mint,
    burn,
    createDataset,
    createOrder,
    getDataset,
    getOrder,
    getDatasetList,
    getOrderList,
    handleOrder,
    displayInputParameters
}