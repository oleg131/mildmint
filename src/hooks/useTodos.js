import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'nested-todos-lists';
const API_BASE_URL = '/.netlify/functions';

export const useTodos = (listId) => {
  const [searchParams] = useSearchParams();
  const useLocal = searchParams.get('local') === 'true';
  const [todos, setTodos] = useState([]);
  const hasLoadedRef = useRef(false);

  // Load todos when listId changes
  useEffect(() => {
    hasLoadedRef.current = false;

    const loadTodos = async () => {
      if (useLocal) {
        // Load from localStorage
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const allLists = saved ? JSON.parse(saved) : {};
          setTodos(allLists[listId] || []);
        } catch (error) {
          console.error('Error loading from localStorage:', error);
          setTodos([]);
        }
      } else {
        // Load from API
        try {
          const response = await fetch(`${API_BASE_URL}/list/${listId}`);
          if (response.ok) {
            const data = await response.json();
            setTodos(data.todos || []);
          } else {
            console.error('Error fetching from API:', response.statusText);
            setTodos([]);
          }
        } catch (error) {
          console.error('Error loading from API:', error);
          setTodos([]);
        }
      }

      Promise.resolve().then(() => {
        hasLoadedRef.current = true;
      });
    };

    loadTodos();
  }, [listId, useLocal]);

  // Save todos when they change
  useEffect(() => {
    if (!listId || !hasLoadedRef.current) {
      return;
    }

    const saveTodos = async () => {
      if (useLocal) {
        // Save to localStorage
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const allLists = saved ? JSON.parse(saved) : {};
          allLists[listId] = todos;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allLists));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      } else {
        // Save to API
        try {
          await fetch(`${API_BASE_URL}/list/${listId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todos }),
          });
        } catch (error) {
          console.error('Error saving to API:', error);
        }
      }
    };

    saveTodos();
  }, [todos, listId, useLocal]);

  const addTodo = (text, parentId = null) => {
    const newTodo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      children: [],
    };

    if (parentId === null) {
      setTodos([...todos, newTodo]);
    } else {
      setTodos(addTodoToParent(todos, parentId, newTodo));
    }

    return newTodo.id;
  };

  const addTodoToParent = (items, parentId, newTodo) => {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, children: [...item.children, newTodo] };
      }
      if (item.children.length > 0) {
        return { ...item, children: addTodoToParent(item.children, parentId, newTodo) };
      }
      return item;
    });
  };

  const updateTodo = (id, text) => {
    setTodos(updateTodoInTree(todos, id, text));
  };

  const updateTodoInTree = (items, id, text) => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, text };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateTodoInTree(item.children, id, text) };
      }
      return item;
    });
  };

  const toggleTodo = (id) => {
    setTodos(toggleTodoInTree(todos, id));
  };

  const toggleTodoInTree = (items, id) => {
    const result = items.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed;
        return {
          ...item,
          completed: newCompleted,
          children: cascadeCompletion(item.children, newCompleted),
        };
      }
      if (item.children.length > 0) {
        const updatedItem = {
          ...item,
          children: toggleTodoInTree(item.children, id)
        };
        // Check if all children are complete, if so, complete the parent
        const allChildrenComplete = updatedItem.children.length > 0 &&
          updatedItem.children.every(child => isFullyComplete(child));
        return {
          ...updatedItem,
          completed: allChildrenComplete
        };
      }
      return item;
    });
    return result;
  };

  const isFullyComplete = (item) => {
    if (!item.completed) return false;
    if (item.children.length === 0) return true;
    return item.children.every(child => isFullyComplete(child));
  };

  const cascadeCompletion = (items, completed) => {
    return items.map(item => ({
      ...item,
      completed,
      children: cascadeCompletion(item.children, completed),
    }));
  };

  const deleteTodo = (id) => {
    setTodos(deleteTodoFromTree(todos, id));
  };

  const deleteTodoFromTree = (items, id) => {
    return items
      .filter(item => item.id !== id)
      .map(item => ({
        ...item,
        children: deleteTodoFromTree(item.children, id),
      }));
  };

  const moveTodo = (draggedId, targetId, position) => {
    const draggedItem = findTodoById(todos, draggedId);
    if (!draggedItem) return;

    let newTodos = deleteTodoFromTree(todos, draggedId);

    if (position === 'inside') {
      newTodos = addTodoToParent(newTodos, targetId, draggedItem);
    } else if (position === 'before' || position === 'after') {
      newTodos = insertTodoRelativeToTarget(newTodos, draggedItem, targetId, position);
    }

    setTodos(newTodos);
  };

  const findTodoById = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children.length > 0) {
        const found = findTodoById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const insertTodoRelativeToTarget = (items, draggedItem, targetId, position) => {
    const result = [];

    for (const item of items) {
      if (item.id === targetId) {
        if (position === 'before') {
          result.push(draggedItem, item);
        } else {
          result.push(item, draggedItem);
        }
      } else {
        result.push({
          ...item,
          children: item.children.length > 0
            ? insertTodoRelativeToTarget(item.children, draggedItem, targetId, position)
            : item.children,
        });
      }
    }

    return result;
  };

  const addTodoAfter = (afterId, text = '') => {
    const newTodo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      children: [],
    };

    setTodos(insertTodoAfterInTree(todos, afterId, newTodo));
    return newTodo.id;
  };

  const insertTodoAfterInTree = (items, afterId, newTodo) => {
    const result = [];
    for (const item of items) {
      result.push(item);
      if (item.id === afterId) {
        result.push(newTodo);
      } else if (item.children.length > 0) {
        item.children = insertTodoAfterInTree(item.children, afterId, newTodo);
      }
    }
    return result;
  };

  const indentTodo = (id) => {
    const { previousSibling } = findPreviousSibling(todos, id);
    if (!previousSibling) return;

    const todoItem = findTodoById(todos, id);
    if (!todoItem) return;

    let newTodos = deleteTodoFromTree(todos, id);
    newTodos = addTodoToParent(newTodos, previousSibling.id, todoItem);
    setTodos(newTodos);
  };

  const outdentTodo = (id) => {
    const parent = findParent(todos, id, null);
    if (!parent) return;

    const todoItem = findTodoById(todos, id);
    if (!todoItem) return;

    let newTodos = deleteTodoFromTree(todos, id);
    newTodos = insertTodoRelativeToTarget(newTodos, todoItem, parent.id, 'after');
    setTodos(newTodos);
  };

  const findPreviousSibling = (items, id, parent = null) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return {
          previousSibling: i > 0 ? items[i - 1] : null,
          parent,
        };
      }
      if (items[i].children.length > 0) {
        const result = findPreviousSibling(items[i].children, id, items[i]);
        if (result.previousSibling !== undefined) {
          return result;
        }
      }
    }
    return { previousSibling: undefined, parent: null };
  };

  const findParent = (items, id, parent) => {
    for (const item of items) {
      if (item.id === id) {
        return parent;
      }
      if (item.children.length > 0) {
        const found = findParent(item.children, id, item);
        if (found !== null) return found;
      }
    }
    return null;
  };

  const checkAll = () => {
    const checkAllRecursive = (items) => {
      return items.map(item => ({
        ...item,
        completed: true,
        children: checkAllRecursive(item.children),
      }));
    };
    setTodos(checkAllRecursive(todos));
  };

  const uncheckAll = () => {
    const uncheckAllRecursive = (items) => {
      return items.map(item => ({
        ...item,
        completed: false,
        children: uncheckAllRecursive(item.children),
      }));
    };
    setTodos(uncheckAllRecursive(todos));
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setTodos(imported);
      return true;
    } catch (error) {
      console.error('Error importing JSON:', error);
      return false;
    }
  };

  return {
    todos,
    addTodo,
    addTodoAfter,
    updateTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    indentTodo,
    outdentTodo,
    checkAll,
    uncheckAll,
    exportToJson,
    importFromJson,
  };
};

