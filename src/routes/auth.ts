import { Router } from 'express';
import { GeneralAuthController, GoogleAuthController } from '~controllers';

// Init shared
// eslint-disable-next-line new-cap
const router = Router();
const authCtrl = new GeneralAuthController();
const googleCtrl = new GoogleAuthController();

router.route('/google/auth-url')
  .get(googleCtrl.getAuthUrl.bind(googleCtrl));
router.route('/google/signin')
  .get(googleCtrl.signIn.bind(googleCtrl));

router.route('/signout')
  .get(authCtrl.signout.bind(authCtrl));

router.route('/refresh')
  .get(authCtrl.refreshAuthToken.bind(authCtrl));

export default router;
