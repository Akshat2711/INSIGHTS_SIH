import { Request, Response } from 'express';
import { botSessionModel } from '../models';
import { llmRequest, typeLLMRequest } from '../services/llm';
import logger from '../utils/logger';
import { getISTDateTimeRange } from '../utils/utils';

const sessionController = async (req: Request, res: Response) => {
  try {
    const { device_id } = req.body;
    if (!device_id) {
      res
        .status(400)
        .json({ status: 'error', message: 'device_id is required' });
      return;
    }

    try {
      let session = await botSessionModel.create({
        chat_history: [],
      });
      res.status(201).json({
        status: 'success',
        message: 'Session created successfully',
        data: { session_id: String(session._id) },
      });
      return;
    } catch (error) {
      logger.error('Error creating session:', error);
      res
        .status(500)
        .json({ message: 'Internal Server Error', status: 'error' });
      return;
    }
  } catch (error) {
    logger.error('Error in sessionController:', error);
    res.status(500).json({ message: 'Internal Server Error', status: 'error' });
    return;
  }
};

const chatController = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    if (!session_id) {
      res
        .status(400)
        .json({ status: 'error', message: 'session_id is required' });
      return;
    }
    const session = await botSessionModel.findById(session_id);
    if (!session) {
      res.status(404).json({
        status: 'error',
        message: 'Session not found',
      });
      return;
    }
    let { user_query }: typeLLMRequest = req.body;
    let system_prompt = 'You are a helpful assistant.';
    if (!user_query) {
      res.status(400).json({
        status: 'error',
        message: 'user_query is required',
      });
      return;
    }

    const chat_history = session.chat_history || [];
    chat_history.push({ role: 'user', parts: [{ text: user_query }] });
    session.chat_history = chat_history;
    await botSessionModel.updateById(session_id, { chat_history });

    const llmRequestData: typeLLMRequest = {
      system_prompt,
      chat_history,
      user_query,
    };

    const response = await llmRequest(llmRequestData);
    logger.info('LLM response received :', {
      session_id,
      user_query,
      response,
    });
    if (!response) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get response from LLM',
      });
      return;
    }
    chat_history.push({
      role: 'model',
      parts: [{ text: response.candidates[0].content.parts[0].text || '' }],
    });
    session.chat_history = chat_history;
    await botSessionModel.updateById(session_id, { chat_history });
    res.status(200).json({
      status: 'success',
      message: 'Chat response generated successfully',
      data: { response: response.candidates[0].content.parts[0].text },
    });
    return;
  } catch (error) {
    logger.error('Error in chatController:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export { chatController, sessionController };
