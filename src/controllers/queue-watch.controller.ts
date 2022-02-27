import {
  appConfig, logger
} from '~shared';
import { DequeuedMessageItem, QueueServiceClient } from '@azure/storage-queue';

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
    for (const item of response.receivedMessageItems) {
      await processDocument(item);
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
 * @param {DequeuedMessageItem} item
 */
async function processDocument(item: DequeuedMessageItem): Promise<void> {
  // TODO:
}

/** Cancel queue watch */
export function cancelQueueWatch(): void {
  if (_timeoutHandler) {
    clearTimeout(_timeoutHandler);
    _timeoutHandler = null;
  }
}
