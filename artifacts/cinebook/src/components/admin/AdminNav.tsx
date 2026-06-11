import { LayoutDashboard, Film, Ticket, Users, Settings, LogOut, Building2, TrendingUp, ScanLine } from "lucide-react";
import { Link } from "wouter";
import { clearSession, getSession } from "@/lib/adminData";

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const session = getSession();
  const isTheater = session?.type === "theater";

  const adminTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "financial", label: "Financial", icon: TrendingUp },
    { id: "movies", label: "Movie Control", icon: Film },
    { id: "theaters", label: "Theaters", icon: Building2 },
    { id: "bookings", label: "Bookings", icon: Ticket },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const theaterTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "revenue", label: "Revenue", icon: TrendingUp },
    { id: "movies", label: "My Movies", icon: Film },
    { id: "bookings", label: "Bookings", icon: Ticket },
    { id: "scanner", label: "QR Scanner", icon: ScanLine },
  ];

  const tabs = isTheater ? theaterTabs : adminTabs;

  const handleExit = () => {
    clearSession();
    window.location.href = "/";
  };

  return (
    <div className="w-full md:w-60 bg-[#0f0f1a] border-r border-white/5 flex flex-col md:h-screen md:sticky md:top-0">
      <div className="p-5 border-b border-white/5">
        <Link href="/" className="font-display font-bold text-lg tracking-tighter text-white flex items-center gap-1.5">
          MOVI KOVA <div className="w-1.5 h-1.5 rounded-full bg-[#f84464]" />
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider border ${
            isTheater
              ? "bg-[#ffc107]/15 text-[#ffc107] border-[#ffc107]/30"
              : "bg-[#f84464]/15 text-[#f84464] border-[#f84464]/30"
          }`}>
            {isTheater ? "THEATER" : "ADMIN"}
          </span>
          {isTheater && session?.theaterName && (
            <span className="text-xs text-gray-400 truncate">{session.theaterName}</span>
          )}
        </div>
      </div>

      <nav className="flex-1 flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-visible">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal w-full text-left
              ${activeTab === item.id
                ? "bg-[#f84464]/15 text-[#f84464] border border-[#f84464]/25"
                : "text-[#9e9e9e] hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            data-testid={`admin-nav-${item.id}`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 hidden md:block">
        <button
          onClick={handleExit}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#9e9e9e] hover:text-red-400 hover:bg-red-400/10 transition-colors"
          data-testid="button-exit-admin"
        >
          <LogOut className="w-4 h-4" /> Exit Panel
        </button>
      </div>
    </div>
  );
}
