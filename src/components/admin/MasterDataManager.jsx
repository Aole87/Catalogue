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
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const payload = { ...formData, slug };
      if (editId) {
        await ApiClient.updateCategory(editId, payload);
      } else {
        await ApiClient.createCategory(payload);
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
      setMakes(res?.data || res || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchMakes(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      const payload = { ...formData, slug };
      if (editId) {
        await ApiClient.updateVehicleMake(editId, payload);
      } else {
        await ApiClient.createVehicleMake(payload);
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
      setMakes(res?.data || res || []);
    } catch (e) { console.error(e); }
  };

  const fetchModels = async (makeId = null) => {
    try {
      const res = await ApiClient.getModels(makeId, false);
      setModels(res?.data || res || []);
    } catch (e) { console.error(e); }
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
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      const payload = { ...formData, slug };
      if (editId) {
        await ApiClient.updateVehicleModel(editId, payload);
      } else {
        await ApiClient.createVehicleModel(payload);
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
// 4. CAR YEAR / GENERATION MANAGER
// ==========================================
export function CarYearManager() {
  const [generations, setGenerations] = useState([]);
  const [models, setModels] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ modelId: '', name: '', code: '', startYear: 2018, endYear: 2022, isActive: true });
  const [error, setError] = useState('');

  const fetchGenerations = async () => {
    try {
      const res = await ApiClient.getGenerations(null, false);
      setGenerations(res?.data || res || []);
    } catch (e) { console.error(e); }
  };

  const fetchModels = async () => {
    try {
      const res = await ApiClient.getModels(null, false);
      setModels(res?.data || res || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchGenerations();
    fetchModels();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.modelId) return;
    try {
      const payload = {
        ...formData,
        startYear: Number(formData.startYear),
        endYear: formData.endYear ? Number(formData.endYear) : null,
      };
      if (editId) {
        await ApiClient.updateVehicleGeneration(editId, payload);
      } else {
        await ApiClient.createVehicleGeneration(payload);
      }
      setEditId(null);
      setFormData({ modelId: '', name: '', code: '', startYear: 2018, endYear: 2022, isActive: true });
      fetchGenerations();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบข้อมูลปี/โฉมรถนี้ใช่หรือไม่?')) {
      try {
        await ApiClient.deleteVehicleGeneration(id);
        fetchGenerations();
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบข้อมูลปีรถได้');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" /> การจัดการปีรถ / โฉมรถ (Car Years & Generations)
          </h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลช่วงปีรถและโฉมรถยนต์ e.g. Civic FC (2016-2021), Hilux Revo AN120</p>
        </div>
        <button onClick={fetchGenerations} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">
          รีเฟรช
        </button>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2">{editId ? 'แก้ไขปี/โฉมรถ' : 'เพิ่มปี/โฉมรถใหม่'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">เลือกรุ่นรถ *</label>
            <select
              required
              value={formData.modelId}
              onChange={e => setFormData({ ...formData, modelId: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
            >
              <option value="">-- เลือกรุ่น --</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.make?.name} - {m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ชื่อโฉม/รุ่นย่อย *</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น Civic FC, Revo Rocco"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ปีที่เริ่ม *</label>
            <input
              type="number"
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.startYear}
              onChange={e => setFormData({ ...formData, startYear: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ปีที่สิ้นสุด</label>
            <input
              type="number"
              className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
              value={formData.endYear || ''}
              onChange={e => setFormData({ ...formData, endYear: e.target.value })}
              placeholder="เว้นว่างถ้ารุ่นปัจจุบัน"
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
            เปิดใช้งานโฉมนี้ (Active)
          </label>
          <div className="flex gap-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setFormData({ modelId: '', name: '', code: '', startYear: 2018, endYear: 2022, isActive: true }); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold"
              >
                ยกเลิก
              </button>
            )}
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มโฉม/ปีรถ'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3">รุ่นรถ</th>
              <th className="p-3">โฉม / ชื่อรุ่นย่อย</th>
              <th className="p-3">ช่วงปี</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {generations.map((gen) => (
              <tr key={gen.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-semibold text-slate-600">{gen.model?.make?.name} {gen.model?.name}</td>
                <td className="p-3 font-bold text-slate-800">{gen.name}</td>
                <td className="p-3 font-mono text-slate-600">{gen.startYear} - {gen.endYear || 'ปัจจุบัน'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gen.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                    {gen.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => { setEditId(gen.id); setFormData({ modelId: gen.modelId, name: gen.name, code: gen.code || '', startYear: gen.startYear, endYear: gen.endYear || '', isActive: gen.isActive !== false }); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(gen.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
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
