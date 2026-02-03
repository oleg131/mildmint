import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { TodoList } from './models/TodoList.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Get todos for a specific list
app.get('/api/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const todoList = await TodoList.findOne({ listId });

    if (!todoList) {
      return res.json({ listId, todos: [] });
    }

    res.json({ listId: todoList.listId, todos: todoList.todos });
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// Update todos for a specific list
app.put('/api/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const { todos } = req.body;

    let todoList = await TodoList.findOne({ listId });

    if (!todoList) {
      todoList = new TodoList({ listId, todos });
    } else {
      todoList.todos = todos;
    }

    await todoList.save();

    res.json({ listId: todoList.listId, todos: todoList.todos });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete a list
app.delete('/api/lists/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    await TodoList.deleteOne({ listId });
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Get all list IDs (for future list management)
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await TodoList.find({}, 'listId updatedAt').sort({ updatedAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
