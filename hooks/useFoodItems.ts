import { useState, useEffect, useCallback } from 'react';
import { FoodItem } from '../types';

const getStorageKey = (username: string) => `foodItems_${username}`;

export const useFoodItems = (username: string | null) => {
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

    // Effect to load data when user logs in
    useEffect(() => {
        if (!username) {
            setFoodItems([]); // Clear data if no user is logged in
            return;
        };

        try {
            const storageKey = getStorageKey(username);
            const savedItems = localStorage.getItem(storageKey);
            setFoodItems(savedItems ? JSON.parse(savedItems) : []);
        } catch (error) {
            console.error("Could not parse food items from localStorage", error);
            setFoodItems([]);
        }
    }, [username]);

    // Effect to save data when it changes
    useEffect(() => {
        if (username) {
            const storageKey = getStorageKey(username);
            localStorage.setItem(storageKey, JSON.stringify(foodItems));
        }
    }, [foodItems, username]);

    const handleAddItem = useCallback((item: Omit<FoodItem, 'id'>) => {
        const newItem: FoodItem = {
            ...item,
            id: `${new Date().toISOString()}-${Math.random()}`, // Add random part to avoid collisions
        };
        setFoodItems(prevItems => [newItem, ...prevItems]);
    }, []);

    const handleDeleteItem = useCallback((id: string) => {
        setFoodItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    return { foodItems, handleAddItem, handleDeleteItem };
};
