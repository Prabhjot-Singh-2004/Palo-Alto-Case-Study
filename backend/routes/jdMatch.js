const express = require('express');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');

const router = express.Router();

const LLM_TIMEOUT = 15000;

const JD_MATCH_PROMPT = `You are a resume-job matching expert. Analyze how well a candidate's resume matches a specific job description.

Return ONLY valid JSON with this exact structure:
{
  "matchScore": 75,
  "summary": "Brief 1-2 sentence overall assessment",
  "matchedSkills": [
    {"skill": "skill name", "relevance": "High|Medium|Low"}
  ],
  "missingSkills": [
    {"skill": "skill name", "importance": "Critical|Important|Nice-to-have"}
  ],
  "keywordMatches": [
    {"keyword": "exact phrase from JD", "found": true}
  ],
  "missingKeywords": [
    {"keyword": "exact phrase from JD", "suggestion": "how to add this to resume"}
  ],
  "strengths": ["strength 1", "strength 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Scoring criteria:
- 90-100: Excellent match, strong candidate
- 70-89: Good match, minor gaps
- 50-69: Partial match, significant gaps
- Below 50: Poor match, major reskilling needed

Be specific and actionable. Do not include any text outside the JSON.`;

// POST /api/jd-match/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const { sessionId, jobDescription } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Please provide a valid job description (at least 50 characters)' });
    }

    const profile = await UserProfile.findOne({ sessionId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const resumeText = profile.rawText.substring(0, 1500);
    const jdText = jobDescription.substring(0, 3000);

    try {
      const llmResponse = await axios.post(
        `${process.env.LLM_API_URL}?key=${process.env.LLM_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${JD_MATCH_PROMPT}\n\n---RESUME---\n${resumeText}\n\n---JOB DESCRIPTION---\n${jdText}`,
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

      res.json({
        success: true,
        data: {
          sessionId,
          ...parsed,
        },
      });
    } catch (llmError) {
      console.error('JD Match LLM error:', llmError.message);

      // Fallback: basic keyword matching
      const resumeLower = profile.rawText.toLowerCase();
      const jdLower = jdText.toLowerCase();

      // Extract common tech keywords from JD
      const techKeywords = [
        'javascript', 'typescript', 'python', 'java', 'react', 'node', 'angular', 'vue',
        'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes', 'git', 'rest',
        'graphql', 'html', 'css', 'agile', 'scrum', 'ci/cd', 'testing', 'api',
        'microservices', 'cloud', 'linux', 'machine learning', 'data', 'algorithms',
      ];

      const matchedSkills = [];
      const missingSkills = [];

      techKeywords.forEach((kw) => {
        if (jdLower.includes(kw)) {
          if (resumeLower.includes(kw)) {
            matchedSkills.push({ skill: kw, relevance: 'Medium' });
          } else {
            missingSkills.push({ skill: kw, importance: 'Important' });
          }
        }
      });

      const totalFound = matchedSkills.length;
      const totalNeeded = matchedSkills.length + missingSkills.length;
      const score = totalNeeded > 0 ? Math.round((totalFound / totalNeeded) * 100) : 50;

      res.json({
        success: true,
        fallback: true,
        data: {
          sessionId,
          matchScore: score,
          summary: 'Basic keyword analysis (AI temporarily unavailable)',
          matchedSkills,
          missingSkills,
          keywordMatches: [],
          missingKeywords: [],
          strengths: matchedSkills.slice(0, 3).map((s) => `Has ${s.skill} experience`),
          recommendations: missingSkills.slice(0, 3).map((s) => `Consider adding ${s.skill} experience to your resume`),
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
