const STORAGE_KEY = 'nested-todos-lists';

export const getAllLists = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading lists:', error);
    return {};
  }
};

export const deleteList = (listId) => {
  try {
    const allLists = getAllLists();
    delete allLists[listId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLists));
  } catch (error) {
    console.error('Error deleting list:', error);
  }
};

export const generateListId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
