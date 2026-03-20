const express = require('express');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');

const router = express.Router();

const LLM_TIMEOUT = 15000;

const COVER_LETTER_PROMPT = `You are a professional career coach and cover letter writer. Generate a tailored cover letter based on the candidate's resume and the target job description.

Guidelines:
- Keep it to 3-4 paragraphs, concise and professional
- Open with a strong hook that connects the candidate's experience to the role
- Highlight 2-3 key skills/achievements from the resume that match the JD
- Show enthusiasm for the company/role
- Close with a clear call to action
- Use a professional but personable tone
- Do NOT use generic phrases like "I am writing to express my interest"
- Do NOT include address headers or dates — just the letter body
- Return ONLY the cover letter text, no JSON wrapper`;

// POST /api/cover-letter/generate
router.post('/generate', async (req, res, next) => {
  try {
    const { sessionId, jobDescription } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Please provide a valid job description' });
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
                  text: `${COVER_LETTER_PROMPT}\n\n---CANDIDATE'S RESUME---\n${resumeText}\n\n---TARGET JOB DESCRIPTION---\n${jdText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: LLM_TIMEOUT,
        }
      );

      let coverLetter = llmResponse.data.candidates[0].content.parts[0].text;
      coverLetter = coverLetter.replace(/```[a-z]*\n?/g, '').replace(/```\n?/g, '').trim();

      res.json({
        success: true,
        data: {
          sessionId,
          coverLetter,
        },
      });
    } catch (llmError) {
      console.error('Cover Letter LLM error:', llmError.message);

      // Fallback: basic template
      const name = profile.rawText.split('\n')[0] || 'Candidate';
      const matched = profile.matchedSkills.slice(0, 3).map(s => s.skill).join(', ');

      const fallbackLetter = `Dear Hiring Manager,

I am excited to apply for this position. With my background in ${matched || 'software development'}, I believe I would be a strong fit for your team.

My experience includes hands-on work with ${matched || 'various technologies'}, which directly aligns with the requirements outlined in your job description. I have consistently delivered high-quality work and thrive in collaborative environments.

I am particularly drawn to this opportunity because it allows me to leverage my existing skills while continuing to grow as a professional. I would welcome the chance to discuss how my experience can contribute to your team's success.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
${name}`;

      res.json({
        success: true,
        fallback: true,
        data: {
          sessionId,
          coverLetter: fallbackLetter,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
