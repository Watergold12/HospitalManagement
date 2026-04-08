import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, X } from 'lucide-react';
import api from '../api/api';

export default function Departments() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ dept_name: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/departments')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchData();
  }, []);

  const handleEdit = (d) => {
    setEditingId(d.dept_id);
    setFormData({ dept_name: d.dept_name || '', location: d.location || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ dept_name: '', location: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      for (const key in formData) {
        if (formData[key] !== '') payload[key] = formData[key];
      }

      if (editingId) {
        if (Object.keys(payload).length === 0) return alert("Please fill at least one field to update!");
        await api.put(`/departments/${editingId}`, payload);
      } else {
        await api.post('/departments', formData);
      }
      setEditingId(null);
      setFormData({ dept_name: '', location: '' });
      fetchData();
    } catch (err) {
      alert("Error saving department.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (err) {
      alert("Cannot delete department because dependent staff exist in it.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Records...</div>;

  return (
    <div>
      <h1 className="page-title">Department Logistics</h1>

      <form onSubmit={handleSubmit} className="modern-form">
        <input required={!editingId} placeholder="Department Name" className="modern-input" value={formData.dept_name} onChange={e => setFormData({...formData, dept_name: e.target.value})} />
        <input required={!editingId} placeholder="Location" className="modern-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        <button type="submit" className="btn btn-primary">
          <Plus size={18} /> {editingId ? "Update Dept" : "Add Dept"}
        </button>
        {editingId && (
          <button type="button" className="btn btn-danger" onClick={handleCancelEdit}>
            <X size={18} /> Cancel
          </button>
        )}
      </form>

      <div className="table-container" style={{ marginTop: '2rem' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location Route</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.dept_id} style={{ background: editingId === item.dept_id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <td><span className="badge">#{item.dept_id}</span></td>
                <td><strong>{item.dept_name}</strong></td>
                <td><Building2 size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--text-sub)' }}/> {item.location}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(item)} className="btn" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(item.dept_id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="4" className="empty-state">No departments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
