
import React, { useState } from 'react';
import { User } from '../types.ts';
import { AuthService } from '../services/authService.ts';

interface ProfileViewProps {
  user: User;
  themeColor: string;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, themeColor }) => {
  const [name, setName] = useState(user.name);
  const [photo, setPhoto] = useState<string | null>(user.photoURL || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64 storage
        setStatusMsg({ type: 'error', text: "Image size too large. Max 1MB permitted." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMsg(null);

    // Simulate network delay for UX if desired, or just wait for Firebase
    // await new Promise(r => setTimeout(r, 600));

    try {
      const updatedUser: User = {
        ...user,
        name: name,
        photoURL: photo || undefined
      };

      await AuthService.updateUserProfile(updatedUser);
      // NOTE: Current session in AuthContext won't update automatically unless we trigger it.
      // But we can show success message. User will see update next login or refresh.
      // Ideally we call a refreshUser() from context, but for now this persists data.

      setStatusMsg({ type: 'success', text: "Profile record synchronized successfully." });
    } catch (err) {
      console.error("Update failed", err);
      setStatusMsg({ type: 'error', text: "Synchronization failure. Access denied." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-black" style={{ backgroundColor: themeColor }}>
          <i className="fas fa-user-edit"></i>
        </div>
        <div>
          <h2 className="text-2xl font-orbitron font-bold uppercase tracking-widest">Identity <span style={{ color: themeColor }}>Management</span></h2>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] font-black">Authorized Personnel Only</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="cyber-card p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-border-app flex items-center justify-center bg-card-inner group-hover:border-opacity-100 transition-all" style={{ borderColor: photo ? themeColor : '' }}>
                {photo ? (
                  <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-user text-4xl opacity-20"></i>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-app-side border border-border-app flex items-center justify-center cursor-pointer hover:scale-110 transition-all" style={{ color: themeColor }}>
                <i className="fas fa-camera text-sm"></i>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <h3 className="font-orbitron font-bold text-lg mb-1">{user.name}</h3>
            <p className="text-[10px] opacity-40 uppercase tracking-widest font-black mb-4">{user.role} • {user.idNumber}</p>
            <div className="w-full h-px bg-border-app mb-4"></div>
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-50">
                <span>Access Status</span>
                <span className="text-green-500">Verified</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold opacity-50">
                <span>Security Clearance</span>
                <span>Level 4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="cyber-card p-8 rounded-3xl">
            <h3 className="text-sm font-orbitron font-bold uppercase tracking-widest mb-8 opacity-70">Operational Data</h3>

            {statusMsg && (
              <div className={`mb-6 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                <i className={`fas ${statusMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-black">Official Designation (Name)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card-inner border border-border-app rounded-xl p-4 text-sm focus:outline-none focus:border-opacity-100 transition-all"
                  style={{ borderColor: isUpdating ? '' : 'rgba(255,255,255,0.1)' }}
                  placeholder="Operational identifier"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-black">Communication Channel (Email)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-card-inner border border-border-app rounded-xl p-4 text-sm opacity-30 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-black">Role Protocol</label>
                  <input
                    type="text"
                    disabled
                    value={user.role}
                    className="w-full bg-card-inner border border-border-app rounded-xl p-4 text-sm opacity-30 cursor-not-allowed uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2 font-black">Hostel Identifier (ID)</label>
                  <input
                    type="text"
                    disabled
                    value={user.idNumber}
                    className="w-full bg-card-inner border border-border-app rounded-xl p-4 text-sm opacity-30 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{ backgroundColor: themeColor, boxShadow: `0 8px 20px ${themeColor}20` }}
                  className="w-full py-5 text-black font-black rounded-2xl transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50 hover:scale-[1.01]"
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-sync animate-spin"></i>
                      SYNCING IDENTITY...
                    </span>
                  ) : 'Synchronize Profile Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
