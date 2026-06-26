import React, { useState, useEffect } from 'react';
import { managerDatabase } from '../../../services/firebase/managerDatabase';
import ManagerForm from '../components/ManagerForm';

export default function ManagerList() {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingManager, setEditingManager] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (
      !window.confirm(
        'Are you sure you want to seed the default managers? This will overwrite existing managers with the same IDs.'
      )
    )
      return;
    setIsSeeding(true);
    try {
      await managerDatabase.seedMockManagers();
      alert('Mock managers seeded successfully!');
      fetchManagers();
    } catch (e) {
      console.error(e);
      alert('Failed to seed managers: ' + e.message);
    }
    setIsSeeding(false);
  };

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const data = await managerDatabase.getAllManagers();
      setManagers(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingManager(null);
    setIsFormOpen(true);
  };

  const handleSaved = () => {
    setIsFormOpen(false);
    fetchManagers();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manager Management</h1>
        <div className="flex gap-2">
          {managers.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-amber-600 font-medium disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : 'Seed Data'}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium"
          >
            + Add Manager
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading managers...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-gray-600 font-semibold text-sm">ID</th>
                <th className="p-4 text-gray-600 font-semibold text-sm">Avatar</th>
                <th className="p-4 text-gray-600 font-semibold text-sm">Name</th>
                <th className="p-4 text-gray-600 font-semibold text-sm">Price</th>
                <th className="p-4 text-gray-600 font-semibold text-sm">Effect Type</th>
                <th className="p-4 text-gray-600 font-semibold text-sm">Status</th>
                <th className="p-4 text-gray-600 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No managers found.
                  </td>
                </tr>
              )}
              {managers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">{m.id}</td>
                  <td className="p-4">
                    <img
                      src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`}
                      alt=""
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{m.name}</td>
                  <td className="p-4 font-bold text-amber-500">{m.price || 0}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                      {m.effectLogic?.type || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    {m.isActive ? (
                      <span className="text-green-600 font-bold text-sm">Active</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(m)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <ManagerForm
          initialData={editingManager}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
