import { useEffect, useState } from "react";
import API from "../services/api.js";
import {
  Plus, Edit2, Trash2, Train, MapPin,
  Clock, Hash, X, Loader2, Search
} from "lucide-react";
import NavBar from "../components/NavBar.jsx";

export default function TimetablePage() {
  const [timetables, setTimetables] = useState([]);
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
    line: "Coastal Line",
    station: "",
    stopStatus: "Stop",
    timeAtStation: "",
    arrivalTime: "",
    departureTime: "",
    direction: "UP",
    runningDays: [],
    trainType: "Slow",
    activeStatus: "Active"
  });

  const fetchTimetables = async () => {
    try {
      const res = await API.get('/timetables');
      setTimetables(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timetables:', err);
      setLoading(false);
      showToast("❌ Failed to load timetables");
    }
  };

  const fetchTrains = async () => {
    try {
      const res = await API.get('/trains');
      setTrains(res.data.data || []);
    } catch (err) {
      console.error('Error fetching trains:', err);
      showToast("⚠️ Failed to load trains");
    }
  };

  useEffect(() => {
    fetchTimetables();
    fetchTrains();
  }, []);

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

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/timetables/${formData._id}`, formData);
        showToast("✅ Timetable updated successfully");
      } else {
        await API.post('/timetables', formData);
        showToast("🚀 New timetable added");
      }
      setShowForm(false);
      fetchTimetables();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong!";
      showToast(`❌ ${errorMessage}`);
      console.error('Error submitting form:', err);
    }
  };

  // Open Form for Adding
  const handleAddClick = () => {
    setEditMode(false);
    setFormData({
      trainNumber: "",
      line: "Coastal Line",
      station: "",
      stopStatus: "Stop",
      timeAtStation: "",
      arrivalTime: "",
      departureTime: "",
      direction: "UP",
      runningDays: [],
      trainType: "Slow",
      activeStatus: "Active"
    });
    setShowForm(true);
  };

  // Open Form for Editing
  const handleEditClick = (timetable) => {
    setEditMode(true);
    setFormData({
      trainNumber: timetable.trainNumber || "",
      line: timetable.line || "Coastal Line",
      station: timetable.station || "",
      stopStatus: timetable.stopStatus || "Stop",
      timeAtStation: timetable.timeAtStation || "",
      arrivalTime: timetable.arrivalTime || "",
      departureTime: timetable.departureTime || "",
      direction: timetable.direction || "UP",
      runningDays: timetable.runningDays || [],
      trainType: timetable.trainType || "Slow",
      activeStatus: timetable.activeStatus || "Active",
      _id: timetable._id
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timetable?")) return;

    setDeletingId(id); // Trigger Animation

    setTimeout(async () => {
      try {
        await API.delete(`/timetables/${id}`);
        showToast("🗑️ Timetable removed");
        setTimetables(prev => prev.filter(t => t._id !== id));
        setDeletingId(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to delete timetable!";
        showToast(`❌ ${errorMessage}`);
        console.error('Error deleting timetable:', err);
        setDeletingId(null);
      }
    }, 500);
  };

  const filteredTimetables = timetables.filter((t) => {
    const query = searchTerm.toLowerCase();
    return (
      t.trainNumber?.includes(query) ||
      t.line?.toLowerCase().includes(query) ||
      t.station?.toLowerCase().includes(query) ||
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
                <Clock className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Timetable <span className="text-indigo-400">Management</span></h1>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} /> Add New Timetable
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
                placeholder="Search timetables..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-white placeholder-slate-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg text-slate-300">
                Total Timetables: <span className="text-indigo-400 font-bold ml-2">{timetables.length}</span>
              </div>
            </div>
          </div>

          {showForm && (
            <section className="mb-8 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{editMode ? "Update Timetable" : "Add New Timetable"}</h2>
                    <p className="text-sm text-slate-400 mt-1">Enter timetable details.</p>
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
                      <select
                        name="trainNumber"
                        required
                        value={formData.trainNumber}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option value="">Select Train</option>
                        {trains.map(train => (
                          <option key={train._id} value={train.trainNumber}>{train.trainNumber} - {train.trainName}</option>
                        ))}
                      </select>
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Station/Monitoring Location</label>
                      <input
                        name="station"
                        required
                        value={formData.station}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500"
                        placeholder="e.g. Colombo Fort"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Stop Status</label>
                      <select
                        name="stopStatus"
                        required
                        value={formData.stopStatus}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>Stop</option>
                        <option>No Stop</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Time at Station</label>
                      <input
                        type="time"
                        name="timeAtStation"
                        value={formData.timeAtStation}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Arrival Time</label>
                      <input
                        type="time"
                        name="arrivalTime"
                        value={formData.arrivalTime}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Departure Time</label>
                      <input
                        type="time"
                        name="departureTime"
                        value={formData.departureTime}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Direction</label>
                      <select
                        name="direction"
                        required
                        value={formData.direction}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      >
                        <option>UP</option>
                        <option>DOWN</option>
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

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Running Days</label>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.runningDays.includes(day)}
                            onChange={() => handleToggleDay(day)}
                            className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-300">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
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

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                    >
                      {editMode ? "Update Timetable" : "Add Timetable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* Success/Error Toast */}
          {successMsg && (
            <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white animate-in slide-in-from-right-2 duration-300">
              {successMsg}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-400" size={32} />
              <span className="ml-3 text-slate-400">Loading timetables...</span>
            </div>
          ) : (
            /* Timetable Table */
            <section className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Train</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Line</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Station</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Stop Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Times</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Direction</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Running Days</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTimetables.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                          No timetables found. Add your first timetable to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredTimetables.map((timetable) => (
                        <tr key={timetable._id} className={`hover:bg-slate-800/30 transition-colors ${deletingId === timetable._id ? 'opacity-50 scale-95' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-indigo-600/20 rounded-lg">
                                <Train className="text-indigo-400" size={16} />
                              </div>
                              <div>
                                <div className="font-medium text-white">{timetable.trainNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{timetable.line}</td>
                          <td className="px-6 py-4 text-slate-300">{timetable.station}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              timetable.stopStatus === 'Stop'
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {timetable.stopStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            <div className="text-xs">
                              <div>At: {timetable.timeAtStation || '—'}</div>
                              <div>Arr: {timetable.arrivalTime || '—'}</div>
                              <div>Dep: {timetable.departureTime || '—'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{timetable.direction}</td>
                          <td className="px-6 py-4 text-slate-300">
                            <div className="text-xs">
                              {timetable.runningDays?.length > 0 ? timetable.runningDays.join(', ') : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{timetable.trainType}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              timetable.activeStatus === 'Active'
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-gray-600/20 text-gray-400'
                            }`}>
                              {timetable.activeStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditClick(timetable)}
                                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-600/10 rounded-lg transition-colors"
                                title="Edit timetable"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(timetable._id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                                title="Delete timetable"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}