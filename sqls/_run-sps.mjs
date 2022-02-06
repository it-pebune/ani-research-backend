/**
 * Get newly added files: git ls-files --others --exclude-standard
 * Get modified files: git diff --name-only
 * Get last commit id: git log --format="%H" -n 1
 * Get last commit files: git diff-tree --no-commit-id --name-only -r last-commit-id
 * node server/sqls/_run-sps.js username pwd server-name-to-only-run-on
 */

import { exec } from 'child_process';
import { extname, resolve } from 'path';
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
    trustServerCertificate: false,
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
    name: 'rpb_dev',
    server: 'sql-rpb.database.windows.net',
    database: 'rpb'
  }
];

if (false) {
  getLastFiles(async (result) => {
    // console.log(result);
    await runAllOnAll(servers, result);
    console.log('DONE');
  });
}

const previouslyModifiedFiles = [
  // 'sqls/changes.sql',
  'sqls/documents/documentAdd.sql',
  'sqls/documents/documentUpdate.sql',
  'sqls/documents/documentDelete.sql',
  'sqls/documents/documentList.sql',
  'sqls/documents/getDocumentById.sql',
  'sqls/documents/getDocumentData.sql',
  'sqls/documents/documentUpdateData.sql',
  'sqls/documents/getDocumentDataRaw.sql',
  'sqls/documents/getDocumentOriginalPath.sql'
  // 'sqls/subjects/getSubjectById.sql',
  // 'sqls/subjects/subjectList.sql',
  // 'sqls/subjects/subjectAdd.sql',
  // 'sqls/subjects/subjectUpdate.sql'
  // 'sqls/login/didLogin.sql',
  // 'sqls/login/didLogout.sql',
  // 'sqls/users/deserializeUser.sql',
  // 'sqls/users/getUserByEmail.sql',
  // 'sqls/users/getUserByGoogleId.sql',
  // 'sqls/users/getUserById.sql',
  // 'sqls/users/getUserByRefreshToken.sql',
  // 'sqls/users/adminUserAdd.sql',
  // 'sqls/users/adminUserDelete.sql',
  // 'sqls/users/adminUserList.sql',
  // 'sqls/users/adminUserUpdate.sql',
  // 'sqls/users/adminUserUpdateStatus.sql',
  // 'sqls/users/userUpdate.sql'
];

/**
 * @param {*} command
 * @param {*} callback
 */
function execute(command, callback) {
  exec(command, (error, stdout, stderr) => {
    callback(stdout);
  });
};

/**
 * @param {*} callback
 */
function getLastFiles(callback) {
  execute('git log --format="%H" -n 1', (lastCommitId) => {
    console.log(`last commit: ${lastCommitId}`);
    if (lastCommitId) {
      execute('git diff-tree --no-commit-id --name-only -r ' + lastCommitId, (result) => {
        // console.log(result);
        const files = result.split('\n');
        const sps = [];
        files.forEach((f) => {
          if (f) {
            if (extname(f) === '.sql') {
              sps.push(f);
            }
          }
        });

        callback(sps);
      });
    }
  });
}

/**
 * @param {*} callback
 */
function getModifiedFiles(callback) {
  execute('git diff --name-only --diff-filter=d', (modified) => {
    execute('git ls-files --others --exclude-standard', (newly) => {
      const all = (modified || '') + (newly || '');
      const files = all.split('\n');
      const result = [];
      files.forEach((f) => {
        if (f) {
          if (extname(f) === '.sql') {
            result.push(f);
          }
        }
      });

      callback(result);
    });
  });
}

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
 * @param {*} serverInfos
 * @param {*} spFiles
 */
async function runAllOnAll(serverInfos, spFiles) {
  try {
    for (let i = 0; i < serverInfos.length; i++) {
      const selectedServer = process.argv[4];
      const serverInfo = serverInfos[i];
      if (!selectedServer || (selectedServer === serverInfo.name)) {
        serverInfo.user = process.argv[2];
        serverInfo.password = process.argv[3];
        console.log(`running on ${serverInfo.server}:${serverInfo.database}...`);
        const pool = await sqlConnect(serverInfo);
        for (let j = 0; j < spFiles.length; j++) {
          await runOneFile(pool, spFiles[j]);
        }
        await sql.close();
        console.log(`completed on ${serverInfo.server}:${serverInfo.database}\n`);
      } else {
        console.log(`Skipping ${serverInfo.server}:${serverInfo.database}\n`);
      }
    }
  } catch (ex) {
    console.log(ex);
    sql.close();
  }
}

getModifiedFiles(async (result) => {
  console.log(result);
  // await runAllOnAll(servers, result);
  await runAllOnAll(servers, previouslyModifiedFiles);
  console.log('DONE');
});
