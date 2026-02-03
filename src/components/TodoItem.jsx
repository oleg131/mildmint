import { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  TODO: 'todo',
};

export const TodoItem = ({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  onAddAfter,
  onIndent,
  onOutdent,
  onMove,
  onFocus,
  onRegisterRef,
  level = 0
}) => {
  const [text, setText] = useState(todo.text);
  const [dropPosition, setDropPosition] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setText(todo.text);
  }, [todo.text]);

  // Register this input ref with the parent
  useEffect(() => {
    if (onRegisterRef && inputRef.current) {
      onRegisterRef(todo.id, inputRef.current);
    }
    return () => {
      if (onRegisterRef) {
        onRegisterRef(todo.id, null);
      }
    };
  }, [todo.id, onRegisterRef]);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TODO,
    item: { id: todo.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.TODO,
    hover: (item, monitor) => {
      if (!ref.current || item.id === todo.id) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverHeight = hoverBoundingRect.height;

      if (hoverClientY < hoverHeight * 0.25) {
        setDropPosition('before');
      } else if (hoverClientY > hoverHeight * 0.75) {
        setDropPosition('after');
      } else {
        setDropPosition('inside');
      }
    },
    drop: (item, monitor) => {
      if (item.id === todo.id) return;

      const didDrop = monitor.didDrop();
      if (didDrop) return;

      onMove(item.id, todo.id, dropPosition || 'inside');
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(ref));

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onUpdate(todo.id, newText);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleIndent = () => {
    onIndent(todo.id);
    if (onFocus) {
      setTimeout(() => onFocus(todo.id), 10);
    }
  };

  const handleOutdent = () => {
    onOutdent(todo.id);
    if (onFocus) {
      setTimeout(() => onFocus(todo.id), 10);
    }
  };

  const handleKeyDown = (e) => {
    // Enter: Create new item below
    if (e.key === 'Enter') {
      e.preventDefault();
      const newId = onAddAfter(todo.id);
      if (onFocus && newId) {
        setTimeout(() => onFocus(newId), 10);
      }
    }
    // Tab: Indent
    else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onIndent(todo.id);
      // Refocus this item after state update
      if (onFocus) {
        setTimeout(() => onFocus(todo.id), 10);
      }
    }
    // Shift+Tab: Outdent
    else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      onOutdent(todo.id);
      // Refocus this item after state update
      if (onFocus) {
        setTimeout(() => onFocus(todo.id), 10);
      }
    }
    // Backspace on empty: Delete
    else if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete(todo.id);
    }
  };

  const getDropIndicatorClass = () => {
    if (!isOver || !dropPosition) return '';

    if (dropPosition === 'before') {
      return 'before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-blue-500';
    } else if (dropPosition === 'after') {
      return 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500';
    } else {
      return 'ring-2 ring-blue-400';
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-4 md:ml-6' : ''}`}>
      <div
        ref={ref}
        className={`group relative flex items-center gap-1 md:gap-2 py-1 px-1 md:px-2 rounded hover:bg-gray-50 transition-colors ${
          isDragging ? 'opacity-30' : ''
        } ${getDropIndicatorClass()}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag Handle - Only visible on hover (desktop only) */}
        <div className={`hidden md:block flex-shrink-0 cursor-move text-gray-300 hover:text-gray-500 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="flex-shrink-0 w-4 h-4 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
        />

        {/* Text Input - Always editable */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type something..."
          className={`flex-1 min-w-0 bg-transparent border-none outline-none px-1 py-0.5 text-sm md:text-base ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
          } placeholder-gray-300 focus:bg-white focus:ring-0`}
        />

        {/* Mobile Indent/Outdent Buttons - Visible when focused */}
        {isFocused && (
          <div className="flex gap-0.5 flex-shrink-0 md:hidden">
            <button
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleOutdent();
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded active:bg-blue-100"
              title="Outdent (move left)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                handleIndent();
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded active:bg-blue-100"
              title="Indent (move right)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                onDelete(todo.id);
              }}
              className="p-1.5 text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded active:bg-red-100"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Buttons - Only visible on hover (desktop) */}
        <div className={`hidden md:flex gap-1 flex-shrink-0 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete (or Backspace on empty)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      {todo.children && todo.children.length > 0 && (
        <div className="mt-0.5">
          {todo.children.map((child) => (
            <TodoItem
              key={child.id}
              todo={child}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddAfter={onAddAfter}
              onIndent={onIndent}
              onOutdent={onOutdent}
              onMove={onMove}
              onFocus={onFocus}
              onRegisterRef={onRegisterRef}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
