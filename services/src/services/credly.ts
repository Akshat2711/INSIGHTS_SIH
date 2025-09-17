import axios from 'axios';
import logger from '../utils/logger';

export type typeCredlyBadgeRequest = {
  credential_id: string;
};

const getCredlyBadge = async (badgeRequest: typeCredlyBadgeRequest) => {
  try {
    let requestConfig = {
      method: 'get',
      url: `https://www.credly.com/api/v1/public_badges/${badgeRequest.credential_id}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.request(requestConfig);
    if (response.status === 200) {
      return {
        status: 'success',
        data: response.data,
        message: 'Badge fetched successfully',
      };
    } else {
      return {
        status: 'error',
        data: response.data,
        message: 'Failed to fetch badge',
      };
    }
  } catch (error: any) {
    logger.error('Error fetching Credly badge:', error);
    return {
      status: 'error',
      data: error?.response?.data || null,
      message: error?.message || 'An error occurred while fetching the badge',
    };
  }
};
export { getCredlyBadge };
