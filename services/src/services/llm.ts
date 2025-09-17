import axios from 'axios';
import { config } from '../config/config';
import logger from '../utils/logger';

export type typeLLMRequest = {
  system_prompt: string;
  chat_history?: Array<{ role: 'user' | 'model'; parts: { text: string }[] }>;
  user_query: string;
  responseSchema?: Object;
};

const llmRequest = async (llmRequest: typeLLMRequest) => {
  try {
    let data = JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: llmRequest.system_prompt,
          },
        ],
      },
      contents: [
        ...(llmRequest.chat_history ?? []),
        {
          role: 'user',
          parts: [
            {
              text: llmRequest.user_query,
            },
          ],
        },
      ],
      generationConfig: {
        ...(llmRequest.responseSchema && {
          responseSchema: llmRequest.responseSchema,
        }),
      },
    });

    let requestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: config.llm.apiUrl,
      headers: {
        'x-goog-api-key': config.llm.apiKey,
        'Content-Type': 'application/json',
      },
      data: data,
    };
    const response = await axios.request(requestConfig);
    return response.data;
  } catch (error) {
    logger.error('Error in llmRequest:', error);
  }
};

export { llmRequest };
