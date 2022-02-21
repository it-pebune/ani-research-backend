import { Router } from 'express';
import { WebScrapController } from '~controllers';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new WebScrapController();

// /api/webscrap
router.route('/mps')
  .get(ctrl.getMPList.bind(ctrl));
router.route('/mps/details')
  .get(ctrl.getMPDetails.bind(ctrl));
router.route('/decls')
  .get(ctrl.getDeclarations.bind(ctrl));


export default router;
