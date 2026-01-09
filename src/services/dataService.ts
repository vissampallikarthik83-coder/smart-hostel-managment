
import {
    Complaint,
    LeaveRequest,
    Announcement,
    MedicalRequest as MedicalType,
    GateEntry,
    Suggestion,
    User
} from '../types.ts';
import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    orderBy,
    limit,
    getDoc,
    onSnapshot
} from 'firebase/firestore';

export const DataService = {
    // Complaints
    getComplaints: async (userId?: string): Promise<Complaint[]> => {
        const colRef = collection(db, 'complaints');
        let q = query(colRef, orderBy('createdAt', 'desc'));

        if (userId) {
            q = query(colRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
    },

    createComplaint: async (complaint: Complaint): Promise<void> => {
        // Remove ID if present as Firestore generates it, or use setDoc if we want specific ID
        // Assuming we let Firestore gen ID and then might store it?
        // Usage usually: { ...data }
        // The type has ID, but usually we ignore it on creation or use a placeholder then replace.
        // Let's destructure to remove 'id' if needed or just pass it.
        // Firestore addDoc returns a ref with new ID.
        const { id, ...data } = complaint;
        await addDoc(collection(db, 'complaints'), data);
    },

    updateComplaintStatus: async (id: string, status: string, adminComments?: string) => {
        const docRef = doc(db, 'complaints', id);
        await updateDoc(docRef, {
            status,
            ...(adminComments ? { adminComments } : {})
        });
    },

    subscribeToComplaints: (userId: string | undefined, callback: (complaints: Complaint[]) => void) => {
        const colRef = collection(db, 'complaints');
        let q = query(colRef, orderBy('createdAt', 'desc'));

        if (userId) {
            q = query(colRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'));
        }

        return onSnapshot(q, (snapshot) => {
            const complaints = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
            callback(complaints);
        });
    },

    // Medical System
    getMedicalRequests: async (userId?: string): Promise<MedicalType[]> => {
        const colRef = collection(db, 'medical_requests');
        let q = query(colRef, orderBy('createdAt', 'desc'));

        if (userId) {
            q = query(colRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedicalType));
    },

    subscribeToMedicalRequests: (userId: string | undefined, callback: (requests: MedicalType[]) => void) => {
        const colRef = collection(db, 'medical_requests');
        let q = query(colRef, orderBy('createdAt', 'desc'));

        if (userId) {
            q = query(colRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'));
        }

        return onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MedicalType));
            callback(requests);
        });
    },

    createMedicalRequest: async (request: MedicalType): Promise<void> => {
        const { id, ...data } = request;
        await addDoc(collection(db, 'medical_requests'), data);
    },

    updateMedicalRequestStatus: async (id: string, status: string): Promise<void> => {
        const docRef = doc(db, 'medical_requests', id);
        await updateDoc(docRef, { status });
    },

    // Leaves & OTP
    getLeaves: async (userId?: string): Promise<LeaveRequest[]> => {
        const colRef = collection(db, 'leave_requests');
        let q = query(colRef, orderBy('createdAt', 'desc'));

        if (userId) {
            q = query(colRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
    },

    subscribeToLeaves: (userId: string | undefined, callback: (leaves: LeaveRequest[]) => void) => {
        const colRef = collection(db, 'leave_requests');
        let q = query(colRef, orderBy('createdAt', 'desc'));

        if (userId) {
            q = query(colRef, where('studentId', '==', userId), orderBy('createdAt', 'desc'));
        }

        return onSnapshot(q, (snapshot) => {
            const leaves = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));
            callback(leaves);
        });
    },

    requestLeave: async (leave: LeaveRequest): Promise<void> => {
        const { id, ...data } = leave;
        await addDoc(collection(db, 'leave_requests'), data);
    },
    // Approve a pending leave request and generate OTP
    approveLeaveWithOtp: async (leaveId: string): Promise<void> => {
        const otp = await DataService.generateOtp(leaveId);
        const docRef = doc(db, 'leave_requests', leaveId);
        await updateDoc(docRef, {
            status: 'APPROVED',
            otp,
            otpUsed: false,
            needsOtpReissue: false
        });
    },

    generateOtp: async (studentId: string): Promise<string> => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    },

    verifyOtp: async (otp: string): Promise<{ valid: boolean; student?: any; leaveId?: string; error?: string }> => {
        const colRef = collection(db, 'leave_requests');
        const q = query(
            colRef,
            where('otp', '==', otp),
            where('status', '==', 'APPROVED')
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            const docData = snapshot.docs[0].data() as LeaveRequest;

            if (docData.otpUsed) {
                return { valid: false, error: 'ALREADY_USED' };
            }

            const docRef = doc(db, 'leave_requests', docId);
            await updateDoc(docRef, {
                otpUsed: true,
                otpUsedAt: Date.now()
            });

            return {
                valid: true,
                student: {
                    name: docData.studentName,
                    id: docData.studentId,
                    room: docData.room
                },
                leaveId: docId
            };
        }
        return { valid: false, error: 'INVALID_CODE' };
    },

    requestOtpReissue: async (leaveId: string): Promise<void> => {
        const docRef = doc(db, 'leave_requests', leaveId);
        await updateDoc(docRef, {
            needsOtpReissue: true,
            otpUsed: false,
            otp: null
        });
    },

    logGateEntry: async (entry: GateEntry): Promise<void> => {
        const { id, ...data } = entry;
        await addDoc(collection(db, 'gate_history'), data);
    },

    // Announcements
    getAnnouncements: async (): Promise<Announcement[]> => {
        const colRef = collection(db, 'announcements');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
    },

    subscribeToAnnouncements: (callback: (announcements: Announcement[]) => void) => {
        const colRef = collection(db, 'announcements');
        const q = query(colRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const anns = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
            callback(anns);
        });
    },

    createAnnouncement: async (ann: Announcement): Promise<void> => {
        const { id, ...data } = ann;
        await addDoc(collection(db, 'announcements'), data);
    },

    // Suggestions
    getSuggestions: async (): Promise<Suggestion[]> => {
        const colRef = collection(db, 'suggestions');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Suggestion));
    },

    subscribeToSuggestions: (callback: (suggestions: Suggestion[]) => void) => {
        const colRef = collection(db, 'suggestions');
        const q = query(colRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const suggestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Suggestion));
            callback(suggestions);
        });
    },

    addSuggestion: async (sug: Suggestion): Promise<void> => {
        const { id, ...data } = sug;
        await addDoc(collection(db, 'suggestions'), data);
    },

    voteSuggestion: async (id: string, currentVotes: number): Promise<void> => {
        const docRef = doc(db, 'suggestions', id);
        await updateDoc(docRef, {
            votes: currentVotes + 1
        });
    },

    // Mess Feedback
    submitMessRating: async (studentId: string, rating: number): Promise<void> => {
        await addDoc(collection(db, 'mess_ratings'), {
            studentId,
            rating,
            timestamp: Date.now()
        });
    },

    submitMessVote: async (studentId: string, foodId: string): Promise<void> => {
        await addDoc(collection(db, 'mess_votes'), {
            studentId,
            foodId,
            timestamp: Date.now()
        });
    },

    // Mess Menu
    getMessMenu: async (): Promise<any[]> => {
        const colRef = collection(db, 'mess_menu');
        const q = query(colRef, orderBy('time', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    subscribeToMessMenu: (callback: (menu: any[]) => void) => {
        const colRef = collection(db, 'mess_menu');
        const q = query(colRef, orderBy('time', 'asc'));
        return onSnapshot(q, (snapshot) => {
            const menu = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(menu);
        });
    },

    updateMessMenu: async (id: string, menuUpdate: string): Promise<void> => {
        const docRef = doc(db, 'mess_menu', id);
        await updateDoc(docRef, { menu: menuUpdate });
    },

    // Additional Helpers
    getGateHistory: async (): Promise<GateEntry[]> => {
        const colRef = collection(db, 'gate_history');
        const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GateEntry));
    },

    subscribeToGateHistory: (callback: (history: GateEntry[]) => void) => {
        const colRef = collection(db, 'gate_history');
        const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

        return onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GateEntry));
            callback(history);
        });
    },

    updateLeave: async (id: string, updates: Partial<LeaveRequest>): Promise<void> => {
        const docRef = doc(db, 'leave_requests', id);
        await updateDoc(docRef, updates);
    },

    getUsers: async (): Promise<User[]> => {
        const colRef = collection(db, 'users');
        const snapshot = await getDocs(colRef);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
    },

    subscribeToUsers: (callback: (users: User[]) => void) => {
        const colRef = collection(db, 'users');
        return onSnapshot(colRef, (snapshot) => {
            const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
            callback(users);
        });
    }
};
