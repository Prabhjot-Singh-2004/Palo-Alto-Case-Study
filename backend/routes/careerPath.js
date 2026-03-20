const express = require('express');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');
const MarketData = require('../models/MarketData');

const router = express.Router();

const LLM_TIMEOUT = 15000;

const CAREER_PATH_PROMPT = `You are a career strategist. Based on a candidate's current skills and target role, map out realistic career progression paths.

Return ONLY valid JSON with this exact structure:
{
  "currentLevel": "Junior|Mid|Senior",
  "paths": [
    {
      "track": "Individual Contributor|Management|Specialist",
      "levels": [
        {
          "role": "role title (e.g., SDE 1)",
          "timeframe": "estimated time to reach (e.g., '0-1 years')",
          "salaryRange": "approximate range (e.g., '$70k-$100k')",
          "requiredSkills": ["skill 1", "skill 2"],
          "userHasSkills": ["skill the user already has"],
          "skillsToLearn": ["skill the user needs to develop"],
          "description": "brief description of what this role involves"
        }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Generate 2-3 career tracks (IC, Management, Specialist). Each track should have 3-4 levels.
Base salary ranges on US market data. Be realistic about timeframes.
Do not include any text outside the JSON.`;

// POST /api/career-path/explore
router.post('/explore', async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const profile = await UserProfile.findOne({ sessionId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.matchedSkills.length === 0) {
      return res.status(400).json({ success: false, message: 'Please complete gap analysis first' });
    }

    const matchedSkillsList = profile.matchedSkills.map(s => s.skill).join(', ');
    const resumeText = profile.rawText.substring(0, 1000);

    try {
      const llmResponse = await axios.post(
        `${process.env.LLM_API_URL}?key=${process.env.LLM_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${CAREER_PATH_PROMPT}\n\nCandidate's current skills: ${matchedSkillsList}\nTarget role: ${profile.targetRole}\nResume excerpt: ${resumeText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4000,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: LLM_TIMEOUT,
        }
      );

      let llmContent = llmResponse.data.candidates[0].content.parts[0].text;
      llmContent = llmContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(llmContent);

      res.json({
        success: true,
        data: {
          sessionId,
          targetRole: profile.targetRole,
          currentSkills: profile.matchedSkills.map(s => s.skill),
          ...parsed,
        },
      });
    } catch (llmError) {
      console.error('Career Path LLM error:', llmError.message);

      // Fallback: basic career path from market data
      const marketData = await MarketData.findOne({
        role: { $regex: new RegExp(profile.targetRole, 'i') },
      });

      const resumeLower = profile.rawText.toLowerCase();
      const userSkills = profile.matchedSkills.map(s => s.skill);
      const allMarketSkills = marketData ? marketData.skills.map(s => s.skill) : [];
      const toLearn = allMarketSkills.filter(s => !resumeLower.includes(s.toLowerCase()));

      const fallbackPaths = [
        {
          track: 'Individual Contributor',
          levels: [
            {
              role: profile.targetRole,
              timeframe: 'Current',
              salaryRange: '$60k-$90k',
              requiredSkills: allMarketSkills.slice(0, 5),
              userHasSkills: userSkills.slice(0, 5),
              skillsToLearn: toLearn.slice(0, 3),
              description: 'Your current target role focused on hands-on technical work.',
            },
            {
              role: `Senior ${profile.targetRole}`,
              timeframe: '2-4 years',
              salaryRange: '$100k-$150k',
              requiredSkills: [...allMarketSkills.slice(0, 5), 'System Design', 'Mentoring', 'Code Review'],
              userHasSkills: userSkills.slice(0, 3),
              skillsToLearn: ['System Design', 'Mentoring', 'Architecture'],
              description: 'Lead technical initiatives and mentor junior team members.',
            },
            {
              role: `Staff ${profile.targetRole}`,
              timeframe: '5-8 years',
              salaryRange: '$150k-$220k',
              requiredSkills: ['Architecture', 'Technical Strategy', 'Cross-team Collaboration'],
              userHasSkills: [],
              skillsToLearn: ['Architecture', 'Technical Strategy', 'Leadership'],
              description: 'Drive technical direction across multiple teams.',
            },
          ],
        },
        {
          track: 'Engineering Management',
          levels: [
            {
              role: 'Tech Lead',
              timeframe: '2-4 years',
              salaryRange: '$120k-$170k',
              requiredSkills: [...userSkills.slice(0, 3), 'Project Management', 'Communication'],
              userHasSkills: userSkills.slice(0, 3),
              skillsToLearn: ['Project Management', 'Communication', 'Team Leadership'],
              description: 'Bridge between engineering and product, lead a small team.',
            },
            {
              role: 'Engineering Manager',
              timeframe: '4-7 years',
              salaryRange: '$150k-$220k',
              requiredSkills: ['People Management', 'Hiring', 'Roadmap Planning', 'Stakeholder Management'],
              userHasSkills: [],
              skillsToLearn: ['People Management', 'Hiring', 'Roadmap Planning'],
              description: 'Manage a team of engineers, own team delivery and growth.',
            },
            {
              role: 'Director of Engineering',
              timeframe: '8-12 years',
              salaryRange: '$200k-$300k',
              requiredSkills: ['Organizational Design', 'Budget Planning', 'Technical Vision'],
              userHasSkills: [],
              skillsToLearn: ['Organizational Design', 'Strategic Planning'],
              description: 'Lead multiple engineering teams, set technical strategy.',
            },
          ],
        },
      ];

      res.json({
        success: true,
        fallback: true,
        data: {
          sessionId,
          targetRole: profile.targetRole,
          currentSkills: userSkills,
          currentLevel: 'Junior',
          paths: fallbackPaths,
          tips: [
            'Focus on mastering your current role before looking ahead',
            'Build side projects to gain experience with new technologies',
            'Find a mentor who is 2-3 levels ahead of you',
          ],
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
