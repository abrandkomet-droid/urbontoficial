import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Volume2, Globe, X } from 'lucide-react';

interface LanguageBridgeProps {
  rideId: string;
  senderRole: 'chauffeur' | 'passenger';
  onClose: () => void;
}

export default function LanguageBridge({ rideId, senderRole, onClose }: LanguageBridgeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sourceLang = senderRole === 'chauffeur' ? 'es' : 'en';
  const targetLang = senderRole === 'chauffeur' ? 'en' : 'es';

  useEffect(() => {
    // Poll for new messages (Mock WebSocket)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/translation/history/${rideId}`);
        const data = await res.json();
        setMessages(data);
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // or webm
        await processAudio(audioBlob);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Mic Error:", err);
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    
    // Convert Blob to Base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      
      try {
        const res = await fetch('/api/translation/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rideId,
            senderId: 'current-user-id', // Mock
            senderRole,
            inputType: 'audio',
            content: base64Audio,
            sourceLang,
            targetLang
          })
        });

        if (!res.ok) throw new Error("Translation failed");

        const data = await res.json();
        
        // Play the translated audio immediately
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.play();
        
        // Optimistic update
        setMessages(prev => [...prev, {
          id: Date.now(),
          senderRole,
          originalText: data.originalText,
          translatedText: data.translatedText,
          timestamp: new Date().toISOString()
        }]);

      } catch (err) {
        setError("Failed to process translation. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-x-0 bottom-0 h-[85vh] bg-[#001F3F] text-white rounded-t-[32px] z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-light tracking-wide">The Language Bridge</h3>
            <p className="text-xs text-white/60 uppercase tracking-wider">
              {senderRole === 'chauffeur' ? 'Español ↔ English' : 'English ↔ Español'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
            <Volume2 size={48} strokeWidth={1} />
            <p className="text-sm font-light">Press and hold to speak...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isMe = msg.senderRole === senderRole;
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${isMe ? 'bg-white text-[#001F3F] rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                <p className="text-sm font-medium mb-1 opacity-60 uppercase tracking-wider text-[10px]">
                  {isMe ? 'You said' : 'Translated'}
                </p>
                <p className="text-lg font-light leading-snug">
                  {isMe ? msg.originalText : msg.translatedText}
                </p>
                {!isMe && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs opacity-50 italic">Original: "{msg.originalText}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls Area */}
      <div className="p-8 pb-12 bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          {/* PUSH TO TALK BUTTON */}
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessing}
            className={`
              relative w-24 h-24 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isRecording ? 'scale-110 bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-white text-[#001F3F] shadow-lg hover:scale-105 active:scale-95'}
              ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            `}
          >
            {isProcessing ? (
              <div className="w-8 h-8 border-2 border-[#001F3F] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic size={32} className={isRecording ? 'text-white' : 'text-[#001F3F]'} />
            )}
            
            {/* Ripple Effect Ring */}
            {isRecording && (
              <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping" />
            )}
          </button>
          
          <p className="text-sm font-medium tracking-widest uppercase opacity-60">
            {isRecording ? 'Listening...' : isProcessing ? 'Translating...' : 'Hold to Speak'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
