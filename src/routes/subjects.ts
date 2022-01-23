import { Router } from 'express';
import { SubjectController } from '~controllers';
import { subjectPolicy } from '~policies';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const ctrl = new SubjectController();

// /api/subjects
router.route('/')
  .all(subjectPolicy.isAllowed.bind(subjectPolicy))
  .get(ctrl.list.bind(ctrl))
  .post(ctrl.add.bind(ctrl));

router.route('/:subjectId')
  .all(subjectPolicy.isAllowed.bind(subjectPolicy))
  .get(ctrl.read.bind(ctrl))
  .put(ctrl.update.bind(ctrl))
  .delete(ctrl.delete.bind(ctrl));

router.route('/:subjectId/notes')
  .all(subjectPolicy.isAllowed.bind(subjectPolicy))
  .put(ctrl.updateNotes.bind(ctrl));

router.route('/:subjectId/assignedHistory')
  .all(subjectPolicy.isAllowed.bind(subjectPolicy))
  .get(ctrl.assignedHistory.bind(ctrl));

router.param('subjectId', ctrl.subjectById);

export default router;
