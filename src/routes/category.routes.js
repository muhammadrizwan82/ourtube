import { Router } from 'express'
import { getAllCategories,addCategory } from '../controllers/category.controller.js';

const router = Router();

router.route('/getcategory').get(getAllCategories);
router.route('/addcategory').post(addCategory);

export default router;