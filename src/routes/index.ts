import { Router } from 'express';
import AdminUserRouter from './admin-user';
import AuthRouter from './auth';
import DocRouter from './documents';
import InstRouter from './institutions';
import JobRouter from './job-position';
import SubjectRouter from './subjects';
import UatRouter from './uats';
import UserRouter from './users';
import WebScrapRouter from './web-scrap';

// Init router and path
// eslint-disable-next-line new-cap
const router = Router();

// Add sub-routes
router.use('/auth', AuthRouter);
router.use('/docs', DocRouter);
router.use('/insts', InstRouter);
router.use('/jobs', JobRouter);
router.use('/subjects', SubjectRouter);
router.use('/uat', UatRouter);
router.use('/users', UserRouter);
router.use('/users', AdminUserRouter);
router.use('/webscrap', WebScrapRouter);

// Export the base-router
export default router;
