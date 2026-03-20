const express = require('express');
const axios = require('axios');
const UserProfile = require('../models/UserProfile');

const router = express.Router();

const LLM_TIMEOUT = 15000;

const ATS_PROMPT = `You are an ATS (Applicant Tracking System) resume expert. Analyze a resume for ATS compatibility.

Return ONLY valid JSON with this exact structure:
{
  "overallScore": 85,
  "atsCompatibility": "High|Medium|Low",
  "sections": {
    "contactInfo": {"score": 10, "max": 10, "status": "pass|warn|fail", "details": "Email and phone found"},
    "summary": {"score": 8, "max": 10, "status": "pass|warn|fail", "details": "Professional summary present"},
    "experience": {"score": 9, "max": 10, "status": "pass|warn|fail", "details": "Work experience with dates"},
    "education": {"score": 10, "max": 10, "status": "pass|warn|fail", "details": "Education section found"},
    "skills": {"score": 8, "max": 10, "status": "pass|warn|fail", "details": "Technical skills listed"},
    "formatting": {"score": 7, "max": 10, "status": "pass|warn|fail", "details": "Clean formatting detected"}
  },
  "issues": [
    {"severity": "High|Medium|Low", "category": "category name", "issue": "description", "fix": "how to fix"}
  ],
  "strengths": ["strength 1", "strength 2"],
  "recommendations": ["rec 1", "rec 2", "rec 3"]
}

Check for:
- Contact information (email, phone, LinkedIn)
- Standard section headers
- Keyword density and relevance
- Action verbs usage
- Quantifiable achievements
- Length appropriateness
- Formatting issues

Be thorough but concise. Do not include any text outside the JSON.`;

// POST /api/ats-scan/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const profile = await UserProfile.findOne({ sessionId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const resumeText = profile.rawText;

    // Rule-based checks (free, no API)
    const ruleBasedChecks = runRuleBasedChecks(resumeText);

    try {
      // AI-powered deep analysis
      const llmResponse = await axios.post(
        `${process.env.LLM_API_URL}?key=${process.env.LLM_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${ATS_PROMPT}\n\n---RESUME---\n${resumeText.substring(0, 2000)}`,
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
      const aiAnalysis = JSON.parse(llmContent);

      // Merge rule-based and AI results
      const combinedScore = Math.round((ruleBasedChecks.score + aiAnalysis.overallScore) / 2);

      res.json({
        success: true,
        data: {
          sessionId,
          overallScore: combinedScore,
          atsCompatibility: combinedScore >= 80 ? 'High' : combinedScore >= 60 ? 'Medium' : 'Low',
          ruleBasedChecks: ruleBasedChecks.checks,
          aiAnalysis: {
            sections: aiAnalysis.sections,
            issues: aiAnalysis.issues,
            strengths: aiAnalysis.strengths,
            recommendations: aiAnalysis.recommendations,
          },
        },
      });
    } catch (llmError) {
      console.error('ATS Scan LLM error:', llmError.message);

      // Fallback: only rule-based checks
      res.json({
        success: true,
        fallback: true,
        data: {
          sessionId,
          overallScore: ruleBasedChecks.score,
          atsCompatibility: ruleBasedChecks.score >= 70 ? 'High' : ruleBasedChecks.score >= 50 ? 'Medium' : 'Low',
          ruleBasedChecks: ruleBasedChecks.checks,
          aiAnalysis: null,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

function runRuleBasedChecks(text) {
  const lower = text.toLowerCase();
  const checks = [];
  let score = 0;

  // 1. Email check
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  checks.push({
    name: 'Email Address',
    passed: hasEmail,
    details: hasEmail ? 'Email found in resume' : 'No email address detected',
  });
  if (hasEmail) score += 10;

  // 2. Phone check
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  checks.push({
    name: 'Phone Number',
    passed: hasPhone,
    details: hasPhone ? 'Phone number found' : 'No phone number detected',
  });
  if (hasPhone) score += 10;

  // 3. LinkedIn check
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);
  checks.push({
    name: 'LinkedIn Profile',
    passed: hasLinkedIn,
    details: hasLinkedIn ? 'LinkedIn profile mentioned' : 'No LinkedIn profile detected',
  });
  if (hasLinkedIn) score += 5;

  // 4. Section checks
  const sectionPatterns = {
    'Experience Section': /experience|employment|work history|professional experience/i,
    'Education Section': /education|academic|university|college|degree/i,
    'Skills Section': /skills|technologies|technical skills|competencies/i,
    'Summary/Objective': /summary|objective|profile|about me/i,
  };

  for (const [name, pattern] of Object.entries(sectionPatterns)) {
    const found = pattern.test(text);
    checks.push({
      name,
      passed: found,
      details: found ? `${name} detected` : `${name} not found`,
    });
    if (found) score += 10;
  }

  // 5. Action verbs check
  const actionVerbs = [
    'developed', 'designed', 'implemented', 'created', 'built', 'led', 'managed',
    'improved', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated',
    'analyzed', 'optimized', 'deployed', 'maintained', 'architected',
  ];
  const foundVerbs = actionVerbs.filter((v) => lower.includes(v));
  const hasActionVerbs = foundVerbs.length >= 3;
  checks.push({
    name: 'Action Verbs',
    passed: hasActionVerbs,
    details: hasActionVerbs
      ? `Found ${foundVerbs.length} action verbs (${foundVerbs.slice(0, 3).join(', ')}...)`
      : 'Add more action verbs (developed, implemented, designed, etc.)',
  });
  if (hasActionVerbs) score += 10;

  // 6. Quantifiable achievements
  const hasNumbers = /\d+%|\d+\s*(percent|users|customers|projects|years|months)/i.test(text);
  checks.push({
    name: 'Quantifiable Achievements',
    passed: hasNumbers,
    details: hasNumbers
      ? 'Contains metrics and numbers'
      : 'Add quantifiable achievements (e.g., "increased by 25%")',
  });
  if (hasNumbers) score += 10;

  // 7. Word count
  const wordCount = text.split(/\s+/).length;
  const goodLength = wordCount >= 200 && wordCount <= 1500;
  checks.push({
    name: 'Resume Length',
    passed: goodLength,
    details: goodLength
      ? `${wordCount} words - good length`
      : wordCount < 200
        ? `${wordCount} words - too short (aim for 300-800)`
        : `${wordCount} words - consider trimming (aim for 300-800)`,
  });
  if (goodLength) score += 10;

  // 8. No excessive special characters
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s.,;:!?()\-\/]/g) || []).length / text.length;
  const cleanFormat = specialCharRatio < 0.05;
  checks.push({
    name: 'Clean Formatting',
    passed: cleanFormat,
    details: cleanFormat
      ? 'Clean text format detected'
      : 'Excessive special characters may confuse ATS parsers',
  });
  if (cleanFormat) score += 10;

  return { score: Math.min(score, 100), checks };
}

module.exports = router;
