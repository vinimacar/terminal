// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push, update } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaEzGFvaCM5sMMwTrwno3eJe4vugMIVsI",
  authDomain: "livrosmax-d53b5.firebaseapp.com",
  databaseURL: "https://livrosmax-d53b5-default-rtdb.firebaseio.com",
  projectId: "livrosmax-d53b5",
  storageBucket: "livrosmax-d53b5.firebasestorage.app",
  messagingSenderId: "688467872550",
  appId: "1:688467872550:web:2a14ea8e3efea0b2e84fe7",
  measurementId: "G-SS12VLP57R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Classe para gerenciar dados do Firebase - Versão Moderna v9+
class FirebaseManagerV9 {
  
  // Autenticação de usuário
  async loginUser(email, password, userType) {
    try {
      // Simular autenticação (em produção, use Firebase Auth)
      const userData = await this.getUserData(email);
      if (userData && userData.password === password && userData.type === userType) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro no servidor' };
    }
  }

  // Registrar novo usuário
  async registerUser(email, password, userType) {
    try {
      const userId = email.replace(/[.#$[\]]/g, '_');
      const userData = {
        email: email,
        password: password, // Em produção, use hash
        type: userType,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };

      await set(ref(database, `users/${userId}`), userData);
      
      // Criar dados iniciais baseado no tipo de usuário
      if (userType === 'student') {
        await this.createInitialStudentData(userId);
      } else if (userType === 'teacher') {
        await this.createInitialTeacherData(userId);
      }

      return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro ao registrar usuário' };
    }
  }

  // Obter dados do usuário
  async getUserData(email) {
    try {
      const userId = email.replace(/[.#$[\]]/g, '_');
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${userId}`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  // Criar dados iniciais para estudante
  async createInitialStudentData(userId) {
    const studentData = {
      profile: {
        avgGrade: 8.5,
        totalSubjects: 8,
        pendingTasks: 3,
        attendance: 95
      },
      subjects: {
        matematica: { name: 'Matemática', grade: 9.2, status: 'excellent' },
        portugues: { name: 'Português', grade: 8.7, status: 'good' },
        historia: { name: 'História', grade: 8.1, status: 'good' },
        fisica: { name: 'Física', grade: 7.5, status: 'average' },
        quimica: { name: 'Química', grade: 7.8, status: 'average' }
      },
      grades: {
        matematica: { bim1: 9.0, bim2: 8.5, bim3: 9.5, bim4: 9.2, final: 9.1, status: 'Aprovado' },
        portugues: { bim1: 8.2, bim2: 8.8, bim3: 8.5, bim4: 9.0, final: 8.6, status: 'Aprovado' },
        historia: { bim1: 7.5, bim2: 8.0, bim3: 8.2, bim4: 8.5, final: 8.1, status: 'Aprovado' },
        fisica: { bim1: 7.0, bim2: 7.5, bim3: 7.8, bim4: 7.7, final: 7.5, status: 'Em recuperação' },
        quimica: { bim1: 8.0, bim2: 7.5, bim3: 7.8, bim4: 8.0, final: 7.8, status: 'Aprovado' }
      },
      activities: {
        urgent: [
          {
            title: 'Prova de Matemática',
            description: 'Funções quadráticas e logarítmicas',
            date: '2025-07-03',
            time: '14:00',
            type: 'Prova',
            priority: 'urgent'
          }
        ],
        normal: [
          {
            title: 'Trabalho de História',
            description: 'Revolução Industrial no Brasil',
            date: '2025-07-05',
            time: '23:59',
            type: 'Trabalho',
            priority: 'normal'
          }
        ],
        low: [
          {
            title: 'Seminário de Biologia',
            description: 'Sistema circulatório',
            date: '2025-07-10',
            time: '14:00',
            type: 'Seminário',
            priority: 'low'
          }
        ]
      }
    };

    await set(ref(database, `students/${userId}`), studentData);
  }

  // Criar dados iniciais para professor
  async createInitialTeacherData(userId) {
    const teacherData = {
      profile: {
        subjects: 3,
        totalStudents: 127,
        gradesToReview: 15,
        classAverage: 8.3
      },
      subjects: [
        { id: 'matematica', name: 'Matemática', class: '9A', students: 45 },
        { id: 'algebra', name: 'Álgebra', class: '9B', students: 42 },
        { id: 'geometria', name: 'Geometria', class: '8A', students: 40 }
      ],
      students: {
        '9A': [
          { id: 'student1', name: 'Ana Silva', avgGrade: 8.5, status: 'Aprovado' },
          { id: 'student2', name: 'Bruno Santos', avgGrade: 7.2, status: 'Recuperação' },
          { id: 'student3', name: 'Carla Oliveira', avgGrade: 9.1, status: 'Aprovado' }
        ],
        '9B': [
          { id: 'student4', name: 'Diego Costa', avgGrade: 8.8, status: 'Aprovado' },
          { id: 'student5', name: 'Elena Rodrigues', avgGrade: 7.9, status: 'Aprovado' }
        ],
        '8A': [
          { id: 'student6', name: 'Felipe Lima', avgGrade: 8.2, status: 'Aprovado' },
          { id: 'student7', name: 'Gabriela Ferreira', avgGrade: 9.3, status: 'Aprovado' }
        ]
      },
      pendingGrades: [
        { studentName: 'Ana Silva', subject: 'Matemática', activity: 'Prova 1', date: '2025-07-01' },
        { studentName: 'Bruno Santos', subject: 'Matemática', activity: 'Trabalho 2', date: '2025-07-02' }
      ]
    };

    await set(ref(database, `teachers/${userId}`), teacherData);
  }

  // Obter dados do estudante
  async getStudentData(userId) {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `students/${userId}`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Erro ao obter dados do estudante:', error);
      return null;
    }
  }

  // Obter dados do professor
  async getTeacherData(userId) {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `teachers/${userId}`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Erro ao obter dados do professor:', error);
      return null;
    }
  }

  // Atualizar nota do estudante
  async updateStudentGrade(studentId, subject, gradeType, value) {
    try {
      await set(ref(database, `students/${studentId}/grades/${subject}/${gradeType}`), value);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      return { success: false, message: 'Erro ao atualizar nota' };
    }
  }

  // Adicionar nova atividade
  async addActivity(userId, activity) {
    try {
      const activitiesRef = ref(database, `students/${userId}/activities/${activity.priority}`);
      const newActivityRef = push(activitiesRef);
      await set(newActivityRef, activity);
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      return { success: false, message: 'Erro ao adicionar atividade' };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }

  // Verificar se usuário está logado
  getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  // Inicializar dados de demonstração
  async initializeDemoData() {
    try {
      console.log('🔄 Inicializando dados de demonstração...');
      
      // Verificar se já existem dados
      const existingData = await this.checkExistingData();
      if (existingData) {
        console.log('✅ Dados já existem no Firebase');
        return;
      }

      // Usuários de demonstração
      const demoUsers = [
        {
          id: 'aluno@escola_br',
          email: 'aluno@escola.br',
          password: '123456',
          type: 'student',
          name: 'João Silva'
        },
        {
          id: 'prof@escola_br',
          email: 'prof@escola.br',
          password: '123456',
          type: 'teacher',
          name: 'Maria Santos'
        },
        {
          id: 'admin',
          email: 'admin',
          password: '123456',
          type: 'admin',
          name: 'Administrador'
        }
      ];

      for (const user of demoUsers) {
        await set(ref(database, `users/${user.id}`), user);
        
        if (user.type === 'student') {
          await this.createInitialStudentData(user.id);
        } else if (user.type === 'teacher') {
          await this.createInitialTeacherData(user.id);
        }
      }

      console.log('✅ Dados de demonstração inicializados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar dados de demonstração:', error);
      
      // Verificar se é erro de permissão
      if (error.code === 'PERMISSION_DENIED') {
        this.showPermissionError();
      } else {
        console.error('Erro desconhecido:', error);
      }
    }
  }

  // Verificar se dados já existem
  async checkExistingData() {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'users'));
      return snapshot.exists();
    } catch (error) {
      console.log('Não foi possível verificar dados existentes:', error.message);
      return false;
    }
  }

  // Mostrar erro de permissão com instruções
  showPermissionError() {
    const errorMessage = `
🚨 ERRO DE PERMISSÃO DO FIREBASE

Para usar o sistema, você precisa configurar as regras do Realtime Database:

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: livrosmax-d53b5
3. Vá para "Realtime Database"
4. Clique na aba "Regras"
5. Substitua o conteúdo por:

{
  "rules": {
    ".read": true,
    ".write": true
  }
}

6. Clique em "Publicar"
7. Recarregue esta página

⚠️ Estas são regras abertas para desenvolvimento.
Em produção, use regras mais restritivas.
    `;
    
    console.error(errorMessage);
    
    // Mostrar modal de erro se estivermos no navegador
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert('❌ ERRO DE PERMISSÃO DO FIREBASE\n\nVerifique o console (F12) para instruções detalhadas de como corrigir.');
      }, 1000);
    }
  }
}

// Exportar para uso em módulos
export { 
  app, 
  database, 
  auth, 
  analytics, 
  FirebaseManagerV9,
  ref,
  set,
  get,
  child,
  push,
  update
};

// Para compatibilidade com versão não-modular
window.firebaseApp = app;
window.firebaseDatabase = database;
window.firebaseAuth = auth;

// Instanciar o gerenciador do Firebase
const firebaseManager = new FirebaseManagerV9();

// Verificar se é a primeira vez e inicializar dados de demonstração
window.addEventListener('load', () => {
  const firstRun = localStorage.getItem('firstRun');
  if (!firstRun) {
    firebaseManager.initializeDemoData();
    localStorage.setItem('firstRun', 'false');
  }
});

// Exportar para compatibilidade
window.firebaseManager = firebaseManager;
