import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { teamDatabase } from '../../../services/firebase/teamDatabase';
import TeamList from '../components/TeamList';
import TeamFormModal from '../components/TeamFormModal';

const TeamManager = () => {
  const navigate = useNavigate();
  const { teams, isLoading, fetchTeams } = useTeams();
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleEdit = (team) => {
    setEditingTeam(team.id);
    setFormData({
      id: team.id,
      name: team.name,
      shortName: team.shortName || '',
      logo: team.logo || '',
    });
  };

  const handleAddNew = () => {
    setEditingTeam('new');
    setFormData({ id: '', name: '', shortName: '', logo: '' });
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setFormData(null);
  };

  const handleSave = async (dataToSave) => {
    try {
      await teamDatabase.saveTeam(dataToSave);
      await fetchTeams(); // Will fetch fresh data because cache is invalidated
      handleCancel();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`แน่ใจหรือไม่ว่าต้องการลบทีม ${name}?`)) {
      try {
        await teamDatabase.deleteTeam(id);
        await fetchTeams();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการทีมสโมสร (Team Management)</h1>
            <p className="text-sm text-gray-500">
              ตั้งค่าชื่อและโลโก้สโมสร สำหรับใช้งานในตารางและระบบ
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-5 h-5" /> เพิ่มทีมใหม่
        </button>
      </div>

      {/* Editor Modal */}
      {editingTeam && (
        <TeamFormModal
          editingTeam={editingTeam}
          initialData={formData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Team List */}
      <TeamList teams={teams} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default TeamManager;
