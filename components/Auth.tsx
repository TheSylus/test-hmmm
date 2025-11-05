import React, { useState, FormEvent } from 'react';

interface AuthProps {
  login: (username: string) => boolean;
  register: (username: string) => boolean;
}

export const Auth: React.FC<AuthProps> = ({ login, register }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
        setError('Username cannot be empty.');
        return;
    }

    let success = false;
    if (isLoginView) {
      success = login(trimmedUsername);
      if (!success) {
        setError('Username not found. Please check the username or switch to register.');
      }
    } else {
      success = register(trimmedUsername);
      if (!success) {
        setError('Username already taken. Please choose another one.');
      }
    }
    
    // On success, the parent component will re-render and this component will be unmounted.
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-green-400 mb-6">
          Food Memory Tracker
        </h1>
        <h2 className="text-xl font-bold text-white text-center mb-6">{isLoginView ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-3"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded-md">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors"
            >
              {isLoginView ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <button 
            onClick={() => { 
                setIsLoginView(!isLoginView); 
                setError(null); 
                setUsername('');
            }} 
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
