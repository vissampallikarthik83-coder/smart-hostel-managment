
import React, { useState, useEffect } from 'react';
import { User, Complaint, LeaveRequest, Announcement, GateEntry, Suggestion } from '../types.ts';
import { DataService } from '../services/dataService.ts';
import WardenMedicalView from './WardenMedicalView.tsx';

interface WardenViewProps {
  user: User;
  activeTab: string;
}

const WardenView: React.FC<WardenViewProps> = ({ user, activeTab }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gateHistory, setGateHistory] = useState<GateEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [messMenu, setMessMenu] = useState<any[]>([]);
  const [editingMenu, setEditingMenu] = useState<{ id: string, menu: string } | null>(null);

  useEffect(() => {
    // Real-time listeners
    const unsubscribeLeaves = DataService.subscribeToLeaves(undefined, (newLeaves) => {
      setLeaves(newLeaves.filter(l => l.status === 'PENDING' || l.needsOtpReissue));
    });

    const unsubscribeComplaints = DataService.subscribeToComplaints(undefined, (newComplaints) => {
      setComplaints(newComplaints.filter(c => c.status === 'PENDING'));
    });

    const unsubscribeAnns = DataService.subscribeToAnnouncements((newAnns) => {
      setAnnouncements(newAnns.filter(a => a.role === 'ADMIN' || a.role === 'WARDEN'));
    });

    const unsubscribeHistory = DataService.subscribeToGateHistory((newHistory) => {
      setGateHistory(newHistory);
    });

    const unsubscribeSuggestions = DataService.subscribeToSuggestions((newSuggestions) => {
      setSuggestions(newSuggestions);
    });
    const unsubscribeMess = DataService.subscribeToMessMenu((newMenu) => {
      setMessMenu(newMenu);
    });

    return () => {
      unsubscribeLeaves();
      unsubscribeComplaints();
      unsubscribeAnns();
      unsubscribeHistory();
      unsubscribeSuggestions();
      unsubscribeMess();
    };
  }, []);

  const refresh = async () => {
    const allSuggestions = await DataService.getSuggestions();
    setSuggestions(allSuggestions);
  };

  const handleApproveLeave = async (id: string) => {
    await DataService.approveLeaveWithOtp(id);
    refresh();
  };

  const handleResolveComplaint = async (id: string) => {
    await DataService.updateComplaintStatus(id, 'RESOLVED');
    refresh();
  };

  const handleBroadcast = async () => {
    if (!announcementDraft.trim()) return;
    setIsBroadcasting(true);

    const newAnn: Announcement = {
      id: 'TEMP',
      title: 'Warden Broadcast',
      content: announcementDraft,
      author: user.name,
      role: user.role,
      createdAt: Date.now()
    };

    await DataService.createAnnouncement(newAnn);
    setAnnouncementDraft('');
    setIsBroadcasting(false);
    refresh();
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;
    await DataService.updateMessMenu(editingMenu.id, editingMenu.menu);
    setEditingMenu(null);
  };

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Leave Queue" value={`${leaves.length}`} sub="Requires Action" color="#BB86FC" icon="fas fa-plane" />
        <StatCard title="Open Issues" value={`${complaints.length}`} sub="Requires Review" color="#CF6679" icon="fas fa-tools" />
        <StatCard title="Gate History" value={`${gateHistory.length}`} sub="Clearances Today" color="#03DAC6" icon="fas fa-fingerprint" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="cyber-card p-6 rounded-2xl">
          <h3 className="font-orbitron font-bold text-sm mb-6 uppercase tracking-widest text-[#BB86FC]">Active Leave Requests</h3>
          <div className="space-y-4">
            {leaves.map(l => (
              <div key={l.id} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${l.needsOtpReissue ? 'bg-red-500/5 border-red-500/20' : 'bg-card-inner border-border-app'}`}>
                <div>
                  <p className="font-bold text-sm text-text-main">
                    {l.studentName}
                    {l.needsOtpReissue && <span className="ml-2 text-[8px] bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase shadow-lg shadow-red-500/20">Action Required: NEW OTP</span>}
                  </p>
                  <p className="text-[10px] opacity-40 uppercase text-text-muted">{l.reason}</p>
                </div>
                <button onClick={() => handleApproveLeave(l.id)} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${l.needsOtpReissue ? 'bg-[#BB86FC] text-black' : 'text-[#BB86FC] hover:underline'}`}>
                  {l.needsOtpReissue ? 'Issue New Code' : 'Authorize'}
                </button>
              </div>
            ))}
            {leaves.length === 0 && <p className="text-xs opacity-30 italic text-text-muted">No pending requests.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-lg font-orbitron font-bold mb-6 uppercase text-[#BB86FC] tracking-widest">Active Incident Logs</h3>
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c.id} className={`cyber-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 ${c.isAnonymous ? 'border-red-500/20' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-text-main uppercase tracking-tighter">{c.title}</h4>
                  {c.isAnonymous && <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded-full">Confidential Protocol</span>}
                </div>
                <p className="text-xs opacity-60 text-text-secondary leading-relaxed mb-3">{c.description}</p>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase opacity-40 tracking-widest text-text-muted">
                  <span>Student: {c.isAnonymous ? '[IDENTITY_PROTECTED]' : c.studentName}</span>
                  <span>Category: {c.category}</span>
                  <span>Priority: {c.priority}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {c.imageUrl && (
                  <div className="w-12 h-12 rounded-xl border border-border-app overflow-hidden shrink-0">
                    <img src={c.imageUrl} className="w-full h-full object-cover" alt="Proof" />
                  </div>
                )}
                <button onClick={() => handleResolveComplaint(c.id)} className="px-6 py-3 bg-[#03DAC6]/10 text-[#03DAC6] border border-[#03DAC6]/20 rounded-xl text-[10px] font-black uppercase hover:bg-[#03DAC6] hover:text-black transition-all">Resolve Issue</button>
              </div>
            </div>
          ))}
          {complaints.length === 0 && <div className="text-center py-20 opacity-20 font-black tracking-widest uppercase text-xs">No active complaints found in Registry.</div>}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="cyber-card p-8 rounded-[2rem] bg-card-bg border-l-4 border-[#03DAC6]">
        <h3 className="font-orbitron font-black text-sm mb-8 uppercase tracking-[0.4em] text-[#03DAC6]">Nexus Gate Clearances</h3>
        <div className="space-y-4">
          {gateHistory.map(h => (
            <div key={h.id} className="p-4 bg-card-inner rounded-xl border border-border-app flex justify-between items-center">
              <div>
                <p className="font-bold text-text-main">{h.studentName}</p>
                <p className="text-[9px] opacity-40 uppercase text-text-muted">Verified via OTP: {h.otp}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#03DAC6] uppercase">GATE_EXIT_VERIFIED</p>
                <p className="text-[8px] opacity-30">{new Date(h.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {gateHistory.length === 0 && <div className="text-center py-10 opacity-20 italic">No historical clearance data available.</div>}
        </div>
      </div>
    </div>
  );

  const renderMessManagement = () => (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-xl font-orbitron font-black text-[#03DAC6] uppercase tracking-widest">Mess Menu Control</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="cyber-card p-6 rounded-2xl bg-app-side">
          <h4 className="font-bold mb-4 opacity-50 uppercase text-[10px]">Active Menu Items</h4>
          <div className="space-y-4">
            {messMenu.map(item => (
              <div key={item.id} className="p-4 bg-card-inner rounded-xl border border-border-app flex justify-between items-center">
                <div>
                  <p className="font-bold text-xs">{item.type} ({item.time})</p>
                  <p className="text-xs opacity-60">{item.menu}</p>
                </div>
                <button
                  onClick={() => setEditingMenu({ id: item.id, menu: item.menu })}
                  className="p-2 text-[#03DAC6] hover:bg-[#03DAC6]/10 rounded-lg transition-all"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            ))}
            {messMenu.length === 0 && <div className="text-center py-10 opacity-20 italic">Menu is currently static. Update requires Firestore setup.</div>}
          </div>
        </div>

        {editingMenu && (
          <div className="cyber-card p-6 rounded-2xl bg-app-side border-t-4 border-[#03DAC6] animate-fade-in">
            <h4 className="font-bold mb-4 uppercase text-[10px]">Edit Menu Entry</h4>
            <textarea
              value={editingMenu.menu}
              onChange={e => setEditingMenu({ ...editingMenu, menu: e.target.value })}
              className="w-full h-32 bg-card-inner border border-border-app rounded-xl p-4 text-sm outline-none resize-none mb-4"
            />
            <div className="flex gap-4">
              <button onClick={handleUpdateMenu} className="flex-1 py-3 bg-[#03DAC6] text-black font-black rounded-xl uppercase text-[10px] tracking-widest">Commit Change</button>
              <button onClick={() => setEditingMenu(null)} className="px-6 py-3 border border-border-app rounded-xl text-[10px] uppercase font-black opacity-40">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-orbitron font-bold mb-6 uppercase text-[#FFB74D] tracking-widest">Student Community Feedback</h3>
      <div className="grid grid-cols-1 gap-4">
        {suggestions.map(s => (
          <div key={s.id} className="cyber-card p-6 rounded-2xl bg-[#0d0d10] border-l-4 border-[#FFB74D]">
            <div className="flex justify-between mb-4">
              <span className="text-[10px] font-black uppercase text-[#FFB74D] bg-[#FFB74D]/10 px-3 py-1 rounded-full">{s.category}</span>
              <span className="text-[10px] opacity-50 uppercase font-black text-text-muted">{new Date(s.createdAt).toLocaleDateString()}</span>
            </div>
            <h4 className="font-bold text-text-main mb-3 text-lg">{s.title}</h4>
            <p className="text-sm opacity-90 text-text-secondary mb-6 bg-card-inner p-4 rounded-xl">{s.content}</p>
            <div className="text-[9px] font-black uppercase opacity-60 tracking-widest text-text-muted">Proposed by: <span className="text-text-main">{s.studentName}</span></div>
          </div>
        ))}
        {suggestions.length === 0 && <div className="text-center py-20 opacity-20 font-black tracking-widest text-xs uppercase">No student feedback registered.</div>}
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="cyber-card p-10 rounded-3xl bg-app-side border-l-4 border-[#BB86FC]">
        <h3 className="font-orbitron font-bold text-xl mb-6 uppercase tracking-widest text-[#BB86FC]">Emergency Transmission Terminal</h3>
        <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] mb-4 text-text-muted">Broadcast directives to the student community</p>
        <textarea
          value={announcementDraft}
          onChange={e => setAnnouncementDraft(e.target.value)}
          className="w-full h-40 bg-card-inner border border-border-app rounded-2xl p-6 text-sm outline-none resize-none mb-6 text-text-main placeholder:text-text-muted/20"
          placeholder="Enter directive details for broadcast..."
        />
        <button
          onClick={handleBroadcast}
          disabled={isBroadcasting || !announcementDraft.trim()}
          className="w-full py-5 bg-[#BB86FC] text-black font-black rounded-2xl uppercase tracking-[0.3em] text-xs disabled:opacity-50 hover:scale-[1.01] transition-all shadow-xl shadow-[#BB86FC20]"
        >
          {isBroadcasting ? 'TRANSMITTING...' : 'Initialize Broadcast Transmission'}
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="font-orbitron font-bold text-sm mb-4 uppercase tracking-[0.4em] opacity-40 text-text-muted">Active Transmissions</h3>
        {announcements.map(a => (
          <div key={a.id} className="p-6 bg-card-inner border-l-4 border-[#BB86FC] rounded-2xl hover:bg-white/5 transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-[#BB86FC] uppercase tracking-[0.5em]">{a.title}</p>
              <span className="text-[8px] opacity-30 font-black uppercase text-text-muted">{a.role}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">{a.content}</p>
            <div className="mt-4 text-[8px] opacity-30 font-black tracking-widest uppercase text-text-muted">Broadcast by {a.author} • {new Date(a.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {activeTab === 'home' ? renderHome() :
        activeTab === 'approvals' ? renderApprovals() :
          activeTab === 'history' ? renderHistory() :
            activeTab === 'medical' ? <WardenMedicalView user={user} /> :
              activeTab === 'suggestions' ? renderSuggestions() :
                activeTab === 'announcements' ? renderAnnouncements() :
                  activeTab === 'mess' ? renderMessManagement() :
                    <div>Feature coming soon in local engine.</div>}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, sub: string, color: string, icon: string }> = ({ title, value, sub, color, icon }) => (
  <div className="cyber-card p-6 rounded-2xl relative overflow-hidden group bg-app-side/40">
    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{title}</span>
      <i className={`${icon} opacity-20 text-xl group-hover:scale-110 transition-transform`} style={{ color }}></i>
    </div>
    <div className="text-3xl font-orbitron font-black mb-1 text-text-main">{value}</div>
    <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest text-text-muted">{sub}</div>
  </div>
);

export default WardenView;
