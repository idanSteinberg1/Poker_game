import { Router } from 'express';
import { createClub, joinClub, getMyClubs } from '../controllers/clubController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken); // Protect all club routes

router.post('/create', createClub);
router.post('/join', joinClub);
router.get('/my', getMyClubs);

export default router;
