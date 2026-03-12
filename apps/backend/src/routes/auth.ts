import express from 'express';
import { googleAuth, getMe, logout, register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.post('/logout', logout);

export default router;
