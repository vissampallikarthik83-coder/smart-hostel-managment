import { auth, db } from './firebase';
import { User, UserRole } from '../types.ts';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthService = {
    login: async (email: string, role: string): Promise<User> => {
        // Use a default password for migration compatibility
        const userCredential = await signInWithEmailAndPassword(auth, email, "hostelx123");

        const user = await fetchUserProfile(userCredential.user.uid);
        if (user.role !== role) {
            await signOut(auth);
            throw new Error(`ROLE_MISMATCH: Account is not authorized for ${role}`);
        }
        return user;
    },

    register: async (name: string, email: string, role: UserRole): Promise<User> => {
        const credential = await createUserWithEmailAndPassword(auth, email, "hostelx123");

        const newUser: User = {
            id: credential.user.uid,
            name,
            email,
            role,
            idNumber: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
            // Explicitly use 'null' so Firestore doesn't crash on 'undefined'
            room: role === UserRole.STUDENT ? 'Pending' : null
        };

        // Save profile to Firestore
        await setDoc(doc(db, 'users', newUser.id), newUser);

        return newUser;
    },

    logout: async () => {
        await signOut(auth);
    },

    getCurrentUser: async (): Promise<User | null> => {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                unsubscribe();
                if (firebaseUser) {
                    try {
                        const user = await fetchUserProfile(firebaseUser.uid);
                        resolve(user);
                    } catch (e) {
                        // User authenticated but profile missing
                        console.error("Profile missing", e);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    },

    updateUserProfile: async (user: User): Promise<void> => {
        // This ensures that even if 'room' is missing, 
        // it sends 'null' to Firestore instead of 'undefined'
        const cleanData = {
            ...user,
            room: user.room ?? null
        };
        await setDoc(doc(db, 'users', user.id), cleanData, { merge: true });
    }
}; // <--- THIS BRACE WAS MISSING

async function fetchUserProfile(uid: string): Promise<User> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as User;
    } else {
        throw new Error("USER_PROFILE_NOT_FOUND");
    }
}