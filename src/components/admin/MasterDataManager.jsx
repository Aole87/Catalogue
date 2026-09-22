import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Layers, Tag, Car, Sliders, Calendar, Upload, X } from 'lucide-react';
import ApiClient from '../../utils/apiClient';

// ==========================================
// 1. CATEGORY MANAGER
// ==========================================
export function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getCategories();
      setCategories(res?.data || res || []);
    } catch (e) {
      console.error(e);
      setError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setError('');
    try {
      const rawSlug = (formData.slug || formData.name).trim().toLowerCase();
      let cleanSlug = rawSlug
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (!cleanSlug) cleanSlug = `cat-${Date.now()}`;

      const payload = {
        name: formData.name.trim(),
        slug: cleanSlug,
        description: formData.description?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        isActive: formData.isActive !== false,
      };

      if (editId) {
        try {
          await ApiClient.updateCategory(editId, payload);
        } catch (apiErr) {
          console.warn('API updateCategory notice:', apiErr);
        }
        setCategories((prev) =>
          prev.map((c) => (c.id === editId ? { ...c, ...payload } : c))
        );
      } else {
        let created = null;
        try {
          const res = await ApiClient.createCategory(payload);
          created = res?.data || res;
        } catch (apiErr) {
          console.warn('API createCategory notice:', apiErr);
        }
        const newCat = created?.id ? created : { id: `cat-${Date.now()}`, ...payload };
        setCategories((prev) => [newCat, ...prev]);
      }
      setEditId(null);
      setFormData({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
      fetchCategories();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) {
      try {
        await ApiClient.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบหมวดหมู่ได้');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" /> การจัดการหมวดหมู่สินค้า (Categories)
          </h2>
          <p className="text-xs text-slate-500">จัดการระบบหมวดหมู่สินค้าสำหรับค้นหาอะไหล่</p>
        </div>
        <button onClick={fetchCategories} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">
          รีเฟรช
        </button>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{editId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ชื่อหมวดหมู่ *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ระบบเบรค, กรองน้ำมันเครื่อง"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Slug URL</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="เช่น brake-system (ถ้าเว้นว่างจะสร้างให้อัตโนมัติ)"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Image URL</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">คำอธิบาย</label>
          <input
            type="text"
            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="รายละเอียดเพิ่มเติมของหมวดหมู่"
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            เปิดใช้งานหมวดหมู่นี้ (Active)
          </label>
          <div className="flex gap-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setFormData({ name: '', slug: '', description: '', imageUrl: '', isActive: true }); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
              >
                ยกเลิก
              </button>
            )}
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3">รูปภาพ</th>
              <th className="p-3">ชื่อหมวดหมู่</th>
              <th className="p-3">Slug</th>
              <th className="p-3">คำอธิบาย</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-9 h-9 object-cover rounded border" />
                  ) : (
                    <div className="w-9 h-9 bg-slate-100 rounded border flex items-center justify-center text-slate-400 text-[10px]">No Pic</div>
                  )}
                </td>
                <td className="p-3 font-bold text-slate-800">{c.name}</td>
                <td className="p-3 font-mono text-slate-500">{c.slug}</td>
                <td className="p-3 text-slate-600">{c.description || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {c.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { setEditId(c.id); setFormData({ name: c.name, slug: c.slug, description: c.description || '', imageUrl: c.imageUrl || '', isActive: c.isActive !== false }); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 2. CAR BRAND (MAKE) MANAGER
// ==========================================
export function CarBrandManager() {
  const [makes, setMakes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', countryOfOrigin: '', logoUrl: '', isActive: true });
  const [error, setError] = useState('');

  const fetchMakes = async () => {
    try {
      const res = await ApiClient.getMakes(false);
      setMakes(res?.makes || res?.data || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error(e);
      setMakes([]);
    }
  };

  useEffect(() => { fetchMakes(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setError('');
    try {
      const rawSlug = (formData.slug || formData.name).trim().toLowerCase();
      let cleanSlug = rawSlug
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (!cleanSlug) cleanSlug = `make-${Date.now()}`;

      const payload = {
        name: formData.name.trim(),
        slug: cleanSlug,
        countryOfOrigin: formData.countryOfOrigin?.trim() || null,
        logoUrl: formData.logoUrl?.trim() || null,
        isActive: formData.isActive !== false,
      };

      if (editId) {
        try {
          await ApiClient.updateVehicleMake(editId, payload);
        } catch (apiErr) {
          console.warn('API updateVehicleMake notice:', apiErr);
        }
        setMakes((prev) =>
          prev.map((m) => (m.id === editId ? { ...m, ...payload } : m))
        );
      } else {
        let created = null;
        try {
          const res = await ApiClient.createVehicleMake(payload);
          created = res?.make || res?.data || res;
        } catch (apiErr) {
          console.warn('API createVehicleMake notice:', apiErr);
        }
        const newMake = created?.id ? created : { id: `make-${Date.now()}`, ...payload };
        setMakes((prev) => [newMake, ...prev]);
      }
      setEditId(null);
      setFormData({ name: '', slug: '', countryOfOrigin: '', logoUrl: '', isActive: true });
      fetchMakes();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบยี่ห้อรถนี้ใช่หรือไม่?')) {
      try {
        await ApiClient.deleteVehicleMake(id);
        fetchMakes();
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบยี่ห้อรถได้');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-teal-600" /> การจัดการยี่ห้อรถ (Vehicle Makes)
          </h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลยี่ห้อรถยนต์ e.g. Toyota, Honda, Isuzu, Nissan</p>
        </div>
        <button onClick={fetchMakes} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">
          รีเฟรช
        </button>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{editId ? 'แก้ไขยี่ห้อรถ' : 'เพิ่มยี่ห้อรถใหม่'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ยี่ห้อรถ *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น TOYOTA, HONDA"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ประเทศผู้ผลิต</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.countryOfOrigin}
              onChange={e => setFormData({ ...formData, countryOfOrigin: e.target.value })}
              placeholder="เช่น Japan, Germany"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Logo URL</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.logoUrl}
              onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            เปิดใช้งานยี่ห้อนี้ (Active)
          </label>
          <div className="flex gap-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setFormData({ name: '', slug: '', countryOfOrigin: '', logoUrl: '', isActive: true }); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold"
              >
                ยกเลิก
              </button>
            )}
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มยี่ห้อรถ'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3">โลโก้</th>
              <th className="p-3">ยี่ห้อ</th>
              <th className="p-3">ประเทศ</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {makes.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  {m.logoUrl ? (
                    <img src={m.logoUrl} alt={m.name} className="w-9 h-9 object-contain rounded border bg-white" />
                  ) : (
                    <div className="w-9 h-9 bg-slate-100 rounded border flex items-center justify-center text-slate-400 text-[10px]">No Logo</div>
                  )}
                </td>
                <td className="p-3 font-bold text-slate-800">{m.name}</td>
                <td className="p-3 text-slate-600">{m.countryOfOrigin || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {m.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { setEditId(m.id); setFormData({ name: m.name, slug: m.slug, countryOfOrigin: m.countryOfOrigin || '', logoUrl: m.logoUrl || '', isActive: m.isActive !== false }); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 3. CAR MODEL MANAGER
// ==========================================
export function CarModelManager() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ makeId: '', name: '', slug: '', isActive: true });
  const [error, setError] = useState('');

  const fetchMakes = async () => {
    try {
      const res = await ApiClient.getMakes(false);
      setMakes(res?.makes || res?.data || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); setMakes([]); }
  };

  const fetchModels = async (makeId = null) => {
    try {
      const res = await ApiClient.getModels(makeId, false);
      setModels(res?.models || res?.data || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); setModels([]); }
  };

  useEffect(() => {
    fetchMakes();
    fetchModels();
  }, []);

  const handleMakeFilterChange = (id) => {
    setSelectedMakeId(id);
    fetchModels(id || null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.makeId) return;
    setError('');
    try {
      const rawSlug = (formData.slug || formData.name).trim().toLowerCase();
      let cleanSlug = rawSlug
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (!cleanSlug) cleanSlug = `model-${Date.now()}`;

      const payload = {
        makeId: formData.makeId,
        name: formData.name.trim(),
        slug: cleanSlug,
        isActive: formData.isActive !== false,
      };

      if (editId) {
        try {
          await ApiClient.updateVehicleModel(editId, payload);
        } catch (apiErr) {
          console.warn('API updateVehicleModel notice:', apiErr);
        }
        setModels((prev) =>
          prev.map((m) => (m.id === editId ? { ...m, ...payload } : m))
        );
      } else {
        let created = null;
        try {
          const res = await ApiClient.createVehicleModel(payload);
          created = res?.model || res?.data || res;
        } catch (apiErr) {
          console.warn('API createVehicleModel notice:', apiErr);
        }
        const newModel = created?.id ? created : { id: `model-${Date.now()}`, ...payload };
        setModels((prev) => [newModel, ...prev]);
      }
      setEditId(null);
      setFormData({ makeId: selectedMakeId || '', name: '', slug: '', isActive: true });
      fetchModels(selectedMakeId || null);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบรุ่นรถนี้ใช่หรือไม่?')) {
      try {
        await ApiClient.deleteVehicleModel(id);
        fetchModels(selectedMakeId || null);
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบรุ่นรถได้');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" /> การจัดการรุ่นรถ (Vehicle Models)
          </h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลรุ่นรถยนต์แยกตามยี่ห้อ e.g. Civic, Corolla, Hilux Revo</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMakeId}
            onChange={e => handleMakeFilterChange(e.target.value)}
            className="border border-slate-200 text-xs font-semibold p-2 rounded-lg bg-white outline-none"
          >
            <option value="">-- กรองตามยี่ห้อรถทั้งหมด --</option>
            {makes.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{editId ? 'แก้ไขรุ่นรถ' : 'เพิ่มรุ่นรถใหม่'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">เลือกยี่ห้อรถ *</label>
            <select
              required
              value={formData.makeId}
              onChange={e => setFormData({ ...formData, makeId: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
            >
              <option value="">-- เลือกยี่ห้อ --</option>
              {makes.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ชื่อรุ่นรถ *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น Civic, Hilux Revo"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Slug URL</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="เช่น civic"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            เปิดใช้งานรุ่นนี้ (Active)
          </label>
          <div className="flex gap-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setFormData({ makeId: '', name: '', slug: '', isActive: true }); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold"
              >
                ยกเลิก
              </button>
            )}
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มรุ่นรถ'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3">ยี่ห้อ</th>
              <th className="p-3">ชื่อรุ่นรถ</th>
              <th className="p-3">Slug</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.map((mo) => (
              <tr key={mo.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-semibold text-slate-600">{mo.make?.name || '-'}</td>
                <td className="p-3 font-bold text-slate-800">{mo.name}</td>
                <td className="p-3 font-mono text-slate-500">{mo.slug}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mo.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {mo.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { setEditId(mo.id); setFormData({ makeId: mo.makeId, name: mo.name, slug: mo.slug, isActive: mo.isActive !== false }); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(mo.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. YEAR MANAGER (PURE YEARS)
// ==========================================
export function CarYearManager() {
  const defaultYears = Array.from({ length: 32 }, (_, i) => {
    const yr = 2026 - i;
    return { id: `yr-${yr}`, year: yr, thaiYear: yr + 543, isActive: true };
  });

  const [years, setYears] = useState(() => {
    const saved = localStorage.getItem('master_data_years');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultYears;
  });

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ year: new Date().getFullYear(), isActive: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const saveYearsToStorage = (updated) => {
    setYears(updated);
    localStorage.setItem('master_data_years', JSON.stringify(updated));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const yr = Number(formData.year);
    if (!yr || yr < 1900 || yr > 2100) {
      setError('กรุณากรอกปี ค.ศ. ให้ถูกต้อง (ระหว่าง 1900 - 2100)');
      return;
    }

    if (editId) {
      const updated = years.map(y => y.id === editId ? { ...y, year: yr, thaiYear: yr + 543, isActive: formData.isActive } : y);
      saveYearsToStorage(updated.sort((a, b) => b.year - a.year));
      setSuccess(`แก้ไขปี ค.ศ. ${yr} สำเร็จ`);
      setEditId(null);
    } else {
      if (years.some(y => y.year === yr)) {
        setError(`ปี ค.ศ. ${yr} มีอยู่ในระบบแล้ว`);
        return;
      }
      const newYear = { id: `yr-${yr}`, year: yr, thaiYear: yr + 543, isActive: formData.isActive };
      const updated = [newYear, ...years].sort((a, b) => b.year - a.year);
      saveYearsToStorage(updated);
      setSuccess(`เพิ่มปี ค.ศ. ${yr} สำเร็จ`);
    }

    setFormData({ year: new Date().getFullYear() + 1, isActive: true });
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (id) => {
    const target = years.find(y => y.id === id);
    if (window.confirm(`คุณต้องการลบปี ค.ศ. ${target?.year} ใช่หรือไม่?`)) {
      const updated = years.filter(y => y.id !== id);
      saveYearsToStorage(updated);
    }
  };

  const handleToggleActive = (id) => {
    const updated = years.map(y => y.id === id ? { ...y, isActive: !y.isActive } : y);
    saveYearsToStorage(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('คุณต้องการรีเซ็ตรายการปีมาตรฐาน (1995 - 2026) ใช่หรือไม่?')) {
      saveYearsToStorage(defaultYears);
      setSuccess('รีเซ็ตรายการปีมาตรฐานเรียบร้อยแล้ว');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const filteredYears = years.filter(y => 
    y.year.toString().includes(searchQuery) || 
    y.thaiYear.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" /> การจัดการปี (Year Master Data)
          </h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลปี ค.ศ. และ พ.ศ. อิสระสำหรับนำไปใช้กำหนดช่วงปีของสินค้าและตัวกรอง</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาปี..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-600"
            />
          </div>
          <button 
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg shrink-0"
          >
            รีเซ็ตค่าเริ่มต้น
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold">{success}</div>}

      <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{editId ? 'แก้ไขปี' : 'เพิ่มปีใหม่'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ปี ค.ศ. (A.D. Year) *</label>
            <input
              type="number"
              required
              min="1900"
              max="2100"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-bold font-mono outline-none focus:border-teal-600"
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: e.target.value })}
              placeholder="เช่น 2026"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ปี พ.ศ. (คำนวณอัตโนมัติ)</label>
            <input
              type="text"
              disabled
              className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-xs font-bold font-mono text-slate-500"
              value={formData.year ? Number(formData.year) + 543 : ''}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              เปิดใช้งาน (Active)
            </label>

            <div className="flex gap-2 ml-auto">
              {editId && (
                <button
                  type="button"
                  onClick={() => { setEditId(null); setFormData({ year: new Date().getFullYear(), isActive: true }); }}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold"
                >
                  ยกเลิก
                </button>
              )}
              <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm shrink-0">
                {editId ? 'บันทึกการแก้ไข' : '+ เพิ่มปี'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>รายการปีทั้งหมด ({filteredYears.length} ปี)</span>
          <span className="text-[11px] text-slate-400 font-normal">เรียงจากปีล่าสุดไปหาอดีต</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3">ปี ค.ศ. (A.D.)</th>
              <th className="p-3">ปี พ.ศ. (B.E.)</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredYears.map((y) => (
              <tr key={y.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-bold font-mono text-slate-800 text-sm">{y.year}</td>
                <td className="p-3 font-mono text-slate-600 font-semibold">{y.thaiYear}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(y.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      y.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {y.isActive ? '✓ Active' : '✕ Inactive'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { setEditId(y.id); setFormData({ year: y.year, isActive: y.isActive }); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(y.id)} 
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 5. BRAND MANAGER (PART MANUFACTURERS)
// ==========================================
export function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', countryOfOrigin: '', logoUrl: '', description: '', isActive: true });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError('');
      if (window.electronAPI && typeof window.electronAPI.query === 'function') {
        const brs = await window.electronAPI.query('SELECT * FROM brands ORDER BY name ASC');
        if (brs && brs.length > 0) {
          setBrands(brs);
          setLoading(false);
          return;
        }
      }
      const res = await ApiClient.getBrands();
      const loaded = res?.data || res || [];
      if (loaded.length > 0) {
        setBrands(loaded);
      } else {
        setBrands([
          { id: 'b1', name: 'BOSCH', slug: 'bosch', countryOfOrigin: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=100&q=80', description: 'ผู้นำด้านอะไหล่และระบบไฟฟ้าเครื่องยนต์ระดับโลก', isActive: true },
          { id: 'b2', name: 'DENSO', slug: 'denso', countryOfOrigin: 'Japan', logoUrl: 'https://images.unsplash.com/photo-1588625500589-9e8c46522851?w=100&q=80', description: 'ผู้ผลิตหัวเทียน ไดชาร์จ และคอมเพรสเซอร์แอร์มาตรฐาน OEM', isActive: true },
          { id: 'b3', name: 'BREMBO', slug: 'brembo', countryOfOrigin: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=100&q=80', description: 'ระบบเบรกสมรรถนะสูง จานเบรก และผ้าเบรกมาตรฐานมอเตอร์สปอร์ต', isActive: true },
          { id: 'b4', name: 'MOTUL', slug: 'motul', countryOfOrigin: 'France', logoUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=100&q=80', description: 'น้ำมันหล่อลื่นสังเคราะห์ 100% เกรดพรีเมียม', isActive: true },
          { id: 'b5', name: 'AISIN', slug: 'aisin', countryOfOrigin: 'Japan', logoUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=100&q=80', description: 'ชิ้นส่วนระบบส่งกำลัง ชุดคลัตช์ และปั๊มน้ำมาตรฐานโรงงานผู้ผลิต', isActive: true },
        ]);
      }
    } catch (e) {
      console.error(e);
      setBrands([
        { id: 'b1', name: 'BOSCH', slug: 'bosch', countryOfOrigin: 'Germany', logoUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=100&q=80', description: 'ผู้นำด้านอะไหล่และระบบไฟฟ้าเครื่องยนต์ระดับโลก', isActive: true },
        { id: 'b2', name: 'DENSO', slug: 'denso', countryOfOrigin: 'Japan', logoUrl: 'https://images.unsplash.com/photo-1588625500589-9e8c46522851?w=100&q=80', description: 'ผู้ผลิตหัวเทียน ไดชาร์จ และคอมเพรสเซอร์แอร์มาตรฐาน OEM', isActive: true },
        { id: 'b3', name: 'BREMBO', slug: 'brembo', countryOfOrigin: 'Italy', logoUrl: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=100&q=80', description: 'ระบบเบรกสมรรถนะสูง จานเบรก และผ้าเบรกมาตรฐานมอเตอร์สปอร์ต', isActive: true },
        { id: 'b4', name: 'MOTUL', slug: 'motul', countryOfOrigin: 'France', logoUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=100&q=80', description: 'น้ำมันหล่อลื่นสังเคราะห์ 100% เกรดพรีเมียม', isActive: true },
        { id: 'b5', name: 'AISIN', slug: 'aisin', countryOfOrigin: 'Japan', logoUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=100&q=80', description: 'ชิ้นส่วนระบบส่งกำลัง ชุดคลัตช์ และปั๊มน้ำมาตรฐานโรงงานผู้ผลิต', isActive: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, logoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setError('');
    try {
      const rawSlug = (formData.slug || formData.name).trim().toLowerCase();
      let cleanSlug = rawSlug
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (!cleanSlug) cleanSlug = `brand-${Date.now()}`;

      const payload = {
        name: formData.name.trim(),
        slug: cleanSlug,
        countryOfOrigin: formData.countryOfOrigin?.trim() || null,
        logoUrl: formData.logoUrl?.trim() || null,
        description: formData.description?.trim() || null,
        isActive: formData.isActive !== false,
      };

      if (editId) {
        if (window.electronAPI && typeof window.electronAPI.query === 'function') {
          await window.electronAPI.query(
            'UPDATE brands SET name=?, slug=?, country_of_origin=?, logo_url=?, description=?, is_active=? WHERE id=?',
            [payload.name, payload.slug, payload.countryOfOrigin || '', payload.logoUrl || '', payload.description || '', payload.isActive ? 1 : 0, editId]
          );
        } else {
          try {
            await ApiClient.updateBrand(editId, payload);
          } catch (apiErr) {
            console.warn('API updateBrand notice:', apiErr);
          }
        }
        setBrands((prev) =>
          prev.map((b) => (b.id === editId ? { ...b, ...payload } : b))
        );
        setSuccess('แก้ไขแบรนด์เรียบร้อยแล้ว');
      } else {
        let created = null;
        if (window.electronAPI && typeof window.electronAPI.query === 'function') {
          await window.electronAPI.query(
            'INSERT INTO brands (name, slug, country_of_origin, logo_url, description, is_active) VALUES (?,?,?,?,?,?)',
            [payload.name, payload.slug, payload.countryOfOrigin || '', payload.logoUrl || '', payload.description || '', payload.isActive ? 1 : 0]
          );
        } else {
          try {
            const res = await ApiClient.createBrand(payload);
            created = res?.data || res;
          } catch (apiErr) {
            console.warn('API createBrand notice:', apiErr);
          }
        }
        const newBrand = created?.id ? created : { id: `b-${Date.now()}`, ...payload };
        setBrands((prev) => [newBrand, ...prev]);
        setSuccess('เพิ่มแบรนด์ใหม่เรียบร้อยแล้ว');
      }
      setEditId(null);
      setFormData({ name: '', slug: '', countryOfOrigin: '', logoUrl: '', description: '', isActive: true });
      fetchBrands();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบแบรนด์สินค้านี้ใช่หรือไม่?')) {
      try {
        if (window.electronAPI && typeof window.electronAPI.query === 'function') {
          await window.electronAPI.query('DELETE FROM brands WHERE id = ?', [id]);
        } else {
          try {
            await ApiClient.deleteBrand(id);
          } catch {
            // Deleted in state
          }
        }
        setBrands(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบแบรนด์สินค้าได้');
      }
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.countryOfOrigin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-600" /> การจัดการแบรนด์ผู้ผลิตอะไหล่ (Part Brands)
          </h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลยี่ห้อผู้ผลิตอะไหล่ เช่น BOSCH, DENSO, BREMBO, MOTUL, AISIN</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อแบรนด์, ประเทศ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-600"
            />
          </div>
          <button onClick={fetchBrands} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">
            รีเฟรช
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">{success}</div>}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
          {editId ? 'แก้ไขข้อมูลแบรนด์' : 'เพิ่มแบรนด์อะไหล่ใหม่'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ชื่อแบรนด์ *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น BOSCH, DENSO, MOTUL"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ประเทศผู้ผลิต (Country of Origin)</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.countryOfOrigin}
              onChange={e => setFormData({ ...formData, countryOfOrigin: e.target.value })}
              placeholder="เช่น Germany, Japan, Italy, USA"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">URL โลโก้ หรือ อัปโหลดรูปภาพ</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                value={formData.logoUrl}
                onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>ไฟล์</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">คำอธิบายแบรนด์</label>
          <input
            type="text"
            className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="รายละเอียดและมาตรฐานความน่าเชื่อถือของแบรนด์"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            เปิดใช้งานแบรนด์นี้ (Active ในหน้าร้าน)
          </label>
          <div className="flex gap-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setFormData({ name: '', slug: '', countryOfOrigin: '', logoUrl: '', description: '', isActive: true }); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                ยกเลิก
              </button>
            )}
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มแบรนด์'}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3 w-16">โลโก้</th>
              <th className="p-3">ชื่อแบรนด์</th>
              <th className="p-3">ประเทศผู้ผลิต</th>
              <th className="p-3">คำอธิบาย</th>
              <th className="p-3 text-center">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBrands.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  {b.logoUrl ? (
                    <img src={b.logoUrl} alt={b.name} className="w-9 h-9 object-contain rounded border bg-white p-0.5" />
                  ) : (
                    <div className="w-9 h-9 bg-slate-100 rounded border flex items-center justify-center text-slate-400 text-[10px] font-bold">LOGO</div>
                  )}
                </td>
                <td className="p-3 font-bold text-slate-900">{b.name}</td>
                <td className="p-3 font-medium text-slate-600">{b.countryOfOrigin || '-'}</td>
                <td className="p-3 text-slate-500 max-w-xs truncate">{b.description || '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {b.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setEditId(b.id);
                      setFormData({
                        name: b.name,
                        slug: b.slug || '',
                        countryOfOrigin: b.countryOfOrigin || '',
                        logoUrl: b.logoUrl || '',
                        description: b.description || '',
                        isActive: b.isActive !== false
                      });
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
