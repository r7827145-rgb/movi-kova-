import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, ScanLine } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface AIChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenScanner?: () => void;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchAIReply(
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, messages: history }),
  });
  if (!res.ok) throw new Error("AI request failed");
  const data = await res.json();
  return data.reply as string;
}

export default function AIChatPanel({ open, onOpenChange, onOpenScanner }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "I'm your cinematic concierge, powered by AI. Ask me anything — movie recommendations, formats, best seats, or snap a poster to book instantly!", sender: 'ai' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const buildHistory = (msgs: Message[]) =>
    msgs.slice(1).map(m => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as "user" | "assistant",
      content: m.text,
    }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), sender: 'user' };
    const currentMessages = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = buildHistory(currentMessages);
      const reply = await fetchAIReply(userMsg.text, history);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: 'ai'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-[#0d1117] border-l border-white/10 text-white">
        <SheetTitle className="sr-only">AI Concierge</SheetTitle>
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#16213e]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#1e88e5] shadow-[0_0_8px_#1e88e5] animate-pulse"></div>
            <h2 className="font-display font-bold tracking-wider uppercase text-sm">AI CONCIERGE</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-semibold text-gray-300">GPT-4o</span>
            {onOpenScanner && (
              <button
                onClick={() => { onOpenChange(false); onOpenScanner(); }}
                className="flex items-center gap-1.5 text-[10px] bg-[#1565c0]/30 border border-[#1e88e5]/30 hover:bg-[#1565c0]/50 transition-colors px-2 py-1 rounded font-semibold text-[#42a5f5]"
                title="Open Poster Scanner"
              >
                <ScanLine className="w-3 h-3" />
                SCAN POSTER
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-[#1565c0] to-[#1e88e5] text-white self-end rounded-tr-sm'
                  : 'bg-[#1a1a2e] text-gray-200 self-start border border-white/5 rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="bg-[#1a1a2e] text-gray-400 self-start border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-[#16213e]">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations..."
              disabled={loading}
              className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e88e5] text-white placeholder-gray-500 transition-colors disabled:opacity-50"
              data-testid="input-ai-chat"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#1565c0] flex items-center justify-center text-white hover:bg-[#1e88e5] transition-colors flex-shrink-0 disabled:opacity-40"
              data-testid="button-ai-send"
            >
              <Send className="w-4 h-4 ml-[-2px]" />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
