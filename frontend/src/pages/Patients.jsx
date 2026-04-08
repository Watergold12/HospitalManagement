import { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import api from '../api/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', formData);
      setFormData({ name: '', phone: '' });
      fetchPatients();
    } catch (err) {
      alert("Error adding patient.");
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
          required 
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
          <UserPlus size={18} /> Add Record
        </button>
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
              <tr key={p.patient_id}>
                <td><span className="badge">#{p.patient_id}</span></td>
                <td><strong>{p.patient_name}</strong></td>
                <td>{p.phoneno}</td>
                <td>
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
