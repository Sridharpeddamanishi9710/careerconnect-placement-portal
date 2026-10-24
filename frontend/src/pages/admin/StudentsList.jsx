import React, { useState, useEffect } from 'react';
import { studentsApi, companiesApi } from '../../api/client';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  FileDown, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Award, 
  Briefcase 
} from 'lucide-react';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [placedFilter, setPlacedFilter] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  // Edit / View Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    roll_number: '',
    department: '',
    batch_year: 2026,
    cgpa: 0.0,
    phone: '',
    skills: '',
    placed_status: false,
    placed_company_id: '',
    placed_package_lpa: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, department, placedFilter, minCgpa]);

  const fetchCompanies = async () => {
    try {
      const res = await companiesApi.getAll();
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.getAll({
        search: search || undefined,
        department: department || undefined,
        placed_status: placedFilter === '' ? undefined : placedFilter === 'true',
        min_cgpa: minCgpa ? parseFloat(minCgpa) : undefined,
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({
      roll_number: student.roll_number,
      department: student.department,
      batch_year: student.batch_year,
      cgpa: student.cgpa,
      phone: student.phone || '',
      skills: student.skills || '',
      placed_status: student.placed_status,
      placed_company_id: student.placed_company_id || '',
      placed_package_lpa: student.placed_package_lpa || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        cgpa: parseFloat(editForm.cgpa),
        batch_year: parseInt(editForm.batch_year),
        placed_company_id: editForm.placed_status && editForm.placed_company_id ? parseInt(editForm.placed_company_id) : null,
        placed_package_lpa: editForm.placed_status && editForm.placed_package_lpa ? parseFloat(editForm.placed_package_lpa) : null,
      };

      await studentsApi.updateByAdmin(selectedStudent.id, payload);
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update student profile.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? This removes their account and records.`)) {
      try {
        await studentsApi.delete(id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Students Directory</h1>
        <p className="text-sm text-slate-500">View and manage enrolled student academic profiles and placement statuses</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs font-medium px-3 py-2 border rounded-lg bg-slate-50 outline-none text-slate-700"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Electrical">Electrical</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          <select
            value={placedFilter}
            onChange={(e) => setPlacedFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 border rounded-lg bg-slate-50 outline-none text-slate-700"
          >
            <option value="">Placement Status</option>
            <option value="true">Placed Only</option>
            <option value="false">Unplaced Only</option>
          </select>

          <input
            type="number"
            step="0.5"
            placeholder="Min CGPA"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            className="w-24 text-xs font-medium px-3 py-2 border rounded-lg bg-slate-50 outline-none text-slate-700"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading students directory..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Adjust your filters or register students to begin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Roll No.</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">CGPA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Company & CTC</th>
                  <th className="py-3.5 px-4">Resume</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {s.user?.full_name}
                      <div className="text-[10px] text-slate-400 font-normal">{s.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{s.roll_number}</td>
                    <td className="py-3.5 px-4">{s.department}</td>
                    <td className="py-3.5 px-4">{s.batch_year}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">{s.cgpa}</td>
                    <td className="py-3.5 px-4">
                      {s.placed_status ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Placed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Seeking
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.placed_status && s.placed_company ? (
                        <div>
                          <span className="font-semibold text-slate-800">{s.placed_company.name}</span>
                          <span className="text-emerald-600 font-bold ml-1.5">₹{s.placed_package_lpa} LPA</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.resume_filename ? (
                        <a
                          href={studentsApi.getResumeUrl(s.resume_filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.user?.full_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Student Profile & Placement Status"
      >
        {selectedStudent && (
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number *</label>
                <input
                  type="text"
                  required
                  value={editForm.roll_number}
                  onChange={(e) => setEditForm({ ...editForm, roll_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={editForm.cgpa}
                  onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Year *</label>
                <input
                  type="number"
                  required
                  value={editForm.batch_year}
                  onChange={(e) => setEditForm({ ...editForm, batch_year: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="Python, React, Docker..."
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Placement Status Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="placedStatusCheck"
                  checked={editForm.placed_status}
                  onChange={(e) => setEditForm({ ...editForm, placed_status: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="placedStatusCheck" className="text-xs font-bold text-slate-800">
                  Candidate is Placed
                </label>
              </div>

              {editForm.placed_status && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Placed In Company</label>
                    <select
                      value={editForm.placed_company_id}
                      onChange={(e) => setEditForm({ ...editForm, placed_company_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Package CTC (LPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.placed_package_lpa}
                      onChange={(e) => setEditForm({ ...editForm, placed_package_lpa: e.target.value })}
                      placeholder="e.g. 15.0"
                      className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
