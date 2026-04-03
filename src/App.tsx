import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, Camera, Disc, ChevronRight, Menu, X, Map as MapIcon, Route as RouteIcon, ShieldAlert, Key, Car, UserCircle, CreditCard, LogOut, Settings, ExternalLink } from 'lucide-react';
import AdminPanel from './AdminPanel';
import ProfilePage from './ProfilePage';
import ProfileEditor from './ProfileEditor';
import API_URL from './config';

const getImgUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('/') ? `${API_URL.replace('/api', '')}${path}` : path;
};

// --- SECURITY GATE ---
const SecurityGate = ({ onGrant }: { onGrant: (member: any) => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/verify-access`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    const data = await res.json();
    if (data.status === 'granted') { localStorage.setItem('memberAccess', JSON.stringify(data.member)); onGrant(data.member); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono overflow-hidden relative forbidden-pattern crt">
      <div className="noise" />
      <div className="scanner" />
      
      {/* Decorative corrupted elements */}
      <div className="absolute top-10 left-10 text-[10px] text-white/20 select-none hidden md:block">
        LOG_SYS: TENTATIVE_ÉCHEC_X042<br/>
        TYPE_CHIFFREMENT: AES-256-CBC<br/>
        IP_ORIGINE: 127.0.0.1
      </div>
      <div className="absolute bottom-10 right-10 text-[10px] text-white/20 select-none text-right hidden md:block">
        LATENCE: 14ms<br/>
        PERTE_PAQUETS: 0.04%<br/>
        NIVEAU_SEC: BLACK-OPS
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`relative z-10 w-full max-w-md text-center p-12 border border-white/5 bg-black/60 backdrop-blur-xl ${error ? 'flicker shake border-red-500/50' : ''}`}
      >
        <div className="relative inline-block mb-8">
          <ShieldAlert size={80} className={`relative z-10 transition-colors duration-300 ${error ? 'text-red-500' : 'text-[var(--accent-pink)]'}`} />
          <motion.div 
            animate={error ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] } : {}}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"
          />
        </div>

        <h1 
          className="text-5xl font-bold text-white mb-6 uppercase italic glitch-text glitch-active tracking-tighter"
          data-text="ACCÈS REFUSÉ"
        >
          Accès Refusé
        </h1>
        
        <p className="text-[10px] text-white/40 mb-10 tracking-[0.3em] uppercase">Toute entrée non autorisée sera tracée</p>

        <form onSubmit={handleSubmit} className="space-y-8 relative">
          <div className="relative">
            <input 
              type="password" 
              placeholder="ENTRER CLÉ D'ACCÈS" 
              className={`w-full p-5 bg-white/5 border-b-2 text-center text-xl outline-none transition-all duration-300 ${error ? 'border-red-500 text-red-500' : 'border-white/10 text-[var(--accent-pink)] focus:border-[var(--accent-pink)]'}`}
              value={code} 
              onChange={e => setCode(e.target.value)} 
              autoFocus 
            />
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-6 left-0 w-full text-center text-red-500 text-[10px] font-bold uppercase"
              >
                Niveau d'accréditation invalide
              </motion.div>
            )}
          </div>
          <button className={`w-full py-4 border font-bold uppercase text-xs tracking-widest transition-all duration-300 group relative overflow-hidden ${error ? 'border-red-500 text-red-500' : 'border-white/10 text-white hover:bg-white hover:text-black'}`}>
            <span className="relative z-10">Autoriser l'accès</span>
            <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-pink)] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-[var(--accent-yellow)] animate-pulse [animation-delay:0.4s]" />
        </div>
      </motion.div>

      {/* Warning tape aesthetics */}
      <div className="fixed top-0 left-0 w-full h-4 bg-yellow-500 flex items-center overflow-hidden whitespace-nowrap opacity-10 rotate-1 -translate-y-2 pointer-events-none">
        {Array(20).fill('ATTENTION : ZONE RESTREINTE - ').map((t, i) => <span key={i} className="text-black text-[10px] font-bold mr-4">{t}</span>)}
      </div>
      <div className="fixed bottom-0 left-0 w-full h-4 bg-yellow-500 flex items-center overflow-hidden whitespace-nowrap opacity-10 -rotate-1 translate-y-2 pointer-events-none">
        {Array(20).fill('ATTENTION : ZONE RESTREINTE - ').map((t, i) => <span key={i} className="text-black text-[10px] font-bold mr-4">{t}</span>)}
      </div>
    </div>
  );
};

// --- COMPONENTS ---
const Navbar = ({ member, onLogout, onEditProfile }: { member: any, onLogout: () => void, onEditProfile: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all ${isScrolled ? 'bg-black/90 py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/">
            <img src="/NGHTSHFTRS_Logo_White.png" alt="NGHTSHFTRS" className="h-8" />
          </Link>
          <div className="hidden md:flex gap-6 text-[10px] font-bold uppercase text-white/40">
            <a href="#home">Accueil</a> <a href="#leaderboard">Classement</a> <a href="#events">Événements</a> <a href="#gallery">Garage</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div 
            onClick={onEditProfile}
            className="text-right hidden sm:block cursor-pointer group"
          >
            <p className="text-white text-xs font-bold uppercase group-hover:text-[var(--accent-pink)] transition-colors">{member.nickname}</p>
            <p className="text-[var(--accent-pink)] text-[8px] font-bold uppercase tracking-widest flex items-center justify-end gap-1">
              ÉDITER <Settings size={8} />
            </p>
          </div>
          <div 
            onClick={onEditProfile}
            className="relative cursor-pointer group"
          >
            <img src={getImgUrl(member.profile_photo)} className="w-10 h-10 rounded-full border border-[var(--accent-pink)] group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Settings size={16} className="text-white" />
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-white/10 hover:text-red-500 transition-colors"><LogOut size={16}/></button>
        </div>
      </div>
    </nav>
  );
};

const Leaderboard = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { fetch(`${API_URL}/leaderboard`).then(res => res.json()).then(d => setData(d)); }, []);

  return (
    <section id="leaderboard" className="py-24 bg-[#0a0a0a] border-y border-white/5">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 italic tracking-tighter">CLASSEMENT</h2>
        <div className="grid gap-2">
          {data.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-6">
                <span className={`text-2xl font-black italic ${idx === 0 ? 'text-[var(--accent-yellow)]' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-white/10'}`}>#{idx + 1}</span>
                <Link to={`/u/${m.nickname}`} className="flex items-center gap-6 group/link">
                  <img src={getImgUrl(m.profile_photo)} className="w-10 h-10 rounded object-cover border border-white/10 group-hover/link:border-[var(--accent-pink)] transition-colors" />
                  <div>
                    <p className="text-white font-bold uppercase group-hover/link:text-[var(--accent-pink)] transition-colors">{m.nickname}</p>
                    <p className="text-[8px] text-white/30 uppercase">{m.car_model}</p>
                  </div>
                </Link>
              </div>
              <div className="flex gap-8 items-center">
                <div className="flex gap-4 text-[10px] font-bold">
                  <div className="text-center"><p className="text-[var(--accent-yellow)]">1ER</p><p>{m.wins_1st}</p></div>
                  <div className="text-center text-white/40"><p>2E</p><p>{m.wins_2nd}</p></div>
                  <div className="text-center text-[var(--accent-pink)]"><p>3E</p><p>{m.wins_3rd}</p></div>
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-white font-black italic">
                  {m.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Hero = ({ member }: { member: any }) => (
  <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
    <div className="absolute inset-0 opacity-40"><img src={getImgUrl(member.car_photo)} className="w-full h-full object-cover grayscale" /></div>
    <div className="container mx-auto px-6 relative z-20 text-center">
      <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src="/NGHTSHFTRS_Logo_White.png" className="mx-auto h-32 md:h-48 mb-8" />
      <h1 className="text-5xl md:text-8xl font-black mb-4 text-white uppercase italic glitch-text" data-text="NGHTSHFTRS">NGHTSHFTRS</h1>
      <p className="text-[var(--accent-cyan)] font-bold tracking-[0.5em] uppercase">Ravi de te revoir, {member.nickname}</p>
    </div>
  </section>
);

const ProfileDetails = ({ member }: { member: any }) => (
  <section className="py-24 bg-[#050505] border-b border-white/5">
    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
      <div className="space-y-12">
        <h2 className="text-4xl font-bold text-white italic tracking-tighter uppercase">Profil</h2>
        <div className="grid gap-4">
          <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10"><UserCircle size={32} className="text-[var(--accent-pink)]" /><div><p className="text-[10px] text-white/40 uppercase">Identité</p><p className="text-lg font-bold text-white">{member.nickname}</p></div></div>
          <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10"><Car size={32} className="text-[var(--accent-cyan)]" /><div><p className="text-[10px] text-white/40 uppercase">Véhicule Actuel</p><p className="text-lg font-bold text-white">{member.car_model}</p></div></div>
          <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10"><Trophy size={32} className="text-[var(--accent-yellow)]" /><div><p className="text-[10px] text-white/40 uppercase">Palmarès</p><p className="text-lg font-bold text-white">{member.wins_1st}W / {member.wins_2nd}P / {member.wins_3rd}S</p></div></div>
        </div>
      </div>
      <div className="relative">
        {member.id_card_photo ? (
          <img src={getImgUrl(member.id_card_photo)} className="w-full border border-white/10 shadow-2xl skew-y-2" alt="Carte ID" />
        ) : (
          <div className="w-full aspect-[4/3] bg-white/5 border border-white/10 flex items-center justify-center">
            <UserCircle size={64} className="text-white/10" />
          </div>
        )}
      </div>
    </div>
  </section>
);

const Events = ({ member }: { member: any }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => { 
    fetch(`${API_URL}/events`).then(res => res.json()).then(d => setEvents(d)); 
  }, []);

  useEffect(() => {
    if (selectedEvent && member) {
      fetch(`${API_URL}/events/${selectedEvent.id}/participation-status/${member.id}`)
        .then(res => res.json())
        .then(data => setIsRegistered(data.isRegistered));
    }
  }, [selectedEvent, member]);

  const handleRegister = async () => {
    if (!selectedEvent || !member) return;
    setRegistering(true);
    const res = await fetch(`${API_URL}/events/${selectedEvent.id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: member.id })
    });
    if (res.ok) {
      setIsRegistered(true);
      fetch(`${API_URL}/events`).then(res => res.json()).then(d => setEvents(d));
    }
    setRegistering(false);
  };

  return (
    <section id="events" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 italic tracking-tighter">À venir</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {events.map(e => (
            <div key={e.id} onClick={() => setSelectedEvent(e)} className="bg-white/5 border border-white/10 cursor-pointer group hover:border-[var(--accent-pink)]/50 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img src={getImgUrl(e.location_image)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute bottom-4 left-4 bg-[var(--accent-pink)] px-2 py-1 text-[8px] font-bold uppercase">{e.type}</div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 text-[8px] font-bold uppercase border border-white/10 text-white/60">
                  {e.participant_count || 0} Coureurs
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{e.title}</h3>
                <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase mb-4">
                  <span>{e.date}</span>
                  <span className="text-[var(--accent-yellow)]">{e.reward}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-white/20">
                  <span>FRAIS : {parseFloat(e.price) > 0 ? `$ ${e.price}` : 'GRATUIT'}</span>
                  <span className="text-[var(--accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity">VOIR INFOS &gt;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6" onClick={() => setSelectedEvent(null)}>
            <div className="w-full max-w-5xl grid md:grid-cols-2 bg-[#0a0a0a] border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-12 space-y-8">
                <h2 className="text-5xl font-bold text-white italic tracking-tighter uppercase">{selectedEvent.title}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border-white/10 border"><p className="text-[10px] text-white/40 uppercase mb-1">Lieu</p><p className="text-white font-bold">{selectedEvent.location}</p></div>
                  <div className="p-4 bg-white/5 border-white/10 border"><p className="text-[10px] text-white/40 uppercase mb-1">Frais d'entrée</p><p className="text-[var(--accent-yellow)] font-bold">{parseFloat(selectedEvent.price) > 0 ? `${selectedEvent.price} $` : 'GRATUIT'}</p></div>
                </div>
                <div className="pt-4">
                  {isRegistered ? (
                    <div className="w-full py-4 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-black uppercase text-xs text-center">Inscription Confirmée</div>
                  ) : (
                    <button onClick={handleRegister} disabled={registering} className="w-full py-4 bg-white text-black font-bold uppercase text-xs hover:bg-[var(--accent-pink)] hover:text-white transition-all disabled:opacity-50">
                      {registering ? 'Traitement...' : "S'inscrire à l'événement"}
                    </button>
                  )}
                </div>
                <button onClick={() => setSelectedEvent(null)} className="px-8 py-3 bg-white/5 text-white/40 border border-white/10 font-bold uppercase text-[10px]">Compris</button>
              </div>
              <div className="bg-black p-2"><img src={getImgUrl(selectedEvent.route_image || selectedEvent.location_image)} className="w-full h-full object-contain" /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Gallery = () => {
  const [images, setImages] = useState<any[]>([]);
  useEffect(() => { fetch(`${API_URL}/gallery`).then(res => res.json()).then(d => setImages(d)); }, []);
  return (
    <section id="gallery" className="py-24 bg-[#050505]">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 italic tracking-tighter">Photos Souvenirs</h2>
        <div className="grid grid-cols-4 gap-2">
          {images.map(img => <div key={img.id} className="aspect-square overflow-hidden border border-white/10 group grayscale hover:grayscale-0"><img src={getImgUrl(img.url)} className="w-full h-full object-cover group-hover:scale-110 transition-all" /></div>)}
        </div>
      </div>
    </section>
  );
};

// --- MAIN APP ---
const App = () => {
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const syncMember = async () => {
      const saved = localStorage.getItem('memberAccess');
      if (saved) {
        const parsed = JSON.parse(saved);
        const res = await fetch(`${API_URL}/verify-access`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: parsed.access_code }) });
        const data = await res.json();
        if (data.status === 'granted') { setMember(data.member); localStorage.setItem('memberAccess', JSON.stringify(data.member)); }
        else localStorage.removeItem('memberAccess');
      }
      setLoading(false);
    };
    syncMember();
  }, []);

  const handleLogout = () => { localStorage.removeItem('memberAccess'); setMember(null); setShowEditor(false); };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/u/:nickname" element={<ProfilePage />} />
        <Route path="/" element={!member ? <SecurityGate onGrant={setMember} /> : (
          showEditor ? (
            <ProfileEditor 
              member={member} 
              onUpdate={(updated) => setMember(updated)} 
              onBack={() => setShowEditor(false)} 
            />
          ) : (
            <div className="crt bg-black min-h-screen">
              <Navbar member={member} onLogout={handleLogout} onEditProfile={() => setShowEditor(true)} />
              <Hero member={member} />
              <Leaderboard />
              <ProfileDetails member={member} />
              <Events member={member} />
              <Gallery />
              <footer className="py-12 bg-black text-center text-[8px] text-white/10 uppercase tracking-[1em]">Protocol: NGHT-SYND-2026</footer>
            </div>
          )
        )} />
      </Routes>
    </Router>
  );
};

export default App;
