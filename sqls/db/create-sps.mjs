import { resolve } from 'path';
import { readFile } from 'fs/promises';
import sql from 'mssql';
import eol from 'eol';

const { connect } = sql;
const { crlf } = eol;

const serverBase = {
  connectionTimeout: 30000,
  requestTimeout: 30000,
  stream: null,
  parseJSON: true,
  options: {
    connectTimeout: 30000,
    requestTimeout: 30000,
    encrypt: true,
    trustServerCertificate: true,
    useUTC: true,
    dateFormat: 'ymd',
    useColumnNames: false,
    appName: 'rpb-db-script',
    enableArithAbort: true
  }
};

const poolConfig = {
  min: 1,
  max: 5,
  log: false,
  idleTimeoutMillis: 30000,
  acquireTimeoutMillis: 30000
};


const servers = [
  {
    ...serverBase,
    name: 'rpb_test',
    server: 'localhost',
    database: 'rpb'
  }
];

const allFiles = [
  'sqls/login/didLogin.sql',
  'sqls/login/didLogout.sql',

  'sqls/subjects/getSubjectAssignedHistory.sql',
  'sqls/subjects/getSubjectById.sql',
  'sqls/subjects/subjectAdd.sql',
  'sqls/subjects/subjectAssign.sql',
  'sqls/subjects/subjectDelete.sql',
  'sqls/subjects/subjectList.sql',
  'sqls/subjects/subjectUpdate.sql',

  'sqls/uat/getCounties.sql',
  'sqls/uat/getUats.sql',

  'sqls/users/adminUserAdd.sql',
  'sqls/users/adminUserDelete.sql',
  'sqls/users/adminUserList.sql',
  'sqls/users/adminUserUpdate.sql',
  'sqls/users/adminUserUpdateNotes.sql',
  'sqls/users/adminUserUpdateStatus.sql',
  'sqls/users/deserializeUser.sql',
  'sqls/users/getUserByEmail.sql',
  'sqls/users/getUserByGoogleId.sql',
  'sqls/users/getUserById.sql',
  'sqls/users/getUserByRefreshToken.sql',
  'sqls/users/userDelete.sql',
  'sqls/users/userUpdate.sql',
  'sqls/users/userUpdateProviderData.sql'
];

/**
 * @param {*} pool
 * @param {*} batch
 */
async function runBatch(pool, batch) {
  return new Promise((resolve, reject) => {
    // console.log(`\n${batch}\n`);
    new sql.Request(pool).batch(batch)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * @param {*} cnn
 * @param {*} spFile
 */
async function runOneFile(cnn, spFile) {
  try {
    console.log(`\n\trunning ${spFile}...`);
    let data = await readFile(resolve(spFile), 'utf8');
    data = crlf(data);
    const batches = data.split('GO');
    for (let i = 0; i < batches.length; i++) {
      await runBatch(cnn, batches[i]);
    }
    console.log(`\tcompleted ${spFile}`);
  } catch (ex) {
    throw ex;
  }
}

/**
 * @param {*} serverInfo
 * @return {sql.ConnectionPool}
 */
function sqlConnect(serverInfo) {
  const config = {
    ...serverInfo,
    pool: {
      ...poolConfig
    }
  };

  return connect(config);
}

/**
 * @param {*} spFiles
 */
async function runAll(spFiles) {
  try {
    const serverInfo = servers[0];
    serverInfo.user = process.argv[2];
    serverInfo.password = process.argv[3];
    console.log(`running on ${serverInfo.server}:${serverInfo.database}...`);
    const pool = await sqlConnect(serverInfo);
    for (let j = 0; j < spFiles.length; j++) {
      await runOneFile(pool, spFiles[j]);
    }
    await sql.close();
    console.log(`completed on ${serverInfo.server}:${serverInfo.database}\n`);
  } catch (ex) {
    console.log(ex);
    sql.close();
  }
}

(async () => {
  await runAll(allFiles);
  console.log('DONE');
})();
