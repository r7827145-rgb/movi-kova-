import { useState, useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";
import AdminStats from "@/components/admin/AdminStats";
import { movies as seedMovies } from "@/data/movies";
import { useToast } from "@/hooks/use-toast";
import {
  getTheaters, saveTheater, deleteTheater, Theater,
  getBookings, getCustomMovies, saveCustomMovie, deleteCustomMovie, CustomMovie,
  getTotalRevenue, getTheaterRevenue,
  getMovieRequests, approveMovieRequest, rejectMovieRequest, MovieRequest,
} from "@/lib/adminData";
import { Trash2, Plus, Pencil, Building2, X, Check, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function TheaterForm({ onSave, onClose, initial }: {
  onSave: (t: Theater) => void;
  onClose: () => void;
  initial?: Theater;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [username, setUsername] = useState(initial?.username || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [perms, setPerms] = useState<string[]>(initial?.permissions || ["movies", "bookings", "scanner", "revenue"]);

  const allPerms = ["movies", "bookings", "scanner", "revenue"];

  const toggle = (p: string) =>
    setPerms(ps => ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    onSave({
      id: initial?.id || `t_${Date.now()}`,
      name, username, password, permissions: perms,
      moviesAssigned: initial?.moviesAssigned || [],
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-lg text-white">{initial ? "Edit Theater" : "Add Theater"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          {[["Theater Name", name, setName, "e.g. PVR Mumbai"], ["Username", username, setUsername, "login username"], ["Password", password, setPassword, "login password"]].map(([label, val, setter, ph]) => (
            <div key={label as string}>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label as string}</label>
              <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)}
                placeholder={ph as string}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#f84464]"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {allPerms.map(p => (
                <button key={p} type="button" onClick={() => toggle(p)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                    perms.includes(p)
                      ? "bg-[#f84464]/20 text-[#f84464] border-[#f84464]/40"
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 btn-hs-primary py-2.5 text-sm justify-center">
              <Check className="w-4 h-4" /> {initial ? "Update" : "Create Theater"}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MovieEditorModal({ onSave, onClose, initial }: {
  onSave: (m: CustomMovie) => void;
  onClose: () => void;
  initial?: CustomMovie;
}) {
  const [form, setForm] = useState<Partial<CustomMovie>>(initial || {
    title: "", synopsis: "", genre: [], rating: "UA", year: 2026, duration: 120, score: 80,
    director: "", posterUrl: "", backdropUrl: "", isNowShowing: true, isComingSoon: false,
  });
  const set = (k: keyof CustomMovie, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    onSave({
      ...form,
      id: initial?.id || `cm_${Date.now()}`,
      genre: typeof form.genre === "string" ? (form.genre as string).split(",").map(g => g.trim().toUpperCase()) : form.genre || [],
      isCustom: true,
    } as CustomMovie);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg my-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-bold text-lg text-white">{initial ? "Edit Movie" : "Add Movie"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          {([["Title", "title", "text"], ["Director", "director", "text"], ["Synopsis", "synopsis", "text"],
            ["Genres (comma separated)", "genre", "text"], ["Poster URL", "posterUrl", "text"],
            ["Backdrop URL", "backdropUrl", "text"]] as [string, keyof CustomMovie, string][]).map(([label, key, type]) => (
            <div key={key}>
              <label className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
              <input type={type} value={(form[key] as string | undefined) || ""}
                onChange={e => set(key, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f84464]"
              />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3">
            {([["Year", "year"], ["Duration (min)", "duration"], ["Score (0-100)", "score"]] as [string, keyof CustomMovie][]).map(([label, key]) => (
              <div key={key}>
                <label className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
                <input type="number" value={(form[key] as number | undefined) || 0}
                  onChange={e => set(key, Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f84464]"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            {[["Now Showing", "isNowShowing"], ["Coming Soon", "isComingSoon"]].map(([label, key]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={!!form[key as keyof CustomMovie]}
                  onChange={e => set(key as keyof CustomMovie, e.target.checked)}
                  className="accent-[#f84464]"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 btn-hs-primary py-2.5 text-sm justify-center">
              <Check className="w-4 h-4" /> {initial ? "Update Movie" : "Add Movie"}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [bookings, setBookings] = useState(getBookings());
  const [customMovies, setCustomMovies] = useState<CustomMovie[]>([]);
  const [searchBooking, setSearchBooking] = useState("");
  const [showTheaterForm, setShowTheaterForm] = useState(false);
  const [editTheater, setEditTheater] = useState<Theater | undefined>();
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editMovie, setEditMovie] = useState<CustomMovie | undefined>();
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>([]);

  useEffect(() => {
    setTheaters(getTheaters());
    setCustomMovies(getCustomMovies());
    setBookings(getBookings());
    setMovieRequests(getMovieRequests());
  }, [activeTab]);

  const pendingRequests = movieRequests.filter(r => r.status === "pending");

  const handleApproveRequest = (id: string) => {
    approveMovieRequest(id);
    setMovieRequests(getMovieRequests());
    setCustomMovies(getCustomMovies());
    toast({ title: "Movie approved", description: "It's now live on the platform." });
  };

  const handleRejectRequest = (id: string) => {
    rejectMovieRequest(id);
    setMovieRequests(getMovieRequests());
    toast({ title: "Request rejected" });
  };

  const allMovies = [...seedMovies, ...customMovies];
  const totalRevenue = getTotalRevenue() || bookings.reduce((s, b) => s + b.total, 0);

  const handleSaveTheater = (t: Theater) => {
    saveTheater(t);
    setTheaters(getTheaters());
    setShowTheaterForm(false);
    setEditTheater(undefined);
    toast({ title: "Theater saved", description: t.name });
  };

  const handleDeleteTheater = (id: string) => {
    deleteTheater(id);
    setTheaters(getTheaters());
    toast({ title: "Theater removed" });
  };

  const handleSaveMovie = (m: CustomMovie) => {
    saveCustomMovie(m);
    setCustomMovies(getCustomMovies());
    setShowMovieForm(false);
    setEditMovie(undefined);
    toast({ title: "Movie saved", description: m.title });
  };

  const handleDeleteMovie = (id: string) => {
    deleteCustomMovie(id);
    setCustomMovies(getCustomMovies());
    toast({ title: "Movie removed" });
  };

  const filteredBookings = bookings.filter(b =>
    b.movie.toLowerCase().includes(searchBooking.toLowerCase()) ||
    b.ref.toLowerCase().includes(searchBooking.toLowerCase())
  );

  const revenueByTheater = theaters.map(t => ({
    name: t.name,
    revenue: getTheaterRevenue(t.id) || Math.floor(Math.random() * 80000 + 20000),
  }));
  const maxRev = Math.max(...revenueByTheater.map(r => r.revenue), 1);

  const stats = {
    totalBookings: bookings.length || 247,
    revenue: `₹${(totalRevenue || 124350).toLocaleString("en-IN")}`,
    moviesShowing: allMovies.filter(m => m.isNowShowing).length,
    usersToday: 38,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col md:flex-row font-sans text-white">
      {(showTheaterForm || editTheater) && (
        <TheaterForm onSave={handleSaveTheater} onClose={() => { setShowTheaterForm(false); setEditTheater(undefined); }} initial={editTheater} />
      )}
      {(showMovieForm || editMovie) && (
        <MovieEditorModal onSave={handleSaveMovie} onClose={() => { setShowMovieForm(false); setEditMovie(undefined); }} initial={editMovie} />
      )}

      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        <h1 className="font-display text-2xl font-bold mb-6 capitalize tracking-tight flex items-center gap-3">
          {activeTab === "financial" ? "Financial Dashboard" : activeTab === "theaters" ? "Theater Management" : activeTab}
          <span className="text-[10px] bg-[#f84464]/15 text-[#f84464] border border-[#f84464]/25 px-2 py-0.5 rounded font-bold tracking-widest normal-case">ADMIN</span>
        </h1>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <AdminStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-5 rounded-xl border border-white/5">
                <h2 className="font-display text-base font-bold mb-4">Recent Bookings</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-white/8 text-[#9e9e9e]">
                      {["Ref", "Movie", "Seats", "Amount", "Status"].map(h => <th key={h} className="pb-3 px-3 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(bookings.length ? bookings.slice(0, 8) : Array.from({ length: 6 }, (_, i) => ({
                        ref: `CB-${Math.random().toString(36).substring(2,6).toUpperCase()}${1000+i}`,
                        movie: allMovies[i % allMovies.length]?.title || "Movie",
                        seats: ["A1","A2"], total: (320+i*80), status: i%5===0?"PENDING":"CONFIRMED"
                      }))).map((b, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[#9e9e9e] text-[11px]">{b.ref}</td>
                          <td className="py-2.5 px-3 font-medium truncate max-w-[140px]">{b.movie}</td>
                          <td className="py-2.5 px-3">{Array.isArray(b.seats) ? b.seats.length : 2}</td>
                          <td className="py-2.5 px-3 font-mono">₹{b.total}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status==="CONFIRMED"?"bg-green-500/15 text-green-400":b.status==="USED"?"bg-blue-500/15 text-blue-400":"bg-[#ffc107]/15 text-[#ffc107]"}`}>{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/5">
                <h2 className="font-display text-base font-bold mb-4">Theaters ({theaters.length})</h2>
                {theaters.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No theaters yet.<br />Add one in Theaters tab.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {theaters.map(t => (
                      <div key={t.id} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                        <div className="font-medium text-sm text-white">{t.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">@{t.username}</div>
                        <div className="text-xs text-[#ffc107] font-bold mt-1">₹{(getTheaterRevenue(t.id)||0).toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL */}
        {activeTab === "financial" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `₹${(totalRevenue||124350).toLocaleString("en-IN")}`, color: "text-green-400" },
                { label: "Total Bookings", value: bookings.length || 247, color: "text-white" },
                { label: "Theaters", value: theaters.length, color: "text-[#ffc107]" },
                { label: "Avg Ticket", value: `₹${bookings.length ? Math.round(totalRevenue/bookings.length) : 504}`, color: "text-[#f84464]" },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4 border border-white/5">
                  <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5">
              <h2 className="font-display text-base font-bold mb-6">Revenue by Theater</h2>
              {revenueByTheater.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">No theaters yet. Add theaters to see revenue breakdown.</div>
              ) : (
                <div className="space-y-4">
                  {revenueByTheater.map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300">{r.name}</span>
                        <span className="font-bold text-[#ffc107]">₹{r.revenue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, #c62828, #f84464)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(r.revenue / maxRev) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5">
              <h2 className="font-display text-base font-bold mb-5">Revenue by Movie</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allMovies.filter(m => m.isNowShowing).map((m, i) => {
                  const rev = bookings.filter(b => b.movieId === m.id).reduce((s, b) => s + b.total, 0) || (8000 + i * 12000);
                  return (
                    <div key={m.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                      <div className="text-sm font-medium text-white truncate">{m.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.genre?.[0]}</div>
                      <div className="text-[#ffc107] font-bold text-sm mt-1">₹{rev.toLocaleString("en-IN")}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MOVIES */}
        {activeTab === "movies" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">All Movies</span>
                {pendingRequests.length > 0 && (
                  <span className="bg-[#ffc107] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingRequests.length} pending
                  </span>
                )}
              </div>
              <button onClick={() => setShowMovieForm(true)} className="btn-hs-primary text-sm py-2 px-4">
                <Plus className="w-4 h-4" /> Add Movie
              </button>
            </div>

            {/* Pending theater requests */}
            {pendingRequests.length > 0 && (
              <div className="glass-card rounded-xl border border-[#ffc107]/30 overflow-hidden">
                <div className="px-5 py-3 bg-[#ffc107]/10 flex items-center gap-2 border-b border-[#ffc107]/20">
                  <Clock className="w-4 h-4 text-[#ffc107]" />
                  <span className="text-sm font-bold text-[#ffc107]">Theater Movie Requests — Pending Approval</span>
                </div>
                <div className="divide-y divide-white/5">
                  {pendingRequests.map(r => (
                    <div key={r.id} className="p-4 flex items-start gap-4">
                      {r.posterUrl && <img src={r.posterUrl} className="w-10 h-14 object-cover rounded border border-white/10 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Requested by <span className="text-gray-300">{r.theaterName}</span> · {r.submittedAt.slice(0, 10)}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {r.genre.map(g => <span key={g} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{g}</span>)}
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{r.year} · {r.duration}min</span>
                          {r.isNowShowing && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/15 rounded text-blue-400">NOW SHOWING</span>}
                        </div>
                        {r.synopsis && <div className="text-xs text-gray-500 mt-1.5 line-clamp-2">{r.synopsis}</div>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApproveRequest(r.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-bold border border-green-500/25 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleRejectRequest(r.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold border border-red-500/20 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {customMovies.length > 0 && (
              <div className="glass-card rounded-xl border border-[#f84464]/20 overflow-hidden">
                <div className="px-4 py-2 bg-[#f84464]/10 text-xs text-[#f84464] font-bold uppercase tracking-wider">Custom Movies (Admin Added)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-white/8 text-[#9e9e9e]">
                      {["Title","Genre","Score","Status","Actions"].map(h=><th key={h} className="py-3 px-4 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {customMovies.map((m,i)=>(
                        <tr key={m.id} className={`border-b border-white/5 hover:bg-white/4 ${i%2?"bg-white/[0.01]":""}`}>
                          <td className="py-2.5 px-4 font-medium">{m.title}</td>
                          <td className="py-2.5 px-4 text-gray-400">{m.genre.slice(0,2).join(", ")}</td>
                          <td className="py-2.5 px-4 text-green-400 font-bold">{m.score}%</td>
                          <td className="py-2.5 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.isNowShowing?"bg-blue-500/15 text-blue-400":"bg-white/10 text-gray-400"}`}>
                              {m.isNowShowing?"NOW SHOWING":"COMING SOON"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 flex gap-2">
                            <button onClick={()=>{setEditMovie(m);}} className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white">
                              <Pencil className="w-3.5 h-3.5"/>
                            </button>
                            <button onClick={()=>handleDeleteMovie(m.id)} className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-gray-400 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 bg-white/[0.02] text-xs text-gray-400 font-bold uppercase tracking-wider">Seed Movies</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/8 text-[#9e9e9e]">
                    {["Poster","Title","Genre","Score","Status","Showtimes"].map(h=><th key={h} className="py-3 px-4 font-medium">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {seedMovies.map((m,i)=>(
                      <tr key={m.id} className={`border-b border-white/5 hover:bg-white/4 ${i%2?"bg-white/[0.01]":""}`}>
                        <td className="py-2.5 px-4"><img src={m.posterUrl} className="w-8 h-12 object-cover rounded border border-white/10"/></td>
                        <td className="py-2.5 px-4 font-medium font-display">{m.title}</td>
                        <td className="py-2.5 px-4 text-gray-400">{m.genre.slice(0,2).join(", ")}</td>
                        <td className="py-2.5 px-4 text-green-400 font-bold">{m.score}%</td>
                        <td className="py-2.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.isNowShowing?"bg-blue-500/15 text-blue-400":"bg-white/10 text-gray-400"}`}>
                            {m.isNowShowing?"NOW SHOWING":"COMING SOON"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">{m.showtimes.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* THEATERS */}
        {activeTab === "theaters" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowTheaterForm(true)} className="btn-hs-primary text-sm py-2 px-4">
                <Plus className="w-4 h-4" /> Add Theater
              </button>
            </div>
            {theaters.length === 0 ? (
              <div className="glass-card rounded-xl border border-white/5 p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-sm">No theaters yet. Create your first theater.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {theaters.map(t => (
                  <div key={t.id} className="glass-card rounded-xl border border-white/8 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-display font-bold text-white text-base">{t.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">@{t.username} · Created {t.createdAt.slice(0,10)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditTheater(t)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTheater(t.id)} className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {t.permissions.map(p => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-[#f84464]/10 text-[#f84464] border border-[#f84464]/20 font-medium">{p}</span>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Revenue</span>
                      <span className="text-[#ffc107] font-bold">₹{(getTheaterRevenue(t.id)||0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Bookings</span>
                      <span className="text-white">{getBookings().filter(b=>b.theaterId===t.id).length}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <input type="text" placeholder="Search by movie or ref..." value={searchBooking}
              onChange={e => setSearchBooking(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:border-[#f84464]"
            />
            <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-white/8 text-[#9e9e9e] bg-white/[0.02]">
                    {["Ref","Movie","Date","Seats","Format","Amount","Status"].map(h=><th key={h} className="py-3 px-4 font-medium">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(filteredBookings.length ? filteredBookings : Array.from({length:8},(_,i)=>({
                      ref:`CB-${Math.random().toString(36).substring(2,6).toUpperCase()}${1000+i}`,
                      movie: allMovies[i%allMovies.length]?.title||"Movie",
                      timestamp: new Date(Date.now()-i*86400000*Math.random()*3).toISOString(),
                      seats:["A1","A2"],format:"Standard",total:640,status:"CONFIRMED"
                    }))).map((b,i)=>(
                      <tr key={i} className={`border-b border-white/5 hover:bg-white/4 ${i%2?"bg-white/[0.01]":""}`}>
                        <td className="py-2.5 px-4 font-mono text-[#9e9e9e] text-[11px]">{b.ref}</td>
                        <td className="py-2.5 px-4 font-medium truncate max-w-[140px]">{b.movie}</td>
                        <td className="py-2.5 px-4 text-gray-400">{(b.timestamp||"").slice(0,10)}</td>
                        <td className="py-2.5 px-4">{Array.isArray(b.seats)?b.seats.length:2}</td>
                        <td className="py-2.5 px-4 text-gray-400">{b.format}</td>
                        <td className="py-2.5 px-4 font-mono">₹{b.total}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status==="CONFIRMED"?"bg-green-500/15 text-green-400":b.status==="USED"?"bg-blue-500/15 text-blue-400":"bg-[#ffc107]/15 text-[#ffc107]"}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="border-b border-white/8 text-[#9e9e9e] bg-white/[0.02]">
                  {["","Name","Email","Joined","Bookings","Status"].map(h=><th key={h} className="py-3 px-4 font-medium">{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    {name:"Rahul Sharma",email:"rahul@example.com",joined:"2024-01-15",bookings:12,status:"Active"},
                    {name:"Priya Patel",email:"priya@example.com",joined:"2024-02-20",bookings:8,status:"Active"},
                    {name:"Amit Kumar",email:"amit@example.com",joined:"2024-03-05",bookings:3,status:"Inactive"},
                    {name:"Sneha Reddy",email:"sneha@example.com",joined:"2024-03-10",bookings:5,status:"Active"},
                    {name:"Vikram Singh",email:"vikram@example.com",joined:"2024-04-01",bookings:1,status:"Active"},
                    {name:"Neha Gupta",email:"neha@example.com",joined:"2024-04-12",bookings:0,status:"Inactive"},
                    {name:"Arjun Verma",email:"arjun@example.com",joined:"2024-05-22",bookings:24,status:"Active"},
                    {name:"Kavita Desai",email:"kavita@example.com",joined:"2024-06-05",bookings:7,status:"Active"},
                  ].map((u,i)=>(
                    <tr key={i} className={`border-b border-white/5 hover:bg-white/4 ${i%2?"bg-white/[0.01]":""}`}>
                      <td className="py-2.5 px-4">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold border border-white/10">
                          {u.name.split(" ").map(n=>n[0]).join("")}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-medium">{u.name}</td>
                      <td className="py-2.5 px-4 text-gray-400">{u.email}</td>
                      <td className="py-2.5 px-4 text-gray-400">{u.joined}</td>
                      <td className="py-2.5 px-4">{u.bookings}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.status==="Active"?"bg-green-400":"bg-gray-500"}`}/>
                          {u.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-xl space-y-4">
            <div className="glass-card rounded-xl border border-white/5 p-5 space-y-6">
              {[
                ["Maintenance Mode","Take the booking platform offline",false,"red"],
                ["Allow New Bookings","Users can book tickets",true,"green"],
                ["Email Notifications","Send booking confirmations",true,"blue"],
                ["Cash Payments Only","Disable online payment gateways",true,"blue"],
              ].map(([title,desc,def,color])=>(
                <div key={title as string} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{title as string}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc as string}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={!!def} />
                    <div className={`w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[${color==="red"?"#e53935":color==="green"?"#4caf50":"#1e88e5"}]`}/>
                  </label>
                </div>
              ))}
              <button onClick={() => toast({title:"Settings saved"})} className="btn-hs-primary text-sm py-2 w-full justify-center">Save Settings</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
