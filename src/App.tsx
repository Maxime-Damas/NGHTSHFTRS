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
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setError(false);

    const timer = setTimeout(() => setIsWakingUp(true), 2500);

    try {
      const res = await fetch(`${API_URL}/verify-access`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ code }) 
      });
      
      const data = await res.json();
      clearTimeout(timer);
      setIsWakingUp(false);

      if (data.status === 'granted') { 
        localStorage.setItem('memberAccess', JSON.stringify(data.member)); 
        onGrant(data.member); 
      } else { 
        setError(true); 
        setTimeout(() => setError(false), 2000); 
      }
    } catch (err) {
      clearTimeout(timer);
      setIsWakingUp(false);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono overflow-hidden relative forbidden-pattern crt">
      <div className="noise" />
      <div className="scanner" />

      {/* OVERLAY CHARGEMENT */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-12 h-12 border-2 border-[var(--accent-pink)] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-white font-bold tracking-widest uppercase text-sm">Initialisation...</p>
            {isWakingUp && (
              <p className="mt-4 text-yellow-500 text-[10px] font-bold uppercase animate-pulse">
                🚀 Le serveur chauffe... (Sortie de garage Render ~30s)
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
        className={`relative z-10 w-full max-w-md text-center p-12 border border-white/5 bg-black/60 backdrop-blur-xl ${error ? 'flicker shake border-red-500/50' : ''}`}
      >
        <div className="relative inline-block mb-8">
          <ShieldAlert size={80} className={`${error ? 'text-red-500' : 'text-[var(--accent-pink)]'}`} />
        </div>

        <h1 className="text-5xl font-bold text-white mb-6 uppercase italic glitch-text" data-text="ACCÈS REFUSÉ">Accès Refusé</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <input 
            type="password" placeholder="ENTRER CLÉ D'ACCÈS" 
            className={`w-full p-5 bg-white/5 border-b-2 text-center text-xl outline-none ${error ? 'border-red-500 text-red-500' : 'border-white/10 text-[var(--accent-pink)]'}`}
            value={code} onChange={e => setCode(e.target.value)} disabled={loading} autoFocus 
          />
          <button disabled={loading} className="w-full py-4 border border-white/10 text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all">
            {loading ? 'Connexion...' : "Autoriser l'accès"}
          </button>
        </form>
      </motion.div>

      {/* Bandes jaunes de décoration */}
      <div className="fixed top-0 left-0 w-full h-4 bg-yellow-500 opacity-10 rotate-1 -translate-y-2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-full h-4 bg-yellow-500 opacity-10 -rotate-1 translate-y-2 pointer-events-none" />
    </div>
  );
};

const WarmingUpScreen = () => {
  const [progress, setProgress] = React.useState(0);

  // On crée une animation manuelle en React pour être SÛR que ça bouge
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5; // Vitesse de remplissage
      });
    }, 150); // Mise à jour toutes les 150ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      fontFamily: 'monospace',
      color: 'white'
    }}>
      {/* Logo */}
      <img 
        src="/NGHTSHFTRS_Logo_White.png" 
        style={{ height: '60px', marginBottom: '40px', opacity: 0.6 }} 
        alt="Logo" 
      />

      <div style={{ width: '80%', maxWidth: '300px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '3px', marginBottom: '20px', fontWeight: 'bold' }}>
          PRÉCHAUFFAGE DU MOTEUR...
        </p>

        {/* Container de la barre (Gris foncé) */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#222',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #333'
        }}>
          {/* Remplissage de la barre (Rouge) */}
          <div style={{
            height: '100%',
            width: `${progress}%`, // C'est React qui gère la largeur ici
            backgroundColor: '#ff3e3e',
            boxShadow: '0 0 10px #ff3e3e',
            transition: 'width 0.2s linear'
          }} />
        </div>

        <p style={{ fontSize: '8px', color: '#555', marginTop: '15px', textTransform: 'uppercase' }}>
          Initialisation du système : {Math.round(progress)}%
        </p>
      </div>

      {/* Petit effet de scan (optionnel) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 2px, 3px 100%',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [member, setMember] = useState<any | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const syncMember = async () => {
      const saved = localStorage.getItem('memberAccess');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // On appelle le serveur
          const res = await fetch(`${API_URL}/verify-access`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: parsed.access_code }) 
          });
          const data = await res.json();
          if (data.status === 'granted') {
            setMember(data.member);
          } else {
            localStorage.removeItem('memberAccess');
          }
        } catch (e) {
          console.error("Serveur en cours de réveil...");
        }
      } else {
          // Si pas de membre sauvegardé, on simule quand même un petit temps 
          // pour s'assurer que le serveur est prêt pour la suite
          try {
            await fetch(`${API_URL}/leaderboard`); 
          } catch(e) {}
      }
      // On libère l'affichage une fois la réponse reçue
      setAppLoading(false);
    };
    
    syncMember();
  }, []);

  // --- ICI ON AFFICHE TON NOUVEL ÉCRAN ---
  if (appLoading) {
    return <WarmingUpScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/u/:nickname" element={<ProfilePage />} />
        <Route path="/" element={!member ? (
          <SecurityGate onGrant={setMember} />
        ) : (
          showEditor ? (
            <ProfileEditor member={member} onUpdate={setMember} onBack={() => setShowEditor(false)} />
          ) : (
            <div className="crt bg-black min-h-screen">
              <Navbar member={member} onLogout={() => { localStorage.removeItem('memberAccess'); setMember(null); }} onEditProfile={() => setShowEditor(true)} />
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
