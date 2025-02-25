import { auth, db } from '../config/firebase.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    addDoc
} from "firebase/firestore";

export class UserService {
    static USERS_KEY = 'users';
    static USER_STATS_KEY = 'user_stats';
    static USER_BETS_KEY = 'user_bets';

    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static async register(username, email, password) {
        try {
            // Verificar se o username já existe
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                throw new Error('Username already exists');
            }

            // Criar usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Criar documento do usuário no Firestore
            await setDoc(doc(db, "users", user.uid), {
                username,
                email,
                created_at: new Date().toISOString()
            });

            // Inicializar estatísticas do usuário
            await setDoc(doc(db, "user_stats", user.uid), {
                total_bets: 0,
                correct_bets: 0,
                total_points: 0
            });

            return { 
                success: true, 
                user: {
                    id: user.uid,
                    username,
                    email
                }
            };
        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async login(email, password) {
        try {
            // Login com Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Buscar dados adicionais do usuário no Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            return {
                success: true,
                user: {
                    id: user.uid,
                    username: userData.username,
                    email: user.email
                }
            };
        } catch (error) {
            console.error('Error logging in:', error);
            throw new Error(this.getErrorMessage(error));
        }
    }

    static async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    static async getUserStats(userId) {
        try {
            const statsDoc = await getDoc(doc(db, "user_stats", userId));
            return statsDoc.exists() ? statsDoc.data() : {
                total_bets: 0,
                correct_bets: 0,
                total_points: 0
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    static async getUserBets(userId) {
        try {
            const betsRef = collection(db, "user_bets");
            const q = query(betsRef, where("user_id", "==", userId));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting user bets:', error);
            throw error;
        }
    }

    static async updateUserStats(userId, isCorrect) {
        try {
            const statsRef = doc(db, "user_stats", userId);
            const statsDoc = await getDoc(statsRef);
            
            if (statsDoc.exists()) {
                const currentStats = statsDoc.data();
                await updateDoc(statsRef, {
                    total_bets: currentStats.total_bets + 1,
                    correct_bets: currentStats.correct_bets + (isCorrect ? 1 : 0),
                    total_points: currentStats.total_points + (isCorrect ? 3 : 0)
                });
            } else {
                await setDoc(statsRef, {
                    total_bets: 1,
                    correct_bets: isCorrect ? 1 : 0,
                    total_points: isCorrect ? 3 : 0
                });
            }
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }

    static async saveBet(userId, gameId, homeScore, awayScore) {
        try {
            const betRef = await addDoc(collection(db, "user_bets"), {
                user_id: userId,
                game_id: gameId,
                home_score: homeScore,
                away_score: awayScore,
                created_at: new Date().toISOString()
            });
            
            return { success: true, betId: betRef.id };
        } catch (error) {
            console.error('Error saving bet:', error);
            throw error;
        }
    }

    static getErrorMessage(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'Este e-mail já está em uso';
            case 'auth/invalid-email':
                return 'E-mail inválido';
            case 'auth/operation-not-allowed':
                return 'Operação não permitida';
            case 'auth/weak-password':
                return 'Senha muito fraca';
            case 'auth/user-disabled':
                return 'Usuário desabilitado';
            case 'auth/user-not-found':
                return 'Usuário não encontrado';
            case 'auth/wrong-password':
                return 'Senha incorreta';
            default:
                return error.message;
        }
    }
} 