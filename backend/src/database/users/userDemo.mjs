import { addUser } from './userTable.mjs';
import {hashPassword} from './userService.mjs';
import logger from '../../utils/log.mjs';

// 初始化演示账户业务逻辑
export async function addDemoUser() {
    try {
        logger.debug('初始化演示账户');

        // 创建数据拥有者演示账户
        const dataOwnerUsername = 'demoDataOwner';
        const dataOwnerPassword = 'demoDataOwner';
        const hashedDataOwnerPassword = hashPassword(dataOwnerPassword);
        await addUser(dataOwnerUsername, hashedDataOwnerPassword);

        // 创建数据请求者演示账户
        const dataRequesterUsername = 'demoDataRequester';
        const dataRequesterPassword = 'demoDataRequester';
        const hashedDataRequesterPassword = hashPassword(dataRequesterPassword);
        await addUser(dataRequesterUsername, hashedDataRequesterPassword);
        
        return {
            success: true,
            message: '演示账户初始化完成'
        };
    } catch (error) {
        logger.error('初始化演示账户时发生错误:', error);
        return {
            success: false,
            message: error.message
        };
    }
}