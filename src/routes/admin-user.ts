import { Router } from 'express';
import { AdminUserController } from '~controllers';
import { adminUserPolicy } from '~policies';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new AdminUserController();

// /api/users
router.route('/')
  .all(adminUserPolicy.isAllowed.bind(adminUserPolicy))
  .get(ctrl.list.bind(ctrl));
router.route('/role')
  .all(adminUserPolicy.isAllowed.bind(adminUserPolicy))
  .get(ctrl.listByRole.bind(ctrl));

router.route('/:auserId')
  .all(adminUserPolicy.isAllowed.bind(adminUserPolicy))
  .get(ctrl.read.bind(ctrl))
  .put(ctrl.update.bind(ctrl));

router.route('/:auserId/delete')
  .all(adminUserPolicy.isAllowed.bind(adminUserPolicy))
  .put(ctrl.delete.bind(ctrl));
router.route('/:auserId/status')
  .all(adminUserPolicy.isAllowed.bind(adminUserPolicy))
  .put(ctrl.updateStatus.bind(ctrl));
router.route('/:auserId/notes')
  .all(adminUserPolicy.isAllowed.bind(adminUserPolicy))
  .put(ctrl.updateNotes.bind(ctrl));

router.param('auserId', ctrl.userById);

export default router;
