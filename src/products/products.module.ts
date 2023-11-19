import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { OpenAIModule } from '../openai/openai.module';
import { MongoModule } from '../mongo/mongo.module';

@Module({
  imports: [OpenAIModule, MongoModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
