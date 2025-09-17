import { Request, Response } from 'express';
import { getCredlyBadge, typeCredlyBadgeRequest } from '../services/credly';

const fetchCredlyBadge = async (req: Request, res: Response) => {
  try {
    const badgeRequest: typeCredlyBadgeRequest = {
      credential_id: req.params.credentialID,
    };
    const result = await getCredlyBadge(badgeRequest);
    if (result.status === 'success' && result.data.data) {
      const fullData = result.data.data;
      const badgeData = {
        credential_id: fullData.id,
        issued_at_date: fullData.issued_at_date,
        expires_at_date: fullData.expires_at_date,
        state: fullData.state,
        earner: {
          name: fullData.issued_to,
          profile_url: `https://credly.com${fullData.earner_path}`,
          photo_url: fullData.earner_photo_url,
        },
        badge_details: {
          name: fullData.badge_template.name,
          description: fullData.badge_template.description,
          image_url: fullData.badge_template.image_url,
          skill_level: fullData.badge_template.level,
          skills: fullData.badge_template.skills,
        },
        issuer: fullData.issuer.summary,
      };
      res.status(200).json({
        status: 'success',
        data: badgeData,
        message: 'Badge fetched successfully',
      });
    } else {
      res.status(400).json(result);
    }
    return;
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message:
        'Failed to fetch badge. Either invalid credential ID or credential is private.',
    });
    return;
  }
};
export { fetchCredlyBadge };
