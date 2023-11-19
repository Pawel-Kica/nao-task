import config from '../config';

export function logger(...data: any) {
  // AWS CloudWatch formatting
  if (config.isLocal) {
    console.log(
      JSON.stringify({ ts: new Date().toISOString(), args: data }, null, 2),
    );
  } else {
    console.log(JSON.stringify({ ts: new Date().toISOString(), args: data }));
  }
}

export function logError(...data: any) {
  logger('ERROR', ...data);
}

export function logInfo(...data: any) {
  logger('INFO', ...data);
}
