import express from 'express';
import { googleAuth, getMe, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', googleAuth);
router.get('/me', getMe);
router.post('/logout', logout);

export default router;
