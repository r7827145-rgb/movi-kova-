import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link } from "wouter";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-[#0f0f0f] text-white border-r-white/10 p-6 flex flex-col w-full sm:max-w-sm">
        <Link href="/" onClick={() => onOpenChange(false)} className="font-display font-bold text-2xl tracking-tighter text-white flex items-center gap-1.5 mb-12" data-testid="link-mobile-home">
          MOVI KOVA
          <div className="w-1.5 h-1.5 rounded-full bg-[#f84464]"></div>
        </Link>
        
        <div className="flex flex-col gap-6 text-[15px] font-semibold tracking-widest text-gray-300 uppercase">
          <Link href="/" onClick={() => onOpenChange(false)} className="hover:text-[#f84464] transition-colors" data-testid="link-mobile-nav-home">HOME</Link>
          <Link href="/" onClick={() => onOpenChange(false)} className="hover:text-[#f84464] transition-colors" data-testid="link-mobile-nav-movies">MOVIES</Link>
          <Link href="/events" onClick={() => onOpenChange(false)} className="hover:text-[#f84464] transition-colors" data-testid="link-mobile-nav-events">EVENTS</Link>
          <Link href="/plays" onClick={() => onOpenChange(false)} className="hover:text-[#f84464] transition-colors" data-testid="link-mobile-nav-plays">PLAYS</Link>
          <Link href="/sports" onClick={() => onOpenChange(false)} className="hover:text-[#f84464] transition-colors" data-testid="link-mobile-nav-sports">SPORTS</Link>
          <Link href="/profile" onClick={() => onOpenChange(false)} className="hover:text-[#f84464] transition-colors" data-testid="link-mobile-profile">PROFILE</Link>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button className="w-full btn-hs-primary justify-center uppercase tracking-widest text-sm py-3" style={{ background: 'linear-gradient(135deg, #c62828 0%, #f84464 100%)' }}>
            SIGN IN
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
