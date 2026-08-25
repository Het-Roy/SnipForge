const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
}, { timestamps: true });

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true, min: 1, max: 5 },
});

const SnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    minlength: [10, 'Code must be at least 10 characters'],
  },
  tags: [{ type: String, trim: true }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  ratings: [RatingSchema],
}, { timestamps: true });

// Text index for search
SnippetSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Snippet', SnippetSchema);
