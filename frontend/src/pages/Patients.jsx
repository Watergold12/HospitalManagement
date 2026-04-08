import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, X } from 'lucide-react';
import api from '../api/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleEdit = (p) => {
    setEditingId(p.patient_id);
    setFormData({ name: p.name || p.patient_name || '', phone: p.phone || p.phoneno || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '' });
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
        await api.put(`/patients/${editingId}`, payload);
      } else {
        await api.post('/patients', formData);
      }
      setEditingId(null);
      setFormData({ name: '', phone: '' });
      fetchPatients();
    } catch (err) {
      alert("Error saving patient.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete patient?")) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert("Cannot delete patient");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Records...</div>;

  return (
    <div>
      <h1 className="page-title">Patient Management</h1>
      
      <form onSubmit={handleSubmit} className="modern-form">
        <input 
          required={!editingId} 
          placeholder="Patient Name" 
          className="modern-input"
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
        />
        <input 
          placeholder="Contact Phone" 
          className="modern-input"
          value={formData.phone} 
          onChange={e => setFormData({...formData, phone: e.target.value})} 
        />
        <button type="submit" className="btn btn-primary">
          <UserPlus size={18} /> {editingId ? "Update Patient" : "Add Record"}
        </button>
        {editingId && (
          <button type="button" className="btn btn-danger" onClick={handleCancelEdit}>
            <X size={18} /> Cancel
          </button>
        )}
      </form>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Reg ID</th>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.patient_id} style={{ background: editingId === p.patient_id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <td><span className="badge">#{p.patient_id}</span></td>
                <td><strong>{p.name || p.patient_name}</strong></td>
                <td>{p.phone || p.phoneno}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} className="btn" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.patient_id)} className="btn btn-danger">
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && <tr><td colSpan="4" className="empty-state">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
