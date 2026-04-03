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

// --- NOUVEAU COMPOSANT : ÉCRAN DE PRÉCHAUFFAGE ---
const WarmingUpScreen = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.4; // Vitesse de remplissage
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: 'black',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', position: 'fixed', top: 0, left: 0,
      zIndex: 9999, fontFamily: 'monospace', color: 'white'
    }}>
      <div className="noise" />
      <img src="/NGHTSHFTRS_Logo_White.png" style={{ height: '60px', marginBottom: '40px', opacity: 0.6 }} alt="Logo" />
      <div style={{ width: '80%', maxWidth: '300px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '3px', marginBottom: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Préchauffage du moteur...
        </p>
        <div style={{ width: '100%', height: '6px', backgroundColor: '#222', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#ff3e3e', boxShadow: '0 0 10px #ff3e3e', transition: 'width 0.2s linear' }} />
        </div>
        <p style={{ fontSize: '8px', color: '#555', marginTop: '15px', textTransform: 'uppercase' }}>
          Initialisation : {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`relative z-10 w-full max-w-md text-center p-12 border border-white/5 bg-black/60 backdrop-blur-xl ${error ? 'flicker shake border-red-500/50' : ''}`}
      >
        <div className="relative inline-block mb-8">
          <ShieldAlert size={80} className={`${error ? 'text-red-500' : 'text-[var(--accent-pink)]'}`} />
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 uppercase italic glitch-text" data-text="ACCÈS REFUSÉ">Accès Refusé</h1>
        <form onSubmit={handleSubmit} className="space-y-8 relative">
          <input 
            type="password" placeholder="ENTRER CLÉ D'ACCÈS" 
            className={`w-full p-5 bg-white/5 border-b-2 text-center text-xl outline-none ${error ? 'border-red-500 text-red-500' : 'border-white/10 text-[var(--accent-pink)]'}`}
            value={code} onChange={e => setCode(e.target.value)} autoFocus 
          />
          <button className="w-full py-4 border border-white/10 text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all">
            Autoriser l'accès
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- NAVBAR, LEADERBOARD, HERO, ETC. (Gardés identiques) ---
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
          <Link to="/"><img src="/NGHTSHFTRS_Logo_White.png" alt="NGHTSHFTRS" className="h-8" /></Link>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={onEditProfile} className="text-right hidden sm:block cursor-pointer group">
            <p className="text-white text-xs font-bold uppercase group-hover:text-[var(--accent-pink)]">{member.nickname}</p>
            <p className="text-[var(--accent-pink)] text-[8px] font-bold uppercase tracking-widest flex items-center justify-end gap-1">ÉDITER <Settings size={8} /></p>
          </div>
          <button onClick={onLogout} className="p-2 text-white/10 hover:text-red-500"><LogOut size={16}/></button>
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
        <h2 className="text-3xl font-bold text-white mb-12 italic tracking-tighter uppercase">Classement</h2>
        <div className="grid gap-2">
          {data.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-6">
                <span className={`text-2xl font-black italic ${idx === 0 ? 'text-[var(--accent-yellow)]' : 'text-white/10'}`}>#{idx + 1}</span>
                <Link to={`/u/${m.nickname}`} className="flex items-center gap-6 group/link">
                  <img src={getImgUrl(m.profile_photo)} className="w-10 h-10 rounded object-cover border border-white/10 group-hover/link:border-[var(--accent-pink)]" />
                  <div><p className="text-white font-bold uppercase group-hover/link:text-[var(--accent-pink)]">{m.nickname}</p><p className="text-[8px] text-white/30 uppercase">{m.car_model}</p></div>
                </Link>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-white font-black italic">{m.score}</div>
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
        </div>
      </div>
      <div className="relative">{member.id_card_photo && <img src={getImgUrl(member.id_card_photo)} className="w-full border border-white/10 shadow-2xl skew-y-2" alt="Carte ID" />}</div>
    </div>
  </section>
);

const Events = ({ member }: { member: any }) => {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => { fetch(`${API_URL}/events`).then(res => res.json()).then(d => setEvents(d)); }, []);
  return (
    <section id="events" className="py-24 bg-black">
      <div className="container mx-auto px-6"><h2 className="text-3xl font-bold text-white mb-12 italic tracking-tighter uppercase">À venir</h2><div className="grid md:grid-cols-3 gap-8">{events.map(e => <div key={e.id} className="bg-white/5 border border-white/10 p-6"><h3 className="text-xl font-bold text-white mb-2">{e.title}</h3><p className="text-[10px] text-white/40 uppercase">{e.date}</p></div>)}</div></div>
    </section>
  );
};

const Gallery = () => {
  const [images, setImages] = useState<any[]>([]);
  useEffect(() => { fetch(`${API_URL}/gallery`).then(res => res.json()).then(d => setImages(d)); }, []);
  return (
    <section id="gallery" className="py-24 bg-[#050505]"><div className="container mx-auto px-6"><h2 className="text-3xl font-bold text-white mb-12 italic tracking-tighter uppercase">Garage</h2><div className="grid grid-cols-4 gap-2">{images.map(img => <div key={img.id} className="aspect-square border border-white/10 overflow-hidden"><img src={getImgUrl(img.url)} className="w-full h-full object-cover" /></div>)}</div></div></section>
  );
};

// --- COMPOSANT APP PRINCIPAL : LA LOGIQUE DE CHARGEMENT EST ICI ---
const App = () => {
  const [member, setMember] = useState<any | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const syncMember = async () => {
      // On force une attente de 4 secondes minimum pour le style
      const minimumWait = new Promise(resolve => setTimeout(resolve, 4000));
      const saved = localStorage.getItem('memberAccess');
      
      try {
        if (saved) {
          const parsed = JSON.parse(saved);
          const res = await fetch(`${API_URL}/verify-access`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: parsed.access_code }) 
          });
          const data = await res.json();
          if (data.status === 'granted') setMember(data.member);
        } else {
          // Si pas de session, on réveille quand même le serveur
          await fetch(`${API_URL}/leaderboard`).catch(() => {});
        }
      } catch (e) {
        console.error("Serveur en réveil...");
      }

      // On attend que les deux soient finis (L'API + les 4 secondes)
      await minimumWait;
      setAppLoading(false);
    };
    syncMember();
  }, []);

  // ICI : On remplace le chargement vide par ton nouvel écran
  if (appLoading) return <WarmingUpScreen />;

  const handleLogout = () => { localStorage.removeItem('memberAccess'); setMember(null); setShowEditor(false); };

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/u/:nickname" element={<ProfilePage />} />
        <Route path="/" element={!member ? <SecurityGate onGrant={setMember} /> : (
          showEditor ? (
            <ProfileEditor member={member} onUpdate={setMember} onBack={() => setShowEditor(false)} />
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