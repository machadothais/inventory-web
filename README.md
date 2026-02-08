Manufacturing Inventory Web

React frontend for the Manufacturing Inventory System.
Provides a responsive UI to manage Products, Raw Materials, BOM (Bill of Materials), and the Production Plan.

This application consumes the Quarkus REST API and renders all views client-side.

✨ Features
✅ Products

Create and list products

Delete products

Open BOM Editor for each product

Fields:

code (unique)

name

price

✅ Raw Materials

Create and list raw materials

Delete raw materials

Fields:

code (unique)

name

stockQuantity

✅ BOM (Bill of Materials)

Inside Products screen:

Associate raw materials to a product

Define quantityRequired (consumption per unit produced)

List and remove BOM items

Prevent duplicate associations (already added materials are disabled)

✅ Production Plan

Lists producible products and quantities based on stock availability

Prioritizes higher-value products

Displays total expected production value

🧰 Tech Stack

React

Vite

Axios

React Router DOM

Cypress (E2E testing)

🔌 API Integration

The frontend expects the backend running locally.

Default API base URL:

http://localhost:8085


Configured in:

src/api/client.js

🚀 Getting Started
1️⃣ Install dependencies
npm install

2️⃣ Run the project
npm run dev


Frontend will be available at:

http://localhost:5173

🧪 End-to-End Tests (Cypress)

This project includes a Cypress Happy Path test validating the UI flow end-to-end.

Run Cypress UI
npx cypress open


Then select:

E2E Testing → happy-path.cy.js


Make sure backend and frontend are running before executing Cypress.

📁 Project Structure
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

🧠 Notes / Design Decisions

Backend and frontend are separated (REST API approach)

UI is responsive and works on modern browsers

Axios is used for HTTP requests

Cypress validates real user flows to ensure integration correctness

✅ Possible Improvements

Edit/update actions for Products and Raw Materials

Better UX (toasts, loading states and confirmations)

Authentication / authorization

CI pipeline running Cypress automatically