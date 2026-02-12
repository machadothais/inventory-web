import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import BomEditor from "../components/BomEditor";

function EmptyState() {
  return (
    <div className="text-center py-5" data-cy="products-empty">
      <svg
        width="140"
        height="100"
        viewBox="0 0 140 100"
        className="mb-3"
        aria-hidden="true"
      >
        <rect x="10" y="20" width="120" height="70" rx="10" fill="#F3F5F7" />
        <rect x="22" y="34" width="92" height="10" rx="5" fill="#D8DEE4" />
        <rect x="22" y="52" width="70" height="10" rx="5" fill="#D8DEE4" />
        <rect x="22" y="70" width="56" height="10" rx="5" fill="#D8DEE4" />
        <circle cx="108" cy="40" r="12" fill="#E7EDF3" />
        <path
          d="M103 40h10"
          stroke="#9AA7B2"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <h5 className="mb-1 fw-semibold">No products yet</h5>
      <div className="text-muted">
        Create your first product to start planning production.
      </div>
      <div className="text-muted small mt-2">
        Tip: after creating, open BOM to link raw materials.
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editing, setEditing] = useState(null);

  const fmtMoney = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    [],
  );

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

  function startEdit(p) {
    setEditing(p);
    setError("");
    setForm({
      code: p.code ?? "",
      name: p.name ?? "",
      price: String(p.price ?? ""),
    });
  }

  function cancelEdit() {
    setEditing(null);
    setError("");
    setForm({ code: "", name: "", price: "" });
  }

  async function create(e) {
    e.preventDefault();
    setError("");

    if (!form.code.trim() || !form.name.trim()) {
      setError("Please fill Code and Name.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/products", {
        code: form.code.trim(),
        name: form.name.trim(),
        price: Number(form.price || 0),
      });

      setForm({ code: "", name: "", price: "" });
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Failed to create product. Code must be unique and price > 0.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }
  async function update(e) {
    e.preventDefault();
    setError("");

    if (!editing) return;

    if (!form.code.trim() || !form.name.trim()) {
      setError("Please fill Code and Name.");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/products/${editing.id}`, {
        code: form.code.trim(),
        name: form.name.trim(),
        price: Number(form.price || 0),
      });

      cancelEdit();
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Failed to update product. Code must be unique and price > 0.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    setError("");
    try {
      await api.delete(`/api/products/${id}`);
      setSelectedProduct((prev) => (prev?.id === id ? null : prev));
      if (editing?.id === id) cancelEdit();
      await load();
    } catch (e) {
      setError("Failed to delete product.");
    }
  }

  return (
    <div className="d-flex flex-column gap-4" data-cy="products-page">
      {/* TOP TITLE + ACTION */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-box-seam text-primary" />
            <h3 className="mb-0 fw-bold">Products</h3>
          </div>
          <div className="text-muted">
            Create products and manage BOM relationships.
          </div>
        </div>

        <button
          data-cy="products-refresh"
          type="button"
          onClick={load}
          className="btn btn-outline-primary rounded-3 px-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Refreshing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2" />
              Refresh
            </>
          )}
        </button>
      </div>
      {error && (
        <div
          className="alert alert-danger rounded-4 d-flex align-items-start gap-2"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle mt-1" />
          <div data-cy="product-error">{error}</div>
        </div>
      )}
      <section className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <i
                className={`bi ${
                  editing ? "bi-pencil-square" : "bi-plus-circle"
                } text-primary`}
              />
              <h5 className="mb-0 fw-semibold">
                {editing ? "Edit Product" : "Create Product"}
              </h5>
            </div>

            {editing && (
              <span className="badge bg-primary-subtle text-primary rounded-pill">
                Editing ID: {editing.id}
              </span>
            )}
          </div>

          <form
            onSubmit={editing ? update : create}
            className="d-flex flex-column gap-3"
            data-cy="product-create-form"
          >
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Code</label>
                <input
                  data-cy="product-code"
                  className="form-control"
                  placeholder="P01"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  data-cy="product-name"
                  className="form-control"
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Price</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    data-cy="product-price"
                    className="form-control"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              {editing && (
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-3 px-4"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <i className="bi bi-x-circle me-2" />
                  Cancel
                </button>
              )}

              <button
                data-cy="product-save"
                type="submit"
                className={`btn ${
                  editing ? "btn-primary" : "btn-success"
                } rounded-3 px-4`}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {editing ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <i
                      className={`bi ${
                        editing ? "bi-pencil-square" : "bi-check2-circle"
                      } me-2`}
                    />
                    {editing ? "Update" : "Save"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="px-4 pt-4 pb-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-list-ul text-primary" />
              <h5 className="mb-0 fw-semibold">Products List</h5>
            </div>

            <span className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2">
              {items.length} items
            </span>
          </div>

          {loading ? (
            <div
              className="px-4 pb-4 text-muted d-flex align-items-center gap-2"
              data-cy="products-loading"
            >
              <span className="spinner-border spinner-border-sm" />
              Loading products...
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                data-cy="products-table"
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 90 }}>ID</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th className="text-end">Price</th>
                    <th className="text-end" style={{ width: 330 }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} data-cy={`product-row-${p.code}`}>
                      <td className="text-muted">{p.id}</td>

                      <td data-cy="product-row-code">
                        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                          {p.code}
                        </span>
                      </td>

                      <td data-cy="product-row-name" className="fw-semibold">
                        {p.name}
                      </td>

                      <td data-cy="product-row-price" className="text-end">
                        {fmtMoney.format(Number(p.price || 0))}
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="btn btn-sm btn-outline-primary rounded-3"
                            data-cy={`product-edit-${p.code}`}
                          >
                            <i className="bi bi-pencil me-2" />
                            Edit
                          </button>

                          <button
                            data-cy={`product-bom-${p.code}`}
                            type="button"
                            onClick={() => setSelectedProduct(p)}
                            className="btn btn-sm btn-outline-secondary rounded-3"
                          >
                            <i className="bi bi-diagram-2 me-2" />
                            BOM
                          </button>

                          <button
                            data-cy={`product-delete-${p.code}`}
                            type="button"
                            onClick={() => remove(p.id)}
                            className="btn btn-sm btn-outline-danger rounded-3"
                          >
                            <i className="bi bi-trash3 me-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      {selectedProduct && (
        <section
          className="card border-0 shadow-sm rounded-4"
          data-cy="bom-section"
        >
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-diagram-3 text-primary" />
                  <h5 className="mb-0 fw-semibold">BOM Editor</h5>
                </div>
                <div className="text-muted small">
                  Product:{" "}
                  <span className="fw-semibold">{selectedProduct.name}</span>{" "}
                  <span className="ms-2 badge bg-primary-subtle text-primary rounded-pill">
                    {selectedProduct.code}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary rounded-3"
                onClick={() => setSelectedProduct(null)}
              >
                <i className="bi bi-x-lg me-2" />
                Close
              </button>
            </div>

            <BomEditor
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          </div>
        </section>
      )}
    </div>
  );
}