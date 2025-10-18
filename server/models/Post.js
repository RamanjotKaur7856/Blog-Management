const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  tags: { type: [String], default: [], index: true },
  likes: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  date: { type: Date, default: Date.now }
});

postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;


