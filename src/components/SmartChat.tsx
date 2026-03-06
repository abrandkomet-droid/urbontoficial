import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Send, 
  X, 
  Volume2, 
  Languages, 
  Loader2, 
  Sparkles,
  User,
  Headphones
} from 'lucide-react';

interface Message {
  id: string;
  role: 'chauffeur' | 'passenger';
  text: string;
  translatedText?: string;
  audioUrl?: string;
  timestamp: Date;
}

interface SmartChatProps {
  rideId: string;
  senderRole: 'chauffeur' | 'passenger';
  passengerName: string;
  onClose: () => void;
}

export default function SmartChat({ rideId, senderRole, passengerName, onClose }: SmartChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceLang, setSourceLang] = useState<'en' | 'es'>(senderRole === 'chauffeur' ? 'es' : 'en');
  const [targetLang, setTargetLang] = useState<'en' | 'es'>(senderRole === 'chauffeur' ? 'en' : 'es');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await processTranslation(base64Audio, 'audio');
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processTranslation = async (content: string, inputType: 'text' | 'audio') => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/translation/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId,
          senderId: 'current-user', // In a real app, use actual user ID
          senderRole,
          inputType,
          content,
          sourceLang,
          targetLang
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const newMessage: Message = {
        id: data.conversationId,
        role: senderRole,
        text: data.originalText,
        translatedText: data.translatedText,
        audioUrl: data.audioBase64 ? `data:audio/mp3;base64,${data.audioBase64}` : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      
      // Auto-play TTS if audio was generated
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.play();
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    await processTranslation(inputText, 'text');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="absolute inset-x-0 bottom-0 top-20 z-50 bg-white rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#001F3F]/5 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#001F3F]">{passengerName}</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Smart Chat Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSourceLang(sourceLang === 'en' ? 'es' : 'en');
              setTargetLang(targetLang === 'en' ? 'es' : 'en');
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#001F3F]/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#001F3F]"
          >
            <Languages size={12} />
            {sourceLang} → {targetLang}
          </button>
          <button onClick={onClose} className="p-2 bg-[#001F3F]/5 rounded-full hover:bg-[#001F3F]/10 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F7FA]/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Sparkles size={48} strokeWidth={1} />
            <p className="text-sm font-medium uppercase tracking-widest">Start a translated conversation</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === senderRole ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] space-y-2`}>
              <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.role === senderRole ? 'bg-[#001F3F] text-white rounded-tr-none' : 'bg-white text-[#001F3F] rounded-tl-none border border-[#001F3F]/5'}`}>
                <p className="font-medium">{msg.text}</p>
                {msg.translatedText && (
                  <div className={`mt-2 pt-2 border-t ${msg.role === senderRole ? 'border-white/10 text-white/70' : 'border-[#001F3F]/5 text-[#001F3F]/60'} italic text-xs flex items-center gap-2`}>
                    <Languages size={12} />
                    {msg.translatedText}
                  </div>
                )}
              </div>
              {msg.audioUrl && (
                <button 
                  onClick={() => new Audio(msg.audioUrl).play()}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#001F3F]/60 hover:text-[#001F3F] transition-colors"
                >
                  <Volume2 size={12} />
                  Play Translation
                </button>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-[#001F3F]/5 flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-[#001F3F]/40" />
              <span className="text-xs text-[#001F3F]/40 font-medium uppercase tracking-widest">Translating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-[#001F3F]/5 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              disabled={isRecording || isProcessing}
              className="w-full bg-[#001F3F]/5 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#001F3F]/10 transition-all disabled:opacity-50"
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
            />
            {isRecording && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-[#001F3F] rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
          
          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#001F3F]/5 text-[#001F3F] hover:bg-[#001F3F]/10'}`}
          >
            <Mic size={24} strokeWidth={1.5} />
          </button>

          <button 
            onClick={handleSendText}
            disabled={!inputText.trim() || isProcessing}
            className="w-14 h-14 bg-[#001F3F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#001F3F]/20 hover:bg-[#001F3F]/90 transition-all disabled:opacity-50 active:scale-95"
          >
            <Send size={24} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex justify-center items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#001F3F]/40">
          <div className="flex items-center gap-1">
            <Headphones size={12} />
            <span>Driver: Voice-to-Text</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#001F3F]/20" />
          <div className="flex items-center gap-1">
            <Volume2 size={12} />
            <span>Client: Text & TTS</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
