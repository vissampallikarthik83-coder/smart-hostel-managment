
import React, { useState } from 'react';
import { User, Complaint, LeaveRequest, Announcement, UserRole } from '../types';
import { analyzeComplaint } from '../services/geminiService';

interface StudentViewProps {
  user: User;
  activeTab: string;
}

const StudentView: React.FC<StudentViewProps> = ({ user, activeTab }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 'c1',
      studentId: user.id,
      studentName: user.name,
      title: 'Water Leakage in Bathroom',
      description: 'There is a persistent leak in the faucet of the common bathroom on the 4th floor.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      category: 'Plumbing',
      createdAt: Date.now() - 172800000,
      aiAnalysis: 'Leak detected. Plumbing team dispatched.'
    },
    {
      id: 'c2',
      studentId: user.id,
      studentName: user.name,
      title: 'Internet Latency Issues',
      description: 'WiFi signal is extremely weak in the far corner of Block B during peak hours.',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      category: 'IT/Network',
      createdAt: Date.now() - 86400000,
      aiAnalysis: 'Peak hour congestion identified. Investigating router placement.'
    }
  ]);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    {
      id: 'l1',
      studentId: user.id,
      studentName: user.name,
      room: user.room || 'N/A',
      startDate: '2025-04-12',
      endDate: '2025-04-15',
      reason: 'Home visit for festival',
      status: 'APPROVED',
      otp: '742910',
      createdAt: Date.now() - 432000000
    },
    {
      id: 'l2',
      studentId: user.id,
      studentName: user.name,
      room: user.room || 'N/A',
      startDate: '2025-05-20',
      endDate: '2025-05-22',
      reason: 'Medical checkup',
      status: 'PENDING',
      createdAt: Date.now()
    }
  ]);

  const announcements: Announcement[] = [
    {
      id: 'a1',
      title: 'Maintenance: Water Supply Suspension',
      content: 'Water supply will be suspended in Block A tomorrow from 9:00 AM to 1:00 PM for tank cleaning.',
      author: 'Admin Team',
      role: UserRole.ADMIN,
      createdAt: Date.now() - 3600000
    },
    {
      id: 'h1',
      title: 'Holiday Notice: Mid-Semester Break',
      content: 'The hostel will remain open during the mid-semester break (May 15-22). Students leaving must apply for a gate pass by May 12.',
      author: 'Chief Warden',
      role: UserRole.WARDEN,
      createdAt: Date.now() - 5400000
    },
    {
      id: 'a2',
      title: 'Mess Menu Update',
      content: 'New menu for the month of May has been uploaded. Please check the Mess Portal for details.',
      author: 'Mess Committee',
      role: UserRole.WARDEN,
      createdAt: Date.now() - 7200000
    },
    {
      id: 'a3',
      title: 'Hostel Cultural Night 2025',
      content: 'Registration for solo and group performances is now open! Visit the warden office to sign up.',
      author: 'Warden Office',
      role: UserRole.WARDEN,
      createdAt: Date.now() - 86400000
    }
  ];

  const [messRating, setMessRating] = useState(0);
  const [votedFood, setVotedFood] = useState<string | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compImg, setCompImg] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const analysis = await analyzeComplaint(compDesc, compImg || undefined);
    const newComplaint: Complaint = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      studentName: user.name,
      title: compTitle,
      description: compDesc,
      status: 'PENDING',
      priority: (analysis.priority || 'MEDIUM') as any,
      category: analysis.category || 'General',
      createdAt: Date.now(),
      aiAnalysis: analysis.analysis,
      imageUrl: compImg || undefined
    };
    setComplaints([newComplaint, ...complaints]);
    setIsSubmitting(false);
    setShowComplaintModal(false);
    setCompTitle(''); setCompDesc(''); setCompImg(null);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newLeave: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      studentName: user.name,
      room: user.room || 'N/A',
      startDate: formData.get('start') as string,
      endDate: formData.get('end') as string,
      reason: formData.get('reason') as string,
      status: 'PENDING',
      createdAt: Date.now()
    };
    setLeaves([newLeave, ...leaves]);
    setShowLeaveModal(false);
  };

  const renderHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Attendance" value="84%" sub="Threshold Check" color="#00D4FF" icon="fas fa-calendar-check" />
        <StatCard title="Leaves" value={`${leaves.filter(l => l.status === 'APPROVED').length}`} sub="Approved Passes" color="#BB86FC" icon="fas fa-plane-departure" />
        <StatCard title="Rating" value={messRating > 0 ? messRating.toFixed(1) : "4.2"} sub="Mess Feedback" color="#03DAC6" icon="fas fa-star" />
        <StatCard title="Issues" value={`${complaints.filter(c => c.status !== 'RESOLVED').length}`} sub="In Progress" color="#CF6679" icon="fas fa-exclamation-triangle" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="cyber-card p-6 rounded-2xl">
            <h3 className="font-orbitron font-bold text-lg mb-4 uppercase tracking-wider">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionButton icon="fas fa-plus" label="Report Issue" color="#00D4FF" onClick={() => setShowComplaintModal(true)} />
              <ActionButton icon="fas fa-plane-departure" label="Gate Pass" color="#BB86FC" onClick={() => setShowLeaveModal(true)} />
              <ActionButton icon="fas fa-utensils" label="Mess Vote" color="#03DAC6" onClick={() => {}} />
              <ActionButton icon="fas fa-first-aid" label="Medical" color="#CF6679" onClick={() => {}} />
            </div>
          </div>
          <div className="cyber-card p-6 rounded-2xl">
            <h3 className="font-orbitron font-bold text-lg mb-4">Live <span className="text-[#BB86FC]">Announcements</span></h3>
            <div className="space-y-3">
               {announcements.slice(0, 2).map(a => (
                 <div key={a.id} className="p-4 bg-card-inner border-l-2 border-[#BB86FC] rounded-xl">
                    <p className="text-xs font-black text-[#BB86FC] uppercase tracking-widest">{a.title}</p>
                    <p className="text-sm mt-1 line-clamp-2 opacity-80">{a.content}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
        <div className="cyber-card p-6 rounded-2xl">
          <h3 className="font-orbitron font-bold text-sm mb-4 uppercase tracking-[0.2em]">Gate Status</h3>
          <div className="space-y-4">
            {leaves.filter(l => l.status === 'APPROVED').slice(0, 1).map(l => (
              <div key={l.id} className="p-4 bg-[#BB86FC]/10 border border-[#BB86FC]/30 rounded-2xl text-center animate-fade-in">
                 <p className="text-[10px] opacity-60 uppercase font-bold mb-2">Active Exit OTP</p>
                 <div className="text-2xl font-orbitron font-black tracking-widest text-[#BB86FC]">{l.otp || '000000'}</div>
              </div>
            ))}
            {leaves.filter(l => l.status === 'APPROVED').length === 0 && (
              <div className="p-4 bg-card-inner rounded-2xl text-center opacity-50">
                 <p className="text-[10px] uppercase font-bold mb-1">Gate Access</p>
                 <p className="text-xs italic">No approved leave found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-orbitron font-bold uppercase tracking-widest">Global <span className="text-[#BB86FC]">Announcements</span></h3>
      <div className="grid grid-cols-1 gap-6">
        {announcements.map(a => (
          <div key={a.id} className="cyber-card p-6 rounded-3xl border-l-4" style={{ borderColor: a.role === UserRole.ADMIN ? '#03DAC6' : '#BB86FC' }}>
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${a.role === UserRole.ADMIN ? 'bg-[#03DAC6]/20 text-[#03DAC6]' : 'bg-[#BB86FC]/20 text-[#BB86FC]'}`}>
                Issued by {a.role}
              </span>
              <span className="text-[10px] opacity-50 font-mono">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
            <h4 className="text-xl font-bold mb-2">{a.title}</h4>
            <p className="opacity-70 leading-relaxed">{a.content}</p>
            <div className="mt-4 pt-4 border-t border-border-app flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-card-inner flex items-center justify-center text-[10px] font-bold">
                {a.author.charAt(0)}
              </div>
              <span className="text-xs opacity-60">Authorized by {a.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComplaints = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-orbitron font-bold uppercase">Issue <span className="text-[#00D4FF]">History</span></h3>
        <button onClick={() => setShowComplaintModal(true)} className="bg-[#00D4FF] text-black px-6 py-2 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all">File New Report</button>
      </div>
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="cyber-card p-12 text-center opacity-50 rounded-3xl italic">No issues reported yet. System status: Clean.</div>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="cyber-card p-6 rounded-3xl flex flex-col md:flex-row gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fas fa-bug text-8xl"></i>
              </div>
              <div className="flex-1 z-10">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold">{c.title}</h4>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                    c.status === 'RESOLVED' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 
                    c.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' : 
                    'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20'
                  }`}>{c.status}</span>
                </div>
                <p className="text-sm opacity-70 mb-4">{c.description}</p>
                <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase">
                  <span className="bg-[#00D4FF]/10 text-[#00D4FF] px-2 py-1 rounded">Category: {c.category}</span>
                  <span className={`${c.priority === 'HIGH' ? 'text-red-500 bg-red-500/10' : 'text-cyan-500 bg-cyan-500/10'} px-2 py-1 rounded`}>Priority: {c.priority}</span>
                  <span className="opacity-50 flex items-center gap-1"><i className="fas fa-clock"></i> {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                {c.aiAnalysis && (
                  <div className="mt-4 p-4 bg-card-inner border-l-2 border-[#00D4FF] rounded-xl text-xs italic opacity-80">
                    <span className="text-[#00D4FF] not-italic font-black mr-2 uppercase tracking-widest">AI Audit:</span> {c.aiAnalysis}
                  </div>
                )}
              </div>
              {c.imageUrl && (
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden border border-border-app shrink-0">
                  <img src={c.imageUrl} className="w-full h-full object-cover" alt="Proof" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderLeave = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-orbitron font-bold uppercase tracking-widest">Gate <span className="text-[#BB86FC]">Passes</span></h3>
        <button onClick={() => setShowLeaveModal(true)} className="bg-[#BB86FC] text-black px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest">Request Leave</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaves.map(l => (
          <div key={l.id} className="cyber-card p-8 rounded-3xl relative overflow-hidden group">
            {l.status === 'APPROVED' && (
              <div className="absolute top-2 right-2 p-2">
                 <i className="fas fa-check-circle text-green-500 text-xl"></i>
              </div>
            )}
            <div className="text-[10px] opacity-40 font-mono mb-4">TRANS_ID: {l.id.toUpperCase()}</div>
            <div className="grid grid-cols-2 gap-4 mb-6 border-b border-border-app pb-6">
               <div>
                  <p className="text-[10px] opacity-50 uppercase font-bold mb-1">Departure</p>
                  <p className="font-orbitron text-sm font-bold">{l.startDate}</p>
               </div>
               <div>
                  <p className="text-[10px] opacity-50 uppercase font-bold mb-1">Return</p>
                  <p className="font-orbitron text-sm font-bold">{l.endDate}</p>
               </div>
            </div>
            <p className="text-sm opacity-70 mb-6 line-clamp-2 italic">"{l.reason}"</p>
            
            {l.status === 'APPROVED' ? (
              <div className="p-4 bg-card-inner border border-border-app rounded-2xl text-center shadow-lg shadow-[#BB86FC10] animate-pulse">
                 <p className="text-[10px] text-[#BB86FC] uppercase font-black tracking-[0.3em] mb-2">Gate Verification OTP</p>
                 <div className="text-4xl font-orbitron font-black tracking-[0.2em]">{l.otp || '000000'}</div>
                 <p className="text-[8px] opacity-50 mt-2 uppercase tracking-widest">Use this code at exit gate</p>
              </div>
            ) : (
              <div className="p-4 bg-card-inner rounded-2xl text-center border border-dashed border-border-app opacity-50">
                 <p className="text-[10px] uppercase font-bold tracking-widest mb-1">Status: {l.status}</p>
                 <p className="text-[8px] opacity-60">OTP will unlock upon warden auth.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMess = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-orbitron font-bold uppercase tracking-widest">Mess <span className="text-[#03DAC6]">Portal</span></h3>
        <div className="flex items-center gap-4 bg-card-inner px-4 py-2 rounded-2xl border border-border-app">
           <span className="text-[10px] opacity-60 font-black uppercase tracking-widest">Rate Meal</span>
           <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setMessRating(star)} className="hover:scale-125 transition-transform">
                  <i className={`fas fa-star ${messRating >= star ? 'text-[#03DAC6] drop-shadow-[0_0_8px_rgba(3,218,198,0.5)]' : 'text-gray-400 opacity-30'}`}></i>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="cyber-card p-8 rounded-3xl">
            <h4 className="font-orbitron font-bold text-sm mb-6 uppercase tracking-[0.2em] text-[#03DAC6]">Today's Protocol</h4>
            <div className="space-y-4">
               {['Breakfast: Poha & Tea', 'Lunch: Rajma Chawal & Curd', 'Dinner: Mixed Veg & Chapati'].map((meal, idx) => (
                 <div key={idx} className="flex justify-between items-center p-5 bg-card-inner rounded-2xl border border-border-app hover:border-opacity-50 transition-all">
                    <div>
                      <p className="text-[10px] opacity-60 font-black uppercase tracking-tighter mb-1">{meal.split(':')[0]}</p>
                      <p className="text-base font-bold">{meal.split(':')[1]}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-card-inner flex items-center justify-center opacity-40">
                      <i className={idx === 0 ? "fas fa-coffee" : idx === 1 ? "fas fa-sun" : "fas fa-moon"}></i>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="cyber-card p-8 rounded-3xl">
            <h4 className="font-orbitron font-bold text-sm mb-6 uppercase tracking-[0.2em] text-[#03DAC6]">Democratic Menu Voting</h4>
            <p className="text-xs opacity-60 mb-6">Vote for the weekend special dish. Results updated every 6 hours.</p>
            <div className="space-y-3">
               {['Mutter Paneer & Naan', 'Hyderabadi Biryani', 'Hakka Noodles & Manchurian', 'South Indian Platter'].map(food => (
                 <button 
                  key={food}
                  onClick={() => setVotedFood(food)}
                  className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${votedFood === food ? 'bg-[#03DAC6]/10 border-[#03DAC6] text-[#03DAC6] shadow-[0_0_15px_rgba(3,218,198,0.1)]' : 'bg-card-inner border-border-app opacity-80 hover:bg-opacity-100 hover:border-opacity-100'}`}
                 >
                    <span className="text-sm font-bold">{food}</span>
                    {votedFood === food ? <i className="fas fa-check-circle animate-pulse"></i> : <div className="w-4 h-4 rounded-full border-2 border-border-app"></div>}
                 </button>
               ))}
            </div>
            {votedFood && <div className="mt-8 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center text-[10px] font-black uppercase text-green-500 tracking-[0.3em]">Vote Recorded Successfully</div>}
         </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'announcements': return renderAnnouncements();
      case 'complaints': return renderComplaints();
      case 'leave': return renderLeave();
      case 'mess': return renderMess();
      default: return renderHome();
    }
  };

  return (
    <>
      {renderContent()}

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg cyber-card p-10 rounded-3xl relative bg-app-main">
             <button onClick={() => setShowComplaintModal(false)} className="absolute top-8 right-8 opacity-50 hover:opacity-100"><i className="fas fa-times"></i></button>
             <h2 className="text-2xl font-orbitron font-bold mb-8 uppercase tracking-widest text-[#00D4FF]">Log <span className="text-text-main">Grievance</span></h2>
             <form onSubmit={handleFileComplaint} className="space-y-6">
                <div>
                   <label className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-2 block">Incident Identifier</label>
                   <input required value={compTitle} onChange={e => setCompTitle(e.target.value)} className="w-full bg-card-inner border border-border-app rounded-xl p-4 focus:border-[#00D4FF] outline-none" placeholder="Brief subject" />
                </div>
                <div>
                   <label className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-2 block">Operational Details</label>
                   <textarea required value={compDesc} onChange={e => setCompDesc(e.target.value)} rows={4} className="w-full bg-card-inner border border-border-app rounded-xl p-4 focus:border-[#00D4FF] outline-none" placeholder="Describe context for AI..." />
                </div>
                <div>
                   <label className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-2 block">Evidence Upload</label>
                   <input type="file" onChange={handleImageChange} className="text-xs file:bg-[#00D4FF] file:text-black file:border-0 file:px-4 file:py-2 file:rounded-full file:font-black file:mr-4 file:uppercase" />
                </div>
                <button disabled={isSubmitting} className="w-full py-4 bg-[#00D4FF] text-black font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-[#00D4FF30] hover:scale-105 transition-all">
                  {isSubmitting ? 'AI ANALYZING DATA...' : 'Transmit Report'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg cyber-card p-10 rounded-3xl relative bg-app-main">
             <button onClick={() => setShowLeaveModal(false)} className="absolute top-8 right-8 opacity-50 hover:opacity-100"><i className="fas fa-times"></i></button>
             <h2 className="text-2xl font-orbitron font-bold mb-8 uppercase tracking-widest text-[#BB86FC]">Pass <span className="text-text-main">Request</span></h2>
             <form onSubmit={handleApplyLeave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-2 block">Exit Date</label>
                      <input name="start" type="date" required className="w-full bg-card-inner border border-border-app rounded-xl p-4 focus:border-[#BB86FC] outline-none" />
                   </div>
                   <div>
                      <label className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-2 block">Entry Date</label>
                      <input name="end" type="date" required className="w-full bg-card-inner border border-border-app rounded-xl p-4 focus:border-[#BB86FC] outline-none" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] uppercase tracking-widest opacity-50 font-black mb-2 block">Justification</label>
                   <textarea name="reason" required rows={3} className="w-full bg-card-inner border border-border-app rounded-xl p-4 focus:border-[#BB86FC] outline-none" placeholder="Reason for leave" />
                </div>
                <button className="w-full py-4 bg-[#BB86FC] text-black font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-[#BB86FC30] hover:scale-105 transition-all">
                  Synchronize with Warden
                </button>
             </form>
          </div>
        </div>
      )}
    </>
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

const ActionButton: React.FC<{ icon: string, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-5 bg-card-inner hover:bg-opacity-80 rounded-3xl border border-border-app hover:border-opacity-100 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black group-hover:rotate-12 transition-transform shadow-lg" style={{ backgroundColor: color }}>
      <i className={icon}></i>
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">{label}</span>
  </button>
);

export default StudentView;
