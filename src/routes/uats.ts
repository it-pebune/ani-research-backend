import { Router } from 'express';
import { UatController } from '~controllers';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new UatController();

// /api/uat
router.route('/counties')
  .get(ctrl.getCounties.bind(ctrl));

router.route('/uats')
  .get(ctrl.getUats.bind(ctrl));

export default router;
