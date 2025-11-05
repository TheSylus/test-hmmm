import React, { useState, useMemo } from 'react';
import { FoodItem } from './types';
import { FoodItemForm } from './components/FoodItemForm';
import { FoodItemList } from './components/FoodItemList';
import { Auth } from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { useFoodItems } from './hooks/useFoodItems';

const App: React.FC = () => {
  const { currentUser, login, register, logout } = useAuth();
  const { foodItems, handleAddItem, handleDeleteItem } = useFoodItems(currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'liked' | 'disliked' | 'all'>('all');

  const filteredItems = useMemo(() => {
    // Return empty array if no user is logged in
    if (!currentUser) return [];
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return foodItems
      .filter(item => {
        if (filter === 'all') return true;
        if (filter === 'liked') return item.rating >= 4;
        if (filter === 'disliked') return item.rating <= 2 && item.rating > 0;
        return true;
      })
      .filter(item => 
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.notes?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.tags?.join(' ').toLowerCase().includes(lowerCaseSearchTerm)
      );
  }, [foodItems, searchTerm, filter, currentUser]);

  const isSearching = searchTerm.trim() !== '';

  // If no user is logged in, show the Authentication component
  if (!currentUser) {
    return <Auth login={login} register={register} />;
  }

  // Otherwise, show the main application
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-green-400">
                    Food Memory Tracker
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-300">Welcome, <span className="font-bold text-white">{currentUser}</span>!</span>
                    <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
                        Logout
                    </button>
                </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-end mt-4">
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-2"
                />
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value as 'liked' | 'disliked' | 'all')}
                    className="w-full sm:w-auto bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-2"
                >
                    <option value="all">All Items</option>
                    <option value="liked">Liked (4-5 Stars)</option>
                    <option value="disliked">Disliked (1-2 Stars)</option>
                </select>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {isSearching ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-300">
              Results for "<span className="text-indigo-400">{searchTerm}</span>"
            </h2>
          </div>
        ) : (
          <>
            <FoodItemForm onAddItem={handleAddItem} />
            <div className="border-t border-gray-700 my-8"></div>
          </>
        )}
        <FoodItemList items={filteredItems} onDelete={handleDeleteItem} />
      </main>
      
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Never forget a favorite again.</p>
      </footer>
    </div>
  );
};

export default App;
