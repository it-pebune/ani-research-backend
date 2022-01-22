import './loadenv'; // Must be the first import
import mainApp from './app';
import { logger, parseError } from '~shared';


/**
 * @param {string} val port
 * @return {string | number | boolean}
 */
const normalizePort = (val: string): string | number | boolean => {
  const p = parseInt(val, 10);

  if (isNaN(p)) {
    // named pipe
    return val;
  }

  if (p >= 0) {
    // port number
    return p;
  }

  return false;
};


// Start the server
export const main = async () => {
  const port = normalizePort(process.env.PORT || '3300');
  logger.info('Starting...');
  try {
    const expressApp = await mainApp.init();
    const server = expressApp.listen(port, () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + (addr ? addr.port : port);
      logger.info(`Listening on ${bind}`);
    });
  } catch (error) {
    logger.error('Error starting server');
    logger.error(parseError(error));
  }
};

main();
