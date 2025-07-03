import mongoose, { Document, Schema } from 'mongoose';

export interface ITab extends Document {
  name: string;
  filterTags: string[];
  sortBy: 'dueDate' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  filterMode: 'AND' | 'OR';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TabSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  filterTags: [{
    type: String,
    ref: 'Tag'
  }],
  sortBy: {
    type: String,
    enum: ['dueDate', 'createdAt'],
    default: 'dueDate'
  },
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    default: 'asc'
  },
  filterMode: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'OR'
  },
  isDefault: {
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
TabSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ITab>('Tab', TabSchema); 