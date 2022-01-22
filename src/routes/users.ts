import { Router } from 'express';
import { UserController } from '~controllers';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new UserController();

router.route('/me')
  .get(ctrl.getMe.bind(ctrl));

router.route('/')
  .put(ctrl.update.bind(ctrl));
router.route('/delete')
  .put(ctrl.delete.bind(ctrl));
router.route('/settings')
  .put(ctrl.updateUISettings.bind(ctrl));

export default router;
