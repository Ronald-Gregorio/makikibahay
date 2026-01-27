import { Router } from 'express';
import { UserModel } from '../models/User.js';
import { validateUpdateUser } from '@makikibahay/utils';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/preferences', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const preferences = req.body;
    
    const user = await UserModel.findByIdAndUpdate(
      req.user!.id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    );
    
    res.json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;