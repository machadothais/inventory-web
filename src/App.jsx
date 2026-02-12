import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import ProductionPlanPage from "./pages/ProductionPlanPage";

const navLinkClass = ({ isActive }) =>
  [
    "nav-link",
    "px-3",
    "py-2",
    "rounded-3",
    "fw-semibold",
    isActive ? "active bg-primary text-white shadow-sm" : "text-secondary",
  ].join(" ");

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-light min-vh-100">
        <div className="container py-4" style={{ maxWidth: 1100 }}>
          {/* Topbar */}
          <header className="mb-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
              <div>
                <h1 className="h3 mb-1 fw-bold text-primary">
                  Manufacturing Inventory
                </h1>
                <div className="text-muted">
                  Manage products, raw materials and production planning
                </div>
              </div>

              {/* Nav (pills) */}
              <nav className="bg-white border rounded-4 p-2 shadow-sm">
                <ul className="nav gap-2 flex-wrap">
                  <li className="nav-item">
                    <NavLink to="/products" className={navLinkClass}>
                      Products
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/raw-materials" className={navLinkClass}>
                      Raw Materials
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/production-plan" className={navLinkClass}>
                      Production Plan
                    </NavLink>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          {/* Content */}
          <main className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <Routes>
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/raw-materials" element={<RawMaterialsPage />} />
                <Route
                  path="/production-plan"
                  element={<ProductionPlanPage />}
                />
                <Route path="*" element={<ProductsPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
