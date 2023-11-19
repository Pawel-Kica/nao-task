import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OpenAIModule } from './openai/openai.module';
import { MongoModule } from './mongo/mongo.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductsModule,
    OpenAIModule,
    MongoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
