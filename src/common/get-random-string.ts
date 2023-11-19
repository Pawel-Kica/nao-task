import { randomBytes } from 'crypto';

export const getRandomString = (): string => randomBytes(16).toString('hex');
