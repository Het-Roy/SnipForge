const express = require('express');
const Snippet = require('../models/Snippet');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/snippets
// @desc    Get all public snippets (paginated, searchable)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, language, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (language) {
      query.language = language;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [snippets, totalSnippets, allLanguages] = await Promise.all([
      Snippet.find(query)
        .populate('author', 'name email')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Snippet.countDocuments(query),
      Snippet.distinct('language'),
    ]);

    res.json({
      success: true,
      data: {
        snippets,
        totalSnippets,
        totalPages: Math.ceil(totalSnippets / limitNum),
        currentPage: pageNum,
        allLanguages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/snippets/my
// @desc    Get current user's snippets
router.get('/my', protect, async (req, res) => {
  try {
    const { search, language, page = 1, limit = 12 } = req.query;
    const query = { author: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (language) {
      query.language = language;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [snippets, totalSnippets, allLanguages] = await Promise.all([
      Snippet.find(query)
        .populate('author', 'name email')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Snippet.countDocuments(query),
      Snippet.distinct('language', { author: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        snippets,
        totalSnippets,
        totalPages: Math.ceil(totalSnippets / limitNum),
        currentPage: pageNum,
        allLanguages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/snippets/my/stats
// @desc    Get dashboard stats for current user
router.get('/my/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalSnippets, languages, totalBookmarks] = await Promise.all([
      Snippet.countDocuments({ author: userId }),
      Snippet.distinct('language', { author: userId }),
      Snippet.countDocuments({ bookmarks: userId }),
    ]);

    res.json({
      success: true,
      data: {
        totalSnippets,
        languages,
        totalBookmarks,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/snippets/:id
// @desc    Get a single snippet by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    res.json({
      success: true,
      data: { snippet },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/snippets
// @desc    Create a new snippet
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, language, code, tags } = req.body;

    const snippet = await Snippet.create({
      title,
      description,
      language,
      code,
      tags: tags || [],
      author: req.user._id,
    });

    const populated = await snippet.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: { snippet: populated },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/snippets/:id
// @desc    Delete a snippet (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this snippet' });
    }

    await snippet.deleteOne();

    res.json({ success: true, message: 'Snippet deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/snippets/:id/bookmark
// @desc    Toggle bookmark on a snippet
router.patch('/:id/bookmark', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    const userId = req.user._id;
    const index = snippet.bookmarks.indexOf(userId);

    if (index > -1) {
      snippet.bookmarks.splice(index, 1);
    } else {
      snippet.bookmarks.push(userId);
    }

    await snippet.save();

    res.json({ success: true, data: { snippet } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/snippets/:id/rate
// @desc    Rate a snippet (1-5 stars)
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { value } = req.body;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const snippet = await Snippet.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    // Update existing rating or add new one
    const existingRating = snippet.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.value = value;
    } else {
      snippet.ratings.push({ user: req.user._id, value });
    }

    await snippet.save();

    res.json({ success: true, data: { snippet } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/snippets/:id/comment
// @desc    Add a comment to a snippet
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    snippet.comments.push({ user: req.user._id, text: text.trim() });
    await snippet.save();

    // Re-fetch with populated fields
    const populated = await Snippet.findById(snippet._id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');

    res.json({ success: true, data: { snippet: populated } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
