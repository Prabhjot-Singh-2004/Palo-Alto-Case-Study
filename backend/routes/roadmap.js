const express = require('express');
const UserProfile = require('../models/UserProfile');
const Course = require('../models/Course');

const router = express.Router();

// GET /api/roadmap/:sessionId
router.get('/:sessionId', async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({
      sessionId: req.params.sessionId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    if (
      profile.gapAnalysisStatus === 'pending' ||
      profile.missingSkills.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete gap analysis first',
      });
    }

    // Build roadmap from missing skills
    const roadmap = [];
    let currentWeek = 1;

    // Sort missing skills by importance
    const sortedMissing = [...profile.missingSkills].sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return (order[a.importance] || 2) - (order[b.importance] || 2);
    });

    for (const missing of sortedMissing) {
      // Find matching courses for this skill
      const courses = await Course.find({
        skill: { $regex: new RegExp(missing.skill, 'i') },
      }).limit(2);

      const milestone = {
        skill: missing.skill,
        category: missing.category,
        importance: missing.importance,
        startWeek: currentWeek,
        endWeek: currentWeek + (courses[0]?.estimatedWeeks || 2) - 1,
        resources: courses.map((c) => ({
          title: c.title,
          platform: c.platform,
          url: c.url,
          difficulty: c.difficulty,
          estimatedWeeks: c.estimatedWeeks,
          description: c.description,
        })),
        completed: false,
      };

      currentWeek = milestone.endWeek + 1;
      roadmap.push(milestone);
    }

    res.json({
      success: true,
      data: {
        sessionId: profile.sessionId,
        targetRole: profile.targetRole,
        totalWeeks: currentWeek - 1,
        milestones: roadmap,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/roadmap/:sessionId/milestone
router.patch('/:sessionId/milestone', async (req, res, next) => {
  try {
    const { skill, completed } = req.body;
    // Milestone completion is tracked client-side with Zustand
    // This endpoint is available for future persistence
    res.json({
      success: true,
      message: `Milestone "${skill}" marked as ${completed ? 'completed' : 'incomplete'}`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
