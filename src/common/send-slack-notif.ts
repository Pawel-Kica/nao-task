import axios from 'axios';
import config from '../config';
import { logError } from './logger';

export function sendSlackNotif(text: string) {
  try {
    const url = config.slackWebhookUrl;
    if (!url) {
      throw new Error('Missing slack webhook url');
    }

    return axios(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { text },
    });
  } catch (error) {
    logError('Error sending slack notification', {
      error: error.message,
      text,
    });
  }
}

export enum LogEmoji {
  ERROR = '🚨',
  INFO = 'ℹ️',
  SUCCESS = '✅',
}

export function getHeading(text: string, emoji: LogEmoji) {
  return `*${emoji} ${text} ${emoji}*`;
}
