import { useState, useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";
import QRScanner from "@/components/admin/QRScanner";
import { movies as seedMovies } from "@/data/movies";
import {
  getSession, getBookings, getTheaters, getTheaterRevenue,
  Booking, Theater, MovieRequest, submitMovieRequest, getMovieRequests,
  getAllMovies,
} from "@/lib/adminData";
import { ScanLine, Ticket, TrendingUp, Film, Plus, X, Check, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TheaterDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const session = getSession();
  const theaterId = session?.theaterId || "";
  const theaterName = session?.theaterName || "Theater";
  const permissions = session?.permissions || [];

  const [theater, setTheater] = useState<Theater | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [searchBooking, setSearchBooking] = useState("");
  const [myRequests, setMyRequests] = useState<MovieRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqForm, setReqForm] = useState({
    title: "", genre: "", synopsis: "", rating: "UA", year: 2026,
    duration: 120, score: 80, director: "", posterUrl: "", backdropUrl: "",
    isNowShowing: true, isComingSoon: false,
    isStreamable: false, isPremium: false, streamUrl: "",
  });

  useEffect(() => {
    const theaters = getTheaters();
    const t = theaters.find(x => x.id === theaterId) || null;
    setTheater(t);
    const allBookings = getBookings();
    const myBookings = allBookings.filter(b => b.theaterId === theaterId);
    setBookings(myBookings);
    setRevenue(getTheaterRevenue(theaterId));
    setMyRequests(getMovieRequests().filter(r => r.theaterId === theaterId));
  }, [theaterId, activeTab]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.title) return;
    submitMovieRequest({
      theaterId,
      theaterName,
      title: reqForm.title,
      genre: reqForm.genre.split(",").map(g => g.trim().toUpperCase()).filter(Boolean),
      synopsis: reqForm.synopsis,
      rating: reqForm.rating,
      year: reqForm.year,
      duration: reqForm.duration,
      score: Math.max(0, Math.min(100, Number(reqForm.score) || 0)),
      director: reqForm.director,
      posterUrl: reqForm.posterUrl,
      backdropUrl: reqForm.backdropUrl,
      isNowShowing: reqForm.isNowShowing,
      isComingSoon: reqForm.isComingSoon,
      isStreamable: reqForm.isStreamable,
      isPremium: reqForm.isPremium,
      streamUrl: reqForm.streamUrl,
    });
    setMyRequests(getMovieRequests().filter(r => r.theaterId === theaterId));
    setShowRequestForm(false);
    setReqForm({
      title: "", genre: "", synopsis: "", rating: "UA", year: 2026, duration: 120, score: 80,
      director: "", posterUrl: "", backdropUrl: "", isNowShowing: true, isComingSoon: false,
      isStreamable: false, isPremium: false, streamUrl: "",
    });
  };

  const assignedMovieIds = theater?.moviesAssigned || [];
  const allMovies = getAllMovies();
  const myMovies = [
    ...allMovies.filter(m => assignedMovieIds.includes(m.id) || m.theaterId === theaterId),
    ...allMovies.filter(m => m.isNowShowing).slice(0, 3),
  ].filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);

  const filteredBookings = bookings.filter(b =>
    b.movie.toLowerCase().includes(searchBooking.toLowerCase()) ||
    b.ref.toLowerCase().includes(searchBooking.toLowerCase())
  );

  const stats = [
    { label: "Total Revenue", value: `₹${(revenue || 0).toLocaleString("en-IN")}`, color: "text-green-400", icon: TrendingUp },
    { label: "Bookings", value: bookings.length, color: "text-white", icon: Ticket },
    { label: "Movies", value: myMovies.length, color: "text-[#ffc107]", icon: Film },
    { label: "Used Tickets", value: bookings.filter(b => b.status === "USED").length, color: "text-blue-400", icon: ScanLine },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col md:flex-row font-sans text-white">
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight capitalize">{activeTab === "revenue" ? "Revenue" : activeTab === "scanner" ? "QR Scanner" : activeTab}</h1>
          <p className="text-xs text-gray-500 mt-1">{theaterName} · Theater Portal</p>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(s => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-4 border border-white/5">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2 opacity-70`} />
                  <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card p-5 rounded-xl border border-white/5">
                <h2 className="font-display text-base font-bold mb-4">Recent Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">No bookings yet for your theater.</div>
                ) : (
                  <div className="space-y-2">
                    {bookings.slice(0, 6).map((b, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                        <div>
                          <div className="font-medium text-white">{b.movie}</div>
                          <div className="text-gray-500 font-mono">{b.ref}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#ffc107]">₹{b.total}</div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.status === "USED" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400"}`}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card p-5 rounded-xl border border-white/5">
                <h2 className="font-display text-base font-bold mb-4">My Movies</h2>
                <div className="space-y-2">
                  {myMovies.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-center gap-3 py-2 border-b border-white/5">
                      <img src={m.posterUrl} className="w-8 h-11 object-cover rounded" alt={m.title} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{m.title}</div>
                        <div className="text-[11px] text-gray-500">{m.showtimes.length} showtimes</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${m.isNowShowing ? "bg-blue-500/15 text-blue-400" : "bg-white/10 text-gray-400"}`}>
                        {m.isNowShowing ? "LIVE" : "SOON"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVENUE */}
        {activeTab === "revenue" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Revenue", value: `₹${(revenue||0).toLocaleString("en-IN")}`, color: "text-green-400" },
                { label: "Confirmed", value: bookings.filter(b=>b.status==="CONFIRMED").length, color: "text-white" },
                { label: "Used Tickets", value: bookings.filter(b=>b.status==="USED").length, color: "text-blue-400" },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4 border border-white/5">
                  <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5">
              <h2 className="font-display text-base font-bold mb-5">Revenue by Movie</h2>
              <div className="space-y-4">
                {myMovies.map((m, i) => {
                  const rev = bookings.filter(b => b.movieId === m.id).reduce((s, b) => s + b.total, 0) || (5000 + i * 8000);
                  const maxRev = Math.max(50000, rev);
                  return (
                    <div key={m.id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300 truncate">{m.title}</span>
                        <span className="font-bold text-[#ffc107] ml-2">₹{rev.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #c62828, #f84464)" }}
                          initial={{ width: 0 }} animate={{ width: `${(rev / maxRev) * 100}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MY MOVIES */}
        {activeTab === "movies" && (
          <div className="space-y-5">

            {/* Request Movie modal */}
            <AnimatePresence>
              {showRequestForm && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg my-4">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h2 className="font-display font-bold text-lg text-white">Request a Movie</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Your request will be sent to super admin for approval</p>
                      </div>
                      <button onClick={() => setShowRequestForm(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmitRequest} className="space-y-3">
                      {([["Title *", "title", "text"], ["Director", "director", "text"], ["Genres (comma separated)", "genre", "text"], ["Synopsis", "synopsis", "text"], ["Poster URL", "posterUrl", "text"], ["Backdrop URL", "backdropUrl", "text"]] as [string, string, string][]).map(([label, key, type]) => (
                        <div key={key}>
                          <label className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
                          <input type={type} value={(reqForm as any)[key]} onChange={e => setReqForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f84464]"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 block">Stream Video URL (MP4 / HLS)</label>
                        <input type="text" value={reqForm.streamUrl} placeholder="e.g. https://vjs.zencdn.net/v/oceans.mp4"
                          onChange={e => setReqForm(f => ({ ...f, streamUrl: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f84464]"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {([["Year", "year"], ["Duration (min)", "duration"], ["Score", "score"]] as [string, string][]).map(([label, key]) => (
                          <div key={key}>
                            <label className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
                            <input type="number" value={(reqForm as any)[key]} onChange={e => setReqForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f84464]"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {[["Now Showing", "isNowShowing"], ["Coming Soon", "isComingSoon"], ["Streamable", "isStreamable"], ["Premium (Sub Only)", "isPremium"]].map(([label, key]) => (
                          <label key={key} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={(reqForm as any)[key]} onChange={e => setReqForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-[#f84464]" />
                            {label}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 btn-hs-primary py-2.5 text-sm justify-center">
                          <Check className="w-4 h-4" /> Submit Request
                        </button>
                        <button type="button" onClick={() => setShowRequestForm(false)}
                          className="px-4 py-2.5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* My Movies (assigned) */}
            <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Movies ({myMovies.length})</span>
                <button onClick={() => setShowRequestForm(true)} className="btn-hs-primary text-xs py-1.5 px-3">
                  <Plus className="w-3.5 h-3.5" /> Request Movie
                </button>
              </div>
              {myMovies.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-sm">
                  <Film className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  No movies assigned yet. Request a movie to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-white/8 text-[#9e9e9e]">
                      {["Poster","Title","Genre","Score","Status","Showtimes"].map(h=><th key={h} className="py-3 px-4 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {myMovies.map((m, i) => (
                        <tr key={m.id} className={`border-b border-white/5 hover:bg-white/4 ${i%2?"bg-white/[0.01]":""}`}>
                          <td className="py-2.5 px-4"><img src={m.posterUrl} className="w-8 h-11 object-cover rounded border border-white/10" /></td>
                          <td className="py-2.5 px-4 font-medium">{m.title}</td>
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
              )}
            </div>

            {/* My Requests */}
            {myRequests.length > 0 && (
              <div className="glass-card rounded-xl border border-white/8 overflow-hidden">
                <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Movie Requests</span>
                </div>
                <div className="divide-y divide-white/5">
                  {myRequests.map(r => (
                    <div key={r.id} className="p-4 flex items-center gap-4">
                      {r.posterUrl && <img src={r.posterUrl} className="w-8 h-11 object-cover rounded border border-white/10 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{r.submittedAt.slice(0,10)} · {r.year} · {r.genre.join(", ")}</div>
                      </div>
                      <div className="flex-shrink-0">
                        {r.status === "pending" && (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#ffc107] bg-[#ffc107]/10 border border-[#ffc107]/25 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {r.status === "approved" && (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {r.status === "rejected" && (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
            {filteredBookings.length === 0 && bookings.length === 0 ? (
              <div className="glass-card rounded-xl border border-white/5 p-10 text-center text-gray-500 text-sm">
                <Ticket className="w-8 h-8 mx-auto mb-3 opacity-30" />
                No bookings yet for your theater.
              </div>
            ) : (
              <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-white/8 text-[#9e9e9e] bg-white/[0.02]">
                      {["Ref","Movie","Show","Seats","Amount","Status"].map(h=><th key={h} className="py-3 px-4 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(filteredBookings.length ? filteredBookings : bookings).map((b, i) => (
                        <tr key={i} className={`border-b border-white/5 hover:bg-white/4 ${i%2?"bg-white/[0.01]":""}`}>
                          <td className="py-2.5 px-4 font-mono text-[#9e9e9e] text-[11px]">{b.ref}</td>
                          <td className="py-2.5 px-4 font-medium truncate max-w-[140px]">{b.movie}</td>
                          <td className="py-2.5 px-4 text-gray-400">{b.showtime}</td>
                          <td className="py-2.5 px-4">{b.seats.join(", ")}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-[#ffc107]">₹{b.total}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status==="CONFIRMED"?"bg-green-500/15 text-green-400":b.status==="USED"?"bg-blue-500/15 text-blue-400":"bg-[#ffc107]/15 text-[#ffc107]"}`}>{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR SCANNER */}
        {activeTab === "scanner" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Point your camera at a customer's booking QR code to verify and mark their ticket as used.</p>
            <QRScanner />
          </div>
        )}
      </main>
    </div>
  );
}
