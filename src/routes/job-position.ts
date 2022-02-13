import { Router } from 'express';
import { JobPositionController } from '~controllers';
import { jobPositionPolicy } from '~policies';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new JobPositionController();

// /api/jobs
router.route('/')
  .all(jobPositionPolicy.isAllowed.bind(jobPositionPolicy))
  .get(ctrl.list.bind(ctrl))
  .post(ctrl.add.bind(ctrl));

router.route('/:jobId')
  .all(jobPositionPolicy.isAllowed.bind(jobPositionPolicy))
  .get(ctrl.read.bind(ctrl))
  .put(ctrl.update.bind(ctrl))
  .delete(ctrl.delete.bind(ctrl));

export default router;
