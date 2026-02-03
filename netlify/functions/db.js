import mongoose from 'mongoose';

let conn = null;

const todoItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, default: '' },
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

todoListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TodoList = mongoose.models.TodoList || mongoose.model('TodoList', todoListSchema);

export const connectToDatabase = async () => {
  if (conn) {
    return conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  return conn;
};

export { TodoList };
