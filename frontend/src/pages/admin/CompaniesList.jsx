import React, { useState, useEffect } from 'react';
import { companiesApi } from '../../api/client';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Building2, Plus, Search, Globe, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';

export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    description: '',
    logo_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.getAll({ search: search || undefined });
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      industry: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      location: '',
      description: '',
      logo_url: '',
      is_active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name || '',
      industry: comp.industry || '',
      website: comp.website || '',
      contact_email: comp.contact_email || '',
      contact_phone: comp.contact_phone || '',
      location: comp.location || '',
      description: comp.description || '',
      logo_url: comp.logo_url || '',
      is_active: comp.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingCompany) {
        await companiesApi.update(editingCompany.id, formData);
      } else {
        await companiesApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save company.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? All associated drives will also be deleted.`)) {
      try {
        await companiesApi.delete(id);
        fetchCompanies();
      } catch (err) {
        alert('Failed to delete company.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Companies</h1>
          <p className="text-sm text-slate-500">Manage corporate partners and hiring organizations</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name, industry, or location..."
          className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading partner companies..." />
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No companies found</p>
          <p className="text-xs text-slate-400 mt-1">Add your first recruiting company or clear your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{c.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {c.industry}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Edit Company"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                  {c.description || 'No corporate description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {c.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>
                  )}
                  {c.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.contact_email}</span>
                    </div>
                  )}
                  {c.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {c.website && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <a
                    href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visit Website</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Edit Partner Company' : 'Add New Partner Company'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{formError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Google India"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector *</label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Software & Cloud"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://company.com"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="recruiter@company.com"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+91-..."
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Office</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru, Hyderabad"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of company and products..."
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
              {editingCompany ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
