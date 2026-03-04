import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Volume2, Globe, X, Send, Wifi, WifiOff, Radio, Play, CheckCheck } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    rideId: string;
    senderRole: 'chauffeur' | 'passenger';
    originalText: string;
    refinedText: string;
    timestamp: string;
}

type TripStatus = 'IN_PROGRESS' | 'ARRIVED' | 'COMPLETED';

interface ChatRoomProps {
    rideId: string;
    senderRole: 'chauffeur' | 'passenger';
    tripStatus: TripStatus;
    onClose: () => void;
    onTripCompleted?: () => void; // passenger → receipt, chauffeur → waiting
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS: Web Speech API TTS
// ─────────────────────────────────────────────────────────────────────────────
function speakText(text: string, lang: string = 'es-ES') {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.92;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // strip data:...;base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const NAVY = '#0A1128';
const SILVER = '#C0C0C0';
const POLL_INTERVAL_MS = 1400;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatRoom({
    rideId,
    senderRole,
    tripStatus,
    onClose,
    onTripCompleted,
}: ChatRoomProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [error, setError] = useState<string | null>(null);
    const [speakingId, setSpeakingId] = useState<string | null>(null);
    const [lastMsgCount, setLastMsgCount] = useState(0);
    const [holdProgress, setHoldProgress] = useState(0); // 0-100 for visual fill

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const purgeCalledRef = useRef(false);

    const isPassenger = senderRole === 'passenger';
    const isChauffeur = senderRole === 'chauffeur';

    // ── Online/offline detection ──────────────────────────────────────────────
    useEffect(() => {
        const up = () => setIsOnline(true);
        const down = () => setIsOnline(false);
        window.addEventListener('online', up);
        window.addEventListener('offline', down);
        return () => {
            window.removeEventListener('online', up);
            window.removeEventListener('offline', down);
        };
    }, []);

    // ── Polling for new messages ──────────────────────────────────────────────
    useEffect(() => {
        if (tripStatus === 'COMPLETED') return; // stop polling when trip done

        const poll = async () => {
            if (!isOnline) return;
            try {
                const res = await fetch(`/api/groq-chat/messages/${rideId}`);
                if (!res.ok) return;
                const data: ChatMessage[] = await res.json();
                setMessages(data);
            } catch {
                // silently fail — offline indicator handles UX
            }
        };

        poll(); // immediate first call
        const interval = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [rideId, tripStatus, isOnline]);

    // ── Auto-scroll to latest message ────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Auto-speak incoming messages (passenger only) ─────────────────────────
    useEffect(() => {
        if (!isPassenger) return;
        if (messages.length <= lastMsgCount) return;
        const latest = messages[messages.length - 1];
        if (latest.senderRole === 'chauffeur') {
            setSpeakingId(latest.id);
            speakText(latest.refinedText, 'es-ES');
            setTimeout(() => setSpeakingId(null), 5000);
        }
        setLastMsgCount(messages.length);
    }, [messages, isPassenger, lastMsgCount]);

    // ── Trip COMPLETED → purge session ───────────────────────────────────────
    useEffect(() => {
        if (tripStatus === 'COMPLETED' && !purgeCalledRef.current) {
            purgeCalledRef.current = true;
            purgeChatSession();
        }
    }, [tripStatus]);

    const purgeChatSession = useCallback(async () => {
        try {
            await fetch(`/api/groq-chat/purge/${rideId}`, { method: 'DELETE' });
            console.log('[ChatRoom] Session purged — privacy first.');
        } catch (e) {
            console.warn('[ChatRoom] Purge failed (offline?):', e);
        }
        setMessages([]);
        if (onTripCompleted) onTripCompleted();
        else onClose();
    }, [rideId, onTripCompleted, onClose]);

    // ─── RECORDING ─────────────────────────────────────────────────────────────
    const startRecording = async () => {
        if (!isOnline) {
            setError('Sin conexión. Verifique su red.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                },
            });

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                stream.getTracks().forEach((t) => t.stop());
                await processAudio(blob, mimeType);
            };

            recorder.start(250); // collect chunks every 250ms
            setIsRecording(true);
            setError(null);

            // Haptic feedback (mobile)
            if ('vibrate' in navigator) navigator.vibrate([40]);

            // Visual hold progress
            setHoldProgress(0);
            let prog = 0;
            holdTimerRef.current = setInterval(() => {
                prog = Math.min(prog + 2, 100);
                setHoldProgress(prog);
            }, 120);
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setError('Acceso al micrófono denegado.');
            } else {
                setError('Error al iniciar el micrófono.');
            }
        }
    };

    const stopRecording = () => {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        setHoldProgress(0);
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // End haptic
            if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);
        }
    };

    const processAudio = async (blob: Blob, mimeType: string) => {
        setIsProcessing(true);
        setError(null);

        try {
            const base64 = await blobToBase64(blob);
            const res = await fetch('/api/groq-chat/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rideId,
                    senderRole,
                    audioBase64: base64,
                    mimeType,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.error === 'inaudible') {
                    // Chauffeur audio feedback: we DON'T need to show screen, just speak
                    speakText('Repita, por favor.', 'es-ES');
                    setError(isChauffeur ? null : 'Audio no inteligible. Intente de nuevo.');
                    return;
                }
                throw new Error(data.error || 'Error del servidor');
            }

            const msg: ChatMessage = await res.json();
            setMessages((prev) => {
                const exists = prev.find((m) => m.id === msg.id);
                return exists ? prev : [...prev, msg];
            });
        } catch (e: any) {
            setError(e.message || 'Error al procesar el audio.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── TEXT SEND (passenger) ──────────────────────────────────────────────
    const sendText = async () => {
        const trimmed = textInput.trim();
        if (!trimmed || isProcessing) return;
        setTextInput('');
        setIsProcessing(true);
        setError(null);

        try {
            const res = await fetch('/api/groq-chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rideId, senderRole, text: trimmed }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            const msg: ChatMessage = await res.json();
            setMessages((prev) => {
                const exists = prev.find((m) => m.id === msg.id);
                return exists ? prev : [...prev, msg];
            });
        } catch (e: any) {
            setError(e.message || 'Error al enviar el mensaje.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualSpeak = (msg: ChatMessage) => {
        setSpeakingId(msg.id);
        const lang = msg.senderRole === 'chauffeur' ? 'es-ES' : 'en-US';
        speakText(msg.refinedText, lang);
        setTimeout(() => setSpeakingId(null), 6000);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    if (tripStatus === 'COMPLETED') return null;

    return (
        <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(170deg, ${NAVY} 0%, #0D1830 55%, #0A1128 100%)`,
                fontFamily: "'Barlow Condensed', 'Barlow', sans-serif",
                color: '#ffffff',
            }}
        >
            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    padding: '52px 24px 16px',
                    borderBottom: '1px solid rgba(192,192,192,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Globe icon with Live badge */}
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'rgba(192,192,192,0.1)',
                            border: `1px solid rgba(192,192,192,0.25)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Globe size={20} color={SILVER} />
                    </div>
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 20,
                                fontWeight: 500,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#FFFFFF',
                            }}
                        >
                            Guante Blanco
                        </h3>
                        {/* Status badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: isOnline ? '#4ADE80' : '#EF4444',
                                    display: 'inline-block',
                                    boxShadow: isOnline
                                        ? '0 0 6px rgba(74,222,128,0.7)'
                                        : '0 0 6px rgba(239,68,68,0.7)',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 11,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: isOnline ? '#4ADE80' : '#EF4444',
                                    fontWeight: 400,
                                }}
                            >
                                {isOnline ? 'Live Translation Active' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Role badge + Close */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                        style={{
                            fontSize: 10,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            border: `1px solid rgba(192,192,192,0.3)`,
                            borderRadius: 20,
                            color: SILVER,
                            fontWeight: 400,
                        }}
                    >
                        {isPassenger ? 'Passenger' : 'Chauffeur'}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: SILVER,
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* ── MESSAGES ────────────────────────────────────────────────────── */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                }}
            >
                {messages.length === 0 && (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            opacity: 0.35,
                        }}
                    >
                        <Volume2 size={52} strokeWidth={1} color={SILVER} />
                        <p
                            style={{
                                fontSize: 15,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: SILVER,
                                fontWeight: 300,
                                textAlign: 'center',
                            }}
                        >
                            {isChauffeur
                                ? 'Mantenga presionado para hablar'
                                : 'Presione el micrófono\no escriba un mensaje'}
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.senderRole === senderRole;
                    const isLatest = idx === messages.length - 1;

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.28 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {/* Sender label */}
                            <span
                                style={{
                                    fontSize: 10,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(192,192,192,0.55)',
                                    marginBottom: 4,
                                    fontWeight: 400,
                                }}
                            >
                                {isMe ? 'Tú' : msg.senderRole === 'chauffeur' ? 'Chauffeur' : 'Pasajero'}
                            </span>

                            <div
                                style={{
                                    maxWidth: '82%',
                                    padding: '12px 16px',
                                    borderRadius: isMe
                                        ? '20px 20px 4px 20px'
                                        : '20px 20px 20px 4px',
                                    background: isMe
                                        ? 'rgba(192,192,192,0.18)'
                                        : 'rgba(255,255,255,0.07)',
                                    border: isMe
                                        ? '1px solid rgba(192,192,192,0.3)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(8px)',
                                    position: 'relative',
                                }}
                            >
                                {/* Refined message */}
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 16,
                                        fontWeight: 300,
                                        lineHeight: 1.5,
                                        letterSpacing: '0.02em',
                                        color: '#FFFFFF',
                                        fontFamily: "'Barlow Condensed', sans-serif",
                                    }}
                                >
                                    {msg.refinedText}
                                </p>

                                {/* Original (subtle) */}
                                {!isMe && msg.originalText !== msg.refinedText && (
                                    <p
                                        style={{
                                            margin: '8px 0 0',
                                            fontSize: 11,
                                            fontStyle: 'italic',
                                            color: 'rgba(192,192,192,0.45)',
                                            fontWeight: 300,
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            paddingTop: 6,
                                            letterSpacing: '0.01em',
                                        }}
                                    >
                                        "{msg.originalText}"
                                    </p>
                                )}

                                {/* Footer: time + play */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: 8,
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color: 'rgba(192,192,192,0.4)',
                                            fontWeight: 300,
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString('es-VE', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>

                                    {/* Play TTS button */}
                                    <button
                                        onClick={() => handleManualSpeak(msg)}
                                        style={{
                                            background:
                                                speakingId === msg.id
                                                    ? 'rgba(74,222,128,0.2)'
                                                    : 'rgba(192,192,192,0.1)',
                                            border: 'none',
                                            borderRadius: 20,
                                            padding: '3px 10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            cursor: 'pointer',
                                            color: speakingId === msg.id ? '#4ADE80' : SILVER,
                                            fontSize: 10,
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {speakingId === msg.id ? (
                                            <>
                                                <Radio size={11} /> Playing
                                            </>
                                        ) : (
                                            <>
                                                <Play size={11} /> Play
                                            </>
                                        )}
                                    </button>

                                    {isMe && (
                                        <CheckCheck size={13} color="rgba(192,192,192,0.5)" />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            style={{
                                textAlign: 'center',
                                padding: '10px 16px',
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 12,
                                color: '#FCA5A5',
                                fontSize: 13,
                                fontWeight: 300,
                                letterSpacing: '0.04em',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* ── CONTROLS ────────────────────────────────────────────────────── */}
            <div
                style={{
                    padding: isChauffeur ? '24px 24px 44px' : '16px 16px 36px',
                    borderTop: '1px solid rgba(192,192,192,0.1)',
                    background: 'rgba(10,17,40,0.7)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                {/* ── CHAUFFEUR: Big PTT button ──────────────────────────────── */}
                {isChauffeur && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 16,
                        }}
                    >
                        {/* Processing indicator */}
                        <AnimatePresence>
                            {isProcessing && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        fontSize: 12,
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                        color: SILVER,
                                        fontWeight: 300,
                                    }}
                                >
                                    Refinando mensaje...
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Giant PTT button */}
                        <div style={{ position: 'relative' }}>
                            {/* Ripple rings when recording */}
                            {isRecording && (
                                <>
                                    <motion.span
                                        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            border: '2px solid #EF4444',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <motion.span
                                        animate={{ scale: [1, 2.4], opacity: [0.3, 0] }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: 'easeOut',
                                            delay: 0.4,
                                        }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            border: '2px solid #EF4444',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                </>
                            )}

                            {/* SVG progress ring */}
                            <svg
                                width={112}
                                height={112}
                                style={{
                                    position: 'absolute',
                                    top: -6,
                                    left: -6,
                                    pointerEvents: 'none',
                                    transform: 'rotate(-90deg)',
                                    opacity: isRecording ? 1 : 0,
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                <circle cx={56} cy={56} r={50} fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth={3} />
                                <circle
                                    cx={56}
                                    cy={56}
                                    r={50}
                                    fill="none"
                                    stroke="#EF4444"
                                    strokeWidth={3}
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - holdProgress / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                                />
                            </svg>

                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    startRecording();
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    stopRecording();
                                }}
                                disabled={isProcessing}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: isRecording
                                        ? '#EF4444'
                                        : isProcessing
                                            ? 'rgba(192,192,192,0.2)'
                                            : `linear-gradient(135deg, rgba(192,192,192,0.25) 0%, rgba(192,192,192,0.08) 100%)`,
                                    border: isRecording
                                        ? '2px solid #EF4444'
                                        : `2px solid rgba(192,192,192,0.4)`,
                                    cursor: isProcessing ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isRecording
                                        ? '0 0 40px rgba(239,68,68,0.35), 0 8px 32px rgba(0,0,0,0.4)'
                                        : '0 8px 32px rgba(0,0,0,0.4)',
                                    transform: isRecording ? 'scale(1.06)' : 'scale(1)',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                }}
                            >
                                {isProcessing ? (
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            border: `3px solid rgba(192,192,192,0.3)`,
                                            borderTopColor: SILVER,
                                            animation: 'spin 0.8s linear infinite',
                                        }}
                                    />
                                ) : (
                                    <Mic size={38} color={isRecording ? '#FFFFFF' : SILVER} strokeWidth={1.5} />
                                )}
                            </button>
                        </div>

                        <p
                            style={{
                                fontSize: 11,
                                letterSpacing: '0.25em',
                                textTransform: 'uppercase',
                                color: isRecording ? '#EF4444' : 'rgba(192,192,192,0.6)',
                                fontWeight: 400,
                                margin: 0,
                                transition: 'color 0.2s',
                            }}
                        >
                            {isRecording
                                ? '● Escuchando...'
                                : isProcessing
                                    ? 'Procesando...'
                                    : 'Mantener para hablar'}
                        </p>
                    </div>
                )}

                {/* ── PASSENGER: PTT + Text input ───────────────────────────── */}
                {isPassenger && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Text Input Row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(192,192,192,0.2)',
                                borderRadius: 40,
                                padding: '8px 8px 8px 18px',
                            }}
                        >
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendText();
                                    }
                                }}
                                placeholder="Escribe un mensaje..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#FFFFFF',
                                    fontSize: 16,
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontWeight: 300,
                                    letterSpacing: '0.03em',
                                    minWidth: 0,
                                }}
                            />
                            <button
                                onClick={sendText}
                                disabled={!textInput.trim() || isProcessing}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background:
                                        textInput.trim() && !isProcessing
                                            ? SILVER
                                            : 'rgba(192,192,192,0.15)',
                                    border: 'none',
                                    cursor: textInput.trim() && !isProcessing ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                }}
                            >
                                <Send size={16} color={textInput.trim() && !isProcessing ? NAVY : 'rgba(192,192,192,0.4)'} />
                            </button>
                        </div>

                        {/* Voice button row */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 16,
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                {isRecording && (
                                    <motion.span
                                        animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            border: '2px solid #EF4444',
                                        }}
                                    />
                                )}
                                <button
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        startRecording();
                                    }}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        stopRecording();
                                    }}
                                    disabled={isProcessing}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: isRecording
                                            ? '#EF4444'
                                            : 'rgba(192,192,192,0.12)',
                                        border: `1.5px solid ${isRecording ? '#EF4444' : 'rgba(192,192,192,0.3)'}`,
                                        cursor: isProcessing ? 'wait' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.18s',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                    }}
                                >
                                    <Mic size={24} color={isRecording ? '#FFFFFF' : SILVER} strokeWidth={1.5} />
                                </button>
                            </div>

                            <p
                                style={{
                                    fontSize: 11,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(192,192,192,0.5)',
                                    margin: 0,
                                    fontWeight: 300,
                                }}
                            >
                                {isRecording ? '● Escuchando' : 'Mantener para voz'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── CSS ANIMATION KEYFRAMES ──────────────────────────────────── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500&family=Barlow:wght@300;400&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
        </motion.div>
    );
}
