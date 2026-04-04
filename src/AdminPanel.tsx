import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image as ImageIcon, Users, LogOut, Plus, Trash2, Edit2, ShieldAlert, Save, Key, UserCircle, Car, Trophy, Upload, X } from 'lucide-react';
import API_URL from './config';

const BASE_URL = API_URL.replace('/api', '');
const EVENT_TYPES = ['Street Race', 'Car Meet', 'Toughe', 'Drift Trial', 'Other'];

// --- REUSABLE IMAGE UPLOAD COMPONENT ---
const ImageUpload = ({ label, value, onChange, fieldName }: { label: string, value: any, onChange: (file: File | string) => void, fieldName: string }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof value === 'string' && value) {
      setPreview(value.startsWith('http') || value.startsWith('/') ? value : null);
      if (value.startsWith('http')) setUrlInput(value);
    } else if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
      setUrlInput('');
    }
  }, [value]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onChange(file);
      setUrlInput(''); // Clear URL if file is uploaded
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    if (url.trim()) {
      onChange(url); // Set value as string URL
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleFile(blob);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div 
        className={`relative group border-2 border-dashed transition-all duration-300 p-4 bg-black/40 flex flex-col items-center justify-center min-h-[120px] cursor-pointer ${isDragging ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/5' : 'border-white/10 hover:border-white/30'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
        />
        
        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <img src={preview.startsWith('/') && !preview.startsWith('http') ? `${BASE_URL}${preview}` : preview} alt="Preview" className="max-h-24 object-contain mb-2" />
            <span className="text-[8px] text-white/40 uppercase truncate max-w-full">{value instanceof File ? value.name : 'Image Distante'}</span>
            <button 
              className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); onChange(''); setPreview(null); setUrlInput(''); }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors text-center">
            <Upload size={24} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
            <span className="text-[7px] uppercase opacity-50">Drop, Paste or Click</span>
          </div>
        )}
      </div>
      <input 
        type="text" 
        placeholder="Ou coller une URL directe (https://...)" 
        className="w-full bg-black/60 border border-white/5 p-2 text-[8px] uppercase font-bold outline-none focus:border-[var(--accent-purple)] transition-colors"
        value={urlInput}
        onChange={handleUrlChange}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const AdminPanel = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [activeTab, setActiveTab] = useState('events');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // Data states
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Editing states
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Form states
  const [newEvent, setNewEvent] = useState<any>({ title: '', type: 'Street Race', date: '', location: '', location_image: null, route_image: null, reward: '', price: 0 });
  const [galleryImage, setGalleryImage] = useState<File | null>(null);
  const [newMember, setNewMember] = useState<any>({ nickname: '', car_model: '', car_photo: null, id_card_photo: null, profile_photo: null, access_code: '', wins_1st: 0, wins_2nd: 0, wins_3rd: 0 });

  useEffect(() => {
    if (token) fetchData();
  }, [token, activeTab]);

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      if (activeTab === 'events' || selectedEventId) {
        const res = await fetch(`${API_URL}/events`);
        if (res.ok) setEvents(await res.json());
      } else if (activeTab === 'gallery') {
        const res = await fetch(`${API_URL}/gallery`);
        if (res.ok) setGallery(await res.json());
      } else if (activeTab === 'members') {
        const res = await fetch(`${API_URL}/admin/members`, { headers });
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        } else if (res.status === 403 || res.status === 401) {
          setToken(null);
          localStorage.removeItem('adminToken');
          setError('SESSION EXPIRÉE : VEUILLEZ VOUS RECONNECTER');
        }
      }
    } catch (err) { 
      console.error(err);
      setError('ERREUR RÉSEAU : Vérifiez si le serveur est lancé');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
    } else setError(data.message);
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newMember).forEach(key => {
      if (newMember[key] !== null) {
        formData.append(key, newMember[key]);
      }
    });

    const url = editingMemberId ? `${API_URL}/admin/members/${editingMemberId}` : `${API_URL}/admin/members`;
    const method = editingMemberId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      setNewMember({ nickname: '', car_model: '', car_photo: null, id_card_photo: null, profile_photo: null, access_code: '', wins_1st: 0, wins_2nd: 0, wins_3rd: 0 });
      setEditingMemberId(null);
      fetchData();
    } else {
      setError('Échec de l\'enregistrement du membre');
    }
  };

  const startEditMember = (m: any) => {
    setNewMember({ ...m });
    setEditingMemberId(m.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (type: string, id: number) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    await fetch(`${API_URL}/admin/${type}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  // --- EVENT MANAGEMENT COMPONENT ---
  const EventManagement = ({ eventId, onBack }: { eventId: number, onBack: () => void }) => {
    const [event, setEvent] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [managementTab, setManagementTab] = useState<'participants' | 'pools' | 'grid'>('participants');
    const [pools, setPools] = useState<any[][]>([]);
    const [poolSize, setPoolSize] = useState(4);

    useEffect(() => {
      const e = events.find(ev => ev.id === eventId);
      if (e) setEvent(e);
      fetchParticipants();
    }, [eventId, events]);

    const fetchParticipants = async () => {
      const res = await fetch(`${API_URL}/admin/events/${eventId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setParticipants(await res.json());
    };

    const updateQualif = async (memberId: number, time: string, dnf: boolean) => {
      const parseTime = (t: string) => {
        if (!t || !t.includes(':') || !t.includes('.')) return null;
        try {
          const [m, rest] = t.split(':');
          const [s, ms] = rest.split('.');
          return (parseInt(m) * 60 * 1000) + (parseInt(s) * 1000) + parseInt(ms);
        } catch { return null; }
      };

      const msValue = parseTime(time);
      await fetch(`${API_URL}/admin/events/${eventId}/participants/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ qualifying_time: msValue, is_dnf: dnf ? 1 : 0 })
      });
      fetchParticipants();
    };

    const formatMs = (ms: number) => {
      if (!ms) return '--:--.---';
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const mss = ms % 1000;
      return `${m}:${s.toString().padStart(2, '0')}.${mss.toString().padStart(3, '0')}`;
    };

    const sortedParticipants = [...participants].sort((a, b) => {
      if (a.is_dnf && !b.is_dnf) return 1;
      if (!a.is_dnf && b.is_dnf) return -1;
      if (!a.qualifying_time && b.qualifying_time) return 1;
      if (a.qualifying_time && !b.qualifying_time) return -1;
      if (!a.qualifying_time && !b.qualifying_time) return 0;
      return a.qualifying_time - b.qualifying_time;
    });

    const filteredParticipants = sortedParticipants
      .filter(p => p.nickname.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.is_dnf && !b.is_dnf) return 1;
        if (!a.is_dnf && b.is_dnf) return -1;
        if (!a.qualifying_time && b.qualifying_time) return 1;
        if (a.qualifying_time && !b.qualifying_time) return -1;
        if (!a.qualifying_time && !b.qualifying_time) return 0;
        return sortAsc ? a.qualifying_time - b.qualifying_time : b.qualifying_time - a.qualifying_time;
      });

    const generatePools = (type: 'random' | 'sequential' | 'snake') => {
      const ranked = sortedParticipants.filter(p => !p.is_dnf && p.qualifying_time);
      let result: any[][] = [];
      const numPools = Math.ceil(ranked.length / poolSize);

      if (type === 'random') {
        const shuffled = [...ranked].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length; i += poolSize) {
          result.push(shuffled.slice(i, i + poolSize));
        }
      } else if (type === 'sequential') {
        for (let i = 0; i < ranked.length; i += poolSize) {
          result.push(ranked.slice(i, i + poolSize));
        }
      } else if (type === 'snake') {
        result = Array.from({ length: numPools }, () => []);
        ranked.forEach((p, i) => {
          const poolIteration = Math.floor(i / numPools);
          const isForward = poolIteration % 2 === 0;
          const posInIteration = i % numPools;
          const targetPool = isForward ? posInIteration : numPools - 1 - posInIteration;
          if (result[targetPool]) result[targetPool].push(p);
        });
      }
      setPools(result);
    };

    if (!event) return null;

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <button onClick={onBack} className="text-[10px] text-[var(--accent-purple)] mb-2 hover:underline tracking-widest font-black uppercase flex items-center gap-2">&lt; Retour au centre de contrôle</button>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase font-heading">{event.title} <span className="text-white/20">// GESTION_SESSION</span></h2>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 p-4 text-center min-w-[120px]"><p className="text-[8px] text-white/40 mb-1 uppercase">Frais</p><p className="text-xl font-bold text-[var(--accent-yellow)]">$ {event.price}</p></div>
            <div className="bg-white/5 border border-white/10 p-4 text-center min-w-[120px]"><p className="text-[8px] text-white/40 mb-1 uppercase">Inscriptions</p><p className="text-xl font-bold text-[var(--accent-cyan)]">{participants.length} COUREURS</p></div>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="w-56 space-y-2">
            <button 
              onClick={() => setManagementTab('participants')}
              className={`w-full text-left p-4 text-[10px] font-black tracking-widest uppercase transition-all ${managementTab === 'participants' ? 'bg-[var(--accent-purple)] text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
            >
              Participants
            </button>
            <button 
              onClick={() => setManagementTab('pools')}
              className={`w-full text-left p-4 text-[10px] font-black tracking-widest uppercase transition-all ${managementTab === 'pools' ? 'bg-[var(--accent-purple)] text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
            >
              Pools
            </button>
            <button 
              onClick={() => setManagementTab('grid')}
              className={`w-full text-left p-4 text-[10px] font-black tracking-widest uppercase transition-all ${managementTab === 'grid' ? 'bg-[var(--accent-purple)] text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
            >
              Grille de départ
            </button>
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 p-8 min-h-[600px]">
            {managementTab === 'participants' && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase">Gestion des Participants</h3>
                  <div className="flex gap-4">
                    <input type="text" placeholder="CHERCHER UN COUREUR..." className="bg-black border border-white/10 p-2 text-[10px] outline-none focus:border-[var(--accent-purple)] w-64 uppercase font-bold" value={search} onChange={e => setSearch(e.target.value)} />
                    <button onClick={() => setSortAsc(!sortAsc)} className="bg-white/5 border border-white/10 px-4 text-[10px] font-black hover:bg-white hover:text-black transition-all">TRI : {sortAsc ? 'PLUS RAPIDE' : 'PLUS LENT'}</button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                    <div className="col-span-1">Pos.</div><div className="col-span-3">Coureur</div><div className="col-span-3">Véhicule</div><div className="col-span-3">Temps (M:SS.mmm)</div><div className="col-span-2 text-center">DNF</div>
                  </div>
                  {filteredParticipants.map((p, idx) => {
                    const pos = idx + 1;
                    const isRanked = !p.is_dnf && p.qualifying_time;
                    return (
                      <div key={p.id} className={`grid grid-cols-12 gap-4 p-4 bg-black/40 border border-white/5 items-center group transition-all ${isRanked && pos <= 3 ? 'border-l-4' : ''} ${isRanked && pos === 1 ? 'border-l-[var(--accent-yellow)]' : isRanked && pos === 2 ? 'border-l-gray-400' : isRanked && pos === 3 ? 'border-l-amber-700' : ''}`}>
                        <div className="col-span-1 font-black italic text-lg text-white/10">{!isRanked ? '--' : `#${pos.toString().padStart(2, '0')}`}</div>
                        <div className="col-span-3 flex items-center gap-3"><img src={p.profile_photo?.startsWith('/') ? `${BASE_URL}${p.profile_photo}` : p.profile_photo} className="w-8 h-8 rounded-full border border-white/10" /><span className="font-bold text-white text-xs uppercase">{p.nickname}</span></div>
                        <div className="col-span-3 text-white/40 text-[10px] font-bold uppercase">{p.car_model}</div>
                        <div className="col-span-3"><input type="text" defaultValue={p.qualifying_time ? formatMs(p.qualifying_time) : ''} placeholder="0:00.000" className="bg-black border border-white/10 p-2 w-full text-center font-mono text-xs focus:border-[var(--accent-cyan)] outline-none text-[var(--accent-cyan)]" onBlur={(e) => updateQualif(p.id, e.target.value, p.is_dnf)} /></div>
                        <div className="col-span-2 flex justify-center"><input type="checkbox" checked={p.is_dnf === 1} className="w-4 h-4 accent-[var(--accent-purple)] cursor-pointer" onChange={(e) => updateQualif(p.id, p.qualifying_time ? formatMs(p.qualifying_time) : '', e.target.checked)} /></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {managementTab === 'pools' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-4">Génération des Pools</h3>
                    <div className="flex gap-4 items-center">
                      <div className="space-y-1">
                        <label className="text-[8px] text-white/40 uppercase">Taille des pools</label>
                        <input type="number" value={poolSize} onChange={e => setPoolSize(parseInt(e.target.value))} className="bg-black border border-white/10 p-2 w-20 text-xs outline-none focus:border-[var(--accent-purple)]" />
                      </div>
                      <button onClick={() => generatePools('random')} className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase">Aléatoire</button>
                      <button onClick={() => generatePools('sequential')} className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase">Ordre Grille</button>
                      <button onClick={() => generatePools('snake')} className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase">Snake</button>
                    </div>
                  </div>
                  <button onClick={() => setPools([])} className="text-[10px] text-red-500 hover:underline uppercase font-black">Réinitialiser</button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {pools.length > 0 ? pools.map((pool, pIdx) => (
                    <div key={pIdx} className="border border-white/10 bg-black/20">
                      <div className="bg-white/5 p-3 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-black uppercase italic tracking-widest text-[var(--accent-purple)]">Pool #{pIdx + 1}</span>
                        <span className="text-[8px] text-white/20 uppercase font-black">{pool.length} Coureurs</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {pool.map((p, i) => (
                          <div key={p.id} className="flex justify-between items-center p-2 bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black italic text-white/20">#{i + 1}</span>
                              <span className="text-[10px] font-bold uppercase">{p.nickname}</span>
                            </div>
                            <span className="text-[8px] font-mono text-[var(--accent-cyan)]">{formatMs(p.qualifying_time)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 h-64 flex flex-col items-center justify-center border border-white/5 border-dashed text-white/10 uppercase font-black italic">
                      <Users size={48} className="mb-4 opacity-20" />
                      Aucune pool générée
                    </div>
                  )}
                </div>
              </div>
            )}

            {managementTab === 'grid' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase">Grille de Départ Officielle</h3>
                  <button className="bg-[var(--accent-cyan)] text-black px-6 py-2 text-[10px] font-black uppercase hover:bg-white transition-all">Exporter PDF / Print</button>
                </div>

                <div className="grid gap-4 max-w-2xl mx-auto relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 hidden md:block" />
                  
                  {sortedParticipants.filter(p => !p.is_dnf && p.qualifying_time).map((p, idx) => (
                    <div 
                      key={p.id} 
                      className={`flex items-center gap-6 p-4 bg-black/40 border border-white/10 relative group ${idx % 2 === 0 ? 'md:mr-[50%]' : 'md:ml-[50%]'}`}
                    >
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--accent-purple)] rotate-45 flex items-center justify-center">
                        <span className="text-[8px] font-black -rotate-45 text-white">{idx + 1}</span>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={p.profile_photo?.startsWith('/') ? `${BASE_URL}${p.profile_photo}` : p.profile_photo} className="w-10 h-10 rounded-sm border border-white/10 grayscale group-hover:grayscale-0 transition-all" />
                          <div>
                            <p className="text-xs font-black uppercase italic tracking-tighter">{p.nickname}</p>
                            <p className="text-[8px] text-white/40 uppercase font-bold">{p.car_model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-[var(--accent-cyan)]">{formatMs(p.qualifying_time)}</p>
                          <p className="text-[7px] text-white/20 uppercase font-black">QUALIFIED</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sortedParticipants.filter(p => p.is_dnf || !p.qualifying_time).length > 0 && (
                    <div className="mt-12 space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-white/20 tracking-widest border-b border-white/5 pb-2">Non-Qualifiés / DNF</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {sortedParticipants.filter(p => p.is_dnf || !p.qualifying_time).map(p => (
                          <div key={p.id} className="p-3 bg-red-500/5 border border-red-500/10 flex justify-between items-center opacity-40">
                            <span className="text-[10px] font-bold uppercase">{p.nickname}</span>
                            <span className="text-[8px] font-black uppercase text-red-500/50">{p.is_dnf ? 'DNF' : 'NO TIME'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (selectedEventId) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-12 font-mono relative overflow-hidden">
        <div className="noise opacity-[0.03]" />
        <EventManagement eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white uppercase font-bold tracking-[0.2em]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-8 bg-white/5 border border-white/10 text-center">
          <ShieldAlert className="mx-auto text-[var(--accent-purple)] mb-6" size={64} />
          <h1 className="text-xl mb-8 font-speed">ACCÈS SYSTÈME</h1>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input type="text" placeholder="ID ADMIN" className="w-full p-4 bg-black border border-white/10 text-white outline-none" onChange={e => setLoginData({...loginData, username: e.target.value})} />
            <input type="password" placeholder="MOT DE PASSE" className="w-full p-4 bg-black border border-white/10 text-white outline-none" onChange={e => setLoginData({...loginData, password: e.target.value})} />
            <button className="w-full py-4 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-purple)]/80 transition-all">EXÉCUTER</button>
          </form>
          {error && <p className="mt-4 text-red-500 text-[10px]">{error}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex text-white uppercase font-bold text-xs tracking-widest relative z-10">
      <div className="w-64 border-r border-white/10 p-6 space-y-4 bg-[#050505] relative z-20">
        <h2 className="text-xl mb-12 tracking-tighter italic font-speed">NGHTSHFTRS</h2>
        <button onClick={() => setActiveTab('events')} className={`w-full flex items-center gap-3 p-3 rounded ${activeTab === 'events' ? 'bg-[var(--accent-purple)]' : ''}`}><Calendar size={16}/> ÉVÉNEMENTS</button>
        <button onClick={() => setActiveTab('gallery')} className={`w-full flex items-center gap-3 p-3 rounded ${activeTab === 'gallery' ? 'bg-[var(--accent-purple)]' : ''}`}><ImageIcon size={16}/> GALERIE</button>
        <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 p-3 rounded ${activeTab === 'members' ? 'bg-[var(--accent-purple)]' : ''}`}><Users size={16}/> MEMBRES</button>
        <button onClick={() => {setToken(null); localStorage.removeItem('adminToken');}} className="absolute bottom-6 flex items-center gap-3 text-white/40 hover:text-white"><LogOut size={16}/> DÉCONNEXION</button>
      </div>

      <div className="flex-1 p-12 overflow-y-auto font-mono relative z-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold uppercase font-heading">{activeTab === 'events' ? 'Événements' : activeTab === 'gallery' ? 'Galerie' : 'Membres'}</h2>
          <div className="text-[10px] text-white/40 flex gap-4">
            <span>TOKEN : {token ? 'VALIDE' : 'ABSENT'}</span>
            {activeTab === 'members' && <span>TOTAL : {members.length}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 text-red-500 text-xs font-bold animate-pulse">
            {error}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-8">
            <form onSubmit={handleSubmitMember} className="grid grid-cols-3 gap-6 bg-white/5 p-6 border border-white/10">
              <div className="col-span-1 space-y-4">
                <input type="text" placeholder="PSEUDO" className="w-full bg-black p-3 border border-white/10 outline-none focus:border-[var(--accent-purple)] transition-colors" value={newMember.nickname} onChange={e => setNewMember({...newMember, nickname: e.target.value})} />
                <input type="text" placeholder="CODE D'ACCÈS" className="w-full bg-black p-3 border border-white/10 text-[var(--accent-cyan)] outline-none focus:border-[var(--accent-cyan)] transition-colors" value={newMember.access_code} onChange={e => setNewMember({...newMember, access_code: e.target.value})} />
                <input type="text" placeholder="MODÈLE VÉHICULE" className="w-full bg-black p-3 border border-white/10 outline-none focus:border-white/30 transition-colors" value={newMember.car_model} onChange={e => setNewMember({...newMember, car_model: e.target.value})} />
              </div>
              
              <ImageUpload label="Photo de Profil" value={newMember.profile_photo} onChange={(file) => setNewMember({...newMember, profile_photo: file})} fieldName="profile_photo" />
              <ImageUpload label="Photo Véhicule" value={newMember.car_photo} onChange={(file) => setNewMember({...newMember, car_photo: file})} fieldName="car_photo" />
              <ImageUpload label="Carte d'Identité" value={newMember.id_card_photo} onChange={(file) => setNewMember({...newMember, id_card_photo: file})} fieldName="id_card_photo" />

              <div className="col-span-3 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[var(--accent-yellow)] text-[8px]">1ÈRES PLACES</label>
                  <input type="number" className="bg-black p-3 border border-white/10" value={newMember.wins_1st} onChange={e => setNewMember({...newMember, wins_1st: parseInt(e.target.value)})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white/40 text-[8px]">2ÈMES PLACES</label>
                  <input type="number" className="bg-black p-3 border border-white/10" value={newMember.wins_2nd} onChange={e => setNewMember({...newMember, wins_2nd: parseInt(e.target.value)})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[var(--accent-purple)] text-[8px]">3ÈMES PLACES</label>
                  <input type="number" className="bg-black p-3 border border-white/10" value={newMember.wins_3rd} onChange={e => setNewMember({...newMember, wins_3rd: parseInt(e.target.value)})} />
                </div>
              </div>
              <button className="col-span-3 p-4 bg-[var(--accent-cyan)] text-black flex items-center justify-center gap-2 font-black uppercase">
                {editingMemberId ? <><Save size={18}/> Enregistrer les modifications</> : <><Plus size={18}/> Créer un membre</>}
              </button>
            </form>

            <div className="grid gap-4">
              {members.map(m => (
                <div key={m.id} className="p-6 border border-white/10 bg-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                  <div className="flex gap-6 items-center">
                    <img src={m.profile_photo?.startsWith('/') ? `${BASE_URL}${m.profile_photo}` : m.profile_photo} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                    <div>
                      <h3 className="text-lg">{m.nickname}</h3>
                      <p className="text-[var(--accent-cyan)] text-[10px] tracking-[0.3em]">{m.access_code}</p>
                    </div>
                    <div className="flex gap-8 ml-8 border-l border-white/10 pl-8">
                      <div className="text-center"><p className="text-[8px] text-[var(--accent-yellow)]">1ER</p><p className="text-lg">{m.wins_1st}</p></div>
                      <div className="text-center"><p className="text-[8px] text-white/40">2E</p><p className="text-lg">{m.wins_2nd}</p></div>
                      <div className="text-center"><p className="text-[8px] text-[var(--accent-purple)]">3E</p><p className="text-lg">{m.wins_3rd}</p></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => startEditMember(m)} className="text-[var(--accent-cyan)] hover:scale-110 transition-transform"><Edit2 size={18}/></button>
                    <button onClick={() => deleteItem('members', m.id)} className="text-[var(--accent-purple)] hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData();
                Object.keys(newEvent).forEach(key => {
                  if (newEvent[key] !== null) formData.append(key, newEvent[key]);
                });
                const method = editingEventId ? 'PUT' : 'POST';
                const url = editingEventId ? `${API_URL}/admin/events/${editingEventId}` : `${API_URL}/admin/events`;
                const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
                if (res.ok) {
                  setNewEvent({ title: '', type: 'Street Race', date: '', location: '', location_image: null, route_image: null, reward: '', price: 0 });
                  setEditingEventId(null);
                  fetchData();
                } else {
                  const data = await res.json();
                  setError(`ÉCHEC : ${data.error || 'Erreur serveur'}`);
                }
            }} className="grid grid-cols-2 gap-6 bg-white/5 p-6 border border-white/10">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <input type="text" placeholder="TITRE" className="bg-black p-3 border border-white/10 outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                <select className="bg-black p-3 border border-white/10 outline-none" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="text" placeholder="DATE / HEURE" className="bg-black p-3 border border-white/10 outline-none" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <input type="text" placeholder="LIEU" className="bg-black p-3 border border-white/10 outline-none" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              </div>
              
              <ImageUpload label="Image du Lieu" value={newEvent.location_image} onChange={(file) => setNewEvent({...newEvent, location_image: file})} fieldName="location_image" />
              <ImageUpload label="Image du Tracé" value={newEvent.route_image} onChange={(file) => setNewEvent({...newEvent, route_image: file})} fieldName="route_image" />

              <input type="text" placeholder="RÉCOMPENSE" className="bg-black p-3 border border-white/10 col-span-2 outline-none" value={newEvent.reward} onChange={e => setNewEvent({...newEvent, reward: e.target.value})} />
              
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[var(--accent-yellow)] text-[8px] font-black tracking-widest uppercase">Frais d'entrée ($)</label>
                <input type="number" className="bg-black p-3 border border-white/10 outline-none text-[var(--accent-yellow)] font-bold" value={newEvent.price === null || isNaN(newEvent.price) ? '' : newEvent.price} onChange={e => setNewEvent({...newEvent, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} />
              </div>

              <button className="col-span-2 p-4 bg-[var(--accent-cyan)] text-black font-black uppercase">
                {editingEventId ? 'Enregistrer les modifications' : 'Ajouter l\'événement'}
              </button>
            </form>
            <div className="grid gap-4">
              {events.map(e => (
                <div key={e.id} className="p-4 border border-white/10 bg-white/5 flex justify-between items-center hover:border-white/20 transition-all group">
                  <div onClick={() => setSelectedEventId(e.id)} className="cursor-pointer">
                    <h3 className="text-lg group-hover:text-[var(--accent-purple)] transition-colors">{e.title}</h3>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                      <p className="text-[var(--accent-purple)]">{e.type}</p>
                      <p className="text-white/20">|</p>
                      <p className="text-white/40">{e.participant_count || 0} COUREURS</p>
                      <p className="text-white/20">|</p>
                      <p className="text-[var(--accent-yellow)]">$ {e.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => {setNewEvent({...e}); setEditingEventId(e.id); window.scrollTo(0,0);}} className="text-[var(--accent-cyan)]"><Edit2 size={18}/></button>
                    <button onClick={() => deleteItem('events', e.id)} className="text-[var(--accent-purple)]"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!galleryImage) return;
              const formData = new FormData();
              formData.append('image', galleryImage);
              await fetch(`${API_URL}/admin/gallery`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
              setGalleryImage(null); fetchData();
            }} className="flex flex-col gap-4 bg-white/5 p-6 border border-white/10">
              <ImageUpload label="Ajouter à la Galerie" value={galleryImage} onChange={(file) => setGalleryImage(file as File)} fieldName="image" />
              <button className="bg-[var(--accent-cyan)] text-black py-4 font-black uppercase">Uploader dans la Galerie</button>
            </form>
            <div className="grid grid-cols-4 gap-4">
              {gallery.map(img => (
                <div key={img.id} className="relative aspect-video group border border-white/10 overflow-hidden">
                  <img src={img.url?.startsWith('/') ? `${BASE_URL}${img.url}` : img.url} className="w-full h-full object-cover" />
                  <button onClick={() => deleteItem('gallery', img.id)} className="absolute inset-0 m-auto bg-[var(--accent-purple)] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity w-fit h-fit"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
