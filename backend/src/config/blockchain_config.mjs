/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

import path from "node:path";
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

/**
 * 获取 SciDataHub 项目根目录路径
 * 从当前文件位置向上查找，直到找到包含 package.json 的目录
 */
function getSciDataHubRootPath() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    let currentDir = __dirname;
    
    // 从当前目录向上查找，直到找到项目根目录（包含 package.json）
    while (currentDir !== path.dirname(currentDir)) {
        try {
            const packageJsonPath = path.join(currentDir, 'package.json');
            // 检查是否存在 package.json 和 blockchain 目录
            if (fs.existsSync(packageJsonPath) && fs.existsSync(path.join(currentDir, 'blockchain'))) {
                return currentDir;
            }
        } catch (error) {
            // 继续向上查找
        }
        currentDir = path.dirname(currentDir);
    }
    
    // 如果没找到，抛出错误
    throw new Error('无法找到 SciDataHub 项目根目录');
}

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'scidatahub');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        getSciDataHubRootPath(),
        'blockchain',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

// Path to user private key directory.
const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

// Path to user certificate directory.
const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

// Path to peer tls certificate.
const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const config = {
    channelName,
    chaincodeName,
    mspId,
    cryptoPath,
    keyDirectoryPath,
    certDirectoryPath,
    tlsCertPath,
    peerEndpoint,
    peerHostAlias
};

export default config;