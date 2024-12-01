import { z } from 'zod';

const cloudConfigSchema = z.object({
  projectId: z.string(),
  location: z.string(),
  logRotationDays: z.number(),
  maxLogSize: z.string(),
});

export const cloudConfig = {
  projectId: import.meta.env.VITE_GCP_PROJECT_ID,
  location: import.meta.env.VITE_GCP_LOCATION,
  logRotationDays: Number(import.meta.env.VITE_LOG_ROTATION_DAYS),
  maxLogSize: import.meta.env.VITE_MAX_LOG_SIZE,
};

export const validateCloudConfig = () => cloudConfigSchema.parse(cloudConfig);