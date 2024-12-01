const envSchema = z.object({
  // ... existing schema
  gcp: z.object({
    projectId: z.string(),
    location: z.string(),
    logRotationDays: z.number(),
    maxLogSize: z.string()
  })
});

export const config = {
  // ... existing config
  gcp: {
    projectId: env.VITE_GCP_PROJECT_ID,
    location: env.VITE_GCP_LOCATION,
    logRotationDays: env.VITE_LOG_ROTATION_DAYS,
    maxLogSize: env.VITE_MAX_LOG_SIZE
  }
} as const;