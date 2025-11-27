import crypto from 'crypto';
import {
    dbAddUser as dbCreateUser,
    dbGetUserByUsername,
} from './userTable.mjs';

import logger from '../../utils/log.mjs';

// 密码加密函数
export async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// 验证密码
export async function verifyPassword(password, hashedPassword) {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

// 用户注册路由处理函数
export async function register(req, res) {
    try {
        const { username, password } = req.body;

        // 检查用户名是否已存在
        const existingUser = await dbGetUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: '用户名至少需要3个字符'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码至少需要6个字符'
            });
        }

        // 加密密码并创建用户
        const hashedPassword = await hashPassword(password);
        const user = await dbCreateUser(username, hashedPassword);

        res.json({
            success: true,
            message: '注册成功',
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('用户注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 用户登录路由处理函数
export async function login(req, res) {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        // 查找用户
        const user = await dbGetUserByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        res.json({
            success: true,
            message: '登录成功',
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('用户登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};


// 根据用户名获取用户信息路由处理函数
export async function getUserByUsername(req, res) {
    try {
        const { username } = req.params;
        const user = await dbGetUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

