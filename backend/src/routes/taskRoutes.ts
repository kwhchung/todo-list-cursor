import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Tag from '../models/Tag';

const router = express.Router();

// Helper function to manage predefined tags
const managePredefinedTags = async (task: any, isCompleted: boolean) => {
  const doneTag = await Tag.findOne({ name: 'done' });
  const dueTag = await Tag.findOne({ name: 'due' });
  
  if (!doneTag || !dueTag) return;

  let tags = task.tags || [];
  
  // Handle done tag
  if (isCompleted) {
    if (!tags.includes(doneTag._id)) {
      tags.push(doneTag._id);
    }
    // Remove due tag if task is completed
    tags = tags.filter((tagId: any) => !tagId.equals(dueTag._id));
  } else {
    // Remove done tag if task is not completed
    tags = tags.filter((tagId: any) => !tagId.equals(doneTag._id));
    
    // Handle due tag only for uncompleted tasks
    if (task.dueDate) {
      const isOverdue = new Date(task.dueDate) < new Date();
      if (isOverdue) {
        if (!tags.includes(dueTag._id)) {
          tags.push(dueTag._id);
        }
      } else {
        tags = tags.filter((tagId: any) => !tagId.equals(dueTag._id));
      }
    }
  }

  return tags;
};

// Get all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().populate('tags').lean();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get task by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id).populate('tags');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Create new task
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray(),
  body('completed').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const taskData = { ...req.body };
    
    // Handle tags if they exist
    if (taskData.tags && Array.isArray(taskData.tags)) {
      const validTagIds = taskData.tags.filter((tagId: string) => 
        mongoose.Types.ObjectId.isValid(tagId)
      );
      
      if (validTagIds.length > 0) {
        taskData.tags = validTagIds.map((tagId: string) => new mongoose.Types.ObjectId(tagId));
      } else {
        taskData.tags = [];
      }
    } else {
      taskData.tags = [];
    }

    // Create task
    const task = new Task(taskData);
    await task.save();

    // Manage predefined tags
    task.tags = await managePredefinedTags(task, task.completed || false);
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('tags');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update task
router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray(),
  body('completed').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const taskData = { ...req.body };
    
    // Only handle tags if they're explicitly included in the request
    if ('tags' in req.body) {
      if (Array.isArray(taskData.tags)) {
        const validTagIds = taskData.tags.filter((tagId: string) => 
          mongoose.Types.ObjectId.isValid(tagId)
        );
        
        taskData.tags = validTagIds.map((tagId: string) => 
          new mongoose.Types.ObjectId(tagId)
        );
      } else {
        taskData.tags = [];
      }
    }

    // Update task
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      taskData,
      { new: true }
    ).populate('tags');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Manage predefined tags
    task.tags = await managePredefinedTags(task, task.completed || false);
    await task.save();

    const updatedTask = await Task.findById(task._id).populate('tags');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

export default router; 