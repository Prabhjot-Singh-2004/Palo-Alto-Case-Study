const express = require('express');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');
const MarketData = require('../models/MarketData');

const router = express.Router();

const LLM_TIMEOUT = 15000; // 15 seconds for Gemini

// Prompt templates
const GAP_ANALYSIS_SYSTEM_PROMPT = `You are a career analysis expert. Given a user's resume text and target job role, analyze their skills against market requirements.
Return ONLY valid JSON with this exact structure:
{
  "matched_skills": [
    {"skill": "skill name", "category": "Foundational|Frameworks|Tools|Soft Skills", "proficiency": "beginner|intermediate|advanced"}
  ],
  "missing_skills": [
    {"skill": "skill name", "category": "Foundational|Frameworks|Tools|Soft Skills", "importance": "High|Medium|Low"}
  ]
}
Be specific with skill names (e.g., "React.js" not just "JavaScript frameworks").
Category must be one of: Foundational, Frameworks, Tools, Soft Skills.
Importance must be one of: High, Medium, Low.
Do not include any text outside the JSON.`;

// POST /api/analysis/gap
router.post('/gap', async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const profile = await UserProfile.findOne({ sessionId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Fetch market data for the target role
    const marketData = await MarketData.findOne({
      role: { $regex: new RegExp(profile.targetRole, 'i') },
    });

    const marketContext = marketData
      ? `Market requirements for ${profile.targetRole}:\n${JSON.stringify(marketData.skills, null, 2)}\n\nSample job requirements:\n${marketData.sampleRequirements.join('\n')}`
      : `General requirements for ${profile.targetRole} role in the current tech market.`;

    try {
      // Call Gemini API with timeout
      const resumeText = profile.rawText.substring(0, 1500);
      const llmResponse = await axios.post(
        `${process.env.LLM_API_URL}?key=${process.env.LLM_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${GAP_ANALYSIS_SYSTEM_PROMPT}\n\nResume Text:\n${resumeText}\n\nTarget Role: ${profile.targetRole}\n\n${marketContext}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
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

      await UserProfile.findOneAndUpdate(
        { sessionId },
        { matchedSkills: parsed.matched_skills, missingSkills: parsed.missing_skills, gapAnalysisStatus: 'completed' }
      );

      res.json({
        success: true,
        data: {
          sessionId,
          targetRole: profile.targetRole,
          matchedSkills: parsed.matched_skills,
          missingSkills: parsed.missing_skills,
          status: 'completed',
        },
      });
    } catch (llmError) {
      // Graceful degradation - return fallback data
      console.error('LLM API error:', llmError.message);

      // Use market data to provide basic skill matching without AI
      const fallbackMatched = [];
      const fallbackMissing = [];

      if (marketData) {
        const resumeLower = profile.rawText.toLowerCase();
        marketData.skills.forEach((ms) => {
          if (resumeLower.includes(ms.skill.toLowerCase())) {
            fallbackMatched.push({
              skill: ms.skill,
              category: ms.category,
              proficiency: 'intermediate',
            });
          } else {
            fallbackMissing.push({
              skill: ms.skill,
              category: ms.category,
              importance: ms.importance,
            });
          }
        });
      }

      await UserProfile.findOneAndUpdate(
        { sessionId },
        { matchedSkills: fallbackMatched, missingSkills: fallbackMissing, gapAnalysisStatus: 'fallback' }
      );

      res.json({
        success: true,
        fallback: true,
        data: {
          sessionId,
          targetRole: profile.targetRole,
          matchedSkills: fallbackMatched,
          missingSkills: fallbackMissing,
          status: 'fallback',
          message:
            'Our AI is currently taking a coffee break. Here are the results from our basic analysis.',
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/analysis/retry
router.post('/retry', async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const profile = await UserProfile.findOne({ sessionId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Reset status and re-run analysis
    await UserProfile.findOneAndUpdate(
      { sessionId },
      { gapAnalysisStatus: 'pending' }
    );

    // Re-call the gap analysis logic
    req.body = { sessionId };
    return router.handle(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
