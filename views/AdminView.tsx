
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { refineAnnouncement } from '../services/geminiService';

interface AdminViewProps {
  user: User;
  activeTab: string;
}

const dataMonthly = [
  { name: 'Jan', complaints: 45, resolved: 40, satisfaction: 70 },
  { name: 'Feb', complaints: 52, resolved: 45, satisfaction: 65 },
  { name: 'Mar', complaints: 38, resolved: 35, satisfaction: 80 },
  { name: 'Apr', complaints: 65, resolved: 50, satisfaction: 75 },
  { name: 'May', complaints: 48, resolved: 46, satisfaction: 85 },
  { name: 'Jun', complaints: 55, resolved: 53, satisfaction: 90 },
];

const pieData = [
  { name: 'Resolved', value: 75, color: '#03DAC6' },
  { name: 'Pending', value: 15, color: '#FFB84D' },
  { name: 'Critical', value: 10, color: '#CF6679' },
];

const AdminView: React.FC<AdminViewProps> = ({ user, activeTab }) => {
  const [broadcastDraft, setBroadcastDraft] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const wardenRequests = [
    { id: 'wr1', warden: 'Warden Sarah', type: 'Equipment Request', detail: '3 New Desktop Units for IT Lab', priority: 'HIGH', date: 'Today' },
    { id: 'wr2', warden: 'Warden John', type: 'Inventory Shortage', detail: 'Insufficient cleaning equipment in Block B', priority: 'MEDIUM', date: 'Yesterday' },
    { id: 'wr3', warden: 'Warden Mike', type: 'Manpower Request', detail: 'Additional security personnel for night shift', priority: 'HIGH', date: '2 Days Ago' },
    { id: 'wr4', warden: 'Warden Sarah', type: 'Maintenance', detail: 'Central water filter replacement required', priority: 'MEDIUM', date: '3 Days Ago' }
  ];

  const handleRefine = async () => {
    if (!broadcastDraft.trim()) return;
    setIsRefining(true);
    const refined = await refineAnnouncement(broadcastDraft);
    setBroadcastDraft(refined || broadcastDraft);
    setIsRefining(false);
  };

  const handleBroadcast = () => {
    if (!broadcastDraft.trim()) return;
    setIsBroadcasting(true);
    setTimeout(() => {
      alert("GLOBAL TRANSMISSION SUCCESSFUL: Wardens and Students have been notified.");
      setBroadcastDraft('');
      setIsBroadcasting(false);
    }, 1500);
  };

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="1,240" sub="+12 This Week" color="#03DAC6" icon="fas fa-users" />
        <StatCard title="Open Issues" value="28" sub="Critical Response: 2h" color="#CF6679" icon="fas fa-exclamation-circle" />
        <StatCard title="Warden Requests" value={`${wardenRequests.length}`} sub="Awaiting Review" color="#BB86FC" icon="fas fa-file-signature" />
        <StatCard title="System Uptime" value="99.9%" sub="Server: Cloud-Core" color="#00D4FF" icon="fas fa-server" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="cyber-card p-8 rounded-3xl">
          <h3 className="text-xl font-orbitron font-bold mb-6 uppercase tracking-widest text-sm opacity-70">Recent <span className="text-[#03DAC6]">Activity</span></h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-card-inner rounded-2xl border border-border-app">
                <div className="w-10 h-10 rounded-full bg-[#03DAC6]/10 flex items-center justify-center text-[#03DAC6]">
                  <i className="fas fa-bolt"></i>
                </div>
                <div>
                  <p className="text-sm font-bold">System Log 0{i}</p>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Protocol synchronized with Warden Hub</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cyber-card p-8 rounded-3xl flex flex-col items-center justify-center text-center">
            <i className="fas fa-shield-alt text-6xl text-[#03DAC6] opacity-20 mb-4"></i>
            <h4 className="text-lg font-orbitron font-bold uppercase tracking-widest mb-2">Security Integrity</h4>
            <p className="text-xs opacity-50">Core systems are running within optimal parameters. No breaches detected.</p>
        </div>
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="cyber-card p-10 rounded-3xl flex flex-col border-l-4 border-[#03DAC6]">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#03DAC6]/10 flex items-center justify-center text-[#03DAC6] border border-[#03DAC6]/30 text-xl">
                 <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest">Global <span className="text-[#03DAC6]">Broadcast Center</span></h3>
                <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">Powered by Gemini AI Engine</p>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="relative">
                 <textarea 
                    value={broadcastDraft}
                    onChange={(e) => setBroadcastDraft(e.target.value)}
                    placeholder="Enter announcement details or prompt AI to draft one..."
                    className="w-full h-64 bg-card-inner border border-border-app rounded-3xl p-6 text-sm focus:border-[#03DAC6] outline-none resize-none transition-all placeholder:opacity-20"
                 />
                 <button 
                    onClick={handleRefine}
                    disabled={isRefining || !broadcastDraft.trim()}
                    className="absolute bottom-6 right-6 bg-[#03DAC6]/10 text-[#03DAC6] px-4 py-2 rounded-xl text-xs font-black uppercase border border-[#03DAC6]/30 hover:bg-[#03DAC6] hover:text-black transition-all disabled:opacity-30"
                 >
                    {isRefining ? 'Refining...' : <><i className="fas fa-magic mr-2"></i>Refine with AI</>}
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-card-inner rounded-2xl border border-border-app">
                   <p className="text-[10px] opacity-40 uppercase font-black mb-1">Recipient Matrix</p>
                   <p className="text-sm font-bold text-[#03DAC6]">All Wardens + All Students</p>
                </div>
                <div className="p-4 bg-card-inner rounded-2xl border border-border-app">
                   <p className="text-[10px] opacity-40 uppercase font-black mb-1">Priority Level</p>
                   <p className="text-sm font-bold text-[#03DAC6]">Global High</p>
                </div>
              </div>

              <button 
                 onClick={handleBroadcast}
                 disabled={isBroadcasting || !broadcastDraft.trim()}
                 className="w-full py-5 bg-[#03DAC6] text-black font-black rounded-3xl uppercase tracking-[0.3em] shadow-lg shadow-[#03DAC630] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-xs"
              >
                 {isBroadcasting ? 'SYNCHRONIZING TRANSMISSION...' : 'Initialize Global Broadcast'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#BB86FC] text-sm">Warden <span className="text-text-main opacity-80">Requests</span></h3>
      <div className="grid grid-cols-1 gap-4">
        {wardenRequests.map(req => (
          <div key={req.id} className="cyber-card p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 group">
            <div className="flex gap-5 items-center flex-1 w-full">
               <div className="w-14 h-14 rounded-2xl bg-[#BB86FC]/10 flex items-center justify-center font-bold text-[#BB86FC] border border-[#BB86FC]/20 shrink-0">
                  <i className={req.type === 'Equipment Request' ? "fas fa-tools" : "fas fa-box-open"}></i>
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-lg">{req.type}</h4>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${req.priority === 'HIGH' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-[#BB86FC]/20 text-[#BB86FC] border border-[#BB86FC]/20'}`}>
                      {req.priority} PRIORITY
                    </span>
                 </div>
                 <p className="text-sm opacity-80 mb-1">{req.detail}</p>
                 <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Logged by {req.warden} • {req.date}</p>
               </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button className="flex-1 md:flex-none px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl text-[10px] font-black hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest">Approve</button>
               <button className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black hover:bg-red-500 hover:text-black transition-all uppercase tracking-widest">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in">
       <h3 className="text-xl font-orbitron font-bold uppercase tracking-widest text-[#03DAC6] text-sm">Monthly <span className="text-text-main opacity-80">System Analysis</span></h3>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 cyber-card p-8 rounded-3xl">
             <h3 className="text-lg font-orbitron font-bold mb-8 uppercase tracking-widest text-xs opacity-70">Complaint vs Resolution <span className="text-[#03DAC6]">(H1 2025)</span></h3>
             <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={dataMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                      <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={10} />
                      <YAxis stroke="currentColor" opacity={0.5} fontSize={10} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--bg-side)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-main)'}} />
                      <Bar dataKey="complaints" fill="#CF6679" radius={[10, 10, 0, 0]} name="New Grievances" />
                      <Bar dataKey="resolved" fill="#03DAC6" radius={[10, 10, 0, 0]} name="Resolved Tasks" />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
          
          <div className="lg:col-span-1 cyber-card p-8 rounded-3xl flex flex-col">
             <h3 className="text-lg font-orbitron font-bold mb-8 uppercase tracking-widest text-xs opacity-70">Student <span className="text-[#03DAC6]">Satisfaction %</span></h3>
             <div className="h-[250px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={dataMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                      <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={10} />
                      <YAxis stroke="currentColor" opacity={0.5} fontSize={10} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="satisfaction" stroke="#BB86FC" strokeWidth={3} dot={{ fill: '#BB86FC' }} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 p-4 bg-card-inner rounded-2xl border border-border-app text-center">
                <p className="text-[10px] opacity-50 uppercase mb-1 font-bold">Current Metric</p>
                <p className="text-3xl font-orbitron font-black text-[#BB86FC]">85%</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="cyber-card p-8 rounded-3xl border-t-4 border-[#03DAC6]">
            <h3 className="text-lg font-orbitron font-bold mb-4 uppercase tracking-widest text-[#03DAC6] text-xs">Gemini Insight Report</h3>
            <p className="text-sm opacity-70 italic leading-relaxed">
              "Predictive maintenance analysis suggests that electrical infrastructure in Block A may require inspection within the next 45 days. Resource allocation efficiency has increased by 22% following the digitizing of warden-admin communication protocols."
            </p>
          </div>
          <div className="cyber-card p-8 rounded-3xl border-t-4 border-[#BB86FC]">
            <h3 className="text-lg font-orbitron font-bold mb-4 uppercase tracking-widest text-[#BB86FC] text-xs">Operational Efficiency</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span>Task Resolution Time</span>
                <span className="text-green-500">-14%</span>
              </div>
              <div className="w-full bg-card-inner h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[85%]"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span>Warden Load Balancing</span>
                <span className="text-blue-500">Optimal</span>
              </div>
              <div className="w-full bg-card-inner h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[70%]"></div>
              </div>
            </div>
          </div>
       </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'announcements': return renderBroadcast();
      case 'approvals': return renderApprovals();
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

export default AdminView;
