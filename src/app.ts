import path from 'path';
import httpContext from 'express-http-context';
import createError, { HttpError } from 'http-errors';
import express from 'express';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import methodOverride from 'method-override';
import compress from 'compression';
import logger from 'morgan';
import expressJwt from 'express-jwt';
import helmet from 'helmet';
import cors from 'cors';
import consolidate from 'consolidate';
import { v4 as uuidv4 } from 'uuid';
import pkg from '../package.json';
import {
  logger as winston, loggerStream as winstonStream,
  parseError, hasKey, setHttpCtxUser, setRequestUser, setHttpCtxReqId
} from '~shared';
import { NextFunction } from 'connect';
import { initServerRolesPolicy } from '~policies';
import { ConnectionPool } from 'mssql';
import router from './routes';
import { IAuthTokenSubject } from './entities/auth.js';
import { UserDao } from './daos/user-dao';

const JWT_PROPERTY_NAME = 'vxmt_property_auth';

/**
 * Main application class
 */
class App {
  private app = express();
  private sqlConnectionPool: any;

  /**
   * @return {express.Application}
   */
  public get expressApp(): express.Application {
    return this.app;
  }

  /**
   * @return {Promise<express.Express>}
   */
  public async init(): Promise<express.Express> {
    await this.initDatabase();
    this.initMiddleware();
    initServerRolesPolicy();
    this.initJWT();
    this.initRoutes();
    return this.app;
  }

  /**
   * Initialzes the DB
   * @return {Promise<void>}
   */
  private async initDatabase(): Promise<void> {
    const sqlConfig: any = JSON.parse(process.env.AZURE_SQL || '');
    this.sqlConnectionPool = await new ConnectionPool(sqlConfig).connect();
    winston.info(`Connected to SQL: ${sqlConfig.server}:${sqlConfig.database}`);
    return this.sqlConnectionPool;
  }

  /** Init the JWT */
  private initJWT() {
    const exceptedPaths = [
      '/vinfo',
      '/api/auth/refresh',
      '/api/auth/google/auth-url',
      '/api/auth/google/signin'
    ];

    const keyPair = JSON.parse(process.env.AUTH_KEYS || '');

    this.app.use(expressJwt({
      algorithms: ['RS256'],
      secret: keyPair.public,
      requestProperty: JWT_PROPERTY_NAME
    }).unless({
      path: exceptedPaths
    }));

    // Extract user info from auth
    this.app.use(async (req: ExpressRequest, res: ExpressResponse, next) => {
      let auth: any = null;
      if (hasKey(req, JWT_PROPERTY_NAME)) {
        auth = req[JWT_PROPERTY_NAME];
      }
      if (auth && auth.sub) {
        try {
          const sub: IAuthTokenSubject = JSON.parse(auth.sub);
          const dao = new UserDao(await this.sqlPool);
          const user = await dao.deserializeUser(sub.id);
          if (user) {
            user.sessionId = sub.sessionsId;
            setHttpCtxUser(httpContext, user);
            setRequestUser(req, user);
          }
        } catch (ex) {
          winston.error(parseError(ex));
        }
      }
      next();
    });
  }

  /**
   * Initialize routes
   */
  private initRoutes() {
    // disable cache
    this.app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      next();
    });

    /**
     * Routes
     */
    this.app.use('/api', router);

    this.app.get('/vinfo', (req, res) => {
      res.status(200).json({
        v: pkg.version
      });
    });

    // catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      next(createError(404));
    });

    // error handler
    this.app.use((err: HttpError, req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        const ip = req.ip || '';
        if (ip.indexOf('[::1]') < 0) { // do not log AlwaysOn
          winston.error(parseError(err));
        }
      } else {
        winston.error(parseError(err));
      }
      // set locals, only providing error in development
      res.locals.message = err.message || err;
      res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500).send(err.message || err);
    });
  }

  /**
   * Initialize middlewares
   */
  private initMiddleware() {
    // Showing stack errors
    this.app.set('showStackError', true);

    // Enable jsonp
    this.app.enable('jsonp callback');
    this.app.set('trust proxy', 1);

    this.app.use(httpContext.middleware);
    this.app.use((req, res, next) => {
      setHttpCtxReqId(httpContext, uuidv4());
      next();
    });
    this.app.use(cors({
      origin: '*',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization,Origin,X-Requested-With,Accept',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      maxAge: 30 * 60 * 1000
    }));

    // Should be placed before express.static
    this.app.use(compress({
      filter: (req: ExpressRequest, res: ExpressResponse) => {
        const hdr = res.getHeader('Content-Type');
        if (typeof hdr === 'string') {
          return (/json|text|javascript|css|font|svg/).test(hdr);
        }
        return false;
      },
      level: 9
    }));

    this.app.use(helmet());
    this.app.use(helmet.frameguard({ action: 'DENY' }));
    if (process.env.NODE_ENV === 'development') {
      this.app.use(logger('dev'));
    } else {
      const morganOptions: logger.Options<ExpressRequest, ExpressResponse> = {
        stream: winstonStream,
        skip: (req: ExpressRequest) => {
          const ip = req.ip || '';
          const userAgent = req.get('user-agent') || '';
          if (userAgent && userAgent.indexOf('HealthCheck') >= 0) {
            return true;
          }
          if (ip.indexOf('[::1]') < 0) { // do not log AlwaysOn
            return false;
          }
          return true;
        }
      };
      this.app.use(logger('combined', morganOptions));
    }

    this.app.use(express.urlencoded({
      limit: '3mb',
      extended: true
    }));
    this.app.use(express.json({ limit: '3mb' }));
    this.app.use(express.text({ limit: '10kb' }));
    this.app.use(methodOverride());

    // Set swig as the template engine
    // tslint:disable-next-line: no-string-literal
    this.app.engine('view.html', consolidate['swig']);

    // Set views path and view engine
    this.app.set('view engine', 'view.html');
    this.app.set('views', path.join(__dirname, 'templates'));

    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  /**
   * Get DB connection pool
   */
  public get sqlPool(): Promise<ConnectionPool> {
    try {
      return this.sqlConnectionPool;
    } catch (error) {
      throw error;
    }
  }
}

const app = new App();
export default app;
