import { IGoogleClientInfo } from '~entities';
import { getAccountInfoFromCnnString, IStorageAccountInfo } from './utils';

export interface IAppConfig {
  app: {
    title: string;
    description: string;
    keywords: string;
  };
  authentication: {
    private: string;
    public: string;
  };
  blobContainerGeneralPath: string;
  blobMPsCachePath: string;
  googleClientInfo: IGoogleClientInfo;
  logTableName: string;
  logUITableName: string;
  nodeEnv: string;
  port: string;
  queueDeclarationsInName: string;
  queueDeclarationsOutName: string;
  sqlCnnString: string;
  shareDeclarations: string;
  storageGenCnnString: string;
  storageGenInfo: IStorageAccountInfo;
  storageOcrCnnString: string;
  storageOcrInfo: IStorageAccountInfo;
}

let _appConfig: IAppConfig | null = null;

export const appConfig = (refresh: boolean = false): IAppConfig => {
  if (_appConfig && !refresh) {
    return _appConfig;
  }

  const keyPair = JSON.parse(getEnvVariable('AUTH_KEYS'));
  const gci = JSON.parse(getEnvVariable('GOOGLE_CLIENT_INFO'));
  const storageGenCnnString = getEnvVariable('AZURE_STORAGE_GEN_CNNSTR');
  const storageGenInfo = getAccountInfoFromCnnString(storageGenCnnString);
  const storageOcrCnnString = getEnvVariable('AZURE_STORAGE_OCR_CNNSTR');
  const storageOcrInfo = getAccountInfoFromCnnString(storageOcrCnnString);

  _appConfig = {
    app: {
      title: 'Integritate pe Bune',
      description: 'Integritate pe Bune - research backend',
      keywords: 'Integritate, pe Bune, ANI, CNA'
    },
    authentication: {
      private: keyPair.private,
      public: keyPair.public
    },
    blobContainerGeneralPath: getEnvVariable('BLOB_CONTAINER_GENERAL'),
    blobMPsCachePath: getEnvVariable('BLOB_MPS_CACHE'),
    googleClientInfo: gci.web,
    logTableName: getEnvVariable('LOG_TABLE_NAME'),
    logUITableName: getEnvVariable('LOGUI_TABLE_NAME'),
    nodeEnv: getEnvVariable('NODE_ENV'),
    port: getEnvVariable('PORT'),
    queueDeclarationsInName: getEnvVariable('QUEUE_DECLARATIONS_IN'),
    queueDeclarationsOutName: getEnvVariable('QUEUE_DECLARATIONS_OUT'),
    sqlCnnString: getEnvVariable('AZURE_SQL'),
    shareDeclarations: getEnvVariable('SHARE_DECLARATIONS'),
    storageGenCnnString,
    storageGenInfo,
    storageOcrCnnString,
    storageOcrInfo
  };

  return _appConfig;
};

/**
 * Check if environment variable exists
 * @param {string} varName
 * @return {string}
 */
function getEnvVariable(varName: string): string {
  if (!process.env[varName]) {
    throw new Error(`${varName} is not defined`);
  }

  return process.env[varName]!;
}
