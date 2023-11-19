import { MongoClient } from 'mongodb';
import { logError } from './logger';
import config from '../config';

export async function mongoClient() {
  const url = `mongodb://${config.mongo.host}:${config.mongo.port}`;
  const client = new MongoClient(url);
  try {
    // Connect to db
    await client.connect();
    // Return the db object
    return client;
  } catch (error) {
    logError('Error connecting to the database:', error.message);
    throw error;
  }
}
