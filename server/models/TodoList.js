import mongoose from 'mongoose';

const todoItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  children: { type: [Object], default: [] }
}, { _id: false });

const todoListSchema = new mongoose.Schema({
  listId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  todos: [todoItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
todoListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const TodoList = mongoose.model('TodoList', todoListSchema);
