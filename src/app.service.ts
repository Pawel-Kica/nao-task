import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  getUTC(): string {
    return new Date().toUTCString();
  }

  @Cron(CronExpression.EVERY_SECOND)
  async logMemoryUsage() {
    const used = process.memoryUsage();
    console.log(
      `Memory Usage: ${Math.round((used.rss / 1024 / 1024) * 100) / 100}MB`,
    );
  }
}
