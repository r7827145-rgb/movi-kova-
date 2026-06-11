import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#080808] text-gray-500 py-12 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1 font-display font-bold text-xl tracking-tighter text-white">
          MOVI KOVA
          <div className="w-1.5 h-1.5 rounded-full bg-[#f84464]"></div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-[1px] bg-[#f84464]/30 mb-4 hidden md:block"></div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium uppercase tracking-wider">
            <Link href="/" className="hover:text-[#f84464] transition-colors">Terms of Use</Link>
            <Link href="/" className="hover:text-[#f84464] transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#f84464] transition-colors">FAQ</Link>
            <Link href="/" className="hover:text-[#f84464] transition-colors">Support</Link>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2 text-xs">
          <div>© 2026 Movi Kova</div>
          <Link href="/admin" className="text-gray-600 hover:text-[#f84464] transition-colors">ADMIN</Link>
        </div>
      </div>
    </footer>
  );
}
