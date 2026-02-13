# 📦 Inventário de Fabricação Web

Interface **React** para o Sistema de Inventário de Manufatura.

Esta aplicação fornece uma interface web responsiva para gerenciar:

- Produtos  
- Matérias-Primas  
- Lista de Materiais (BOM)  
- Plano de Produção  

O frontend consome uma **API REST em Quarkus** e renderiza todas as visualizações no lado do cliente (SPA).

---

# ✨ Funcionalidades

## ✅ Produtos

- Criar produtos  
- Listar produtos  
- Excluir produtos  
- Abrir o Editor de Lista de Materiais (BOM) por produto  

**Campos:**

- `code` (único)  
- `name`  
- `price`

---

## ✅ Matérias-Primas

- Criar matérias-primas  
- Listar matérias-primas  
- Excluir matérias-primas  

**Campos:**

- `code` (único)  
- `name`  
- `stockQuantity`

---

## ✅ Lista de Materiais (BOM)

Disponível na tela de Produtos:

- Associar matérias-primas a um produto  
- Definir quantidade necessária por unidade produzida  
- Listar itens da BOM  
- Remover itens da BOM  
- Bloquear associações duplicadas (materiais já adicionados ficam desativados)

---

## ✅ Plano de Produção

- Calcula quantidades possíveis de produção com base no estoque  
- Prioriza produtos de maior valor agregado  
- Exibe valor total esperado da produção

---

# 🧰 Tecnologias Utilizadas

- React  
- Vite  
- Axios  
- React Router DOM  
- Cypress (testes E2E)

---

# 🔌 Integração com API

O frontend espera que o backend esteja rodando localmente.

**Base URL padrão:**
http://localhost:8085


---

# 🚀 Primeiros Passos

## 1️⃣ Instalar dependências

```bash
npm install
npm install react-bootstrap bootstrap

2️⃣ Executar o projeto
npm run dev

Frontend disponível em:
http://localhost:5173

🧪 Testes E2E (Cypress)

O projeto inclui um teste Happy Path validando o fluxo completo do usuário.

Abrir Cypress
npx cypress open

E2E Tests → happy-path.cy.js

⚠️ Certifique-se de que backend e frontend estejam rodando antes de executar Cypress.

📁 Estrutura do Projeto

inventory-web/
├── cypress/
│   └── e2e/
│       └── happy-path.cy.js
├── src/
│   ├── api/
│   │   └── client.js
│   ├── components/
│   │   └── BomEditor.jsx
│   ├── pages/
│   │   ├── ProductsPage.jsx
│   │   ├── RawMaterialsPage.jsx
│   │   └── ProductionPlanPage.jsx
│   ├── App.jsx
│   └── main.jsx
└── package.json

🧠 Decisões de Design

Arquitetura frontend/backend desacoplada (API REST)

SPA responsiva compatível com navegadores modernos

Axios para comunicação HTTP

Cypress para validação de fluxos reais de usuário
