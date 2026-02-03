import { connectToDatabase, TodoList } from './db.js';

export const handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
      },
      body: ''
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    await connectToDatabase();

    // Extract listId from path
    const listId = event.path.split('/').pop();

    if (event.httpMethod === 'GET') {
      // Get list
      const todoList = await TodoList.findOne({ listId });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          listId,
          todos: todoList ? todoList.todos : []
        })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update list
      const { todos } = JSON.parse(event.body);

      let todoList = await TodoList.findOne({ listId });

      if (!todoList) {
        todoList = new TodoList({ listId, todos });
      } else {
        todoList.todos = todos;
      }

      await todoList.save();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          listId: todoList.listId,
          todos: todoList.todos
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
