import { useState, useEffect } from 'react';
import { Stethoscope, Trash2, UserPlus, Edit2, X } from 'lucide-react';
import api from '../api/api';

export default function Doctors() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ name: '', specialization: '', phone: '', dept_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/doctors')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchData();
  }, []);

  const handleEdit = (d) => {
    setEditingId(d.doctor_id);
    setFormData({ 
      name: d.name || d.doctor_name || '', 
      specialization: d.specialization || '', 
      phone: d.phone || d.phoneno || '', 
      dept_id: d.dept_id || '' 
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', specialization: '', phone: '', dept_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      for (const key in formData) {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          payload[key] = formData[key];
        }
      }

      if (editingId) {
        if (Object.keys(payload).length === 0) return alert("Please fill at least one field to update!");
        await api.put(`/doctors/${editingId}`, payload);
      } else {
        await api.post('/doctors', formData);
      }
      setEditingId(null);
      setFormData({ name: '', specialization: '', phone: '', dept_id: '' });
      fetchData();
    } catch (err) {
      console.log("FULL ERROR:", err);                     // 👈 add this
      console.log("BACKEND ERROR:", err.response?.data);   // 👈 add this

      alert(err.response?.data?.error || "Error saving doctor");
    }
    // } catch (err) {
    //   alert("Error saving doctor. Check if dept_id is valid.");
    // }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete doctor?")) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchData();
    } catch (err) {
      alert("Cannot delete doctor. They may have active dependencies like appointments.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Records...</div>;

  return (
    <div>
      <h1 className="page-title">Doctor Management</h1>
      
      <form onSubmit={handleSubmit} className="modern-form">
        <input required={!editingId} placeholder="Name" className="modern-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required={!editingId} placeholder="Specialization" className="modern-input" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
        <input placeholder="Phone" className="modern-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input required={!editingId} placeholder="Department ID" className="modern-input" type="number" value={formData.dept_id} onChange={e => setFormData({...formData, dept_id: e.target.value ? parseInt(e.target.value) : ''})} />
        <button type="submit" className="btn btn-primary">
          <UserPlus size={18} /> {editingId ? "Update Doctor" : "Add Doctor"}
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
              <th>Phone</th>
              <th>License No.</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.doctor_id} style={{ background: editingId === item.doctor_id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <td><span className="badge">#{item.doctor_id}</span></td>
                <td><strong>{item.doctor_name}</strong></td>
                <td>{item.phoneno}</td>
                <td>{item.licenseno}</td>
                <td>{item.specialization}</td>
                <td>{item.dept_id}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(item)} className="btn" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(item.doctor_id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="6" className="empty-state">No doctors found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
