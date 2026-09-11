import React, { useState, useEffect } from 'react';
import {
  Users,
  Tag,
  Layers,
  Activity,
  Search,
  Filter,
  Eye,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Award,
  ShoppingBag,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
  PlusCircle
} from 'lucide-react';
import ApiClient from '../../utils/ApiClient';

export default function CrmManager() {
  const [activeSubTab, setActiveSubTab] = useState('customers'); // 'customers', 'segments', 'tags'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customer360, setCustomer360] = useState(null);
  const [customer360Loading, setCustomer360Loading] = useState(false);

  // Tags State
  const [tags, setTags] = useState([]);
  const [tagForm, setTagForm] = useState({ name: '', color: '#3b82f6', description: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);

  // Segments State
  const [segments, setSegments] = useState([]);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    rules: [{ field: 'lifetime_value', operator: 'GTE', value: '5000' }]
  });

  // Assign tag modal
  const [showAssignTagModal, setShowAssignTagModal] = useState(false);
  const [selectedTagToAssign, setSelectedTagToAssign] = useState('');

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.getAdminCustomers({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        limit: 50,
      });
      if (res?.data) {
        setCustomers(res.data.data || []);
        setTotalCustomers(res.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Customer 360
  const fetchCustomer360 = async (id) => {
    try {
      setCustomer360Loading(true);
      setSelectedCustomerId(id);
      const res = await ApiClient.getAdminCustomer360(id);
      if (res?.data) {
        setCustomer360(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setCustomer360Loading(false);
    }
  };

  // Fetch Tags
  const fetchTags = async () => {
    try {
      const res = await ApiClient.getAdminTags();
      if (res?.data) {
        setTags(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Segments
  const fetchSegments = async () => {
    try {
      const res = await ApiClient.getAdminSegments();
      if (res?.data) {
        setSegments(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'customers') {
      fetchCustomers();
      fetchTags();
    } else if (activeSubTab === 'segments') {
      fetchSegments();
    } else if (activeSubTab === 'tags') {
      fetchTags();
    }
  }, [activeSubTab, searchQuery, typeFilter]);

  // Handle Save Tag
  const handleSaveTag = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingTag) {
        await ApiClient.updateAdminTag(editingTag.id, tagForm);
        setSuccess('Tag updated successfully');
      } else {
        await ApiClient.createAdminTag(tagForm);
        setSuccess('Tag created successfully');
      }
      setShowTagModal(false);
      setEditingTag(null);
      setTagForm({ name: '', color: '#3b82f6', description: '' });
      fetchTags();
    } catch (err) {
      setError(err.message || 'Failed to save tag');
    }
  };

  // Handle Delete Tag
  const handleDeleteTag = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    try {
      await ApiClient.deleteAdminTag(id);
      setSuccess('Tag deleted successfully');
      fetchTags();
    } catch (err) {
      setError(err.message || 'Failed to delete tag');
    }
  };

  // Handle Assign Tag to Customer
  const handleAssignTag = async () => {
    if (!selectedCustomerId || !selectedTagToAssign) return;
    try {
      await ApiClient.assignAdminTag(selectedCustomerId, selectedTagToAssign);
      setSuccess('Tag assigned');
      setShowAssignTagModal(false);
      setSelectedTagToAssign('');
      fetchCustomer360(selectedCustomerId);
    } catch (err) {
      setError(err.message || 'Failed to assign tag');
    }
  };

  // Handle Remove Tag from Customer
  const handleRemoveTag = async (tagId) => {
    if (!selectedCustomerId) return;
    try {
      await ApiClient.removeAdminTag(selectedCustomerId, tagId);
      setSuccess('Tag removed');
      fetchCustomer360(selectedCustomerId);
    } catch (err) {
      setError(err.message || 'Failed to remove tag');
    }
  };

  // Handle Save Segment
  const handleSaveSegment = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await ApiClient.createAdminSegment(segmentForm);
      setSuccess('Segment created successfully');
      setShowSegmentModal(false);
      setSegmentForm({
        name: '',
        description: '',
        rules: [{ field: 'lifetime_value', operator: 'GTE', value: '5000' }]
      });
      fetchSegments();
    } catch (err) {
      setError(err.message || 'Failed to create segment');
    }
  };

  // Handle Evaluate Segment
  const handleEvaluateSegment = async (id) => {
    try {
      setLoading(true);
      const res = await ApiClient.evaluateAdminSegment(id);
      setSuccess(`Segment evaluated. Member count: ${res.data?.membersCount ?? 0}`);
      fetchSegments();
    } catch (err) {
      setError(err.message || 'Failed to evaluate segment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('customers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'customers'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({totalCustomers})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('segments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'segments'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Segments ({segments.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('tags')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'tags'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Tags ({tags.length})</span>
          </button>
        </div>

        <div>
          {activeSubTab === 'segments' && (
            <button
              onClick={() => setShowSegmentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b2b] hover:bg-[#ff5500] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Segment</span>
            </button>
          )}
          {activeSubTab === 'tags' && (
            <button
              onClick={() => {
                setEditingTag(null);
                setTagForm({ name: '', color: '#ff6b2b', description: '' });
                setShowTagModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b2b] hover:bg-[#ff5500] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tag</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Customers */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customer Types</option>
              <option value="INDIVIDUAL">Individual (บุคคลธรรมดา)</option>
              <option value="GARAGE">Garage / Workshop (อู่ซ่อมรถ)</option>
              <option value="FLEET">Fleet Operator (ฟลีทรถยนต์)</option>
              <option value="RETAILER">Retailer (ร้านค้าอะไหล่)</option>
            </select>
            <button
              onClick={fetchCustomers}
              className="p-2 text-gray-500 hover:text-[#ff6b2b] bg-gray-50 hover:bg-[#ff6b2b]/10 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Tags</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4 text-right">Lifetime Value</th>
                    <th className="py-3 px-4 text-center">Loyalty Points</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {loading && customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        Loading customers...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{c.email}</div>
                          {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {c.type || 'INDIVIDUAL'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {c.tags && c.tags.length > 0 ? (
                              c.tags.map((t) => (
                                <span
                                  key={t.id || t.tag?.id}
                                  className="px-2 py-0.5 text-xs rounded-md text-white font-medium shadow-sm"
                                  style={{ backgroundColor: t.color || t.tag?.color || '#3b82f6' }}
                                >
                                  {t.name || t.tag?.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {c.totalOrders ?? c.metrics?.totalOrders ?? 0}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          ฿{Number(c.lifetimeValue ?? c.metrics?.lifetimeValue ?? 0).toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-600">
                          {c.loyaltyBalance ?? c.loyaltyAccount?.balance ?? 0} pts
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => fetchCustomer360(c.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0c2b2f]/10 text-[#0c2b2f] hover:bg-[#0c2b2f] hover:text-white rounded-lg text-xs font-semibold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View 360</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Segments */}
      {activeSubTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-base">{seg.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {seg.memberships?.length ?? seg._count?.memberships ?? 0} members
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{seg.description || 'No description provided.'}</p>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Rules ({seg.rules?.length || 0})
                  </div>
                  {seg.rules?.map((rule, idx) => (
                    <div key={idx} className="text-xs font-mono text-gray-700 flex items-center gap-1.5">
                      <span className="font-semibold text-[#0c2b2f]">{rule.field}</span>
                      <span className="text-gray-400">{rule.operator}</span>
                      <span className="text-emerald-700 font-bold">{rule.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  Updated: {new Date(seg.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleEvaluateSegment(seg.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#0c2b2f] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Evaluate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Tags */}
      {activeSubTab === 'tags' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Assigned Customers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tags.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className="inline-block px-3 py-1 text-xs rounded-full font-bold text-white shadow-sm"
                      style={{ backgroundColor: t.color || '#3b82f6' }}
                    >
                      {t.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{t.description || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    {t.assignments?.length ?? t._count?.assignments ?? 0}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingTag(t);
                        setTagForm({ name: t.name, color: t.color || '#3b82f6', description: t.description || '' });
                        setShowTagModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#0c2b2f] rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer 360 Detail Modal */}
      {selectedCustomerId && customer360 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0c2b2f] text-[#2dd4bf] flex items-center justify-center font-bold text-lg">
                  {customer360.profile.firstName?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {customer360.profile.firstName} {customer360.profile.lastName}
                  </h3>
                  <div className="text-xs text-gray-400">{customer360.profile.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setCustomer360(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0c2b2f]/5 border border-[#0c2b2f]/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-[#0c2b2f] text-[#2dd4bf] rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0c2b2f] uppercase">Lifetime Value</div>
                    <div className="text-xl font-extrabold text-[#0c2b2f] font-mono">
                      ฿{Number(customer360.metrics.lifetimeValue || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-700 uppercase">Total Orders</div>
                    <div className="text-xl font-extrabold text-emerald-900">
                      {customer360.metrics.totalOrders || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-amber-600 text-white rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-700 uppercase">Loyalty Points</div>
                    <div className="text-xl font-extrabold text-amber-900">
                      {customer360.loyalty?.balance || 0} pts
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags & Segments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4" /> Assigned Tags
                    </h5>
                    <button
                      onClick={() => setShowAssignTagModal(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Assign Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customer360.tags && customer360.tags.length > 0 ? (
                      customer360.tags.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: t.color || '#3b82f6' }}
                        >
                          {t.name}
                          <button
                            onClick={() => handleRemoveTag(t.id)}
                            className="hover:opacity-80 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No tags assigned.</span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Dynamic Segments
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {customer360.segments && customer360.segments.length > 0 ? (
                      customer360.segments.map((s) => (
                        <span
                          key={s.id}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No segment memberships.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Activity Timeline
                </h5>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 max-h-60 overflow-y-auto divide-y divide-gray-200/60">
                  {customer360.activities && customer360.activities.length > 0 ? (
                    customer360.activities.map((act) => (
                      <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-800">{act.activityType}</div>
                          <div className="text-xs text-gray-500">{act.description || '-'}</div>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {new Date(act.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-4">No logged activity recorded.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTag} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">{editingTag ? 'Edit Tag' : 'Create New Tag'}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tag Name</label>
              <input
                type="text"
                required
                value={tagForm.name}
                onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. VIP, Wholesale, Fleet"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tagForm.color}
                  onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                  className="w-10 h-10 p-0 rounded-lg border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={tagForm.color}
                  onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                  className="flex-1 p-2.5 text-sm font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <textarea
                value={tagForm.description}
                onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Tag purpose or notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20"
              >
                Save Tag
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveSegment} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Create Customer Segment</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Segment Name</label>
              <input
                type="text"
                required
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. High Value VIPs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <textarea
                value={segmentForm.description}
                onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Segment definition..."
              />
            </div>

            {/* Rules list */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Segment Rules</label>
              {segmentForm.rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <select
                    value={rule.field}
                    onChange={(e) => {
                      const newRules = [...segmentForm.rules];
                      newRules[idx].field = e.target.value;
                      setSegmentForm({ ...segmentForm, rules: newRules });
                    }}
                    className="p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="lifetime_value">Lifetime Value (THB)</option>
                    <option value="order_count">Order Count</option>
                    <option value="days_since_last_order">Days Since Last Order</option>
                    <option value="customer_type">Customer Type</option>
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => {
                      const newRules = [...segmentForm.rules];
                      newRules[idx].operator = e.target.value;
                      setSegmentForm({ ...segmentForm, rules: newRules });
                    }}
                    className="p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="GTE">&gt;=</option>
                    <option value="LTE">&lt;=</option>
                    <option value="EQUALS">=</option>
                    <option value="NOT_EQUALS">!=</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={rule.value}
                    onChange={(e) => {
                      const newRules = [...segmentForm.rules];
                      newRules[idx].value = e.target.value;
                      setSegmentForm({ ...segmentForm, rules: newRules });
                    }}
                    className="flex-1 p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSegmentModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20"
              >
                Create Segment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Tag Modal */}
      {showAssignTagModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Assign Tag to Customer</h3>
            <select
              value={selectedTagToAssign}
              onChange={(e) => setSelectedTagToAssign(e.target.value)}
              className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
            >
              <option value="">-- Select Tag --</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignTagModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTag}
                disabled={!selectedTagToAssign}
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
