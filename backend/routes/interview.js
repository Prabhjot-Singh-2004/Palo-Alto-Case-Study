const express = require('express');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');

const router = express.Router();

const LLM_TIMEOUT = 15000;

const INTERVIEW_SYSTEM_PROMPT = `You are a technical interviewer. Generate practice interview questions based ONLY on the candidate's matched skills.
IMPORTANT CONSTRAINTS:
- Do NOT ask questions about skills the candidate does NOT have.
- Focus entirely on assessing depth of knowledge in their existing skills.
- Generate questions that range from easy to hard.

Return ONLY valid JSON with this structure:
{
  "questions": [
    {
      "id": 1,
      "skill": "skill name",
      "difficulty": "Easy|Medium|Hard",
      "question": "The question text",
      "hints": ["hint 1", "hint 2"],
      "expectedTopics": ["topic 1", "topic 2"]
    }
  ]
}
Generate 6-8 questions. Include 2 easy, 3 medium, 2 hard questions.
Do not include any text outside the JSON.`;

// POST /api/interview/start
router.post('/start', async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    const profile = await UserProfile.findOne({ sessionId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    if (profile.matchedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No matched skills found. Please complete gap analysis first.',
      });
    }

    const matchedSkillsList = profile.matchedSkills
      .map((s) => s.skill)
      .join(', ');
    const missingSkillsList = profile.missingSkills
      .map((s) => s.skill)
      .join(', ');

    try {
      const llmResponse = await axios.post(
        `${process.env.LLM_API_URL}?key=${process.env.LLM_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${INTERVIEW_SYSTEM_PROMPT}\n\nCandidate's matched skills: ${matchedSkillsList}\n\nDo NOT ask questions regarding: ${missingSkillsList}\nFocus entirely on assessing the depth of knowledge in: ${matchedSkillsList}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
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
          sessionId: profile.sessionId,
          questions: parsed.questions,
        },
      });
    } catch (llmError) {
      console.error('LLM error for interview:', llmError.message);

      // Fallback: generate basic questions from matched skills
      const fallbackQuestions = [];
      let id = 1;

      for (const skill of profile.matchedSkills.slice(0, 6)) {
        fallbackQuestions.push({
          id: id++,
          skill: skill.skill,
          difficulty: 'Medium',
          question: `Explain your experience with ${skill.skill}. What projects have you used it in, and what challenges did you face?`,
          hints: [
            `Think about specific use cases of ${skill.skill}`,
            'Consider performance or scalability aspects',
          ],
          expectedTopics: [
            'Core concepts',
            'Practical application',
            'Problem-solving',
          ],
        });
      }

      res.json({
        success: true,
        fallback: true,
        data: {
          sessionId: profile.sessionId,
          questions: fallbackQuestions,
          message:
            'Our AI is taking a coffee break. Here are some standard questions based on your skills.',
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
