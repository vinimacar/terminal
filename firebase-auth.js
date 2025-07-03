// firebase-auth-manager.js

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "firebase/auth";

import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "firebase/database";

import { auth, database } from './firebase-config-v9.js';

class FirebaseAuthManager {

  constructor() {
    this.auth = auth;
    this.database = database;

    // Detectar usuário logado automaticamente
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('👤 Sessão ativa:', user.email);
      } else {
        console.log('🔒 Nenhum usuário logado');
      }
    });
  }

  // Login com persistência local
  async loginWithFirebaseAuth(email, password) {
    try {
      console.log('🔐 Efetuando login...');

      // Mantém o usuário logado mesmo ao fechar o navegador
      await setPersistence(this.auth, browserLocalPersistence);

      // Autenticar
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      console.log("✅ Login OK:", user.uid);

      // Gravar dados básicos no DB
      await this.saveUserData(user.uid, user.email);

      // Buscar perfil completo
      const userData = await this.getUserProfileData(user.uid);

      // Salvar na sessão local
      localStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        ...userData
      }));

      return {
        success: true,
        user,
        userData
      };

    } catch (error) {
      console.error('❌ Erro no login:', error.code);

      let errorMessage = 'Erro desconhecido';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente mais tarde';
          break;
        default:
          errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Registro de novo usuário
  async registerWithFirebaseAuth(email, password, userType = 'student', additionalData = {}) {
    try {
      console.log('📝 Registrando novo usuário...');

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      console.log("✅ Registro OK:", user.uid);

      const userData = {
        email: user.email,
        type: userType,
        name: additionalData.name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ...additionalData
      };

      await this.saveUserData(user.uid, user.email, userData);

      if (userType === 'student') {
        await this.createInitialStudentData(user.uid);
      } else if (userType === 'teacher') {
        await this.createInitialTeacherData(user.uid);
      }

      return {
        success: true,
        user,
        message: 'Usuário registrado com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro ao registrar:', error.code);

      let errorMessage = 'Erro desconhecido';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email já está em uso';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca (mínimo 6 caracteres)';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        default:
          errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Salvar ou atualizar dados do usuário
  async saveUserData(uid, email, additionalData = {}) {
    try {
      const userData = {
        email: email,
        lastLogin: new Date().toISOString(),
        ...additionalData
      };

      await set(ref(this.database, 'usuarios/' + uid), userData);

      console.log('💾 Dados do usuário salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  // Buscar perfil completo
  async getUserProfileData(uid) {
    try {
      const dbRef = ref(this.database);
      let userData = null;

      const userSnapshot = await get(child(dbRef, `usuarios/${uid}`));
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
      }

      if (userData?.type === 'student') {
        const studentSnapshot = await get(child(dbRef, `students/${uid}`));
        if (studentSnapshot.exists()) {
          userData.studentData = studentSnapshot.val();
        }
      } else if (userData?.type === 'teacher') {
        const teacherSnapshot = await get(child(dbRef, `teachers/${uid}`));
        if (teacherSnapshot.exists()) {
          userData.teacherData = teacherSnapshot.val();
        }
      }

      return userData;

    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return null;
    }
  }

  async createInitialStudentData(uid) {
    const studentData = {
      profile: {
        avgGrade: 0,
        totalSubjects: 0,
        pendingTasks: 0,
        attendance: 100
      },
      subjects: {},
      grades: {},
      activities: {
        urgent: [],
        normal: [],
        low: []
      }
    };

    await set(ref(this.database, `students/${uid}`), studentData);
    console.log('📚 Perfil inicial do aluno criado');
  }

  async createInitialTeacherData(uid) {
    const teacherData = {
      profile: {
        subjects: 0,
        totalStudents: 0,
        gradesToReview: 0,
        classAverage: 0
      },
      subjects: [],
      students: {},
      pendingGrades: []
    };

    await set(ref(this.database, `teachers/${uid}`), teacherData);
    console.log('👨‍🏫 Perfil inicial do professor criado');
  }

  async logout() {
    try {
      await signOut(this.auth);
      localStorage.removeItem('currentUser');
      console.log('👋 Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, message: error.message };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}

export { FirebaseAuthManager };
window.FirebaseAuthManager = FirebaseAuthManager;
