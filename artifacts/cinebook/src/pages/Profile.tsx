import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { RotateCcw, LogIn } from "lucide-react";
import { movies } from "../data/movies";
import { useUser, useClerk } from "@clerk/react";
import { useState } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<"upcoming" | "history" | "preferences">("upcoming");
  const movie = movies[0];
  const pastMovie = movies[1];

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"
    : "?";

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.emailAddresses[0]?.emailAddress?.split("@")[0] || "Cinephile"
    : "Guest";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-2 border-[#1565c0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0f0f0f] text-white gap-6 p-4">
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-[#1565c0]/20 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-[#42a5f5]" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Sign in required</h2>
          <p className="text-gray-400 text-sm mb-6">Create an account or sign in to view your bookings and profile.</p>
          <Link href="/sign-in">
            <button className="btn-hs-primary w-full justify-center py-3">SIGN IN</button>
          </Link>
          <Link href="/sign-up">
            <button className="w-full mt-3 py-3 rounded-md border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
              CREATE ACCOUNT
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const demoQrData = JSON.stringify({
    ref: "CB-DEMO9234",
    movie: movie.title,
    showtime: "Tomorrow 14:30",
    seats: "F4, F5",
    format: "IMAX",
  });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f] text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 py-8 md:py-12 pt-24">

        {/* Profile Header */}
        <div className="glass-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1565c0] rounded-full blur-[120px] opacity-10 -mr-20 -mt-20 pointer-events-none" />

          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#1e88e5]/50 shadow-[0_0_20px_rgba(21,101,192,0.3)] flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1565c0] to-[#1e88e5] flex items-center justify-center text-2xl font-display font-bold text-white flex-shrink-0 shadow-[0_0_20px_rgba(21,101,192,0.3)]">
              {initials}
            </div>
          )}

          <div className="text-center md:text-left flex-1 z-10">
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-1">{displayName}</h1>
            <p className="text-gray-400 text-sm mb-3">{user.emailAddresses[0]?.emailAddress}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-5">
              <span className="bg-gradient-to-r from-[#1565c0] to-[#1e88e5] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                PREMIUM MEMBER
              </span>
              <span className="text-xs text-gray-500">Member since {memberSince}</span>
            </div>

            <div className="flex gap-8 justify-center md:justify-start text-sm">
              <div>
                <div className="font-bold text-xl text-white">3</div>
                <div className="text-gray-500 uppercase tracking-wider text-[10px]">Booked</div>
              </div>
              <div>
                <div className="font-bold text-xl text-white">2</div>
                <div className="text-gray-500 uppercase tracking-wider text-[10px]">Reviews</div>
              </div>
              <div>
                <div className="font-bold text-xl text-[#ffc107]">420</div>
                <div className="text-gray-500 uppercase tracking-wider text-[10px]">Points</div>
              </div>
            </div>
          </div>

          <button
            data-testid="button-profile-sign-out"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-md transition-colors z-10 self-start">
            Sign Out
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-6 border-b border-white/10 mb-7">
          {(["upcoming", "history", "preferences"] as const).map(tab => (
            <button
              key={tab}
              data-testid={`button-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`font-semibold text-sm tracking-wider uppercase border-b-2 pb-3 transition-colors ${
                activeTab === tab
                  ? "text-[#1e88e5] border-[#1e88e5]"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "upcoming" && (
          <div className="grid md:grid-cols-3 gap-7">
            <div className="md:col-span-2 space-y-5">
              <h2 className="font-display font-bold text-lg text-white">Upcoming Tickets</h2>

              <div className="glass-card rounded-xl overflow-hidden flex flex-col sm:flex-row hover:border-[#1e88e5]/30 transition-colors group">
                <img src={movie.posterUrl} alt="Poster" className="w-full sm:w-36 h-48 sm:h-auto object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-xl leading-tight text-white mb-1">{movie.title}</h3>
                  <p className="text-sm text-[#42a5f5] font-medium mb-3">Tomorrow • 14:30 • IMAX</p>
                  <div className="flex gap-5 mb-4 text-sm text-gray-300">
                    <div>
                      <span className="block text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Hall</span>
                      <span className="font-semibold">SCREEN 1</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Seats</span>
                      <span className="font-semibold">F4, F5</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">Paid</span>
                      <span className="font-semibold text-[#ffc107]">₹1,000</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-xs text-[#ffc107] bg-[#ffc107]/10 px-2 py-1 rounded font-semibold uppercase tracking-wider">
                      Pay at Counter
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-center justify-center p-5 border-l border-white/5 bg-white/[0.02]">
                  <div className="bg-white p-2.5 rounded-lg mb-2">
                    <QRCodeSVG value={demoQrData} size={80} level="M" />
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">#CB-DEMO9234</span>
                </div>
              </div>
            </div>

            <div>
              <div className="glass-card rounded-xl p-5 sticky top-24">
                <h2 className="font-display font-bold text-base text-white mb-5">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/">
                    <button data-testid="button-browse-movies" className="w-full btn-hs-primary justify-center py-3 text-sm">
                      BROWSE MOVIES
                    </button>
                  </Link>
                  <button data-testid="button-download-ticket" className="w-full py-3 rounded-md border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                    DOWNLOAD TICKETS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-white mb-4">Watch History</h2>
            <div className="glass-card rounded-xl p-4 flex gap-4 opacity-75">
              <img src={pastMovie.posterUrl} alt="Poster" className="w-14 h-20 object-cover rounded-md grayscale" />
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-white text-base">{pastMovie.title}</h3>
                <p className="text-xs text-gray-400 mt-1">March 12, 2026 • Standard</p>
                <p className="text-xs text-gray-500 mt-0.5">Seats: C3, C4 • ₹760</p>
                <Link href={`/movies/${pastMovie.id}`}>
                  <button className="text-xs text-[#1e88e5] font-semibold uppercase tracking-wider mt-2 flex items-center gap-1 hover:text-white transition-colors w-max">
                    <RotateCcw className="w-3 h-3" /> Book Again
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="glass-card rounded-xl p-6 max-w-md">
            <h2 className="font-display font-bold text-lg text-white mb-6">Preferences</h2>

            <div className="space-y-7">
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Favorite Genres</label>
                <div className="flex flex-wrap gap-2">
                  {["SCI-FI", "ACTION", "DRAMA", "THRILLER", "ROMANCE", "HORROR"].map(g => (
                    <span key={g} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                      g === "SCI-FI" || g === "THRILLER"
                        ? "bg-[#1565c0] text-white border-transparent shadow-[0_0_10px_rgba(21,101,192,0.3)]"
                        : "bg-transparent text-gray-400 border-white/15 hover:border-white/40"
                    }`}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Notifications</label>
                <div className="space-y-3">
                  {[{ label: "New Releases", on: true }, { label: "Promotions", on: false }, { label: "Booking Reminders", on: true }].map(n => (
                    <label key={n.label} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{n.label}</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${n.on ? "bg-[#1565c0]" : "bg-gray-600"}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${n.on ? "right-1" : "left-1"}`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Seat Preference</label>
                <div className="flex gap-2">
                  {["Aisle", "Middle", "Back"].map(s => (
                    <button key={s} className={`text-xs px-4 py-2 rounded-md border transition-colors ${
                      s === "Middle"
                        ? "bg-[#1565c0] text-white border-transparent"
                        : "bg-transparent text-gray-400 border-white/15 hover:border-white/40"
                    }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
