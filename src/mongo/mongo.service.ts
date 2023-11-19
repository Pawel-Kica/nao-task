import { Injectable } from '@nestjs/common';
import {
  Collection,
  Filter,
  MongoClient,
  OptionalUnlessRequiredId,
} from 'mongodb';
import { logError } from '../common/logger';
import config from '../config';

@Injectable()
export class MongoService {
  async mongoClient() {
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

  async insertManyByChunks<T>(
    collection: Collection<T>,
    data: OptionalUnlessRequiredId<any>[],
    identifiedBy: string,
  ) {
    // const errored = ['5e320722-7d91-435e-b7a4-c9e034727324'];
    const errored = [];
    for (let i = 0; i < data.length; i += config.chunkSize) {
      const chunk = data.slice(i, i + config.chunkSize);

      const result = await collection
        // Default _id is generated by MongoDB
        .insertMany(chunk)
        .catch((e) => {
          logError('Insert many error', {
            chunk,
            error: e.message,
          });
          return { acknowledged: false };
        });

      if (!result.acknowledged)
        errored.push(...chunk.map((el) => el[identifiedBy]));
    }
    return errored;
  }

  async updateMany<T>(
    collection: Collection<T>,
    data: T[],
    identifiedBy: string = '_id',
  ) {
    // const errored = ['1cd2f7de-0c3d-4fb0-a151-e1a5f8a3e27e'];
    const errored = [];
    for (const el of data) {
      const filter = { [identifiedBy]: el[identifiedBy] } as Filter<T>;

      // create update element, remove identifiedBy
      const update = { ...el };
      delete update[identifiedBy];

      const result = await collection
        .updateOne(filter, { $set: update })
        .catch((e) => {
          logError('Update many error', {
            product: el,
            error: e.message,
          });
          return { acknowledged: false };
        });

      if (!result.acknowledged) errored.push(el[identifiedBy]);
    }
    return errored;
  }
}
