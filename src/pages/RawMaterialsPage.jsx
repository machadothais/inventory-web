import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function RawMaterialsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", stockQuantity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/raw-materials");
      setItems(data);
    } catch (e) {
      setError("Failed to load raw materials.");
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
      await api.post("/api/raw-materials", {
        code: form.code,
        name: form.name,
        stockQuantity: Number(form.stockQuantity),
      });
      setForm({ code: "", name: "", stockQuantity: "" });
      await load();
    } catch (e) {
      setError("Failed to create raw material. Code must be unique and stock >= 0.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this raw material?")) return;
    setError("");
    try {
      await api.delete(`/api/raw-materials/${id}`);
      await load();
    } catch (e) {
      setError("Failed to delete raw material.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Create Raw Material</h3>
        <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 10 }}>
            <input placeholder="Code (e.g. RM01)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Stock Quantity" type="number" step="0.01" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
          </div>
          <button type="submit" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}>
            Save
          </button>
          {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
        </form>
      </section>

      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Raw Materials</h3>
          <button onClick={load} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Code</th>
                  <th align="left">Name</th>
                  <th align="left">Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((rm) => (
                  <tr key={rm.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td>{rm.id}</td>
                    <td>{rm.code}</td>
                    <td>{rm.name}</td>
                    <td>{rm.stockQuantity}</td>
                    <td align="right">
                      <button onClick={() => remove(rm.id)} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5">No raw materials yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
