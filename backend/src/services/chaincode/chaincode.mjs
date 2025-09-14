import * as fs from 'node:fs/promises';
import * as grpc from '@grpc/grpc-js';
import path from "node:path";
import * as crypto from 'node:crypto';
import { connect, signers } from '@hyperledger/fabric-gateway';
import config from '../../config/blockchain_config.mjs';
import logger from '../../utils/log.mjs';

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
export async function displayInputParameters() {
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


export async function initializeContract() {
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

export async function initLedger(contract) {
    logger.info("initLedger")
    try {
        await contract.submitTransaction('InitLedger');
    } catch (error) {
        logger.error('initLedger fail', error);
    }
}



