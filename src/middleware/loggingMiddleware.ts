import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export async function logApiRequest(
  endpoint: string,
  method: string,
  startTime: number,
  response: any,
  error?: Error
) {
  const duration = Date.now() - startTime;
  const requestId = uuidv4();
  const userId = localStorage.getItem('userId');

  const metadata = {
    requestId,
    userId,
    operation: `${method} ${endpoint}`,
    resourcePath: endpoint,
    method,
    statusCode: response?.status,
    duration
  };

  if (error) {
    await logger.error('API request failed', metadata, error);
  } else {
    await logger.info('API request completed', metadata);
  }
}