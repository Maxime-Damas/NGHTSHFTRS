import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Calendar, Users, ShieldCheck, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import API_URL from './config';

const BASE_URL = API_URL.replace('/api', '');

const LegalNavbar = () => (
  <nav className="fixed top-0 left-0 w-full z-[100] bg-black/80 backdrop-blur-md border-b border-white/5 py-4">
    <div className="container mx-auto px-6 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <img src="/NGHTSHFTRS_Logo_White.png" alt="NGHTSHFTRS" className="h-8 md:h-10" />
        <span className="font-heading text-[10px] md:text-xs tracking-[0.2em] font-bold text-white uppercase hidden sm:block">Automotive Club</span>
      </Link>
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/60">
          <a href="#about" className="hover:text-white transition-colors">Association</a>
          <a href="#events" className="hover:text-white transition-colors">Événements</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <Link 
          to="/portal" 
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all border border-white/5 hover:border-white/20 px-4 py-2"
        >
          Accès Membre
        </Link>
      </div>
    </div>
  </nav>
);

const LegalHero = () => (
  <section className="relative min-h-[90vh] flex items-center pt-20 bg-[#050505] overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0a0a0a] z-0 hidden lg:block" 
         style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}>
      <img src="/src/assets/hero.png" alt="Car" className="w-full h-full object-cover grayscale opacity-40" />
    </div>
    
    <div className="container mx-auto px-6 relative z-10">
      <div className="max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-4 block">Depuis 2024</span>
          <h1 className="text-5xl md:text-8xl font-heading font-black text-white leading-tight mb-8">
            NGHT<br />SHFTRS
          </h1>
          <p className="text-lg text-white/60 font-light leading-relaxed mb-10 max-w-lg">
            Une association dédiée à la culture automobile d'exception. Nous rassemblons les passionnés autour d'événements exclusifs, de sorties sur circuit et de rencontres de prestige.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#events" className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/80 transition-all flex items-center gap-2">
              Calendrier 2026 <ChevronRight size={14} />
            </a>
            <a href="#about" className="px-8 py-4 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              L'Association
            </a>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Decorative element */}
    <div className="absolute bottom-10 left-6 font-heading text-[120px] text-white/[0.02] font-black pointer-events-none select-none uppercase">
      Movement
    </div>
  </section>
);

const LegalAbout = () => (
  <section id="about" className="py-32 bg-black">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-heading font-bold text-white uppercase italic tracking-tighter">Notre Vision</h2>
          <p className="text-white/60 leading-relaxed italic">
            "Plus qu'un club, une institution pour ceux qui considèrent l'automobile comme un art de vivre."
          </p>
          <div className="grid gap-6">
            <div className="flex gap-6 p-8 bg-white/[0.02] border border-white/5">
              <ShieldCheck className="text-white shrink-0" size={32} />
              <div>
                <h4 className="font-bold text-white uppercase text-sm mb-2">Sécurité & Éthique</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Nous promouvons une conduite responsable et l'usage de circuits sécurisés pour exprimer la performance.
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-8 bg-white/[0.02] border border-white/5">
              <Users className="text-white shrink-0" size={32} />
              <div>
                <h4 className="font-bold text-white uppercase text-sm mb-2">Communauté</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Un réseau de membres sélectionnés partageant des valeurs d'entraide et de passion mécanique.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] bg-white/[0.03] overflow-hidden">
             <div className="w-full h-full flex items-center justify-center text-white/5 font-heading text-xs uppercase tracking-[0.5em] rotate-90">NGHTSHFTRS Gallery</div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-2/3 aspect-square bg-black border border-white/5 p-4 shadow-2xl hidden md:block">
            <div className="w-full h-full bg-white/[0.02] flex items-center justify-center text-[8px] uppercase tracking-widest text-white/20 font-bold">Official Meetup 2025</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const LegalEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/public-events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch public events:", err);
        setLoading(false);
      });
  }, []);

  const getImgUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('/') ? `${BASE_URL}${path}` : path;
  };

  return (
    <section id="events" className="py-32 bg-[#050505] border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-heading font-bold text-white uppercase italic tracking-tighter mb-4">Événements</h2>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Saison Officielle 2026</p>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/10 pb-2">Track Days & Expositions</span>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/5 border-t-white animate-spin rounded-full" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {events.map((event, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[16/10] bg-white/[0.03] mb-6 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/5">
                   <img 
                    src={getImgUrl(event.location_image || event.route_image)} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                     <span className="px-4 py-2 bg-white text-black text-[8px] font-bold uppercase tracking-widest">En savoir plus</span>
                   </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white uppercase font-heading group-hover:text-white/60 transition-colors">{event.title}</h3>
                  <span className="text-[8px] bg-white text-black px-2 py-1 font-bold uppercase tracking-widest">{event.type}</span>
                </div>
                <div className="flex gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {event.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-white/5 border-dashed text-white/10 uppercase font-black italic tracking-widest text-xs">
            Aucun événement public prévu pour le moment.
          </div>
        )}
      </div>
    </section>
  );
};

const LegalFooter = () => (
  <footer id="contact" className="py-20 bg-black border-t border-white/5">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-2">
          <img src="/NGHTSHFTRS_Logo_White.png" alt="Logo" className="h-8 mb-6" />
          <p className="text-xs text-white/40 leading-relaxed max-w-sm uppercase tracking-wider">
            Association Loi 1901 à but non lucratif. Dédiée à la préservation et à la célébration du patrimoine automobile moderne et classique.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-white/80">Navigation</h4>
          <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <li><a href="#" className="hover:text-white transition-colors">Accueil</a></li>
            <li><a href="#about" className="hover:text-white transition-colors">L'Association</a></li>
            <li><a href="#events" className="hover:text-white transition-colors">Événements</a></li>
            <li><Link to="/portal" className="hover:text-white transition-colors text-white/10">Espace Membre</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-white/80">Social</h4>
          <div className="flex gap-6 text-white/30">
            <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Facebook size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Youtube size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/10">
          © 2026 NGHTSHFTRS AUTOMOTIVE CLUB. TOUS DROITS RÉSERVÉS.
        </p>
        <div className="flex gap-8 text-[8px] font-bold uppercase tracking-[0.4em] text-white/10">
          <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
          <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
        </div>
      </div>
    </div>
  </footer>
);

const LegalSite = () => {
  return (
    <div className="bg-black min-h-screen font-main selection:bg-white selection:text-black">
      <LegalNavbar />
      <main>
        <LegalHero />
        <LegalAbout />
        <LegalEvents />
      </main>
      <LegalFooter />
    </div>
  );
};

export default LegalSite;