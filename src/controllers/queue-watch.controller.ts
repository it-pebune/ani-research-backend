import {
  appConfig, logger, parseError, streamToBuffer
} from '~shared';
import { DequeuedMessageItem, QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { DocumentStatus, IQueueOutput } from '~entities';
import app from '~app';
import { DocumentDao } from '~daos';
import { ShareServiceClient } from '@azure/storage-file-share';

const QUEUE_CHECK_PERIOD = 30_000;

let _timeoutHandler: NodeJS.Timeout | null;

/**
 * Checks for finsihed OCR processed documents
 */
export async function checkOCROutputQueue(): Promise<void> {
  logger.debug('checking for OCR output messages...');
  const appCfg = appConfig();
  const queueServiceClient = QueueServiceClient.fromConnectionString(appCfg.storageOcrCnnString);
  const queueClient = queueServiceClient.getQueueClient(appCfg.queueDeclarationsOutName);
  const response = await queueClient.receiveMessages();
  if (response.receivedMessageItems.length) {
    logger.debug(`${response.receivedMessageItems.length} to process...`);
    for (const item of response.receivedMessageItems) {
      await processDocument(queueClient, item);
    }
  }

  if (response.errorCode) {
    logger.error(`ocr output queue error: ${response.errorCode}`);
    logger.debug(response);
  }

  _timeoutHandler = setTimeout(checkOCROutputQueue, QUEUE_CHECK_PERIOD);
}

/**
 * Process a queue item
 * @param {QueueClient} queueClient
 * @param {DequeuedMessageItem} item
 */
async function processDocument(queueClient: QueueClient, item: DequeuedMessageItem): Promise<void> {
  try {
    logger.debug(item);
    const doc = JSON.parse(item.messageText) as IQueueOutput;
    logger.debug(doc);

    const sqlpool = await app.sqlPool;
    const dao = new DocumentDao(sqlpool);

    if (doc.errors.length > 0) {
      logger.error(doc.errors);
      await queueClient.deleteMessage(item.messageId, item.popReceipt);
      await dao.updateDataRaw(doc.documentId, DocumentStatus.ocrError);
      return;
    }

    const appCfg = appConfig();
    const shareServiceClient = ShareServiceClient.fromConnectionString(appCfg.storageOcrCnnString);
    const shareClient = shareServiceClient.getShareClient(appCfg.shareDeclarations);
    const declFolderClient = shareClient.getDirectoryClient(doc.outPath);
    const fileClient = declFolderClient.getFileClient(doc.ocrCustomJsonFilename);
    if (!await fileClient.exists()) {
      logger.error(`output file does not exists ${doc.outPath} ${doc.ocrCustomJsonFilename}`);
      await queueClient.deleteMessage(item.messageId, item.popReceipt);
      await dao.updateDataRaw(doc.documentId, DocumentStatus.ocrOutputNotFound);
      return;
    }
    const downloadFileResponse = await fileClient.download();
    if (!downloadFileResponse.readableStreamBody) {
      logger.error('download error');
      await queueClient.deleteMessage(item.messageId, item.popReceipt);
      await dao.updateDataRaw(doc.documentId, DocumentStatus.ocrOutputDownloadError);
      return;
    }
    const content = (await streamToBuffer(downloadFileResponse.readableStreamBody)).toString();
    logger.debug(content);

    await dao.updateDataRaw(doc.documentId, DocumentStatus.ocrCompleted, content);

    await queueClient.deleteMessage(item.messageId, item.popReceipt);
  } catch (ex) {
    logger.error(parseError(ex));
  }
}

/** Cancel queue watch */
export function cancelQueueWatch(): void {
  if (_timeoutHandler) {
    clearTimeout(_timeoutHandler);
    _timeoutHandler = null;
  }
}
