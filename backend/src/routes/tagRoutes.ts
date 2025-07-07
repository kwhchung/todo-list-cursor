import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Tag from '../models/Tag';
import Task from '../models/Task';

const router = express.Router();

// Get all tags
router.get('/', async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

// Get tag by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tag' });
  }
});

// Create new tag
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('group').optional().trim(),
  body('color').optional().trim(),
  body('isPredefined').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tag' });
  }
});

// Update tag
router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('group').optional().trim(),
  body('color').optional().trim(),
  body('isPredefined').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    if (tag.isPredefined) {
      return res.status(403).json({ message: 'Cannot modify predefined tags' });
    }
    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tag' });
  }
});

// Get tag usage info
router.get('/:id/usage', async (req: Request, res: Response) => {
  try {
    const count = await Task.countDocuments({ tags: req.params.id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting tag usage' });
  }
});

// Delete tag
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    if (tag.isPredefined) {
      return res.status(403).json({ message: 'Cannot delete predefined tags' });
    }
    await tag.deleteOne();
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag' });
  }
});

export default router; 