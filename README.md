# Terminal do Estudante - Sistema Escolar Integrado

Um sistema completo de gestão escolar com integração Firebase, projetado para estudantes e professores acompanharem o progresso acadêmico.

## 🚀 Características

### Para Estudantes:
- Dashboard personalizado com métricas de desempenho
- Visualização de notas por bimestre
- Agenda de atividades e prazos
- Acompanhamento da frequência
- Interface responsiva e moderna

### Para Professores:
- Gestão de disciplinas e turmas
- Cadastro e acompanhamento de alunos
- Lançamento de notas por bimestre
- Dashboard com estatísticas da turma
- Lista de notas pendentes para revisão

## 🔧 Configuração do Firebase

**⚠️ IMPORTANTE:** O projeto agora está configurado com suas credenciais reais do Firebase!

### Credenciais Configuradas:
- **Projeto:** livrosmax-d53b5
- **Database URL:** https://livrosmax-d53b5-default-rtdb.firebaseio.com
- **API Key:** AIzaSyDaEzGFvaCM5sMMwTrwno3eJe4vugMIVsI

### Versões Disponíveis:

#### 1. Versão Compat (Atual - `firebase-config.js`)
- Usa Firebase v8 (compat mode)
- Pronta para uso imediato
- Compatível com os arquivos HTML existentes

#### 2. Versão Moderna (`firebase-config-v9.js`)
- Usa Firebase v9+ com sintaxe moderna
- Imports modulares
- Melhor performance e tree-shaking
- Requer ajustes nos arquivos HTML para usar módulos

### 1. Configurar Realtime Database

1. No console do Firebase, vá para "Realtime Database"
2. O banco já deve estar criado para o projeto livrosmax-d53b5
3. Configure as regras de segurança:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Importante:** Em produção, configure regras mais restritivas.

## 📁 Estrutura do Projeto

```
terminal-main/
├── index.html              # Página principal com login
├── aluno.html              # Dashboard do estudante
├── professor.html          # Dashboard do professor
├── firebase-config.js      # Configuração Firebase v8 (Compat) - ATUAL
├── firebase-config-v9.js   # Configuração Firebase v9+ (Moderna)
├── README.md              # Este arquivo
└── docs/                  # Documentação adicional
```

## 🔄 Migração para Firebase v9+ (Opcional)

Se desejar usar a versão moderna do Firebase v9+:

### 1. Atualizar os arquivos HTML:

Substitua as tags de script nos arquivos HTML:

**De:**
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>
```

**Para:**
```html
<script type="module">
  import { firebaseManager } from './firebase-config-v9.js';
  window.firebaseManager = firebaseManager;
</script>
```

### 2. Vantagens da versão v9+:
- ✅ Melhor performance
- ✅ Tree-shaking (reduz tamanho do bundle)
- ✅ Sintaxe moderna
- ✅ Tipagem TypeScript melhorada
- ✅ Imports modulares

## 🎯 Como usar

### Primeira Execução

1. Abra `index.html` em um navegador web
2. O sistema inicializará automaticamente dados de demonstração
3. Use uma das contas de demonstração para fazer login

### Contas de Demonstração

#### Estudante:
- **Email:** aluno@escola.br
- **Senha:** 123456

#### Professor:
- **Email:** prof@escola.br
- **Senha:** 123456

#### Administrador:
- **Email:** admin
- **Senha:** 123456

### Funcionalidades

#### Estudante:
1. Faça login como estudante
2. Visualize suas notas e médias
3. Acompanhe atividades pendentes
4. Monitore sua frequência

#### Professor:
1. Faça login como professor
2. Gerencie disciplinas e turmas
3. Visualize alunos por turma
4. Lance notas por bimestre
5. Acompanhe notas pendentes de revisão

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Bootstrap 5.3.2
- **Ícones:** Font Awesome 6.4.0
- **Fontes:** Google Fonts (Inter)
- **Backend:** Firebase Realtime Database
- **Autenticação:** Sistema customizado com Firebase

## 📊 Estrutura de Dados

### Usuários
```json
{
  "users": {
    "usuario_id": {
      "email": "usuario@exemplo.com",
      "password": "hash_da_senha",
      "type": "student|teacher|admin",
      "name": "Nome do Usuário",
      "createdAt": "2025-07-02T..."
    }
  }
}
```

### Estudantes
```json
{
  "students": {
    "usuario_id": {
      "profile": {
        "avgGrade": 8.5,
        "totalSubjects": 8,
        "pendingTasks": 3,
        "attendance": 95
      },
      "grades": {
        "matematica": {
          "bim1": 9.0,
          "bim2": 8.5,
          "bim3": 9.5,
          "bim4": 9.2,
          "final": 9.1,
          "status": "Aprovado"
        }
      },
      "activities": {
        "urgent": [],
        "normal": [],
        "low": []
      }
    }
  }
}
```

### Professores
```json
{
  "teachers": {
    "usuario_id": {
      "profile": {
        "subjects": 3,
        "totalStudents": 127,
        "gradesToReview": 15,
        "classAverage": 8.3
      },
      "subjects": [
        {
          "id": "matematica",
          "name": "Matemática",
          "class": "9A",
          "students": 45
        }
      ],
      "students": {
        "9A": [
          {
            "id": "student1",
            "name": "João Silva",
            "avgGrade": 8.5,
            "status": "Aprovado"
          }
        ]
      }
    }
  }
}
```

## 🔒 Segurança

- As senhas são armazenadas em texto simples para demonstração
- **⚠️ Em produção:** Implemente hash de senhas adequado
- Configure regras do Firebase Database apropriadas
- Implemente validação no lado do servidor
- Use Firebase Authentication para autenticação robusta

## 🚀 Deploy

### Hospedagem Simples
1. Faça upload dos arquivos para qualquer servidor web
2. Configure o Firebase conforme instruções acima
3. Acesse via navegador

### Firebase Hosting (Recomendado)
1. Instale Firebase CLI: `npm install -g firebase-tools`
2. Faça login: `firebase login`
3. Inicialize: `firebase init hosting`
4. Configure o projeto
5. Deploy: `firebase deploy`

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação do Firebase
- Verifique os logs do console do navegador para debugging

## 📈 Roadmap

- [ ] Implementar sistema de mensagens
- [ ] Adicionar relatórios em PDF
- [ ] Integração com calendário
- [ ] Sistema de notificações push
- [ ] App mobile com React Native
- [ ] Dashboard administrativo
- [ ] Backup automático de dados
- [ ] Sistema de frequência com QR Code

---

**Desenvolvido com ❤️ para educação**
