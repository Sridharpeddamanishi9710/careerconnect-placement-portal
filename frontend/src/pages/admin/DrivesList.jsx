import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { drivesApi, companiesApi } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Award, 
  Users, 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  Filter 
} from 'lucide-react';

export default function DrivesList() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    company_id: '',
    job_title: '',
    job_description: '',
    job_location: '',
    package_lpa: '',
    min_cgpa: '0.0',
    eligible_departments: 'Computer Science, Information Technology',
    eligible_batch_year: 2026,
    application_deadline: '',
    drive_date: '',
    status: 'UPCOMING',
    max_positions: '',
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, [search, statusFilter]);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await drivesApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setDrives(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await companiesApi.getAll();
      setCompanies(res.data);
      if (res.data.length > 0 && !formData.company_id) {
        setFormData((prev) => ({ ...prev, company_id: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingDrive(null);
    setFormData({
      company_id: companies[0]?.id || '',
      job_title: '',
      job_description: '',
      job_location: 'Bengaluru / Hybrid',
      package_lpa: '',
      min_cgpa: '7.0',
      eligible_departments: 'Computer Science, Information Technology',
      eligible_batch_year: 2026,
      application_deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16),
      drive_date: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 16),
      status: 'UPCOMING',
      max_positions: '10',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setFormData({
      company_id: drive.company_id,
      job_title: drive.job_title,
      job_description: drive.job_description,
      job_location: drive.job_location,
      package_lpa: drive.package_lpa,
      min_cgpa: drive.min_cgpa,
      eligible_departments: drive.eligible_departments,
      eligible_batch_year: drive.eligible_batch_year,
      application_deadline: drive.application_deadline ? new Date(drive.application_deadline).toISOString().slice(0, 16) : '',
      drive_date: drive.drive_date ? new Date(drive.drive_date).toISOString().slice(0, 16) : '',
      status: drive.status,
      max_positions: drive.max_positions || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        ...formData,
        company_id: parseInt(formData.company_id),
        package_lpa: parseFloat(formData.package_lpa),
        min_cgpa: parseFloat(formData.min_cgpa),
        eligible_batch_year: parseInt(formData.eligible_batch_year),
        max_positions: formData.max_positions ? parseInt(formData.max_positions) : null,
        application_deadline: new Date(formData.application_deadline).toISOString(),
        drive_date: formData.drive_date ? new Date(formData.drive_date).toISOString() : null,
      };

      if (editingDrive) {
        await drivesApi.update(editingDrive.id, payload);
      } else {
        await drivesApi.create(payload);
      }
      setIsModalOpen(false);
      fetchDrives();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save placement drive.');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete drive "${title}"? All submitted applications will be removed.`)) {
      try {
        await drivesApi.delete(id);
        fetchDrives();
      } catch (err) {
        alert('Failed to delete drive.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-sm text-slate-500">Create, monitor, and manage campus recruitment drives</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post Placement Drive</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives by job role or company..."
            className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 border rounded-lg bg-slate-50 outline-none text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing / Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <LoadingSpinner text="Loading placement drives..." />
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No drives match your filters</p>
          <p className="text-xs text-slate-400 mt-1">Post a new drive to start accepting student applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {drives.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                      {d.company.name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{d.job_title}</h3>
                  </div>
                  <StatusBadge status={d.status} type="drive" />
                </div>

                {/* Badges / Highlights */}
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>₹{d.package_lpa} LPA</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    <span>Min CGPA: {d.min_cgpa}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                    <Users className="w-3.5 h-3.5" />
                    <span>{d.applicants_count || 0} Applicants</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-4 line-clamp-2">
                  {d.job_description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Eligible Branches:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">{d.eligible_departments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deadline:</span>
                    <span className="font-semibold text-rose-600">
                      {new Date(d.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Edit Drive"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id, d.job_title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Drive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  to={`/admin/drives/${d.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Manage Applicants</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Drive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDrive ? 'Edit Placement Drive' : 'Create New Placement Drive'}
        maxWidth="max-w-3xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{formError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hiring Company *</label>
              <select
                required
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Designation *</label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g. Associate Software Engineer"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CTC Package (LPA) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.package_lpa}
                onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                placeholder="e.g. 12.5"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA Required *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.min_cgpa}
                onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                placeholder="e.g. 7.5"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Eligible Batch Year *</label>
              <input
                type="number"
                required
                value={formData.eligible_batch_year}
                onChange={(e) => setFormData({ ...formData, eligible_batch_year: e.target.value })}
                placeholder="2026"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Location *</label>
              <input
                type="text"
                required
                value={formData.job_location}
                onChange={(e) => setFormData({ ...formData, job_location: e.target.value })}
                placeholder="e.g. Bengaluru, Remote"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline *</label>
              <input
                type="datetime-local"
                required
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:border-indigo-600"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Eligible Departments (Comma separated or 'All') *
            </label>
            <input
              type="text"
              required
              value={formData.eligible_departments}
              onChange={(e) => setFormData({ ...formData, eligible_departments: e.target.value })}
              placeholder="e.g. Computer Science, Information Technology, Electronics"
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description & Requirements *</label>
            <textarea
              rows={4}
              required
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              placeholder="Detailed description, interview rounds, required technical skills..."
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
            />
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
              {editingDrive ? 'Save Changes' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
