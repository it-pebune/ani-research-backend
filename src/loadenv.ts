import dotenv from 'dotenv';
import commandLineArgs from 'command-line-args';
import { join } from 'path';

// Setup command line options
const options = commandLineArgs([
  {
    name: 'env',
    alias: 'e',
    defaultValue: 'production',
    type: String
  }
]);

// Set the env file
const result = dotenv.config({
  path: join(__dirname, '../env', `${options.env}.env`)
});

if (result.error && process.env.NODE_ENV === 'development') {
  throw result.error;
}
