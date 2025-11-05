
import React, { useState } from 'react';
import { FoodItem } from '../types';
import { FoodItemCard } from './FoodItemCard';
import { ImageModal } from './ImageModal';

interface FoodItemListProps {
  items: FoodItem[];
  onDelete: (id: string) => void;
}

export const FoodItemList: React.FC<FoodItemListProps> = ({ items, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
        <div className="text-center py-10 px-4">
            <h2 className="text-2xl font-semibold text-gray-400">Your list is empty!</h2>
            <p className="text-gray-500 mt-2">Add a food item using the form above to start tracking your preferences.</p>
        </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(item => (
          <FoodItemCard 
            key={item.id} 
            item={item} 
            onDelete={onDelete} 
            onImageClick={(imageUrl) => setSelectedImage(imageUrl)}
          />
        ))}
      </div>
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};