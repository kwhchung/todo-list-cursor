import mongoose, { Document, Schema, Query } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color?: string;
  isPredefined: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    default: '#808080'
  },
  isPredefined: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for faster queries
TagSchema.index({ name: 1 });

// Add pre-save middleware to ensure predefined tags exist
TagSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if this is one of the predefined tags
    const predefinedTags = [
      { name: 'done', color: '#4CAF50', isPredefined: true },
      { name: 'due', color: '#F44336', isPredefined: true }
    ];

    const existingTag = await mongoose.model('Tag').findOne({ name: this.name });
    if (existingTag) {
      return next(new Error('Tag with this name already exists'));
    }

    // If this is a new tag, check if we need to create predefined tags
    if (!this.isPredefined) {
      for (const tag of predefinedTags) {
        const exists = await mongoose.model('Tag').findOne({ name: tag.name });
        if (!exists) {
          await mongoose.model('Tag').create(tag);
        }
      }
    }
  }
  next();
});

// Add pre-deleteOne middleware to prevent deletion of predefined tags
TagSchema.pre('deleteOne', async function(next) {
  const tag = await this.model.findOne(this.getQuery());
  if (tag && tag.isPredefined) {
    return next(new Error('Cannot delete predefined tags'));
  }
  next();
});

// Add pre-findOneAndDelete middleware to prevent deletion of predefined tags
TagSchema.pre('findOneAndDelete', async function(next) {
  const tag = await this.model.findOne(this.getQuery());
  if (tag && tag.isPredefined) {
    return next(new Error('Cannot delete predefined tags'));
  }
  next();
});

export default mongoose.model<ITag>('Tag', TagSchema); 