import React, { useState, useEffect } from 'react';
import { managerDatabase } from '../../../services/firebase/managerDatabase';

export default function ManagerForm({ initialData, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    avatarUrl: '',
    description: '',
    isActive: true,
    effectLogic: '{\n  "type": "UNKNOWN_BONUS"\n}'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        avatarUrl: initialData.avatarUrl || '',
        description: initialData.description || '',
        isActive: initialData.isActive !== false,
        effectLogic: initialData.effectLogic ? JSON.stringify(initialData.effectLogic, null, 2) : '{\n  "type": "UNKNOWN_BONUS"\n}'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let parsedLogic = {};
    try {
      parsedLogic = JSON.parse(formData.effectLogic);
    } catch (err) {
      setError('Invalid JSON in Effect Logic');
      setIsSubmitting(false);
      return;
    }

    if (!formData.id.trim()) {
      setError('ID is required');
      setIsSubmitting(false);
      return;
    }

    try {
      await managerDatabase.saveManager(formData.id, {
        name: formData.name,
        avatarUrl: formData.avatarUrl,
        description: formData.description,
        isActive: formData.isActive,
        effectLogic: parsedLogic
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Manager' : 'Create Manager'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID (Unique)</label>
              <input 
                type="text" 
                name="id" 
                value={formData.id} 
                onChange={handleChange}
                disabled={isEditing}
                required
                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="e.g. MGR_A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input 
              type="text" 
              name="avatarUrl" 
              value={formData.avatarUrl} 
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows={2}
              className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effect Logic (JSON)
              <span className="text-xs text-gray-500 font-normal ml-2">Must be valid JSON</span>
            </label>
            <textarea 
              name="effectLogic" 
              value={formData.effectLogic} 
              onChange={handleChange}
              rows={5}
              className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-gray-50"
            />
          </div>

          <div className="flex items-center pt-2">
            <input 
              type="checkbox" 
              name="isActive" 
              id="isActive"
              checked={formData.isActive} 
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 cursor-pointer">
              Active (Visible in Game)
            </label>
          </div>

        </form>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Save Manager'}
          </button>
        </div>
      </div>
    </div>
  );
}
