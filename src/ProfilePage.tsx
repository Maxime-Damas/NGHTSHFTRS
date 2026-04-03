import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, 
  Twitter, 
  Github, 
  Globe, 
  Music, 
  Car, 
  Trophy, 
  ExternalLink,
  Disc as Discord,
  Youtube,
  Twitch
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import API_URL from './config';

const getImgUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('/') ? `${API_URL.replace('/api', '')}${path}` : path;
};

const SocialIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram size={size} />;
    case 'twitter': case 'x': return <Twitter size={size} />;
    case 'github': return <Github size={size} />;
    case 'discord': return <Discord size={size} />;
    case 'youtube': return <Youtube size={size} />;
    case 'twitch': return <Twitch size={size} />;
    default: return <Globe size={size} />;
  }
};

const ProfileGate = ({ onEnter }: { onEnter: () => void }) => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5, ease: "easeInOut" }}
    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer font-mono"
    onClick={onEnter}
  >
    <div className="noise opacity-20" />
    <motion.div 
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-white text-[10px] uppercase tracking-[1em] font-black italic"
    >
      Appuyer pour entrer
    </motion.div>
    <div className="fixed inset-0 pointer-events-none crt" />
  </motion.div>
);

const ProfilePage = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/profile/${nickname}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [nickname]);

  const handleEnter = () => {
    setEntered(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Playback failed:", e));
    }
  };

  useEffect(() => {
    const handleKeyPress = () => { if (!entered) handleEnter(); };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [entered, profile]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="text-[var(--accent-pink)] animate-pulse uppercase tracking-[0.5em]">Initialisation_Système...</div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="text-red-500 uppercase tracking-[0.2em] text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p>Profil non trouvé ou désactivé</p>
      </div>
    </div>
  );

  const socialLinks = typeof profile.social_links === 'string' 
    ? JSON.parse(profile.social_links) 
    : profile.social_links || [];

  const isSoundCloud = profile.music_url?.includes('soundcloud.com');
  const isYouTube = profile.music_url?.includes('youtube.com') || profile.music_url?.includes('youtu.be');

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-6 overflow-x-hidden"
      style={{ 
        fontFamily: profile.font_family || 'Inter',
        color: 'white'
      }}
    >
      <AnimatePresence>
        {!entered && <ProfileGate onEnter={handleEnter} />}
      </AnimatePresence>

      {/* Hidden/Invisible Audio Engine */}
      <div className="fixed opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        {profile.music_url && (
          isSoundCloud ? (
            entered && (
              <iframe 
                allow="autoplay" 
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(profile.music_url)}&auto_play=true`}
              ></iframe>
            )
          ) : isYouTube ? (
            entered && (
              <iframe 
                allow="autoplay" 
                src={`https://www.youtube.com/embed/${profile.music_url.split('v=')[1] || profile.music_url.split('/').pop()}?autoplay=1`}
              ></iframe>
            )
          ) : (
            <audio ref={audioRef} src={profile.music_url} loop />
          )
        )}
      </div>
      {/* Background Layer */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
        <div className="noise opacity-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Accent decoration */}
          <div 
            className="absolute top-0 left-0 w-full h-1" 
            style={{ backgroundColor: profile.theme_color || '#ff2d55' }}
          />
          <div 
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20"
            style={{ backgroundColor: profile.theme_color || '#ff2d55' }}
          />

          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative mb-6"
            >
              <img 
                src={getImgUrl(profile.profile_photo)} 
                alt={profile.nickname}
                className="w-32 h-32 rounded-full object-cover border-2 shadow-lg"
                style={{ borderColor: profile.theme_color || '#ff2d55' }}
              />
              <div 
                className="absolute -bottom-2 -right-2 p-2 bg-black border border-white/10 rounded-full"
                style={{ color: profile.theme_color || '#ff2d55' }}
              >
                <Trophy size={16} />
              </div>
            </motion.div>

            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 italic">
              {profile.nickname}
            </h1>
            
            {profile.bio && (
              <div className="text-white/60 text-sm max-w-sm leading-relaxed mb-6 prose prose-invert prose-xs bio-content">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {profile.bio}
                </ReactMarkdown>
              </div>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((link: any, idx: number) => (
                <motion.a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: profile.theme_color || '#ff2d55' }}
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Car Info Section */}
          {profile.show_car && (profile.car_model || profile.car_photo) && (
            <div className="mb-10 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                <Car size={12} />
                <span>Véhicule</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              
              <div className="relative aspect-video overflow-hidden border border-white/10 group/car">
                {profile.car_photo ? (
                  <img 
                    src={getImgUrl(profile.car_photo)} 
                    alt={profile.car_model}
                    className="w-full h-full object-cover grayscale transition-all duration-500 group-hover/car:grayscale-0 group-hover/car:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Car size={48} className="text-white/10" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white font-bold uppercase italic text-lg">{profile.car_model}</p>
                </div>
              </div>
            </div>
          )}

          {/* Music Player Section - Sleek Mini Version */}
          {profile.music_url && (
            <div className="mb-10 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                <Music size={12} />
                <span>Audio Log</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              
              <div 
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg group/player hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  if (isSoundCloud || isYouTube) return; // Cannot easily pause/play hidden iframes without complex API
                  if (audioRef.current) {
                    if (isPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                    setIsPlaying(!isPlaying);
                  }
                }}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-10 h-10 rounded flex items-center justify-center bg-black border border-white/10 text-[var(--accent-pink)] ${isPlaying ? 'animate-pulse' : ''}`}>
                    <Music size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-tighter truncate text-white">Système Audio Actif</p>
                    <p className="text-[8px] font-bold uppercase text-white/40 tracking-widest">
                      {isSoundCloud ? 'Source: SoundCloud' : isYouTube ? 'Source: YouTube' : 'Source: Audio Log'}
                    </p>
                  </div>
                </div>
                
                <div 
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  {isPlaying ? <div className="flex gap-1"><div className="w-1 h-3 bg-current" /><div className="w-1 h-3 bg-current" /></div> : <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent" />}
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-[8px] text-[var(--accent-yellow)] font-black uppercase tracking-widest mb-1">1ER</p>
              <p className="text-xl font-black italic">{profile.wins_1st}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mb-1">2E</p>
              <p className="text-xl font-black italic">{profile.wins_2nd}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-[var(--accent-pink)] font-black uppercase tracking-widest mb-1">3E</p>
              <p className="text-xl font-black italic">{profile.wins_3rd}</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
          <span>NGHTSHFTRS // SYSTEM_PROFILE</span>
          <a href="/" className="hover:text-white transition-colors">Rejoindre le Syndicat</a>
        </div>
      </motion.div>

      {/* Decorative CRT line */}
      <div className="fixed inset-0 pointer-events-none crt" />
    </div>
  );
};

export default ProfilePage;
