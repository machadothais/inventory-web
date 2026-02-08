import { useEffect, useState } from "react";
import { api } from "../api/client";
import BomEditor from "../components/BomEditor";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/products");
      setItems(data);
    } catch (e) {
      setError("Failed to load products. Check backend/CORS/port.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/products", {
        code: form.code,
        name: form.name,
        price: Number(form.price),
      });
      setForm({ code: "", name: "", price: "" });
      await load();
    } catch (e) {
      setError("Failed to create product. Code must be unique and price > 0.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    setError("");
    try {
      await api.delete(`/api/products/${id}`);
      setSelectedProduct((prev) => (prev?.id === id ? null : prev));
      await load();
    } catch (e) {
      setError("Failed to delete product.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }} data-cy="products-page">
      {/* CREATE */}
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Create Product</h3>

        <form onSubmit={create} style={{ display: "grid", gap: 10 }} data-cy="product-create-form">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 10 }}>
            <input
              data-cy="product-code"
              placeholder="Code (e.g. P01)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              data-cy="product-name"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              data-cy="product-price"
              placeholder="Price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <button
            data-cy="product-save"
            type="submit"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
          >
            Save
          </button>

          {error && <p data-cy="product-error" style={{ color: "crimson", margin: 0 }}>{error}</p>}
        </form>
      </section>

      {/* LIST */}
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Products</h3>

          <button
            data-cy="products-refresh"
            type="button"
            onClick={load}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p data-cy="products-loading">Loading...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table data-cy="products-table" width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Code</th>
                  <th align="left">Name</th>
                  <th align="left">Price</th>
                  <th align="right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0" }} data-cy={`product-row-${p.code}`}>
                    <td>{p.id}</td>
                    <td data-cy="product-row-code">{p.code}</td>
                    <td data-cy="product-row-name">{p.name}</td>
                    <td data-cy="product-row-price">{p.price}</td>

                    <td align="right">
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                          data-cy={`product-bom-${p.code}`}
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
                        >
                          BOM
                        </button>

                        <button
                          data-cy={`product-delete-${p.code}`}
                          type="button"
                          onClick={() => remove(p.id)}
                          style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "white" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" data-cy="products-empty">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* BOM EDITOR */}
      {selectedProduct && (
        <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }} data-cy="bom-section">
          <BomEditor product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </section>
      )}
    </div>
  );
}
