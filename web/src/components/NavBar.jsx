import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Train,
  Newspaper,
  Clock,
  Package,
  Layers,
  Users
} from "lucide-react";

export default function SideBar() {
  const [newsOpen, setNewsOpen] = useState(false);

  const handleNewsClick = () => {
    setNewsOpen(prev => !prev);
  };

  const handleItemClick = () => {
    setNewsOpen(false); // auto close after navigation
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-6 text-2xl font-bold tracking-wide text-white border-b border-slate-700">
        <span className="text-emerald-400">Rail</span>Pulse
      </div>

      {/* Menu */}
      <ul className="flex-1 px-4 py-6 space-y-2 text-white font-medium">

        {/* Train */}
        <li>
          <Link
            to="/train"
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300
            hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Train size={20} />
            Train
          </Link>
        </li>

        {/* Users */}
        <li>
          <Link
            to="/user"
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300
            hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Users size={20} />
            Users
          </Link>
        </li>

        {/* News */}
        <li>
          <button
            onClick={handleNewsClick}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-300
            hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <span className="flex items-center gap-3">
              <Newspaper size={20} />
              News
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${newsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`ml-6 mt-2 space-y-1 overflow-hidden transition-all duration-300
            ${newsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
          >
            <Link
              to="/localnews"
              onClick={handleItemClick}
              className="block px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-300
              hover:bg-emerald-500 hover:text-black"
            >
              Local News
            </Link>

            <Link
              to="/trainnews"
              onClick={handleItemClick}
              className="block px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-300
              hover:bg-emerald-500 hover:text-black"
            >
              Train News
            </Link>
          </div>
        </li>

        {/* Time Table */}
        <li>
          <Link
            to="/timetable"
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300
            hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Clock size={20} />
            Time Table
          </Link>
        </li>

        {/* Lost */}
        <li>
          <Link
            to="/lost"
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300
            hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Package size={20} />
            Lost
          </Link>
        </li>

        {/* Others */}
        <li>
          <Link
            to="/others"
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300
            hover:bg-emerald-500/10 hover:text-emerald-400"
          >
            <Layers size={20} />
            Others
          </Link>
        </li>

      </ul>

      {/* Footer */}
      <div className="px-4 py-4 text-xs text-slate-400 border-t border-slate-700">
        © RailPulse System
      </div>
    </div>
  );
}
