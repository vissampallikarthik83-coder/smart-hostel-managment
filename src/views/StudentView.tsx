
import React, { useState, useEffect } from 'react';
import { User, Complaint, LeaveRequest, Announcement, UserRole, MedicalRequest, Suggestion, GateEntry } from '../types.ts';
import { analyzeComplaint, draftComplaintDescription } from '../services/geminiService.ts';
import { DataService } from '../services/dataService.ts';
import MedicalView from './MedicalView.tsx';

interface StudentViewProps {
  user: User;
  activeTab: string;
}

const StudentView: React.FC<StudentViewProps> = ({ user, activeTab }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gateHistory, setGateHistory] = useState<GateEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [messMenu, setMessMenu] = useState<any[]>([]);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCategory, setCompCategory] = useState('Others');
  const [compImage, setCompImage] = useState<string | null>(null);
  const [compIsAnonymous, setCompIsAnonymous] = useState(false);

  // Suggestion State
  const [sugTitle, setSugTitle] = useState('');
  const [sugContent, setSugContent] = useState('');
  const [sugCat, setSugCat] = useState('Facilities');

  // Mess State
  const [messVote, setMessVote] = useState<string | null>(null);
  const [messRating, setMessRating] = useState(4);

  useEffect(() => {
    // Real-time listeners
    const unsubscribeComplaints = DataService.subscribeToComplaints(user.id, (newComplaints) => {
      setComplaints(newComplaints.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unsubscribeSuggestions = DataService.subscribeToSuggestions((newSuggestions) => {
      setSuggestions(newSuggestions.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unsubscribeLeaves = DataService.subscribeToLeaves(user.id, (newLeaves) => {
      setLeaves(newLeaves);
    });

    const unsubscribeAnns = DataService.subscribeToAnnouncements((newAnns) => {
      setAnnouncements(newAnns);
    });
    const unsubscribeGateHistory = DataService.subscribeToGateHistory((newHistory) => {
      setGateHistory(newHistory);
    });

    const unsubscribeMessMenu = DataService.subscribeToMessMenu((newMenu) => {
      setMessMenu(newMenu);
    });

    return () => {
      unsubscribeComplaints();
      unsubscribeSuggestions();
      unsubscribeLeaves();
      unsubscribeAnns();
      unsubscribeGateHistory();
      unsubscribeMessMenu();
    };
  }, [user.id]);

  const refreshData = async () => {
    // This is still useful for manual refresh or post-action refresh
    const allComplaints = await DataService.getComplaints(user.id);
    setComplaints(allComplaints.sort((a, b) => b.createdAt - a.createdAt));

    const allSuggestions = await DataService.getSuggestions();
    setSuggestions(allSuggestions.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAutoDraft = async () => {
    if (!compImage) return alert("Please upload a photo first for AI analysis.");
    setIsDrafting(true);
    const draft = await draftComplaintDescription(compImage);
    setCompDesc(draft);
    setIsDrafting(false);
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const analysis = await analyzeComplaint(compDesc, compImage || undefined);
      // Let Firestore generate ID or manage it. DataService.createComplaint handles ID removal if needed,
      // but here we generate it. DataService implementation ignores it?
      // I updated DataService to destructure {id, ...data}. So passing an ID is fine, it will be stripped.
      // But wait, the ID generated here 'C-...' is useful for display?
      // If Firestore generates ID, it will be random string.
      // If I want 'C-...' format, I should use `setDoc` with that ID in DataService, OR accept Firestore ID.
      // My DataService implementation `createComplaint`: `const { id, ...data } = complaint; await addDoc(...)`.
      // So the ID generated here is THROWN AWAY.
      // This might be confusing if the UI shows the ID immediately?
      // `refreshData` fetches from Firestore, so it gets Firestore ID.
      // If I want Custom IDs, I need to change DataService to use `setDoc`.
      // For now, I'll stick to Firestore IDs to avoid collision. The UI display "ID: {c.id}" will show Firestore ID.

      const newComp: Complaint = {
        id: 'TEMP', // Will be replaced by Firestore ID
        studentId: user.id,
        studentName: user.name,
        title: compTitle,
        description: compDesc,
        imageUrl: compImage || undefined,
        status: 'PENDING',
        priority: (analysis.priority || 'MEDIUM') as any,
        category: compCategory,
        createdAt: Date.now(),
        aiAnalysis: analysis.analysis,
        isAnonymous: compIsAnonymous
      };
      await DataService.createComplaint(newComp);
      setShowComplaintModal(false);
      setCompTitle(''); setCompDesc(''); setCompImage(null); setCompIsAnonymous(false); setCompCategory('Others');
      refreshData();
    } catch (err) {
      console.error("Complaint filing failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSug: Suggestion = {
      id: 'TEMP',
      studentId: user.id,
      studentName: user.name,
      title: sugTitle,
      content: sugContent,
      category: sugCat,
      createdAt: Date.now(),
      votes: 0
    };
    await DataService.addSuggestion(newSug);
    setShowSuggestionModal(false);
    setSugTitle(''); setSugContent('');
    refreshData();
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newLeave: LeaveRequest = {
      id: 'TEMP',
      studentId: user.id,
      studentName: user.name,
      room: user.room || 'N/A',
      startDate: formData.get('start') as string,
      endDate: formData.get('end') as string,
      reason: formData.get('reason') as string,
      status: 'PENDING',
      createdAt: Date.now()
    };
    await DataService.requestLeave(newLeave);
    setShowLeaveModal(false);
    refreshData();
  };

  const renderHome = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Attendance" value="88.5%" sub="Monthly Average" color="#03DAC6" icon="fas fa-calendar-check" />
        <StatCard title="Active Passes" value={`${leaves.filter(l => l.status === 'APPROVED' && !l.otpUsed).length}`} sub="Verified Gate Access" color="#BB86FC" icon="fas fa-shield-halved" />
        <StatCard title="Complaints" value={`${complaints.filter(c => c.status !== 'RESOLVED').length}`} sub="Open Reports" color="#CF6679" icon="fas fa-microchip" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="cyber-card p-10 rounded-[2.5rem] bg-app-side/30">
            <h3 className="font-orbitron font-black text-xl mb-8 uppercase tracking-[0.3em] flex items-center gap-4">
              <span className="w-1.5 h-6 bg-[#00D4FF]"></span>
              Node Operations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <ActionButton icon="fas fa-plus" label="File Complaint" color="#00D4FF" onClick={() => setShowComplaintModal(true)} />
              <ActionButton icon="fas fa-plane" label="Request Transit" color="#BB86FC" onClick={() => setShowLeaveModal(true)} />
              <ActionButton icon="fas fa-lightbulb" label="Add Suggestion" color="#FFB74D" onClick={() => setShowSuggestionModal(true)} />
            </div>
          </div>

          <div className="cyber-card p-10 rounded-[2.5rem] bg-app-side/30">
            <h3 className="font-orbitron font-black text-sm mb-8 uppercase tracking-[0.4em] opacity-40">Global Feed</h3>
            <div className="space-y-6">
              {announcements.slice(0, 3).map(a => (
                <div key={a.id} className="p-6 bg-card-inner border-l-4 border-[#BB86FC] rounded-2xl hover:bg-white/5 transition-all">
                  <p className="text-[10px] font-black text-[#BB86FC] uppercase tracking-[0.5em] mb-2">{a.title}</p>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">{a.content}</p>
                  <div className="mt-4 text-[8px] opacity-30 font-black tracking-widest uppercase text-text-muted">Admin Broadcast • {new Date(a.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-center opacity-20 py-10 uppercase font-black text-xs tracking-widest text-text-muted">No transmissions found.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="cyber-card p-10 rounded-[2.5rem] h-fit bg-[#BB86FC]/5 border-t-4 border-[#BB86FC]">
            <h3 className="font-orbitron font-black text-[10px] mb-8 uppercase tracking-[0.5em] text-[#BB86FC]">Active Signature</h3>
            {leaves.filter(l => l.status === 'APPROVED' && !l.otpUsed).slice(0, 1).map(l => (
              <div key={l.id} className="p-8 bg-card-bg border border-[#BB86FC]/20 rounded-[2rem] text-center shadow-inner">
                <p className="text-[9px] opacity-40 uppercase font-black mb-4 tracking-widest text-text-muted">Transit Code</p>
                <div className="text-5xl font-orbitron font-black text-[#BB86FC] tracking-tighter glow-role">{l.otp || 'LINKING'}</div>
                <div className="mt-6 p-3 bg-[#BB86FC]/10 rounded-xl text-[9px] font-black text-[#BB86FC] uppercase">Authorized Exit</div>
              </div>
            ))}
            {leaves.filter(l => l.status === 'APPROVED' && !l.otpUsed).length === 0 && (
              <div className="p-12 bg-card-inner rounded-[2rem] text-center opacity-20 italic text-xs flex flex-col items-center gap-4">
                <i className="fas fa-lock text-3xl"></i>
                <span className="font-black tracking-widest uppercase text-[10px]">No Active Transit Passes</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#FFB74D]/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="flex justify-between items-center mb-10 relative z-10">
        <h2 className="font-orbitron font-black text-2xl tracking-[0.3em] uppercase">Idea <span className="text-[#FFB74D]">Nexus</span></h2>
        <button onClick={() => setShowSuggestionModal(true)} className="px-8 py-4 bg-[#FFB74D] text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#FFB74D30]">New Entry</button>
      </div>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {suggestions.map(s => (
          <div key={s.id} className="cyber-card p-10 rounded-[2.5rem] bg-[#0d0d10] border-l-4 group transition-all" style={{ borderColor: '#FFB74D' }}>
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB74D] px-4 py-2 bg-[#FFB74D]/10 border border-[#FFB74D]/20 rounded-full">{s.category}</span>
              <span className="text-[10px] opacity-100 font-black uppercase tracking-[0.3em] text-text-muted">{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
            <h4 className="font-orbitron font-black text-2xl uppercase tracking-tighter mb-4 text-text-main group-hover:text-[#FFB74D] transition-colors">{s.title}</h4>
            <p className="text-sm text-text-secondary leading-relaxed mb-8 font-medium bg-card-inner p-6 rounded-2xl">{s.content}</p>
            <div className="flex items-center gap-6 pt-6 border-t border-border-strong text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-text-muted"><i className="fas fa-user-circle text-[#FFB74D]"></i> Operative: <span className="text-text-main">{s.studentName}</span></span>
              <button
                onClick={() => DataService.voteSuggestion(s.id, s.votes)}
                className="ml-auto flex items-center gap-2 bg-[#FFB74D]/10 px-4 py-2 rounded-xl text-[#FFB74D] border border-[#FFB74D]/20 hover:bg-[#FFB74D]/20 transition-all"
              >
                <i className="fas fa-bolt"></i> {s.votes} Network Votes
              </button>
            </div>
          </div>
        ))}
        {suggestions.length === 0 && <div className="text-center py-24 opacity-40 font-black tracking-[0.5em] text-zinc-100 uppercase text-xs">Registry_Empty_BroadCast_Required</div>}
      </div>
    </div>
  );

  const renderMessHub = () => (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="cyber-card p-10 rounded-[2.5rem] border-t-4 border-[#03DAC6]">
          <h3 className="font-orbitron font-black text-xl mb-8 tracking-widest uppercase text-[#03DAC6]">Today's Nutrition Chart</h3>
          <div className="space-y-4">
            {messMenu.map(item => (
              <MealRow key={item.id} time={item.time} type={item.type} menu={item.menu} />
            ))}
            {messMenu.length === 0 && (
              <>
                <MealRow time="07:30 - 09:00" type="Breakfast" menu="Masala Dosa, Chutney, Sambhar, Coffee" />
                <MealRow time="12:30 - 14:00" type="Lunch" menu="Veg Biryani, Raita, Dal Tadka, Roti, Salad" />
                <MealRow time="16:30 - 17:30" type="Snacks" menu="Samosa, Next Tea, Mint Chutney" />
                <MealRow time="19:30 - 21:00" type="Dinner" menu="Paneer Butter Masala, Naan, Rice, Kheer" />
              </>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="cyber-card p-8 rounded-[2rem] bg-app-side/40">
            <h3 className="font-orbitron font-black text-xs mb-6 uppercase tracking-widest opacity-40">Meal Quality Audit</h3>
            <div className="flex items-center gap-4 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleMessRatingSubmission(star)}
                  className={`text-2xl transition-all ${star <= messRating ? 'text-yellow-400' : 'text-white/10'}`}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
              <span className="ml-auto font-orbitron font-black text-[#03DAC6]">{messRating}.0 / 5.0</span>
            </div>
            <p className="text-[10px] uppercase font-black opacity-30 tracking-widest">Rate the most recent meal session.</p>
          </div>

          <div className="cyber-card p-8 rounded-[2rem] bg-app-side/40">
            <h3 className="font-orbitron font-black text-xs mb-6 uppercase tracking-widest opacity-40 text-text-muted">Next Cycle Vote</h3>
            <p className="text-sm font-bold mb-6 text-text-main">Choose the weekend special menu:</p>
            <div className="space-y-3">
              <VoteOption label="South Indian Fusion" votes={42} active={messVote === 'south'} onClick={() => handleMessVoteSubmission('south')} />
              <VoteOption label="Continental Platter" votes={28} active={messVote === 'cont'} onClick={() => handleMessVoteSubmission('cont')} />
              <VoteOption label="Traditional Thali" votes={35} active={messVote === 'thal'} onClick={() => handleMessVoteSubmission('thal')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleMessRatingSubmission = async (rating: number) => {
    setMessRating(rating);
    await DataService.submitMessRating(user.id, rating);
  };

  const handleMessVoteSubmission = async (foodId: string) => {
    setMessVote(foodId);
    await DataService.submitMessVote(user.id, foodId);
  };

  const renderGateHistory = () => (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-orbitron font-black text-2xl tracking-[0.3em] uppercase">Gate <span className="text-[#03DAC6]">History</span></h2>
      <div className="cyber-card p-8 rounded-[2rem] bg-card-bg border-l-4 border-[#03DAC6]">
        <h3 className="font-orbitron font-black text-sm mb-8 uppercase tracking-[0.4em] text-[#03DAC6]">Access Logs</h3>
        <div className="space-y-4">
          {gateHistory.filter(h => h.studentId === user.id).map(h => (
            <div key={h.id} className="p-4 bg-card-inner rounded-xl border border-border-app flex justify-between items-center">
              <div>
                <p className="font-bold text-text-main">{h.action} Verified</p>
                <p className="text-[9px] opacity-40 uppercase text-text-muted">OTP used: {h.otp}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] opacity-30">{new Date(h.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {gateHistory.filter(h => h.studentId === user.id).length === 0 && <div className="text-center py-10 opacity-20 italic">No historical clearance data available.</div>}
        </div>
      </div>
    </div>
  );


  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'mess': return renderMessHub();
      case 'suggestions': return renderSuggestions();
      case 'history': return renderGateHistory();
      case 'announcements': return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <h2 className="font-orbitron font-black text-2xl mb-10 tracking-[0.3em] uppercase">Nexus <span className="text-[#BB86FC]">Transmissions</span></h2>
          {announcements.map(a => (
            <div key={a.id} className="cyber-card p-10 rounded-[2rem] border-l-8" style={{ borderColor: '#BB86FC' }}>
              <h4 className="font-black text-xl mb-4 uppercase tracking-widest text-text-main">{a.title}</h4>
              <p className="opacity-70 leading-relaxed text-text-secondary">{a.content}</p>
              <div className="mt-8 pt-6 border-t border-border-strong flex justify-between text-[10px] font-black uppercase opacity-30 tracking-widest text-text-muted">
                <span>By: {a.author}</span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <div className="text-center py-20 opacity-20 font-black tracking-[0.5em]">REGISTRY_EMPTY</div>}
        </div>
      );
      case 'complaints': return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-orbitron font-black text-2xl tracking-[0.3em] uppercase">Active <span className="text-[#00D4FF]">Complaints</span></h2>
            <button onClick={() => setShowComplaintModal(true)} className="px-8 py-4 bg-[#00D4FF] text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#00D4FF30]">New Complaint</button>
          </div>
          {complaints.map(c => (
            <div key={c.id} className={`cyber-card p-8 rounded-[2rem] hover:bg-white/5 transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden ${c.isAnonymous ? 'border-r-4 border-red-500/30' : ''}`}>
              {c.isAnonymous && <div className="absolute top-0 right-0 px-4 py-1 bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest">Confidential Protocol</div>}
              {c.imageUrl && (
                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img src={c.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-widest mb-1 text-text-main">{c.title}</h4>
                    <p className="text-[10px] font-bold opacity-30 uppercase text-text-muted">{c.category} Sector • ID: {c.id}</p>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${c.status === 'RESOLVED' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{c.description}</p>
                {c.aiAnalysis && (
                  <div className="p-4 bg-card-inner rounded-xl border border-border-app text-[11px] font-medium italic opacity-50 text-text-secondary">
                    <i className="fas fa-robot mr-2 text-[#00D4FF]"></i>
                    AI System Audit: {c.aiAnalysis}
                  </div>
                )}
                {c.adminComments && (
                  <div className="mt-4 p-4 bg-green-500/5 rounded-xl border border-green-500/10 text-[11px] font-medium text-green-400">
                    <i className="fas fa-comment-dots mr-2"></i>
                    Warden Directive: {c.adminComments}
                  </div>
                )}
              </div>
            </div>
          ))}
          {complaints.length === 0 && <div className="text-center py-20 opacity-20 font-black tracking-[0.5em]">NO_LOGGED_INCIDENTS</div>}
        </div>
      );
      case 'leave': return (
        <div className="animate-fade-in space-y-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-orbitron font-black text-2xl tracking-[0.3em] uppercase">Transit <span className="text-[#BB86FC]">Passes</span></h2>
            <button onClick={() => setShowLeaveModal(true)} className="px-8 py-4 bg-[#BB86FC] text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all">New Request</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leaves.filter(l => l.status === 'PENDING' || (l.status === 'APPROVED' && !l.otpUsed)).map(l => (
              <div key={l.id} className="cyber-card p-8 rounded-[2.5rem] bg-app-side/40">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{l.startDate} » {l.endDate}</p>
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${l.status === 'APPROVED' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                    {l.status}
                  </span>
                </div>
                <h4 className="font-black text-lg uppercase tracking-tighter mb-4 text-text-main">{l.reason}</h4>
                {l.status === 'APPROVED' && (
                  <div className="mt-4 p-5 bg-card-bg rounded-2xl text-center border border-border-app">
                    <p className="text-[9px] opacity-30 uppercase font-black mb-2 tracking-widest text-text-muted">Gate Signature</p>
                    {l.otpUsed ? (
                      <div className="space-y-3">
                        <p className="text-sm font-black text-red-500 uppercase tracking-widest">Expired</p>
                        <button
                          onClick={() => DataService.requestOtpReissue(l.id)}
                          disabled={l.needsOtpReissue}
                          className="text-[8px] font-black uppercase text-[#BB86FC] hover:underline disabled:opacity-50"
                        >
                          {l.needsOtpReissue ? 'Waiting for Warden...' : 'Request New OTP'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-3xl font-orbitron font-black text-[#BB86FC] tracking-[0.2em]">{l.otp}</p>
                        <p className="text-[8px] font-black uppercase text-[#BB86FC] opacity-40">Display at Gate</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="font-orbitron font-black text-sm mb-8 uppercase tracking-[0.4em] opacity-40">Transit Logs</h3>
            <div className="cyber-card rounded-3xl overflow-hidden border border-border-app">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <tr>
                      <th className="p-6">Reason</th>
                      <th className="p-6">Timeline</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium">
                    {leaves.filter(l => l.status === 'REJECTED' || l.otpUsed).map(l => (
                      <tr key={l.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                        <td className="p-6 font-bold">{l.reason}</td>
                        <td className="p-6 opacity-60">{l.startDate} - {l.endDate}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${l.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-6 opacity-30 font-black uppercase tracking-widest">
                          {l.otpUsed ? 'Clearance confirmed' : 'Access Denied'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {leaves.filter(l => l.status === 'REJECTED' || l.otpUsed).length === 0 && (
                <div className="p-12 text-center opacity-20 font-black tracking-widest uppercase text-[10px]">No historical transit recordings.</div>
              )}
            </div>
          </div>
        </div>
      );
      case 'medical': return <MedicalView user={user} />;
      default: return renderHome();
    }
  };

  return (
    <>
      {renderContent()}

      {/* Suggestions Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-xl cyber-card p-12 rounded-[3rem] bg-[#1a1a1e] border-t-4 border-[#FFB74D] shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#FFB74D]/5 pointer-events-none rounded-t-[3rem]"></div>
            <h2 className="text-3xl font-orbitron font-black mb-10 text-[#FFB74D] uppercase tracking-widest relative z-10">Broadcast Idea</h2>
            <form onSubmit={handleFileSuggestion} className="space-y-8 relative z-10">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB74D] mb-3 block opacity-100 font-bold">Target Sector</label>
                <select value={sugCat} onChange={e => setSugCat(e.target.value)} className="w-full bg-[#0a0a0c] border border-white/20 rounded-2xl p-6 outline-none focus:border-[#FFB74D] focus:bg-zinc-800 transition-all text-white font-bold appearance-none cursor-pointer">
                  <option value="Facilities">Facilities & Infrastructure</option>
                  <option value="Mess">Mess & Nutrition</option>
                  <option value="Events">Community Events</option>
                  <option value="Policy">Hostel Policy</option>
                </select>
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB74D] mb-3 block opacity-100 font-bold">Idea Headline</label>
                <input required value={sugTitle} onChange={e => setSugTitle(e.target.value)} className="w-full bg-card-inner border border-border-strong rounded-2xl p-6 outline-none focus:border-[#FFB74D] focus:bg-card-overlay transition-all text-text-main font-bold placeholder:text-text-muted" placeholder="E.g. High-Speed Mesh WiFi Upgrade" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB74D] mb-3 block opacity-100 font-bold">Detailed Proposal</label>
                <textarea required value={sugContent} onChange={e => setSugContent(e.target.value)} rows={5} className="w-full bg-card-inner border border-border-strong rounded-2xl p-6 outline-none focus:border-[#FFB74D] focus:bg-card-overlay transition-all resize-none text-text-main text-sm font-medium placeholder:text-text-muted" placeholder="Describe the benefit..." />
              </div>
              <button className="w-full py-6 bg-[#FFB74D] text-black font-black rounded-2xl uppercase tracking-[0.5em] text-xs hover:scale-[1.02] transition-all shadow-2xl shadow-[#FFB74D30]">Initialize Transmission</button>
              <button type="button" onClick={() => setShowSuggestionModal(false)} className="w-full text-[10px] text-zinc-400 uppercase font-black tracking-widest hover:text-white transition-all mt-4">Discard Protocol</button>
            </form>
          </div>
        </div>
      )}

      {showComplaintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl">
          <div className="w-full max-w-xl cyber-card p-12 rounded-[3rem] bg-app-main border-t-4 border-[#00D4FF] shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-orbitron font-black mb-8 text-[#00D4FF] uppercase tracking-widest">File Complaint</h2>
            <form onSubmit={handleFileComplaint} className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                <div className="relative w-12 h-6 bg-white/10 rounded-full transition-all cursor-pointer" onClick={() => setCompIsAnonymous(!compIsAnonymous)}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${compIsAnonymous ? 'translate-x-6 bg-[#00D4FF]' : 'bg-white/40'}`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#00D4FF]">Confidential Protocol</p>
                  <p className="text-[8px] opacity-40 uppercase tracking-widest text-zinc-400">Mask identity for sensitive issues</p>
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block text-text-muted">Complaint Sector</label>
                <select
                  value={compCategory}
                  onChange={e => setCompCategory(e.target.value)}
                  className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-card-overlay transition-all appearance-none cursor-pointer"
                >
                  <option value="Carpenter">Carpenter</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Food">Food</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block text-text-muted">Photo Evidence (Mandatory)</label>
                <div className="relative w-full h-48 bg-card-inner border-2 border-dashed border-border-app rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:border-[#00D4FF]/40">
                  {compImage ? (
                    <div className="relative w-full h-full">
                      <img src={compImage} className="w-full h-full object-cover" alt="Preview" />
                      <button type="button" onClick={() => setCompImage(null)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"><i className="fas fa-times"></i></button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-camera text-3xl opacity-20 mb-2 text-text-muted"></i>
                      <p className="text-[8px] font-black uppercase opacity-30 tracking-widest text-text-muted">Select Image Asset</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block text-text-muted">Subject Header</label>
                <input required value={compTitle} onChange={e => setCompTitle(e.target.value)} className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-card-overlay transition-all placeholder:opacity-20 placeholder:text-text-muted" placeholder="E.g. Broken Light Fixture" />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 block text-text-muted">Technical Details</label>
                  <button type="button" onClick={handleAutoDraft} disabled={isDrafting || !compImage} className="text-[9px] font-black uppercase tracking-widest text-[#00D4FF] hover:underline disabled:opacity-20">
                    {isDrafting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-magic mr-1"></i>}
                    AI Smart Auto Draft
                  </button>
                </div>
                <textarea required value={compDesc} onChange={e => setCompDesc(e.target.value)} rows={4} className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-card-overlay transition-all resize-none placeholder:opacity-20 placeholder:text-text-muted" placeholder="Provide context..." />
              </div>

              <button disabled={isSubmitting} className="w-full py-6 bg-[#00D4FF] text-black font-black rounded-2xl uppercase tracking-[0.4em] text-xs hover:scale-105 transition-all shadow-xl shadow-[#00D4FF20]">
                {isSubmitting ? <span className="animate-pulse">Syncing...</span> : 'Execute Submission'}
              </button>
              <button type="button" onClick={() => setShowComplaintModal(false)} className="w-full text-[10px] opacity-40 uppercase font-black tracking-widest hover:opacity-100 transition-all mt-4">Abort Request</button>
            </form>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl">
          <div className="w-full max-w-xl cyber-card p-12 rounded-[3rem] bg-app-main border-t-4 border-[#BB86FC] shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-orbitron font-black mb-8 text-[#BB86FC] uppercase tracking-widest">Transit Pass</h2>
            <form onSubmit={handleApplyLeave} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block text-text-muted">Departure Date</label>
                  <input name="start" type="date" required className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-card-overlay transition-all" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block text-text-muted">Return Date</label>
                  <input name="end" type="date" required className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-card-overlay transition-all" />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 block text-text-muted">Authorization Reason</label>
                <textarea name="reason" required rows={4} className="w-full bg-card-inner border border-border-app rounded-2xl p-5 text-sm outline-none text-text-main focus:bg-card-overlay transition-all resize-none" placeholder="Enter justification..." />
              </div>
              <button className="w-full py-6 bg-[#BB86FC] text-black font-black rounded-2xl uppercase tracking-[0.4em] text-xs hover:scale-105 transition-all shadow-xl shadow-[#BB86FC20]">Request Authorization</button>
              <button type="button" onClick={() => setShowLeaveModal(false)} className="w-full text-[10px] opacity-40 uppercase font-black tracking-widest hover:opacity-100 transition-all mt-4">Abort Request</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const MealRow = ({ time, type, menu }: { time: string, type: string, menu: string }) => (
  <div className="flex flex-col md:flex-row gap-4 p-5 bg-card-inner rounded-2xl border border-border-app hover:border-border-strong transition-all">
    <div className="md:w-36 text-[10px] font-black uppercase tracking-widest text-[#03DAC6]">{time}</div>
    <div className="md:w-24 text-sm font-bold uppercase text-text-main">{type}</div>
    <div className="flex-1 text-xs opacity-60 italic text-text-secondary">{menu}</div>
  </div>
);

const VoteOption = ({ label, votes, active, onClick }: { label: string, votes: number, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${active ? 'bg-[#03DAC6] text-black border-[#03DAC6]' : 'bg-card-inner border-border-app hover:border-border-strong text-text-main'}`}>
    <span className="font-bold">{label}</span>
    <span className="text-[10px] font-black">{votes} VTS</span>
  </button>
);

const StatCard: React.FC<{ title: string, value: string, sub: string, color: string, icon: string }> = ({ title, value, sub, color, icon }) => (
  <div className="cyber-card p-8 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-all bg-app-side/40">
    <div className="absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-6">
      <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">{title}</span>
      <i className={`${icon} opacity-10 text-2xl transition-all group-hover:opacity-40 group-hover:scale-110`} style={{ color }}></i>
    </div>
    <div className="text-4xl font-orbitron font-black mb-2 tracking-tighter text-text-main">{value}</div>
    <div className="text-[10px] opacity-40 font-black uppercase tracking-[0.2em]">{sub}</div>
  </div>
);

const ActionButton: React.FC<{ icon: string, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-5 p-10 bg-card-inner rounded-[2.5rem] border border-border-app hover:bg-card-overlay transition-all group shadow-xl hover:shadow-2xl">
    <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-black font-black text-2xl transition-all group-hover:rotate-12 group-hover:scale-110 shadow-lg" style={{ backgroundColor: color, boxShadow: `0 8px 20px ${color}40` }}>
      <i className={icon}></i>
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-all">{label}</span>
  </button>
);

export default StudentView;
