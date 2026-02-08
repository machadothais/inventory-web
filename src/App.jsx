import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import ProductionPlanPage from "./pages/ProductionPlanPage";

const linkStyle = ({ isActive }) => ({
  padding: "8px 12px",
  borderRadius: 8,
  textDecoration: "none",
  border: "1px solid #ddd",
  background: isActive ? "#f2f2f2" : "white",
  color: "#111",
});

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Manufacturing Inventory</h2>
          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <NavLink to="/products" style={linkStyle}>Products</NavLink>
            <NavLink to="/raw-materials" style={linkStyle}>Raw Materials</NavLink>
            <NavLink to="/production-plan" style={linkStyle}>Production Plan</NavLink>
          </nav>
        </header>

        <div style={{ height: 12 }} />

        <Routes>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/raw-materials" element={<RawMaterialsPage />} />
          <Route path="/production-plan" element={<ProductionPlanPage />} />
          <Route path="*" element={<ProductsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
