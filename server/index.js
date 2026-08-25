// ============================================================
// 1. IMPORTS & ENVIRONMENT
// ============================================================
require('dotenv').config();
const bcrypt     = require('bcryptjs');
const cors       = require('cors');
const express    = require('express');
const jwt        = require('jsonwebtoken');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./database');

// ============================================================
// 2. DATABASE CONNECTION
// ============================================================
connectDB();

// ============================================================
// 3. EXPRESS APP SETUP
// ============================================================
const app = express();

app.use(helmet()); // Set security headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;

// ============================================================
// 4. MONGOOSE MODELS
// ============================================================
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

const SnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 500
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  code: {
    type: String,
    required: true,
    minLength: 10
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  bookmarks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, required: true, min: 1, max: 5 }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Snippet = mongoose.model('Snippet', SnippetSchema);

// ============================================================
// 5. AUTH MIDDLEWARE
// ============================================================
const protect = async (req, res, next) => {
  try {
    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ============================================================
// 6. AUTH ROUTES
// ============================================================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email },
        token
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email },
        token
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 7. SNIPPET ROUTES
// ============================================================

app.get('/api/snippets/my/stats', protect, async (req, res) => {
  try {
    const totalSnippets = await Snippet.countDocuments({ author: req.user._id });
    const totalBookmarks = await Snippet.countDocuments({ bookmarks: req.user._id });
    const languageDocs = await Snippet.find({ author: req.user._id }).select('language');
    const languages = [...new Set(languageDocs.map(s => s.language))];

    return res.status(200).json({
      success: true,
      data: {
        totalSnippets,
        totalBookmarks,
        languages
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/snippets/my', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const baseCondition = {
      $or: [{ author: req.user._id }, { bookmarks: req.user._id }]
    };
    const query = { ...baseCondition };

    if (req.query.search) {
      query.$and = [
        baseCondition,
        {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    if (req.query.language) {
      query.language = req.query.language;
    }

    const totalSnippets = await Snippet.countDocuments(query);
    const snippets = await Snippet.find(query)
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalSnippets / limit);

    const allLanguages = await Snippet.distinct('language', baseCondition);

    return res.status(200).json({
      success: true,
      data: {
        snippets,
        totalPages,
        currentPage: page,
        totalSnippets,
        allLanguages
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/snippets', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.language) {
      // Use case-insensitive exact match for language
      query.language = { $regex: `^${req.query.language}$`, $options: 'i' };
    }

    const totalSnippets = await Snippet.countDocuments(query);
    const snippets = await Snippet.find(query)
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalSnippets / limit);

    const allLanguages = await Snippet.distinct('language');

    return res.status(200).json({
      success: true,
      data: {
        snippets,
        totalPages,
        currentPage: page,
        totalSnippets,
        allLanguages
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/snippets/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');
    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }
    return res.status(200).json({ success: true, data: { snippet } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/snippets', protect, async (req, res) => {
  try {
    const { title, description, language, tags, code } = req.body;
    
    if (!title || !language || !code) {
      return res.status(400).json({ success: false, message: 'Please provide title, language, and code' });
    }

    let snippet = await Snippet.create({
      title,
      description,
      language,
      tags,
      code,
      author: req.user._id
    });

    await snippet.populate('author', 'name email');
    await snippet.populate('comments.user', 'name');

    return res.status(201).json({ success: true, data: { snippet } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/snippets/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this snippet' });
    }

    const { title, description, language, tags, code } = req.body;

    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { title, description, language, tags, code },
      { new: true, runValidators: true }
    ).populate('author', 'name email').populate('comments.user', 'name');

    return res.status(200).json({ success: true, data: { snippet: updatedSnippet } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/snippets/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this snippet' });
    }

    await Snippet.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Snippet deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/snippets/:id/bookmark', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    const userId = req.user._id.toString();
    const alreadyBookmarked = snippet.bookmarks.some(id => id.toString() === userId);

    if (alreadyBookmarked) {
      snippet.bookmarks = snippet.bookmarks.filter(id => id.toString() !== userId);
    } else {
      snippet.bookmarks.push(req.user._id);
    }

    await snippet.save();
    await snippet.populate('author', 'name email');
    await snippet.populate('comments.user', 'name');

    return res.status(200).json({ success: true, data: { snippet } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/snippets/:id/comment', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    snippet.comments.push({
      user: req.user._id,
      text
    });

    await snippet.save();
    await snippet.populate('author', 'name email');
    await snippet.populate('comments.user', 'name');

    return res.status(201).json({ success: true, data: { snippet } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/snippets/:id/rate', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    const { value } = req.body;
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Valid rating (1-5) is required' });
    }

    const existingRatingIndex = snippet.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
    
    if (existingRatingIndex >= 0) {
      // Update existing rating
      snippet.ratings[existingRatingIndex].value = value;
    } else {
      // Add new rating
      snippet.ratings.push({
        user: req.user._id,
        value
      });
    }

    await snippet.save();
    await snippet.populate('author', 'name email');
    await snippet.populate('comments.user', 'name');

    return res.status(200).json({ success: true, data: { snippet } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// 8. GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // In production, do not send stack traces!
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ============================================================
// 9. START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
