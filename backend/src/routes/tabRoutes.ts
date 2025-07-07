import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Tab from '../models/Tab';

const router = express.Router();

// Get all tabs
router.get('/', async (req: Request, res: Response) => {
  try {
    const tabs = await Tab.find();
    res.json(tabs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tabs' });
  }
});

// Get tab by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tab = await Tab.findById(req.params.id);
    if (!tab) {
      return res.status(404).json({ message: 'Tab not found' });
    }
    res.json(tab);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tab' });
  }
});

// Create new tab
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('filterTags').optional().isArray(),
  body('sortBy').optional().isIn(['dueDate', 'createdAt']),
  body('sortOrder').optional().isIn(['asc', 'desc']),
  body('isDefault').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tab = new Tab(req.body);
    await tab.save();
    res.status(201).json(tab);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tab' });
  }
});

// Update tab
router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('filterTags').optional().isArray(),
  body('sortBy').optional().isIn(['dueDate', 'createdAt']),
  body('sortOrder').optional().isIn(['asc', 'desc']),
  body('isDefault').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tab = await Tab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tab) {
      return res.status(404).json({ message: 'Tab not found' });
    }
    res.json(tab);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tab' });
  }
});

// Delete tab
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tab = await Tab.findByIdAndDelete(req.params.id);
    if (!tab) {
      return res.status(404).json({ message: 'Tab not found' });
    }
    res.json({ message: 'Tab deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tab' });
  }
});

export default router; 