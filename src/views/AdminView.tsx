
import React, { useState, useEffect } from 'react';
import { User, Announcement, Complaint, Suggestion } from '../types.ts';
import { DataService } from '../services/dataService.ts';
import { refineAnnouncement } from '../services/geminiService.ts';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AdminViewProps {
  user: User;
  activeTab: string;
}

const AdminView: React.FC<AdminViewProps> = ({ user, activeTab }) => {
  const [draft, setDraft] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Announcement[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [messMenu, setMessMenu] = useState<any[]>([]);
  const [editingMenu, setEditingMenu] = useState<{ id: string, menu: string } | null>(null);

  useEffect(() => {
    const unsubscribeAnns = DataService.subscribeToAnnouncements((anns) => {
      setBroadcasts(anns);
    });

    const unsubscribeUsers = DataService.subscribeToUsers((users) => {
      setUserCount(users.length);
    });

    const unsubscribeComplaints = DataService.subscribeToComplaints(undefined, (comps) => {
      setComplaints(comps);
    });

    const unsubscribeSuggestions = DataService.subscribeToSuggestions((sugs) => {
      setSuggestions(sugs);
    });

    const unsubscribeMess = DataService.subscribeToMessMenu((menu) => {
      setMessMenu(menu);
    });

    return () => {
      unsubscribeAnns();
      unsubscribeUsers();
      unsubscribeComplaints();
      unsubscribeSuggestions();
      unsubscribeMess();
    };
  }, []);

  const handleBroadcast = async () => {
    if (!draft.trim()) return;
    setIsBroadcasting(true);

    const refined = await refineAnnouncement(draft);

    const newAnn: Announcement = {
      id: 'TEMP',
      title: 'Global Broadcast',
      content: refined || draft,
      author: user.name,
      role: user.role,
      createdAt: Date.now()
    };

    await DataService.createAnnouncement(newAnn);

    setDraft('');
    setIsBroadcasting(false);
  };

  const handleVote = async (id: string, votes: number) => {
    await DataService.voteSuggestion(id, votes);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;
    await DataService.updateMessMenu(editingMenu.id, editingMenu.menu);
    setEditingMenu(null);
  };

  const getAnalyticsData = () => {
    const categories = ['Plumbing', 'Electrical', 'Furniture', 'Internet', 'Mess', 'Other'];
    return categories.map(cat => ({
      name: cat,
      count: complaints.filter(c => c.category === cat).length
    }));
  };

  const getStatusData = () => {
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
    const pending = complaints.filter(c => c.status === 'PENDING').length;
    return [
      { name: 'Resolved', value: resolved, color: '#03DAC6' },
      { name: 'Pending', value: pending, color: '#CF6679' }
    ];
  };

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Issues" value={`${complaints.length}`} sub="All Time Registry" color="#03DAC6" icon="fas fa-server" />
        <StatCard title="Live Suggestions" value={`${suggestions.length}`} sub="Student Feedback" color="#00D4FF" icon="fas fa-lightbulb" />
        <StatCard title="Broadcasts" value={`${broadcasts.length}`} sub="Global Feed" color="#BB86FC" icon="fas fa-bullhorn" />
        <StatCard title="Users" value={`${userCount}`} sub="Local Registry" color="#CF6679" icon="fas fa-users" />
      </div>

      <div className="cyber-card p-10 rounded-3xl bg-app-side border-l-4 border-[#03DAC6]">
        <h3 className="font-orbitron font-bold text-xl mb-6 uppercase tracking-widest text-[#03DAC6]">Global Broadcast Terminal</h3>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full h-40 bg-card-inner border border-border-app rounded-2xl p-6 text-sm outline-none resize-none mb-6 text-text-main"
          placeholder="Enter directive details for AI refinement..."
        />
        <button
          onClick={handleBroadcast}
          disabled={isBroadcasting || !draft.trim()}
          className="w-full py-5 bg-[#03DAC6] text-black font-black rounded-2xl uppercase tracking-[0.3em] text-xs disabled:opacity-50 hover:scale-[1.01] transition-all shadow-xl shadow-[#03DAC620]"
        >
          {isBroadcasting ? 'REFINING & TRANSMITTING...' : 'Transmit Nexus Directive'}
        </button>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="cyber-card p-8 rounded-3xl h-[400px]">
          <h3 className="font-orbitron text-xs font-bold mb-8 uppercase tracking-widest opacity-40">Issue Categories Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={getAnalyticsData()}>
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1e', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#03DAC6', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="#03DAC6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cyber-card p-8 rounded-3xl h-[400px]">
          <h3 className="font-orbitron text-xs font-bold mb-8 uppercase tracking-widest opacity-40">Resolution Status</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={getStatusData()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {getStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1e', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-4">
            {getStatusData().map(status => (
              <div key={status.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                <span className="text-[10px] uppercase font-black opacity-60 tracking-widest">{status.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-xl font-orbitron font-black text-[#FFB74D] uppercase tracking-widest">Global Suggestion Registry</h3>
      <div className="grid grid-cols-1 gap-6">
        {suggestions.map(s => (
          <div key={s.id} className="cyber-card p-8 rounded-3xl bg-app-side border-l-4 border-[#FFB74D] hover:bg-white/5 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase text-[#FFB74D] bg-[#FFB74D]/10 px-4 py-2 border border-[#FFB74D]/20 rounded-full">{s.category}</span>
              <button
                onClick={() => handleVote(s.id, s.votes)}
                className="flex items-center gap-2 bg-[#FFB74D] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
              >
                <i className="fas fa-bolt"></i> {s.votes} Votes
              </button>
            </div>
            <h4 className="font-orbitron font-black text-xl mb-4 text-text-main uppercase">{s.title}</h4>
            <p className="text-sm opacity-70 text-text-secondary leading-relaxed bg-card-inner p-6 rounded-2xl mb-6">{s.content}</p>
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-muted opacity-40">
              <span>Proposed by: {s.studentName}</span>
              <span>{new Date(s.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {suggestions.length === 0 && <div className="text-center py-24 opacity-20 font-black tracking-widest uppercase text-xs">Registry Empty. Awaiting Input.</div>}
      </div>
    </div>
  );

  const renderMessManagement = () => (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-xl font-orbitron font-black text-[#03DAC6] uppercase tracking-widest">Mess Logistics Center</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="cyber-card p-6 rounded-2xl bg-app-side">
          <h4 className="font-bold mb-4 opacity-50 uppercase text-[10px]">Active Provisions</h4>
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
            {messMenu.length === 0 && <div className="text-center py-10 opacity-20 italic">No provisioning data available.</div>}
          </div>
        </div>

        {editingMenu && (
          <div className="cyber-card p-6 rounded-2xl bg-app-side border-t-4 border-[#03DAC6] animate-fade-in">
            <h4 className="font-bold mb-4 uppercase text-[10px]">Modify Protocol</h4>
            <textarea
              value={editingMenu.menu}
              onChange={e => setEditingMenu({ ...editingMenu, menu: e.target.value })}
              className="w-full h-32 bg-card-inner border border-border-app rounded-xl p-4 text-sm outline-none resize-none mb-4"
            />
            <div className="flex gap-4">
              <button onClick={handleUpdateMenu} className="flex-1 py-3 bg-[#03DAC6] text-black font-black rounded-xl uppercase text-[10px] tracking-widest">Update Nexus</button>
              <button onClick={() => setEditingMenu(null)} className="px-6 py-3 border border-border-app rounded-xl text-[10px] uppercase font-black opacity-40">Abort</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'suggestions' && renderSuggestions()}
      {activeTab === 'announcements' && renderHome()}
      {activeTab === 'mess' && renderMessManagement()}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, sub: string, color: string, icon: string }> = ({ title, value, sub, color, icon }) => (
  <div className="cyber-card p-6 rounded-2xl relative overflow-hidden group bg-app-side/40">
    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{title}</span>
      <i className={`${icon} opacity-20 text-xl group-hover:scale-110 transition-transform`} style={{ color }}></i>
    </div>
    <div className="text-3xl font-orbitron font-black mb-1 text-text-main">{value}</div>
    <div className="text-[10px] opacity-50 font-bold uppercase tracking-widest text-text-muted">{sub}</div>
  </div>
);

export default AdminView;
