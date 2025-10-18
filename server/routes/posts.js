const express = require('express');
const Post = require('../models/Post');
const { authOptional, authRequired } = require('../middleware/auth');

const router = express.Router();

function toSlug(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function computeNextId() {
  const last = await Post.findOne().sort({ id: -1 });
  return last ? last.id + 1 : 1;
}

router.get('/', authOptional, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const search = (req.query.q || '').trim();
    const tag = (req.query.tag || '').trim();
    const sort = (req.query.sort || 'date');

    const filter = {};
    if (search) { filter.$text = { $search: search }; }
    if (tag) { filter.tags = tag; }

    const cursor = Post.find(filter);
    if (sort === 'likes') cursor.sort({ likes: -1 });
    else cursor.sort({ date: -1 });

    const total = await Post.countDocuments(filter);
    const posts = await cursor.skip((page - 1) * limit).limit(limit);
    res.json({ data: posts, meta: { page, limit, total } });
  } catch (err) { next(err); }
});

router.get('/:idOrSlug', authOptional, async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let post;
    if (/^\d+$/.test(idOrSlug)) post = await Post.findOne({ id: parseInt(idOrSlug, 10) });
    else post = await Post.findOne({ slug: idOrSlug });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { title, content, imageUrl, tags } = req.body;
    const id = await computeNextId();
    const slugBase = toSlug(title);
    let slug = slugBase || `post-${id}`;
    let suffix = 1;
    while (await Post.findOne({ slug })) slug = `${slugBase}-${suffix++}`;
    const post = await Post.create({
      id,
      title,
      slug,
      content,
      imageUrl: imageUrl || null,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      author: req.user?.id || null,
      date: new Date()
    });
    res.status(201).json(post);
  } catch (err) { next(err); }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const { title, content, imageUrl, tags } = req.body;
    const update = { title, content, imageUrl: imageUrl || null };
    if (title) update.slug = toSlug(title);
    if (tags !== undefined) update.tags = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []);
    const post = await Post.findOneAndUpdate({ id: parseInt(req.params.id, 10) }, update, { new: true });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const deleted = await Post.findOneAndDelete({ id: parseInt(req.params.id, 10) });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/like', authRequired, async (req, res, next) => {
  try {
    const updated = await Post.findOneAndUpdate({ id: parseInt(req.params.id, 10) }, { $inc: { likes: 1 } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post('/:id/unlike', authRequired, async (req, res, next) => {
  try {
    const updated = await Post.findOneAndUpdate({ id: parseInt(req.params.id, 10) }, { $inc: { likes: -1 } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;


