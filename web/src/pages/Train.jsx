import { useEffect, useState } from "react";
import API from "../services/api.js";
import { 
  Plus, Edit2, Trash2, Train, MapPin, 
  Clock, Hash, X, Loader2, Search 
} from "lucide-react";
import NavBar from "../components/NavBar.jsx";

export default function TrainPage() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for delete animation
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    trainNumber: "",
    trainName: "",
    line: "Coastal Line",
    fromStation: "",
    toStation: "",
    originDepartureTime: "",
    destinationArrivalTime: "",
    trainType: "Slow",
    expectedSeries: "Unknown",
    expectedClass: "Unknown",
    activeStatus: "Active",
    remarks: ""
  });

  const fetchTrains = async () => {
    try {
      const res = await API.get('/trains');
      setTrains(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trains:', err);
      setLoading(false);
      showToast("❌ Failed to load trains");
    }
  };

  useEffect(() => { fetchTrains(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const runningDays = prev.runningDays.includes(day)
        ? prev.runningDays.filter((d) => d !== day)
        : [...prev.runningDays, day];
      return { ...prev, runningDays };
    });
  };

  // Open Form for Adding
  const handleAddClick = () => {
    setEditMode(false);
    setFormData({
      trainNumber: "",
      trainName: "",
      line: "Coastal Line",
      fromStation: "",
      toStation: "",
      originDepartureTime: "",
      destinationArrivalTime: "",
      trainType: "Slow",
      expectedSeries: "Unknown",
      expectedClass: "Unknown",
      activeStatus: "Active",
      remarks: ""
    });
    setShowForm(true);
  };

  // Open Form for Editing
  const handleEditClick = (train) => {
    setEditMode(true);
    setFormData({
      trainNumber: train.trainNumber || "",
      trainName: train.trainName || "",
      line: train.line || "Coastal Line",
      fromStation: train.fromStation || "",
      toStation: train.toStation || "",
      originDepartureTime: train.originDepartureTime || "",
      destinationArrivalTime: train.destinationArrivalTime || "",
      trainType: train.trainType || "Slow",
      expectedSeries: train.expectedSeries || "Unknown",
      expectedClass: train.expectedClass || "Unknown",
      activeStatus: train.activeStatus || "Active",
      remarks: train.remarks || "",
      _id: train._id
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/trains/${formData._id}`, formData);
        showToast("✅ Train updated successfully");
      } else {
        await API.post('/trains', formData);
        showToast("🚀 New train added to fleet");
      }
      setShowForm(false);
      fetchTrains();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong!";
      showToast(`❌ ${errorMessage}`);
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;

    setDeletingId(id); // Trigger Animation

    setTimeout(async () => {
      try {
        await API.delete(`/trains/${id}`);
        showToast("🗑️ Schedule removed");
        setTrains(prev => prev.filter(t => t._id !== id));
        setDeletingId(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to delete schedule!";
        showToast(`❌ ${errorMessage}`);
        console.error('Error deleting train:', err);
        setDeletingId(null);
      }
    }, 500);
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const filteredTrains = trains.filter((t) => {
    const query = searchTerm.toLowerCase();
    return (
      t.trainName?.toLowerCase().includes(query) ||
      t.trainNumber?.includes(query) ||
      t.line?.toLowerCase().includes(query) ||
      t.fromStation?.toLowerCase().includes(query) ||
      t.toStation?.toLowerCase().includes(query) ||
      t.trainType?.toLowerCase().includes(query)
    );
  });

  return (
    // MAIN LAYOUT CONTAINER
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. SIDEBAR CONTAINER - Fixed Width (w-64) */}
      <div className="w-64 h-full shrink-0 border-r border-slate-800 bg-slate-900">
         <NavBar />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-30 shrink-0">
          <div className="px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                <Train className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Wellcome To <span className="text-indigo-400">RailPulse</span></h1>
            </div>
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} /> Add New Train
            </button>
          </div>
        </nav>

        {/* Scrollable Content - Scrollbar hidden using arbitrary tailwind values */}
        <main className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          
          {/* Stats & Search Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or number..." 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-white placeholder-slate-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg text-slate-300">
                Total Trains: <span className="text-indigo-400 font-bold ml-2">{trains.length}</span>
              </div>
            </div>
          </div>

          {showForm && (
            <section className="mb-8 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{editMode ? "Update Train" : "Add New Train"}</h2>
                    <p className="text-sm text-slate-400 mt-1">Enter schedule details directly in the inline train form.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="self-start md:self-auto rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Train Number</label>
                      <input
                        name="trainNumber"
                        required
                        value={formData.trainNumber}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                         placeholder="e.g. 8302"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Train Name</label>
                      <input
                        name="trainName"
                        value={formData.trainName}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                        placeholder="e.g. Galu Kumari"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Line</label>
                      <select
                        name="line"
                        required
                        value={formData.line}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>Coastal Line</option>
                        <option>Main Line</option>
                        <option>Northern Line</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Train Type</label>
                      <select
                        name="trainType"
                        required
                        value={formData.trainType}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>Slow</option>
                        <option>Express</option>
                        <option>Intercity</option>
                        <option>Night Mail</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">From Station</label>
                      <input
                        name="fromStation"
                        required
                        value={formData.fromStation}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                        placeholder="e.g. Aluthgama"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">To Station</label>
                      <input
                        name="toStation"
                        required
                        value={formData.toStation}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                        placeholder="e.g. Colombo Fort"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Origin Departure Time</label>
                      <input
                        name="originDepartureTime"
                        required
                        value={formData.originDepartureTime}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                        placeholder="e.g. 03:15 AM"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Destination Arrival Time</label>
                      <input
                        name="destinationArrivalTime"
                        required
                        value={formData.destinationArrivalTime}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                        placeholder="e.g. 05:06 AM"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Expected Series</label>
                      <select
                        name="expectedSeries"
                        required
                        value={formData.expectedSeries}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>M</option>
                        <option>S</option>
                        <option>Unknown</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Expected Class</label>
                      <select
                        name="expectedClass"
                        required
                        value={formData.expectedClass}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>M8</option>
                        <option>M10</option>
                        <option>S11</option>
                        <option>S13</option>
                        <option>Unknown</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Active Status</label>
                      <select
                        name="activeStatus"
                        required
                        value={formData.activeStatus}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500 resize-none"
                      placeholder="Optional notes"
                      rows="3"
                    />
                  </div>



                  <div className="pt-4 flex flex-col md:flex-row gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="w-full md:flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-medium">Cancel</button>
                    <button type="submit" className="w-full md:flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20">
                      {editMode ? "Save Changes" : "Create Train"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* Table Container */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
            {loading ? (              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-slate-400">Loading fleet data...</p>
              </div>
            ) : filteredTrains.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Train Details</th>
                      <th className="px-6 py-4 font-semibold text-center">Route & Times</th>
                      <th className="px-6 py-4 font-semibold text-center">Type & Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTrains.map((t) => (
                      <tr 
                        key={t._id} 
                        className={`group transition-all duration-500 ease-out border-l-4 border-transparent 
                        ${deletingId === t._id 
                            ? "bg-blue-600/20 opacity-0 transform translate-x-full border-l-blue-500" 
                            : "hover:bg-slate-800/30 hover:border-l-indigo-500"
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 min-w-[2.5rem] rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                              <Hash size={20} />
                            </div>
                            <div>
                              <div className="text-white font-bold">{t.trainName || '—'}</div>
                              <div className="text-xs text-slate-500 font-mono uppercase">{t.trainNumber}</div>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase">
                                <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300">{t.line}</span>
                                <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300">{t.expectedSeries}/{t.expectedClass}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-slate-300">{t.fromStation} → {t.toStation}</div>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                              <Clock size={14} /> {t.originDepartureTime} - {t.destinationArrivalTime}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center gap-3 text-sm">
                            <div className="text-slate-300">{t.trainType}</div>
                            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] uppercase">
                              <span className={`px-2 py-1 rounded-full ${t.activeStatus === 'Active' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                                {t.activeStatus}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(t)}
                              className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(t._id)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <Train size={48} className="mx-auto mb-4 opacity-20" />
                <p>No trains found in the schedule.</p>
              </div>
            )}
          </div>
        </main>

        {/* Success Toast */}
        {successMsg && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium">
              {successMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

