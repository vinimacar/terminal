// Exemplo prático de como usar Firebase Auth v9+ (modular)
// Este arquivo demonstra como implementar signInWithEmailAndPassword

// Imports necessários (já disponíveis no firebase-config-v9.js)
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Usar as instâncias já criadas no firebase-config-v9.js
import { auth, database } from './firebase-config-v9.js';

// Classe para gerenciar autenticação Firebase
class FirebaseAuthManager {
  
  // Login com Firebase Auth
  async loginWithFirebaseAuth(email, password) {
    try {
      console.log('🔐 Fazendo login com Firebase Auth...');
      
      // Autenticação real com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Usuário autenticado:", user);
      console.log("UID do usuário:", user.uid);
      console.log("Email:", user.email);
      
      // Agora gravar/ler dados do usuário no Realtime Database
      await this.saveUserData(user.uid, user.email);
      
      // Buscar dados específicos do usuário
      const userData = await this.getUserProfileData(user.uid);
      
      // Salvar na sessão local
      localStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        ...userData
      }));
      
      return { 
        success: true, 
        user: user, 
        userData: userData 
      };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Tratar diferentes tipos de erro
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
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
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
  
  // Registrar novo usuário com Firebase Auth
  async registerWithFirebaseAuth(email, password, userType = 'student', additionalData = {}) {
    try {
      console.log('📝 Registrando usuário com Firebase Auth...');
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Usuário criado:", user);
      
      // Dados completos do usuário para salvar no database
      const userData = {
        email: user.email,
        type: userType,
        name: additionalData.name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ...additionalData
      };
      
      // Salvar dados do usuário no Realtime Database
      await this.saveUserData(user.uid, user.email, userData);
      
      // Criar dados iniciais baseado no tipo
      if (userType === 'student') {
        await this.createInitialStudentData(user.uid);
      } else if (userType === 'teacher') {
        await this.createInitialTeacherData(user.uid);
      }
      
      return { 
        success: true, 
        user: user,
        message: 'Usuário registrado com sucesso!' 
      };
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      
      let errorMessage = 'Erro desconhecido';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso';
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
  
  // Salvar dados do usuário no Realtime Database
  async saveUserData(uid, email, additionalData = {}) {
    try {
      const userData = {
        email: email,
        lastLogin: new Date().toISOString(),
        ...additionalData
      };
      
      // Gravar na tabela principal de usuários
      await set(ref(database, 'usuarios/' + uid), userData);
      
      console.log('💾 Dados do usuário salvos no database');
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      throw error;
    }
  }
  
  // Buscar dados do perfil do usuário
  async getUserProfileData(uid) {
    try {
      const dbRef = ref(database);
      
      // Buscar em diferentes locais baseado no tipo de usuário
      let userData = null;
      
      // Primeiro, verificar na tabela de usuários
      const userSnapshot = await get(child(dbRef, `usuarios/${uid}`));
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
      }
      
      // Buscar dados específicos baseado no tipo
      if (userData && userData.type === 'student') {
        const studentSnapshot = await get(child(dbRef, `students/${uid}`));
        if (studentSnapshot.exists()) {
          userData.studentData = studentSnapshot.val();
        }
      } else if (userData && userData.type === 'teacher') {
        const teacherSnapshot = await get(child(dbRef, `teachers/${uid}`));
        if (teacherSnapshot.exists()) {
          userData.teacherData = teacherSnapshot.val();
        }
      }
      
      return userData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      return null;
    }
  }
  
  // Criar dados iniciais para estudante (reutilizando do firebase-config-v9.js)
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

    await set(ref(database, `students/${uid}`), studentData);
    console.log('📚 Dados iniciais de estudante criados');
  }
  
  // Criar dados iniciais para professor
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

    await set(ref(database, `teachers/${uid}`), teacherData);
    console.log('👨‍🏫 Dados iniciais de professor criados');
  }
  
  // Logout
  async logout() {
    try {
      await auth.signOut();
      localStorage.removeItem('currentUser');
      console.log('👋 Logout realizado');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, message: error.message };
    }
  }
  
  // Verificar se usuário está logado
  getCurrentUser() {
    return auth.currentUser;
  }
}

// Exportar a classe
export { FirebaseAuthManager };

// Para compatibilidade global
window.FirebaseAuthManager = FirebaseAuthManager;

// Exemplo de uso prático:
// const authManager = new FirebaseAuthManager();
// 
// authManager.loginWithFirebaseAuth('usuario@exemplo.com', 'senha123')
//   .then(result => {
//     if (result.success) {
//       console.log('Login realizado:', result.user);
//       // Redirecionar para página apropriada
//       window.location.href = result.userData.type === 'student' ? 'aluno.html' : 'professor.html';
//     } else {
//       alert('Erro: ' + result.message);
//     }
//   });

