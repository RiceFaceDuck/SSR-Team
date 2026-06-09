import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { teamDatabase } from '../../../services/firebase/teamDatabase';

const TeamManager = () => {
  const navigate = useNavigate();
  const { teams, isLoading, fetchTeams } = useTeams();
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', shortName: '', logo: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (team) => {
    setEditingTeam(team.id);
    setFormData({ id: team.id, name: team.name, shortName: team.shortName || '', logo: team.logo || '' });
  };

  const handleAddNew = () => {
    setEditingTeam('new');
    setFormData({ id: '', name: '', shortName: '', logo: '' });
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setFormData({ id: '', name: '', shortName: '', logo: '' });
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("กรุณากรอกชื่อทีม");
      return;
    }
    
    setIsSaving(true);
    try {
      await teamDatabase.saveTeam(formData);
      await fetchTeams();
      handleCancel();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`แน่ใจหรือไม่ว่าต้องการลบทีม ${name}?`)) {
      try {
        await teamDatabase.deleteTeam(id);
        await fetchTeams();
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการลบ: " + err.message);
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
            <p className="text-sm text-gray-500">ตั้งค่าชื่อและโลโก้สโมสร สำหรับใช้งานในตารางและระบบ</p>
          </div>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-5 h-5" /> เพิ่มทีมใหม่
        </button>
      </div>

      {/* Editor Form */}
      {editingTeam && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            {editingTeam === 'new' ? '✨ เพิ่มทีมใหม่' : '✏️ แก้ไขข้อมูลทีม'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสโมสร</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="เช่น Arsenal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อย่อ (Short Name)</label>
              <input 
                type="text" 
                value={formData.shortName}
                onChange={e => setFormData({...formData, shortName: e.target.value.toUpperCase()})}
                maxLength={4}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                placeholder="เช่น ARS, MUN, LIV"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL รูปภาพโลโก้</label>
              <input 
                type="text" 
                value={formData.logo}
                onChange={e => setFormData({...formData, logo: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://... (ใส่ Link รูปภาพ)"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={handleCancel} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
              ยกเลิก
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50"
            >
              {isSaving ? 'กำลังบันทึก...' : <><Save className="w-4 h-4" /> บันทึกข้อมูล</>}
            </button>
          </div>
        </div>
      )}

      {/* Team List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">โลโก้</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อย่อ</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อทีม</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID อ้างอิง (Slug)</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teams.map(team => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain rounded-md" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 font-bold">
                          {team.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-indigo-600">{team.shortName || '-'}</td>
                    <td className="p-4 font-semibold text-gray-900">{team.name}</td>
                    <td className="p-4 font-mono text-sm text-gray-500">{team.id}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(team)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(team.id, team.name)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teams.length === 0 && (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                <ShieldAlert className="w-10 h-10 mb-3 text-gray-300" />
                <p>ยังไม่มีข้อมูลทีมในระบบ</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManager;
