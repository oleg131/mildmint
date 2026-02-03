import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TodoItem } from './TodoItem';
import { useTodos } from '../hooks/useTodos';
import { generateListId } from '../utils/listManager';

function TodoList({ listId }) {
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);
  const inputRefs = useRef({});
  const navigate = useNavigate();

  const {
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
  } = useTodos(listId);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = importFromJson(e.target.result);
        if (success) {
          alert('Todos imported successfully!');
        } else {
          alert('Error importing todos. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleFocus = useCallback((id) => {
    const input = inputRefs.current[id];
    if (input) {
      input.focus();
    }
  }, []);

  const handleRegisterRef = useCallback((id, ref) => {
    if (ref) {
      inputRefs.current[id] = ref;
    } else {
      delete inputRefs.current[id];
    }
  }, []);

  const createNewList = () => {
    const newListId = generateListId();
    navigate(`/${newListId}`);
  };

  const totalTodos = countTodos(todos);
  const completedTodos = countCompletedTodos(todos);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Todo List</h1>
            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
              <button
                onClick={createNewList}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                + New List
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-500 hover:text-gray-700"
              >
                Keyboard shortcuts
              </button>
              <button
                onClick={exportToJson}
                className="text-gray-500 hover:text-gray-700"
              >
                Export JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-700"
              >
                Import JSON
              </button>
              {totalTodos > 0 && (
                <>
                  <button
                    onClick={checkAll}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Check All
                  </button>
                  <button
                    onClick={uncheckAll}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Uncheck All
                  </button>
                </>
              )}
              {totalTodos > 0 && (
                <span className="text-gray-400">
                  {completedTodos} / {totalTodos} completed
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Keyboard Shortcuts</h3>
              <div className="space-y-1 text-gray-600">
                <div><kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd> Create new item below</div>
                <div><kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs">Tab</kbd> Indent item (make it a child)</div>
                <div><kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs">Shift+Tab</kbd> Outdent item (move up a level)</div>
                <div><kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs">Backspace</kbd> Delete empty item</div>
                <div className="pt-2 text-gray-500">Tip: Drag items to reorder or nest them</div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {totalTodos > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span>{Math.round((completedTodos / totalTodos) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Todo List */}
          <div className="space-y-0.5">
            {todos.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <button
                  onClick={() => {
                    const newId = addTodo('');
                    setTimeout(() => handleFocus(newId), 10);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Click to add your first task
                </button>
              </div>
            ) : (
              <>
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onUpdate={updateTodo}
                    onDelete={deleteTodo}
                    onAddAfter={addTodoAfter}
                    onIndent={indentTodo}
                    onOutdent={outdentTodo}
                    onMove={moveTodo}
                    onFocus={handleFocus}
                    onRegisterRef={handleRegisterRef}
                  />
                ))}
                {/* Add new item at end */}
                <button
                  onClick={() => {
                    const newId = addTodo('');
                    setTimeout(() => handleFocus(newId), 10);
                  }}
                  className="w-full text-left py-1 px-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors text-sm"
                >
                  + New item
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

function countTodos(todos) {
  return todos.reduce((count, todo) => {
    return count + 1 + countTodos(todo.children || []);
  }, 0);
}

function countCompletedTodos(todos) {
  return todos.reduce((count, todo) => {
    return count + (todo.completed ? 1 : 0) + countCompletedTodos(todo.children || []);
  }, 0);
}

export default TodoList;
