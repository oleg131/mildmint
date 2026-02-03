import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import TodoList from './components/TodoList';
import { generateListId } from './utils/listManager';

function ListPage() {
  const { listId } = useParams();
  return <TodoList listId={listId} />;
}

function HomePage() {
  const navigate = useNavigate();

  const createNewList = () => {
    const newListId = generateListId();
    navigate(`/${newListId}`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Todo Lists</h1>
        <p className="text-gray-600 mb-8">Create a new list to get started</p>
        <button
          onClick={createNewList}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          + New List
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:listId" element={<ListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
