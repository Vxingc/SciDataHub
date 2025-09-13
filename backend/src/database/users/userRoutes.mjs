import express from 'express';
import { 
    handleRegister,
    handleLogin,
    handleGetUserByUsername,
} from './userService.mjs';

const router = express.Router();

// 用户相关路由
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/user/username/:username', handleGetUserByUsername);

export default router;