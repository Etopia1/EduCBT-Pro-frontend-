import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
    ScreenShare, ScreenShareOff, Maximize2, Users, X, Volume2,
    Grid, Minimize2
} from 'lucide-react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

const CallModal = ({ socket, currentUser, callState, onClose }) => {
    const [phase, setPhase] = useState(callState.incoming ? 'ringing' : 'connecting');
    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(callState.callType === 'voice');
    const [sharing, setSharing] = useState(false);
    const [duration, setDuration] = useState(0);
    const [peers, setPeers] = useState({}); // socketId -> { stream, name, videoEnabled }

    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnections = useRef({}); 
    const timerRef = useRef(null);

    const callType = callState?.callType || 'voice';
    const isIncoming = callState?.incoming;
    const roomId = callState?.roomId;

    useEffect(() => {
        if (phase === 'connected') {
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    const getLocalStream = useCallback(async () => {
        try {
            const constraints = { 
                audio: true, 
                video: callType === 'video' ? { width: 1280, height: 720 } : false 
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            return stream;
        } catch (err) {
            console.error('Media error:', err);
            return await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).catch(() => null);
        }
    }, [callType]);

    const removePeer = useCallback((socketId) => {
        peerConnections.current[socketId]?.close();
        delete peerConnections.current[socketId];
        setPeers(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
        });
    }, []);

    const createPeerConnection = useCallback((remoteSocketId, userName) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnections.current[remoteSocketId] = pc;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) socket.emit('rtc_ice_candidate', { targetSocketId: remoteSocketId, candidate });
        };

        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setPeers(prev => ({
                ...prev,
                [remoteSocketId]: { ...prev[remoteSocketId], stream: remoteStream, name: userName || 'Peer' }
            }));
        };

        pc.onconnectionstatechange = () => {
            if (['connected', 'completed'].includes(pc.connectionState)) setPhase('connected');
            if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) removePeer(remoteSocketId);
        };

        return pc;
    }, [socket, removePeer]);

    const joinRoom = useCallback(async () => {
        setPhase('connecting');
        const stream = await getLocalStream();
        if (!stream) return onClose();

        socket.emit('join_call_room', {
            roomId,
            userId: currentUser?._id,
            userName: currentUser?.fullName,
            callType
        });

        socket.on('call_room_peers', async ({ peers: existingPeers }) => {
            for (const peerId of existingPeers) {
                const pc = createPeerConnection(peerId, 'Joining...');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('rtc_offer', { targetSocketId: peerId, offer, roomId });
            }
            if (existingPeers.length === 0) setPhase('connected');
        });

        socket.on('peer_joined_call', ({ peerId, userName }) => {
            setPeers(prev => ({ ...prev, [peerId]: { name: userName, stream: null } }));
        });

        socket.on('rtc_offer', async ({ offer, fromSocketId }) => {
            const pc = createPeerConnection(fromSocketId, 'Joining...');
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('rtc_answer', { targetSocketId: fromSocketId, answer });
        });

        socket.on('rtc_answer', async ({ answer, fromSocketId }) => {
            const pc = peerConnections.current[fromSocketId];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('rtc_ice_candidate', async ({ candidate, fromSocketId }) => {
            const pc = peerConnections.current[fromSocketId];
            if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        });

        socket.on('peer_left_call', ({ peerId }) => removePeer(peerId));
    }, [socket, roomId, currentUser, callType, createPeerConnection, getLocalStream, onClose, removePeer]);

    useEffect(() => {
        if (!isIncoming) joinRoom();
        return () => {
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            Object.values(peerConnections.current).forEach(pc => pc.close());
            socket.off('call_room_peers');
            socket.off('peer_joined_call');
            socket.off('rtc_offer');
            socket.off('rtc_answer');
            socket.off('rtc_ice_candidate');
            socket.off('peer_left_call');
        };
    }, []);

    const handleAccept = () => {
        socket.emit('call_accepted', {
            callerId: callState.callerId,
            roomId,
            answererName: currentUser?.fullName,
            answererId: currentUser?._id
        });
        joinRoom();
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(t => t.enabled = muted);
            setMuted(!muted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(t => t.enabled = videoOff);
            setVideoOff(!videoOff);
        }
    };

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col font-outfit animate-fade-in overflow-hidden">
            {/* Header Info */}
            <div className="absolute top-8 left-8 z-20 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                        Encypted {callType} Session
                    </span>
                </div>
                <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">
                    {callState.groupName ? callState.groupName : (callState.callerName || callState.targetName)}
                </h2>
                <span className="text-white/30 text-xs font-bold">{fmt(duration)} • {Object.keys(peers).length + 1} Participants</span>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center p-6 mt-16 pb-32">
                {phase === 'ringing' ? (
                    <div className="flex flex-col items-center gap-12 text-center animate-bounce-slow">
                         <div className="relative">
                            <div className="w-40 h-40 rounded-full bg-[#D4AF37]/10 border-4 border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-7xl font-black uppercase shadow-2xl">
                                {callState.callerName?.charAt(0)}
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/40 animate-ping opacity-20" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-xs">Incoming Call</p>
                            <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">{callState.callerName}</h3>
                        </div>
                        <div className="flex gap-8">
                            <button onClick={onClose} className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl hover:bg-rose-600 transition-all hover:scale-110 active:scale-95 group">
                                <PhoneOff size={32} className="text-white group-hover:rotate-12 transition-transform" />
                            </button>
                            <button onClick={handleAccept} className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 group">
                                <Phone size={32} className="text-white group-hover:-rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`w-full h-full grid gap-4 ${
                        Object.keys(peers).length === 0 ? 'grid-cols-1' : 
                        Object.keys(peers).length === 1 ? 'grid-cols-1 md:grid-cols-2' : 
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                        {/* Remote Peers */}
                        {Object.entries(peers).map(([id, peer]) => (
                            <div key={id} className="relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group">
                                {peer.stream ? (
                                    <video autoPlay playsInline ref={el => { if(el) el.srcObject = peer.stream }} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                        <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-4xl font-black border border-[#D4AF37]/20 shadow-xl">
                                            {peer.name?.charAt(0)}
                                        </div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Connecting Peer...</p>
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-white text-[11px] font-black uppercase italic tracking-tighter">{peer.name}</span>
                                </div>
                            </div>
                        ))}

                        {/* Local Video */}
                        <div className={`relative rounded-[2rem] overflow-hidden bg-white/5 border border-[#D4AF37]/20 group ${Object.keys(peers).length === 0 ? 'max-w-4xl mx-auto' : ''}`}>
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                            {(videoOff || callType === 'voice') && (
                                <div className="absolute inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-4xl font-black border-2 border-[#D4AF37]/20 shadow-2xl">
                                            {currentUser?.fullName?.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                                            {muted ? <MicOff size={20} className="text-rose-500" /> : <Mic size={20} className="text-[#D4AF37]" />}
                                        </div>
                                    </div>
                                    <p className="text-white font-black text-xl italic uppercase tracking-tighter">{currentUser?.fullName}</p>
                                </div>
                            )}
                            <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-[#D4AF37] px-4 py-2 rounded-2xl shadow-xl shadow-[#D4AF37]/10 border border-[#D4AF37]/20">
                                <span className="text-[#1A120B] text-[11px] font-black uppercase italic tracking-tighter">You (Authorized)</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            {phase !== 'ringing' && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-10 py-6 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
                    <ControlBtn icon={muted ? MicOff : Mic} active={!muted} onClick={toggleMute} color={muted ? 'bg-rose-500' : 'bg-[#D4AF37]'} />
                    {callType === 'video' && (
                        <ControlBtn icon={videoOff ? VideoOff : Video} active={!videoOff} onClick={toggleVideo} color={videoOff ? 'bg-rose-500' : 'bg-white/10'} />
                    )}
                    <button onClick={onClose} className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/30 hover:bg-rose-600 transition-all hover:scale-110 group active:scale-95">
                        <PhoneOff size={28} className="text-white group-hover:rotate-[135deg] transition-transform duration-500" />
                    </button>
                    <ControlBtn icon={sharing ? ScreenShareOff : ScreenShare} active={sharing} onClick={() => {}} disabled />
                    <ControlBtn icon={Maximize2} active={false} onClick={() => {}} />
                </div>
            )}

            <style>{`
                .mirror { transform: scaleX(-1); }
                .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

const ControlBtn = ({ icon: Icon, active, onClick, color = 'bg-white/10', disabled }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 disabled:opacity-20
            ${active ? `${color} text-white shadow-lg` : 'bg-transparent border border-white/10 text-white/40 hover:bg-white/5 hover:text-white'}
        `}>
        <Icon size={22} />
    </button>
);

export default CallModal;
