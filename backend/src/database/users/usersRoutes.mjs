import express from 'express';
import { 
    register,
    login,
    getUserByUsername,
} from './usersService.mjs';

const router = express.Router();

// 用户相关路由
router.post('/register', register);
router.post('/login', login);
router.get('/user/username/:username', getUserByUsername);

export default router;