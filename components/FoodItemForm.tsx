import React, { useState, FormEvent, useRef } from 'react';
import { FoodItem, NutriScore } from '../types';
import { BoundingBox, analyzeFoodImage } from '../services/geminiService';
import { CameraCapture } from './CameraCapture';
import { ImageCropper } from './ImageCropper';
import { StarIcon, SparklesIcon, CameraIcon, PlusCircleIcon, XMarkIcon } from './Icons';

interface FoodItemFormProps {
  onAddItem: (item: Omit<FoodItem, 'id'>) => void;
}

const nutriScoreColors: Record<NutriScore, string> = {
  A: 'bg-green-600',
  B: 'bg-lime-600',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  E: 'bg-red-600',
};

export const FoodItemForm: React.FC<FoodItemFormProps> = ({ onAddItem }) => {
  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [nutriScore, setNutriScore] = useState<NutriScore | ''>('');
  const [tags, setTags] = useState('');

  // UI/Flow state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uncroppedImage, setUncroppedImage] = useState<string | null>(null);
  const [suggestedCrop, setSuggestedCrop] = useState<BoundingBox | null | undefined>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFormState = () => {
    setName('');
    setRating(0);
    setNotes('');
    setImage(null);
    setNutriScore('');
    setTags('');
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddNewClick = () => {
    setIsExpanded(true);
    setIsCameraOpen(true);
  };

  const handleCancel = () => {
    resetFormState();
    setIsExpanded(false);
  };
  
  const handleImageFromCamera = async (imageDataUrl: string) => {
    setIsCameraOpen(false);
    setError(null);
    setIsLoading(true);
    try {
      const result = await analyzeFoodImage(imageDataUrl);
      setName(result.name || '');
      setTags(result.tags?.join(', ') || '');
      setNutriScore(result.nutriScore || '');
      
      setUncroppedImage(imageDataUrl);
      setSuggestedCrop(result.boundingBox);
      setIsCropperOpen(true);

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setUncroppedImage(imageDataUrl); // Still allow user to use the photo and fill details manually
      setSuggestedCrop(null);
      setIsCropperOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setImage(croppedImageUrl);
    setIsCropperOpen(false);
    setUncroppedImage(null);
    setSuggestedCrop(null);
  };
  
  const handleCropCancel = () => {
    if (uncroppedImage) setImage(uncroppedImage);
    setIsCropperOpen(false);
    setUncroppedImage(null);
    setSuggestedCrop(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageFromCamera(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || rating === 0) {
      alert('Please provide a name and a rating.');
      return;
    }

    onAddItem({
      name,
      rating,
      notes: notes || undefined,
      image: image || undefined,
      nutriScore: nutriScore || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
    });
    
    resetFormState();
    setIsExpanded(false);
  };

  const removeImage = () => {
    setImage(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }
  
  if (!isExpanded) {
    return (
      <div className="text-center mb-8">
        <button
          onClick={handleAddNewClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
        >
          <PlusCircleIcon className="w-8 h-8" />
          <span className="text-xl">Add New Food Item</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden text-gray-400">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                            <SparklesIcon className="w-10 h-10 animate-pulse text-indigo-400" />
                            <p className="mt-2 text-sm text-gray-300">Analyzing...</p>
                        </div>
                    )}
                    {image ? (
                        <>
                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/80 transition"
                                aria-label="Remove image"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                         <div className="text-center p-4">
                            <CameraIcon className="w-16 h-16 mx-auto" />
                            <p className="mt-2 text-sm">Scan a product or upload an image to start</p>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:bg-gray-600"
                        disabled={isLoading}
                    >
                        <CameraIcon className="w-5 h-5" />
                        <span>Scan New</span>
                    </button>
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:bg-gray-500"
                        disabled={isLoading}
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Upload</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
                <input
                    type="text"
                    placeholder="Product Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-3"
                />
                <div className="flex items-center gap-4">
                    <label className="text-gray-300 font-medium">Rating:</label>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className="text-gray-600 hover:text-yellow-400 transition"
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                                <StarIcon className={`w-8 h-8 ${rating >= star ? 'text-yellow-400' : ''}`} filled={rating >= star} />
                            </button>
                        ))}
                    </div>
                </div>
                <textarea
                    placeholder="Notes (e.g., taste, where you bought it)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-3"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Tags (comma, separated)"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-3"
                    />
                    {nutriScore && (
                      <div className="flex items-center gap-2 bg-gray-700 rounded-md p-3">
                        <span className="text-gray-400 font-medium">AI Nutri-Score:</span>
                        <div className={`text-sm w-7 h-7 rounded-full text-white font-bold flex items-center justify-center flex-shrink-0 ${nutriScoreColors[nutriScore]}`}>
                            {nutriScore}
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
        
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors text-lg disabled:bg-gray-600"
              disabled={isLoading || !name || rating === 0}
            >
              <PlusCircleIcon className="w-6 h-6" />
              Save Item
            </button>
        </div>
      </form>

      {isCameraOpen && <CameraCapture onCapture={handleImageFromCamera} onClose={() => setIsCameraOpen(false)} />}
      {isCropperOpen && uncroppedImage && <ImageCropper imageUrl={uncroppedImage} suggestedCrop={suggestedCrop} onCrop={handleCropComplete} onCancel={handleCropCancel} />}
    </>
  );
};
