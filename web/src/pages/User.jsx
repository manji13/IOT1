import { useEffect, useState } from "react";
import API from "../services/api.js";
import { 
  Plus, Edit2, Trash2, User, Mail, 
  Lock, X, Loader2, Search, ShieldCheck 
} from "lucide-react";
import NavBar from "../components/NavBar.jsx";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for delete animation
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
      showToast("❌ Failed to load users");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ================= HANDLERS =================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddClick = () => {
    setEditMode(false);
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
    setShowForm(true);
  };

  const handleEditClick = (user) => {
    setEditMode(true);
    setFormData({ 
      _id: user._id,
      fullName: user.fullName, 
      email: user.email, 
      password: "", 
      confirmPassword: "" 
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editMode && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      if (editMode) {
        // Update User
        await API.put(`/auth/users/${formData._id}`, {
          fullName: formData.fullName,
          email: formData.email
        });
        showToast("✅ User details updated successfully");
      } else {
        // Add User
        await API.post('/auth/register', formData);
        showToast("🚀 New user registered successfully");
      }
      
      setShowForm(false);
      fetchUsers(); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Operation failed";
      showToast(`❌ ${errorMessage}`);
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setDeletingId(id); 

    setTimeout(async () => {
      try {
        await API.delete(`/auth/users/${id}`);
        showToast("🗑️ User deleted successfully");
        setUsers(prev => prev.filter(u => u._id !== id));
        setDeletingId(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to delete user";
        showToast(`❌ ${errorMessage}`);
        console.error('Error deleting user:', err);
        setDeletingId(null);
      }
    }, 500);
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <div className="w-64 h-full shrink-0 border-r border-slate-800 bg-slate-900">
         <NavBar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Header */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-30 shrink-0">
          <div className="px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                <User className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">User <span className="text-indigo-400">Management</span></h1>
            </div>
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} /> Add User
            </button>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-white placeholder-slate-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg text-slate-300 text-sm font-medium">
              Total Users: <span className="text-indigo-400 font-bold ml-2">{users.length}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-slate-400">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">User Info</th>
                      <th className="px-6 py-4 font-semibold">Email Contact</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr 
                        key={u._id} 
                        className={`group transition-all duration-500 ease-out border-l-4 border-transparent 
                        ${deletingId === u._id 
                            ? "bg-red-900/20 opacity-0 transform translate-x-full border-l-red-500" 
                            : "hover:bg-slate-800/30 hover:border-l-indigo-500"
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-lg">
                              {u.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-bold">{u.fullName}</div>
                              <div className="text-xs text-slate-500">ID: {u._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail size={14} className="text-slate-500" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck size={12} /> Active
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(u)}
                              className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(u._id)}
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
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>No users found in database.</p>
              </div>
            )}
          </div>
        </main>

        {successMsg && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium">
              {successMsg}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-xl font-bold text-white">{editMode ? "Edit User" : "Register New User"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                  <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500" placeholder="John Doe" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500" placeholder="john@example.com" />
                </div>
              </div>

              {!editMode && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                      <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                      <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-500" placeholder="••••••••" />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20">{editMode ? "Save Changes" : "Register User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}