import express from 'express';
import { saveSearch, getSavedSearches, deleteSavedSearch } from '../controllers/savedSearchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', saveSearch);
router.get('/', getSavedSearches);
router.delete('/:id', deleteSavedSearch);

export default router;
