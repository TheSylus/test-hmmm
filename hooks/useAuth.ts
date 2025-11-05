import { useState, useCallback } from 'react';

// NOTE: In a real app, never store passwords or sensitive data in localStorage.
// This is a simplified example for a frontend-only prototype.

const USERS_STORAGE_KEY = 'food_tracker_users';
const CURRENT_USER_STORAGE_KEY = 'food_tracker_currentUser';

// Helper to get users from localStorage
const getStoredUsers = (): string[] => {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    } catch (e) {
        console.error("Could not parse users from localStorage", e);
        return [];
    }
};

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<string | null>(() => {
        try {
            return localStorage.getItem(CURRENT_USER_STORAGE_KEY) || null;
        } catch (e) {
            console.error("Could not get current user from localStorage", e);
            return null;
        }
    });

    const login = useCallback((username: string): boolean => {
        const users = getStoredUsers();
        if (users.includes(username)) {
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, username);
            setCurrentUser(username);
            return true;
        }
        return false;
    }, []);

    const register = useCallback((username: string): boolean => {
        const users = getStoredUsers();
        if (users.includes(username) || username.trim().length === 0) {
            return false; // User already exists or username is empty
        }
        const newUsers = [...users, username.trim()];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, username.trim());
        setCurrentUser(username.trim());
        return true;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        setCurrentUser(null);
    }, []);
    
    return { currentUser, login, register, logout };
};
