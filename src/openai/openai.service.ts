import { OpenAI } from 'langchain/llms/openai';
import { Injectable } from '@nestjs/common';
import config from '../config';

@Injectable()
export class OpenAIService {
  llm: OpenAI;

  constructor() {
    if (config.openAIApiKey) {
      this.llm = new OpenAI({
        openAIApiKey: config.openAIApiKey,
        modelName: 'gpt-4',
      });
    }
  }
}
