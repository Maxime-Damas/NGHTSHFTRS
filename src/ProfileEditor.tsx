import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Palette, 
  Type, 
  Music, 
  Image as ImageIcon,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ProfilePage from './ProfilePage';
import API_URL from './config';

const FONTS = [
  'Inter',
  'Roboto Mono',
  'Orbitron',
  'Space Grotesk',
  'Montserrat',
  'JetBrains Mono',
  'Bebas Neue',
  'Playfair Display',
  'UnifrakturMaguntia'
];

const PLATFORMS = [
  'Instagram',
  'Twitter',
  'Discord',
  'YouTube',
  'Github',
  'Twitch',
  'Other'
];

const ProfileEditor = ({ member, onUpdate, onBack }: { member: any, onUpdate: (member: any) => void, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    bio: member.bio || '',
    theme_color: member.theme_color || '#ff2d55',
    font_family: member.font_family || 'Inter',
    background_url: member.background_url || '',
    music_url: member.music_url || '',
    show_car: member.show_car === undefined ? true : member.show_car,
    blur_intensity: member.blur_intensity || 2,
    bg_grayscale: member.bg_grayscale || 50,
    social_links: typeof member.social_links === 'string' 
      ? JSON.parse(member.social_links) 
      : member.social_links || []
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance'>('general');
  const [showGifSearch, setShowGifSearch] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'range' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/member/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: member.access_code,
          ...formData
        })
      });

      if (res.ok) {
        const updatedMember = { ...member, ...formData };
        onUpdate(updatedMember);
        localStorage.setItem('memberAccess', JSON.stringify(updatedMember));
        setMessage({ text: 'PROFIL MIS À JOUR AVEC SUCCÈS', type: 'success' });
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessage({ text: 'ERREUR LORS DE LA MISE À JOUR', type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Mock params for preview
  const previewProfile = {
    ...member,
    ...formData
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col md:flex-row">
      {/* Editor Panel */}
      <div className="w-full md:w-[450px] border-r border-white/10 flex flex-col h-screen overflow-hidden bg-black/40 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] uppercase font-black">
            <ArrowLeft size={14} /> Retour
          </button>
          <h2 className="text-sm font-black italic tracking-tighter uppercase">Config_Profil</h2>
        </div>

        <div className="flex border-b border-white/10 bg-black/20">
          {(['general', 'appearance'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[var(--accent-pink)] text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              {tab === 'general' ? 'Général' : 'Apparence'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 group relative">
                  <Share2 size={12} /> Bio de Profil 
                  <AlertCircle size={14} className="cursor-help text-[var(--accent-cyan)] opacity-50 hover:opacity-100 transition-opacity" />
                  
                  {/* Tooltip Popup - Positioned directly below */}
                  <div className="absolute top-full left-0 mt-2 w-72 p-4 bg-[#0a0a0a] border border-white/10 backdrop-blur-xl z-[100] pointer-events-none opacity-0 group-hover:opacity-100 transition-all shadow-2xl">
                    <div className="absolute -top-1 left-10 w-2 h-2 bg-[#0a0a0a] border-t border-l border-white/10 rotate-45" />
                    <p className="text-[var(--accent-cyan)] mb-2 border-b border-white/10 pb-1 italic">GUIDE_MARKDOWN :</p>
                    <div className="space-y-2 text-[9px] text-white/60 normal-case tracking-normal font-sans">
                      <p><span className="text-white font-mono">**gras**</span> : **Texte**</p>
                      <p><span className="text-white font-mono">*italique*</span> : *Texte*</p>
                      <p><span className="text-white font-mono"># Titre</span> : Titre Section</p>
                      <p><span className="text-white font-mono">- Liste</span> : Puces</p>
                      <p><span className="text-white font-mono">&gt; Citation</span> : Bloc stylisé</p>
                      <p><span className="text-white font-mono">[Texte](Lien)</span> : Lien URL</p>
                      <p className="pt-1 border-t border-white/5 text-[8px] italic text-[var(--accent-pink)]">Les sauts de ligne sont automatiques.</p>
                    </div>
                  </div>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Écris quelque chose sur toi..."
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-[var(--accent-pink)] min-h-[120px] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Music size={12} /> URL Musique (SoundCloud / YouTube)
                </label>
                <input
                  type="text"
                  name="music_url"
                  value={formData.music_url}
                  onChange={handleChange}
                  placeholder="https://soundcloud.com/..."
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-[var(--accent-pink)] transition-all"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Afficher le véhicule</span>
                <input
                  type="checkbox"
                  name="show_car"
                  checked={formData.show_car}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_car: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--accent-pink)] cursor-pointer"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Palette size={12} /> Couleur d'accentuation
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    name="theme_color"
                    value={formData.theme_color}
                    onChange={handleChange}
                    className="w-12 h-12 bg-transparent border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    name="theme_color"
                    value={formData.theme_color}
                    onChange={handleChange}
                    className="flex-1 bg-white/5 border border-white/10 p-3 text-xs outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Type size={12} /> Police d'écriture
                </label>
                <select
                  name="font_family"
                  value={formData.font_family}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-[var(--accent-pink)] transition-all appearance-none"
                >
                  {FONTS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <ImageIcon size={12} /> Fond d'écran
                </label>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    name="background_url"
                    value={formData.background_url}
                    onChange={handleChange}
                    placeholder="URL de l'image ou du GIF..."
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-[var(--accent-pink)] transition-all"
                  />
                  <button 
                    onClick={() => setShowGifSearch(true)}
                    className="w-full py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Chercher un GIF (Tenor/Giphy)
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                      <span>Flou du fond</span>
                      <span>{formData.blur_intensity}px</span>
                    </div>
                    <input 
                      type="range" 
                      name="blur_intensity" 
                      min="0" max="20" 
                      value={formData.blur_intensity} 
                      onChange={handleChange}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-pink)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                      <span>Niveau de gris</span>
                      <span>{formData.bg_grayscale}%</span>
                    </div>
                    <input 
                      type="range" 
                      name="bg_grayscale" 
                      min="0" max="100" 
                      value={formData.bg_grayscale} 
                      onChange={handleChange}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-pink)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-[var(--accent-pink)] hover:text-white transition-all flex items-center justify-center gap-2 ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? 'Synchronisation...' : <><Save size={16} /> Sauvegarder</>}
          </button>
          
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 flex items-center gap-2 text-[8px] font-black uppercase border ${message.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}
            >
              {message.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
              {message.text}
            </motion.div>
          )}

          <div className="mt-4 flex justify-between items-center text-[7px] text-white/20 uppercase font-black">
            <span>ID_MEMBER: {member.id}</span>
            <a href={`/u/${member.nickname}`} target="_blank" className="flex items-center gap-1 hover:text-white">
              Voir ma page <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 hidden md:flex flex-col bg-[#0a0a0a] overflow-hidden relative">
        <div className="absolute top-6 left-6 z-20 bg-black/80 px-4 py-2 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">
          Aperçu_En_Direct
        </div>
        
        <div className="flex-1 transform scale-[0.85] origin-top overflow-hidden pointer-events-none rounded-2xl shadow-2xl border border-white/5">
          <PreviewProfile profile={previewProfile} />
        </div>
      </div>

      {/* GIF Search Modal */}
      <AnimatePresence>
        {showGifSearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowGifSearch(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 p-8 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Recherche_GIF</h3>
                <button onClick={() => setShowGifSearch(false)} className="text-white/40 hover:text-white"><AlertCircle size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Chercher sur Tenor / Giphy..." 
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-[var(--accent-pink)]"
                />
                
                <div className="grid grid-cols-3 gap-2 h-96 overflow-y-auto custom-scrollbar p-2">
                  {/* Placeholder for GIF results */}
                  {Array(9).fill(0).map((_, i) => (
                    <div key={i} className="aspect-square bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black uppercase text-white/10">
                      Résultat_{i+1}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] font-bold uppercase text-center">
                  En attente de la marche à suivre pour l'API GIFs
                </div>
              </div>

              <button 
                onClick={() => setShowGifSearch(false)}
                className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simplified version of ProfilePage for live preview without data fetching
const PreviewProfile = ({ profile }: { profile: any }) => {
  const socialLinks = profile.social_links || [];
  const getImgUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('/') ? `${API_URL.replace('/api', '')}${path}` : path;
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-black"
      style={{ 
        fontFamily: profile.font_family || 'Inter',
        color: 'white'
      }}
    >
      <div className="fixed inset-0 z-0">
        {profile.background_url ? (
          <div className="absolute inset-0">
            <img 
              src={profile.background_url} 
              alt="Background" 
              className="w-full h-full object-cover"
              style={{ 
                filter: `blur(${profile.blur_intensity || 0}px) grayscale(${profile.bg_grayscale || 0}%)`,
                opacity: 0.5
              }}
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        )}
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: profile.theme_color || '#ff2d55' }} />
          
          <div className="flex flex-col items-center text-center mb-10">
            <img 
              src={getImgUrl(profile.profile_photo)} 
              className="w-24 h-24 rounded-full object-cover border-2 mb-4"
              style={{ borderColor: profile.theme_color || '#ff2d55' }}
            />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{profile.nickname}</h1>
            <div className="text-white/60 text-xs max-w-sm prose prose-invert prose-xs bio-content">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {profile.bio || 'Aucune bio définie'}
              </ReactMarkdown>
            </div>
          </div>

          <div className="flex justify-center gap-3 flex-wrap mb-8">
            {socialLinks.map((_: any, i: number) => (
              <div key={i} className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center" style={{ color: profile.theme_color }}>
                <Palette size={18} />
              </div>
            ))}
          </div>

          {profile.show_car && (
             <div className="space-y-4">
               <div className="h-px bg-white/10 w-full" />
               <div className="aspect-video bg-white/5 border border-white/10 flex items-center justify-center">
                 <p className="text-[10px] font-black uppercase text-white/20">{profile.car_model}</p>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
