import { randStr, hash, generateHashChain } from '../../src/utils/utils.mjs';
import logger from '../../src/utils/log.mjs';


async function testRandStr(){
    // 生成10个长度为10 的随机字符串
    logger.info("generate 10 random strings:");
    for (let i = 0; i < 10; i++) {
        const str = await randStr(10);
        logger.debug(str);
    }
}

async function testHash(){
    // 为10个随机生成的字符串计算hash
    logger.info("generate 10 random strings and hash them:");
    for (let i = 0; i < 10; i++) {
        const str = await randStr(10);
        const hashResult = await hash(str);
        logger.debug(`preImage: ${str} \nhashResult: ${hashResult}`);
    }
}

async function testHashChain(){
    logger.info("generate hash chain with 10 elements:");
    const hashChain = await generateHashChain(10);
    for (let i = 0; i < hashChain.length; i++) {
        logger.debug(`hashChain[${i}]: ${hashChain[i]}`);
    }
}

async function main() {
    await testRandStr();
    await testHash();
    await testHashChain();
}

main();