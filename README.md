# Nested Todo List App

A Notion-style todo list application with seamless inline editing, keyboard shortcuts, unlimited nesting, and support for multiple lists.

## Features

- **Multiple Lists**: Create and manage multiple separate todo lists, each with its own unique URL
- **Notion-Style Editing**: Click any item to start typing - no edit mode needed
- **Keyboard Shortcuts** (Desktop):
  - **Enter** - Create new item below
  - **Tab** - Indent item (nest it under previous item)
  - **Shift+Tab** - Outdent item (move it up a level)
  - **Backspace** on empty - Delete item
- **Mobile-Friendly Controls**: When typing on mobile, indent/outdent/delete buttons appear automatically
- **Unlimited Nesting**: Create subtasks within subtasks with infinite depth
- **Drag and Drop** (Desktop): Reorder and reorganize tasks by dragging them
- **Cascade Completion**: Completing a parent task automatically completes all child tasks
- **Persistent Storage**: All changes are automatically saved to browser localStorage
- **JSON Export/Import**: Backup and restore your tasks as JSON files
- **Clean UI**: Minimal, distraction-free design inspired by Notion

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Creating and Managing Multiple Lists

1. **Home Page**: Visit the root URL to see the home page
2. **Create New List**: Click "+ New List" button to create a new todo list
3. **Unique URLs**: Each list has its own unique URL (e.g., `/abc123def456`)
4. **Switch Lists**: Click "+ New List" from any list to create another one
5. **Share Lists**: Share the URL to give others access to a specific list
6. **Bookmarks**: Bookmark your favorite lists for quick access

### Adding and Editing

- Click anywhere to start typing
- Press **Enter** to create a new item below
- All changes save automatically as you type

### Organizing with Keyboard

- **Tab** - Nest an item under the one above it
- **Shift+Tab** - Unnest an item (move it up a level)
- **Backspace** on empty line - Delete the item

### Completing Tasks

- Click the checkbox to mark a task as complete
- When you complete a parent task, all child tasks are automatically completed
- Use **Check All** button to mark all tasks as complete
- Use **Uncheck All** button to mark all tasks as incomplete

### Drag and Drop

- Hover over an item to see the drag handle
- Drag items to reorder or nest them:
  - **Drag to top edge**: Places it before that task
  - **Drag to bottom edge**: Places it after that task
  - **Drag to middle**: Makes it a child of that task

### Deleting Tasks

- Hover over an item to see the delete button
- Or use **Backspace** on an empty item
- On mobile: Tap to start typing, then use the delete button that appears

### Mobile Usage

On mobile devices:
- **Tap any item** to start typing
- When focused, three buttons appear:
  - **«** (double arrow left) - Outdent / move item left
  - **»** (double arrow right) - Indent / move item right
  - **Trash icon** - Delete the item
- **Tap the checkbox** to mark items complete
- **Tap outside** to unfocus and hide the buttons

### Export/Import

- **Export**: Click "Export JSON" to download your tasks as a JSON file
- **Import**: Click "Import JSON" and select a previously exported file

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **react-dnd**: Drag and drop functionality
- **localStorage**: Data persistence

## Project Structure

```
src/
├── components/
│   └── TodoItem.jsx      # Individual todo item component with drag-drop
├── hooks/
│   └── useTodos.js       # Custom hook for todo logic and localStorage
├── App.jsx               # Main app component
├── main.jsx              # Entry point
└── index.css             # Global styles with Tailwind imports
```

## Data Format

Todos are stored in the following JSON format:

```json
[
  {
    "id": "unique-id",
    "text": "Task description",
    "completed": false,
    "children": [
      {
        "id": "child-id",
        "text": "Subtask",
        "completed": false,
        "children": []
      }
    ]
  }
]
```

## License

MIT
