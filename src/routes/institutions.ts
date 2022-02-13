import { Router } from 'express';
import { InstitutionController } from '~controllers';
import { institutionPolicy } from '~policies';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new InstitutionController();

// /api/insts
router.route('/')
  .all(institutionPolicy.isAllowed.bind(institutionPolicy))
  .get(ctrl.list.bind(ctrl))
  .post(ctrl.add.bind(ctrl));

router.route('/:instId')
  .all(institutionPolicy.isAllowed.bind(institutionPolicy))
  .get(ctrl.read.bind(ctrl))
  .put(ctrl.update.bind(ctrl))
  .delete(ctrl.delete.bind(ctrl));

export default router;
