import { Router } from 'express';
import { createTable, getClubTables } from '../controllers/tableController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/create', createTable);
router.get('/:clubId', getClubTables);

export default router;
