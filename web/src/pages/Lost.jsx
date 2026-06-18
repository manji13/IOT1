import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Clock, X, Loader2, Search } from "lucide-react";
import NavBar from "../components/NavBar.jsx";
import API from "../services/api";

export default function LostPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ itemDescription: "", lastSeenStation: "", approximateTime: "", trainNumber: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await API.get('/lost');
      setItems(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setEditMode(false); setFormData({ itemDescription: "", lastSeenStation: "", approximateTime: "", trainNumber: "" }); setShowForm(true); };
  const openEdit = (item) => { setEditMode(true); setFormData(item); setShowForm(true); };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/lost/${formData._id}`, formData);
        setSuccessMsg('Item updated');
      } else {
        await API.post('/lost', formData);
        setSuccessMsg('New lost item added');
      }
      setShowForm(false);
      fetchItems();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await API.delete(`/lost/${id}`);
        setItems(prev => prev.filter(i => i._id !== id));
        setSuccessMsg('Item removed');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) { console.error(err); }
      setDeletingId(null);
    }, 400);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      <div className="w-64 h-full shrink-0 border-r border-slate-800 bg-slate-900">
         <NavBar />
      </div>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-30 shrink-0">
          <div className="px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                <MapPin className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Lost & Found</h1>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
              <Plus size={18} /> Report Lost Item
            </button>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="mb-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
              {loading ? (
                <div className="py-10 flex flex-col items-center gap-4"><Loader2 className="animate-spin text-indigo-500" size={36} /><p className="text-slate-400">Loading...</p></div>
              ) : items.length > 0 ? (
                <div className="space-y-4">
                  {items.map(it => (
                    <div key={it._id} className={`p-4 bg-slate-800/30 rounded-lg flex justify-between items-center ${deletingId===it._id? 'opacity-0 translate-x-6':''}`}>
                      <div>
                        <div className="font-bold text-white">{it.itemDescription}</div>
                        <div className="text-sm text-slate-400">Last seen: {it.lastSeenStation} • {it.approximateTime} {it.trainNumber? `• Train ${it.trainNumber}` : ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(it)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(it._id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">No lost items reported yet.</div>
              )}
            </div>
          </div>
        </main>

        {successMsg && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-medium">{successMsg}</div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-xl font-bold text-white">{editMode ? 'Edit Lost Item' : 'Report Lost Item'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Item Description</label>
                <input name="itemDescription" required value={formData.itemDescription} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white" placeholder="e.g. Black backpack" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Last seen Station</label>
                  <input name="lastSeenStation" required value={formData.lastSeenStation} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white" placeholder="e.g. Central Station" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Approximate Time</label>
                  <input name="approximateTime" required value={formData.approximateTime} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white" placeholder="e.g. 07:30 AM" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Train Number (optional)</label>
                <input name="trainNumber" value={formData.trainNumber || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white" placeholder="e.g. 1012" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium">{editMode ? 'Save' : 'Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
