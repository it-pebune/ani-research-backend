import { Router } from 'express';
import AdminUserRouter from './admin-user';
import AuthRouter from './auth';
import UserRouter from './users';

// Init router and path
// eslint-disable-next-line new-cap
const router = Router();

// Add sub-routes
router.use('/auth', AuthRouter);
router.use('/users', UserRouter);
router.use('/users', AdminUserRouter);

// Export the base-router
export default router;
