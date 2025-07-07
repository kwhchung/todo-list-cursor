import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  tags?: Types.ObjectId[];
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add a pre-find middleware to ensure tags are always populated
TaskSchema.pre('find', function() {
  this.populate('tags');
});

TaskSchema.pre('findOne', function() {
  this.populate('tags');
});

// Add a post-find middleware to log the results
TaskSchema.post('find', function(docs) {
  // No logging
});

TaskSchema.post('findOne', function(doc) {
  // No logging
});

export default mongoose.model<ITask>('Task', TaskSchema); 