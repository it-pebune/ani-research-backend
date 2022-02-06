import { Router } from 'express';
import { DocumentController } from '~controllers';
import { documentPolicy } from '~policies';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new DocumentController();

// /api/docs
router.route('/')
  .all(documentPolicy.isAllowed.bind(documentPolicy))
  .get(ctrl.list.bind(ctrl))
  .post(ctrl.add.bind(ctrl));

router.route('/:docId')
  .all(documentPolicy.isAllowed.bind(documentPolicy))
  .get(ctrl.read.bind(ctrl))
  .put(ctrl.update.bind(ctrl))
  .delete(ctrl.delete.bind(ctrl));

router.route('/:docId/odoc')
  .all(documentPolicy.isAllowed.bind(documentPolicy))
  .get(ctrl.getOriginalDoc.bind(ctrl));
router.route('/:docId/data')
  .all(documentPolicy.isAllowed.bind(documentPolicy))
  .get(ctrl.getData.bind(ctrl))
  .put(ctrl.updateData.bind(ctrl));
router.route('/:docId/dataraw')
  .all(documentPolicy.isAllowed.bind(documentPolicy))
  .get(ctrl.getDataRaw.bind(ctrl));

export default router;
