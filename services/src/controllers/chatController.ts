import { Request, Response } from 'express';
import { botSessionModel } from '../models';
import { getDeviceData } from '../services/mqtt';
import { llmRequest, typeLLMRequest } from '../services/llm';
import logger from '../utils/logger';
import { getISTDateTimeRange } from '../utils/utils';
import { getDeviceReadingData } from '../services/device_db';

const sessionController = async (req: Request, res: Response) => {
  try {
    const { device_id } = req.body;
    if (!device_id) {
      res
        .status(400)
        .json({ status: 'error', message: 'device_id is required' });
      return;
    }
    const deviceData = await getDeviceData(device_id);
    if (!deviceData) {
      res.status(404).json({
        status: 'error',
        message: 'Device data not found',
      });
      return;
    }
    try {
      let session = await botSessionModel.create({
        device_id,
        device_data: deviceData,
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

    let parsed_response;
    // query preparation
    try {
      const initial_llm_response = await llmRequest({
        system_prompt: `You are very good at analyzing users query and extracting date and time information form the query. You always have to answer in JSON format. Your job is understand and say whether the user query requires device data or not and if it is required you have to specify the reference to the date being referred to in IST in the format YYYY-MM-DD. For date and time reference if the query contains references like "today" or "yesterday" give that particular keyword as reference else give the exact date given as reference and the date should be of current year and month unless stated otherwise and strictly of the format YYYY-MM-DD. If the user query does not require device data, you can skip the time range and device type fields. Here is an example response: {"requires_device_data": true, "date_reference" : "date reference as in the user query" }. If the user query does not require device data, your response should look like this: {"requires_device_data": false}. Just give the JSON Object and nothing extra.`,
        user_query: `Analyze the following user query and extract relevant parameters such as is device data required, date range, and specific metrics requested. In case the date is being given understand what date the query is referring to in IST and give accordingly, strictly follow the format and time zone and properly give the dates. Provide the extracted information in a structured format. Note that the date range should be in the format YYYY-MM-DD HH:MM. There should be strictly no other text or data. Just give the JSON Object and nothing extra. Don't include the parsers for json just the required object. User Query: "${user_query}"`,
        responseSchema: {
          type: 'object',
          properties: {
            requires_device_data: { type: 'boolean' },
            date_reference: { type: 'string' },
          },
          required: ['requires_device_data'],
        },
      });
      if (!initial_llm_response) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to get response from LLM',
        });
        return;
      }
      logger.info('Initial LLM response for query analysis :', {
        session_id,
        user_query,
        initial_llm_response,
      });
      const raw_response =
        initial_llm_response.candidates[0].content.parts[0].text;
      try {
        const clean_raw_response = raw_response
          .replace(/```[a-z]*\n?/gi, '')
          .replace(/```/g, '')
          .trim();
        parsed_response = JSON.parse(clean_raw_response);
      } catch (error) {
        logger.error('Error parsing LLM response:', error);
        res.status(500).json({
          status: 'error',
          message: 'Failed to parse LLM response',
        });
        return;
      }
    } catch (error) {
      logger.error('Error in query preparation', error);
      res
        .status(500)
        .json({ status: 'error', message: 'Internal Server Error' });
      return;
    }

    if (!parsed_response) {
      logger.error('Error is parsed response', parsed_response);
      res.status(500).json({
        status: 'error',
        message: 'Preprocessing Failed to generate response.',
      });
    }

    if (parsed_response.requires_device_data) {
      if (!parsed_response.date_reference) {
        res.status(400).json({
          status: 'error',
          message: 'Date reference is required for device data.',
        });
        return;
      } else {
        let date_info = getISTDateTimeRange(parsed_response.date_reference);
        if (!date_info) {
          res.status(400).json({
            status: 'error',
            message: 'Invalid date reference provided.',
          });
          return;
        }
        const device_id = session.device_id;
        const device_info = session.device_data;
        console.log('date_info', date_info);
        const device_reading_data = await getDeviceReadingData(
          device_id,
          date_info.start,
          date_info.end,
        );
        console.log('Device reading data:', device_reading_data);
        system_prompt += ` You are very good at analyzing data from given device readings and device information and providing insights based on that data. Use the following device information and readings to assist the user with their query. Device Information: ${JSON.stringify(device_info)}. `;
        user_query += ` Here is the device data for the specified date range (${date_info.start} to ${date_info.end}): ${JSON.stringify(
          device_reading_data,
        )}. Answer the query based on this data. If no data is found, politely inform the user that the data is insufficient to answer their query. If some data is found, use that to answer the query.`;
      }
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
