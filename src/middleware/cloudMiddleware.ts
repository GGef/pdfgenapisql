import { v4 as uuidv4 } from 'uuid';
import { cloudConfig } from '../config/cloud';

interface CloudContext {
  requestId: string;
  timestamp: number;
  projectId: string;
  location: string;
}

export function createCloudContext(): CloudContext {
  return {
    requestId: uuidv4(),
    timestamp: Date.now(),
    projectId: cloudConfig.projectId,
    location: cloudConfig.location,
  };
}

export function withCloudContext<T>(
  operation: (context: CloudContext) => Promise<T>
): Promise<T> {
  const context = createCloudContext();
  return operation(context);
}