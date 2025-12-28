
import React from 'react';
import { User, UserRole, Announcement } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface WardenViewProps {
  user: User;
  activeTab: string;
}

const WardenView: React.FC<WardenViewProps> = ({ user, activeTab }) => {
  const adminAnnouncements: Announcement[] = [
    {
      id: 'admin_a1',
      title: 'Hostel Maintenance Schedule',
      content: 'Major water tank cleaning for all blocks scheduled for the 15th of next month.',
      author: 'Admin Office',
      role: UserRole.ADMIN,
      createdAt: Date.now() - 172800000
    },
    {
      id: 'admin_a2',
      title: 'Security Protocol Upgrade',
      content: 'New OTP verification rules for late entry (after 10 PM) implemented in system core.',
      author: 'Chief Admin',
      role: UserRole.ADMIN,
      createdAt: Date.now() - 86400000
    }
  ];

  const pendingApprovals = [
    { id: 'p1', name: 'Rahul Sharma', type: 'Leave Request', reason: 'Family Event', date: '2025-05-10' },
    { id: 'p2', name: 'Sneha Rao', type: 'Medical Booking', reason: 'Fever (Paracetamol)', date: '2025-05-05' },
    { id: 'p3', name: 'Vikas K.', type: 'Late Entry', reason: 'Library Study', date: '2025-05-04' }
  ];

  const approvalHistory = [
    { id: 'h1', name: 'Amit Singh', type: 'Leave Pass', status: 'APPROVED', date: 'May 01, 2025', performedBy: 'Warden Sarah' },
    { id: 'h2', name: 'Priya M.', type: 'Leave Pass', status: 'REJECTED', date: 'Apr 30, 2025', performedBy: 'Warden John' },
    { id: 'h3', name: 'John Doe', type: 'Medical Request', status: 'APPROVED', date: 'Apr 29, 2025', performedBy: 'Warden Sarah' },
    { id: 'h4', name: 'Vissampalli Karthik', type: 'Water Leakage Complaint', status: 'RESOLVED', date: 'Apr 28, 2025', performedBy: 'Warden Mike' },
    { id: 'h5', name: 'Suresh Raina', type: 'Electricity Issue', status: 'RESOLVED', date: 'Apr 27, 2025', performedBy: 'Warden Sarah' }
  ];

  const complaintData = [
    { name: 'Plumbing', count: 12 },
    { name: 'Electrical', count: 8 },
    { name: 'Internet', count: 24 },
    { name: 'Furniture', count: 5 }
  ];

  const feedbackSentiment = [
    { name: 'Positive', value: 65, color: '#03DAC6' },
    { name: 'Neutral', value: 25, color: '#BB86FC' },
    { name: 'Negative', value: 10, color: '#CF6679' }
  ];

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Occupancy" value="98%" sub="Block A-D" color="#BB86FC" icon="fas fa-building" />
        <StatCard title="Review Queue" value={`${pendingApprovals.length}`} sub="Waiting" color="#FFB84D" icon="fas fa-hourglass-half" />
        <StatCard title="Resolution" value="412" sub="Recent" color="#03DAC6" icon="fas fa-check-double" />
        <StatCard title="Sys Load" value="Optimal" sub="Active" color="#00D4FF" icon="fas fa-bolt" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="cyber-card p-6 rounded-2xl">
          <h3 className="font-orbitron font-bold text-sm mb-6 uppercase tracking-widest text-[#BB86FC]">Urgent Protocols</h3>
          <div className="space-y-4">
            {pendingApprovals.slice(0, 2).map(p => (
              <div key={p.id} className="p-4 bg-card-inner rounded-xl border border-border-app flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-[10px] opacity-60 uppercase">{p.type}</p>
                </div>
                <button className="text-[10px] font-black uppercase text-[#BB86FC] hover:underline">Review</button>
              </div>
            ))}
          </div>
        </div>
        <div className="cyber-card p-6 rounded-2xl">
          <h3 className="font-orbitron font-bold text-sm mb-6 uppercase tracking-widest text-[#03DAC6]">Admin Alerts</h3>
          <div className="space-y-4">
             {adminAnnouncements.slice(0, 1).map(a => (
               <div key={a.id} className="p-4 bg-[#03DAC6]/5 border-l-2 border-[#03DAC6] rounded-xl">
                  <p className="text-[10px] font-black text-[#03DAC6] uppercase tracking-widest mb-1">{a.title}</p>
                  <p className="text-xs opacity-80 line-clamp-2">{a.content}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#03DAC6]">Admin <span className="text-text-main opacity-80">Broadcasts</span></h3>
      <div className="grid grid-cols-1 gap-4">
        {adminAnnouncements.map(a => (
          <div key={a.id} className="cyber-card p-6 rounded-3xl border-l-4 border-[#03DAC6]">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-black bg-[#03DAC6]/20 text-[#03DAC6] px-2 py-1 rounded uppercase">Mandatory Compliance</span>
               <span className="text-[10px] opacity-50 font-mono">{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
            <h4 className="text-lg font-bold mb-2">{a.title}</h4>
            <p className="text-sm opacity-70">{a.content}</p>
            <p className="mt-4 text-[10px] opacity-60 font-bold italic">- Authorized by {a.author}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#BB86FC]">Pending <span className="text-text-main opacity-80">Approvals</span></h3>
      <div className="grid grid-cols-1 gap-4">
        {pendingApprovals.map(p => (
          <div key={p.id} className="cyber-card p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 items-center flex-1">
               <div className="w-12 h-12 rounded-2xl bg-[#BB86FC]/20 flex items-center justify-center font-bold text-[#BB86FC]">{p.name.charAt(0)}</div>
               <div>
                 <h4 className="font-bold text-lg">{p.name} <span className="text-xs opacity-50 font-normal ml-2">({p.type})</span></h4>
                 <p className="text-xs opacity-60 uppercase tracking-widest mt-1">Reason: {p.reason} • Applied: {p.date}</p>
               </div>
            </div>
            <div className="flex gap-3">
               <button className="px-6 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-xs font-black hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest">Approve</button>
               <button className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-black hover:bg-red-500 hover:text-black transition-all uppercase tracking-widest">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#BB86FC]">Action <span className="text-text-main opacity-80">History</span></h3>
      <div className="cyber-card rounded-3xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border-app text-[10px] uppercase tracking-widest opacity-50 font-black">
                     <th className="p-6">Student Name</th>
                     <th className="p-6">Request Type</th>
                     <th className="p-6">Action Taken</th>
                     <th className="p-6">Performed By</th>
                     <th className="p-6">Date</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {approvalHistory.map(h => (
                    <tr key={h.id} className="border-b border-border-app last:border-0 hover:bg-card-inner transition-colors">
                       <td className="p-6 font-bold">{h.name}</td>
                       <td className="p-6 opacity-80">{h.type}</td>
                       <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            h.status === 'APPROVED' || h.status === 'RESOLVED' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {h.status}
                          </span>
                       </td>
                       <td className="p-6 opacity-60 font-medium">{h.performedBy}</td>
                       <td className="p-6 opacity-40 font-mono text-xs">{h.date}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in">
       <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#BB86FC]">AI <span className="text-text-main opacity-80">Analytics</span></h3>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="cyber-card p-8 rounded-3xl">
             <h3 className="text-lg font-orbitron font-bold mb-6 uppercase tracking-widest text-xs opacity-70">Complaint Audit</h3>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={complaintData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                      <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={10} />
                      <YAxis stroke="currentColor" opacity={0.5} fontSize={10} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--bg-side)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-main)'}} />
                      <Bar dataKey="count" fill="#BB86FC" radius={[10, 10, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
          <div className="cyber-card p-8 rounded-3xl text-center">
             <h3 className="text-lg font-orbitron font-bold mb-6 uppercase tracking-widest text-xs opacity-70">Student Sentiment</h3>
             <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={feedbackSentiment} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8}>
                        {feedbackSentiment.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 mt-4">
                {feedbackSentiment.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                    <span className="text-[10px] opacity-60 uppercase font-black">{s.name}</span>
                  </div>
                ))}
             </div>
          </div>
       </div>
       <div className="cyber-card p-8 rounded-3xl border-l-4 border-[#BB86FC]">
          <h3 className="text-lg font-orbitron font-bold mb-4 uppercase tracking-widest text-[#BB86FC] text-sm">AI Sentiment Intelligence</h3>
          <p className="text-sm opacity-70 italic leading-relaxed">
             "Our Gemini-driven analysis indicates a 15% increase in satisfaction regarding Mess food quality since the introduction of 'Pizza Night'. However, 'Network Latency' complaints are peaking in Block B between 21:00 and 23:00, suggesting a potential node overload."
          </p>
       </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'announcements': return renderAnnouncements();
      case 'approvals': return renderApprovals();
      case 'history': return renderHistory();
      case 'analytics': return renderAnalytics();
      default: return renderHome();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {renderContent()}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, sub: string, color: string, icon: string }> = ({ title, value, sub, color, icon }) => (
  <div className="cyber-card p-6 rounded-2xl relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-4">
       <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{title}</span>
       <i className={`${icon} opacity-20 text-xl group-hover:scale-125 transition-transform`} style={{ color }}></i>
    </div>
    <div className="text-3xl font-orbitron font-black mb-1">{value}</div>
    <div className="text-[10px] opacity-50 font-bold uppercase">{sub}</div>
  </div>
);

export default WardenView;
