import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { UserModel } from '../models/User.js';

const router = Router();

// Mock Google OAuth endpoints - in production, use actual Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { token, user } = req.body;
    
    let dbUser = await UserModel.findOne({ email: user.email });
    
    if (!dbUser) {
      dbUser = new UserModel({
        email: user.email,
        name: user.name,
        avatar: user.picture,
        role: 'user'
      });
      await dbUser.save();
    }

    const jwtToken = jwt.sign(
      { userId: dbUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        avatar: dbUser.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/session', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await UserModel.findById(req.user!.id);
    res.json(user);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;