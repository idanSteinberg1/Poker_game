import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check admin role
const checkAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

router.use(authenticateToken);
router.use(checkAdmin);

router.get('/logs', adminController.getLogs);
router.get('/users', adminController.getUsers);
router.post('/chips', adminController.addChips);

export default router;
