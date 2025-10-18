const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authOptional, authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/post/:postId', authOptional, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const exists = await Post.exists({ id: postId });
    if (!exists) return res.status(404).json({ message: 'Post not found' });
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { next(err); }
});

router.post('/post/:postId', authOptional, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const exists = await Post.exists({ id: postId });
    if (!exists) return res.status(404).json({ message: 'Post not found' });
    const { body, authorName } = req.body;
    if (!body || !authorName) return res.status(400).json({ message: 'Missing fields' });
    const comment = await Comment.create({
      postId,
      body,
      authorName,
      author: req.user?.id || null
    });
    res.status(201).json(comment);
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;


