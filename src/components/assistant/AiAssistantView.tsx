import React, { useState, useRef, useEffect } from "react";
import {
  BotMessageSquare,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  User,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AiAssistantView: React.FC = () => {
  const { activeProject } = useProjects();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Halo! Saya adalah **MIXLAB AI Assistant**, asisten teknik sipil spesialis teknologi beton dan perancangan campuran SNI.

Saat ini saya terhubung dengan proyek aktif Anda:
**${activeProject.name}** (Target f'c: ${activeProject.parameters.targetStrengthFc} MPa, Slump: ${activeProject.parameters.slumpMin}-${activeProject.parameters.slumpMax} mm, Metode: ${activeProject.parameters.method.replace(/_/g, " ")}).

Ada yang bisa saya bantu terkait perhitungan mix design, koreksi kadar air agregat, evaluasi pengujian tekan, atau inovasi material?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Mengapa kuat tekan beton hanya mencapai 22 MPa padahal target 28 MPa?",
    "Bagaimana pengaruh koreksi kadar air agregat terhadap rasio fas?",
    "Apakah PET lebih tepat sebagai substitusi agregat atau bahan tambah?",
    "Jelaskan perbedaan SNI 7656:2012 dan SNI 03-2834-2000!",
    "Berapa dosis optimum serat pelepah pisang agar tidak menurunkan workability?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const resp = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8), // Send recent context
          projectContext: {
            projectName: activeProject.name,
            parameters: activeProject.parameters,
            cement: activeProject.cement,
            fineAggregate: {
              type: activeProject.fineAggregate.type,
              ssd: activeProject.fineAggregate.specificGravitySSD,
              moisture: activeProject.fineAggregate.moistureContent,
              absorption: activeProject.fineAggregate.absorption,
              fm: activeProject.fineAggregate.finenessModulus,
            },
            coarseAggregate: {
              type: activeProject.coarseAggregate.type,
              ssd: activeProject.coarseAggregate.specificGravitySSD,
              moisture: activeProject.coarseAggregate.moistureContent,
              absorption: activeProject.coarseAggregate.absorption,
            },
            admixture: activeProject.admixture,
            calculationResult: activeProject.calculationResult
              ? {
                  waterKg: activeProject.calculationResult.waterContentDesignKg,
                  fas: activeProject.calculationResult.waterCementRatio,
                  cementKg: activeProject.calculationResult.cementContentKg,
                  fineAggSSD: activeProject.calculationResult.fineAggregateKg,
                  coarseAggSSD: activeProject.calculationResult.coarseAggregateKg,
                  netWaterMixer: activeProject.calculationResult.moistureCorrection.netWaterToBatchKg,
                  mixRatio: activeProject.calculationResult.mixRatio,
                }
              : null,
            specimensCount: activeProject.specimens.length,
            specimensSummary: activeProject.specimens.map((s) => ({
              code: s.code,
              age: s.ageDays,
              mpa: s.compressiveStrengthMPa,
            })),
            innovations: activeProject.innovations.map((iv) => ({
              code: iv.code,
              name: iv.name,
              dosage: iv.dosagePercent,
            })),
          },
        }),
      });

      const data = await resp.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Maaf, terjadi kendala komunikasi: ${data.error || "Gagal mendapatkan respon dari server."}`,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Terjadi error jaringan: ${err.message}. Mohon periksa koneksi atau API Key server.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <BotMessageSquare className="w-4 h-4" />
            <span>Kecerdasan Buatan Terintegrasi Teknik Sipil</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">MIXLAB AI Assistant</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konsultasi interaktif seputar mix design, koreksi kadar air, kegagalan uji desak, dan telaah SNI
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: `Percakapan telah diatur ulang. Saya siap membantu Anda menganalisis proyek **${activeProject.name}**.`,
              },
            ])
          }
          className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Percakapan</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3.5 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-2xs ${
                    isUser ? "bg-[#286B9B]" : "bg-[#142D45]"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4 text-[#64B5F6]" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-4 rounded-xl text-xs leading-relaxed transition-all ${
                    isUser
                      ? "bg-[#142D45] text-white"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>MIXLAB Grounded AI · SNI Standards</span>
                      <button
                        onClick={() => handleCopy(m.content, idx)}
                        className="hover:text-slate-700 flex items-center gap-1"
                        title="Salin jawaban"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-[#142D45] flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-[#64B5F6]" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic flex items-center gap-2">
                <span>MIXLAB AI sedang menganalisis data proyek dan standar teknik...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex items-center gap-2 text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Saran Pertanyaan:</span>
          </span>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-full text-[11px] text-slate-700 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Field */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan analisis beton, evaluasi pengujian, atau penjelasan rumus..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#286B9B] focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-2.5 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
