import { Monitoring } from '@google-cloud/monitoring';
import { cloudConfig } from '../config/cloud';

class CloudMonitoring {
  private client: Monitoring;

  constructor() {
    this.client = new Monitoring({
      projectId: cloudConfig.projectId,
    });
  }

  async recordPDFGeneration(duration: number, success: boolean) {
    const metric = {
      type: 'custom.googleapis.com/pdf_generator/generation_time',
      labels: {
        success: success.toString(),
      },
    };

    await this.client.createTimeSeries({
      name: `projects/${cloudConfig.projectId}`,
      timeSeries: [{
        metric,
        points: [{
          interval: {
            endTime: {
              seconds: Date.now() / 1000,
            },
          },
          value: {
            doubleValue: duration,
          },
        }],
      }],
    });
  }
}

export const monitoring = new CloudMonitoring();