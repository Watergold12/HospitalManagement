import { useState, useEffect } from 'react';
import { Calendar, Trash2, CalendarPlus, Edit2, X } from 'lucide-react';
import api from '../api/api';

export default function Appointments() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ app_date: '', patient_id: '', doctor_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/appointments')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchData();
  }, []);

  const handleEdit = (a) => {
    const id = a.appointment_id || a.app_id;
    setEditingId(id);
    let dateStr = a.app_date || a.date || '';
    if (dateStr && dateStr.length > 10) dateStr = new Date(dateStr).toISOString().substring(0, 10);
    setFormData({ 
      app_date: dateStr, 
      patient_id: a.patient_id || '', 
      doctor_id: a.doctor_id || '' 
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ app_date: '', patient_id: '', doctor_id: '' });
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
        await api.put(`/appointments/${editingId}`, payload);
      } else {
        await api.post('/appointments', formData);
      }
      setEditingId(null);
      setFormData({ app_date: '', patient_id: '', doctor_id: '' });
      fetchData();
    } catch (err) {
      alert("Error saving appointment. Check if IDs exist.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchData();
    } catch (err) {
      alert("Cannot cancel this appointment currently.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Schedules...</div>;

  return (
    <div>
      <h1 className="page-title">Appointment Routing</h1>

      <form onSubmit={handleSubmit} className="modern-form">
        <input required={!editingId} type="date" className="modern-input" value={formData.app_date} onChange={e => setFormData({...formData, app_date: e.target.value})} />
        <input required={!editingId} placeholder="Patient ID" className="modern-input" type="number" value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} />
        <input required={!editingId} placeholder="Doctor ID" className="modern-input" type="number" value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})} />
        <button type="submit" className="btn btn-primary">
          <CalendarPlus size={18} /> {editingId ? "Update Appt" : "Schedule"}
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
              <th>Date</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => {
              const id = item.appointment_id || item.app_id;
              return (
              <tr key={id} style={{ background: editingId === id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <td><span className="badge">#{id}</span></td>
                <td><Calendar size={14} style={{ display: 'inline', marginRight: '5px' }}/> {item.app_date || item.date}</td>
                <td><strong>{item.patient_name}</strong></td>
                <td>{item.doctor_name}</td>
                <td>{item.dept_name}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(item)} className="btn" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(id)}>
                    <Trash2 size={16} /> Cancel
                  </button>
                </td>
              </tr>
            )})}
            {data.length === 0 && <tr><td colSpan="6" className="empty-state">No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
