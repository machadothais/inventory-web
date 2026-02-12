import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

function EmptyState({ title, subtitle, tip }) {
  return (
    <div className="text-center py-5">
      <svg
        width="140"
        height="100"
        viewBox="0 0 140 100"
        className="mb-3"
        aria-hidden="true"
      >
        <rect x="10" y="20" width="120" height="70" rx="10" fill="#F3F5F7" />
        <rect x="22" y="34" width="64" height="10" rx="5" fill="#D8DEE4" />
        <rect x="22" y="52" width="96" height="10" rx="5" fill="#D8DEE4" />
        <rect x="22" y="70" width="56" height="10" rx="5" fill="#D8DEE4" />
        <circle cx="108" cy="40" r="12" fill="#E7EDF3" />
        <path
          d="M103 40h10M108 35v10"
          stroke="#9AA7B2"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <h5 className="mb-1 fw-semibold">{title}</h5>
      <div className="text-muted mb-3">{subtitle}</div>
      {tip && <div className="text-muted small">{tip}</div>}
    </div>
  );
}

export default function RawMaterialsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", stock: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const fmtNumber = useMemo(
    () => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }),
    [],
  );

  async function load() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/api/raw-materials");
      setItems(data);
    } catch (e) {
      setError("Failed to load raw materials. Check backend/CORS/port.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(it) {
    setEditing(it);
    setError("");
    setForm({
      code: it.code ?? "",
      name: it.name ?? "",
      stock: String(it.stockQuantity ?? 0),
    });
  }

  function cancelEdit() {
    setEditing(null);
    setError("");
    setForm({ code: "", name: "", stock: "" });
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
      await api.post("/api/raw-materials", {
        code: form.code.trim(),
        name: form.name.trim(),
        stockQuantity: Number(form.stock || 0),
      });
      setForm({ code: "", name: "", stock: "" });
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Failed to create raw material. Check if code is unique.";
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
      await api.put(`/api/raw-materials/${editing.id}`, {
        code: form.code.trim(),
        name: form.name.trim(),
        stockQuantity: Number(form.stock || 0),
      });

      cancelEdit();
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Failed to update raw material. Check if code is unique.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    setError("");
    try {
      await api.delete(`/api/raw-materials/${id}`);
      if (editing?.id === id) cancelEdit();
      await load();
    } catch (e) {
      setError("Failed to delete raw material.");
    }
  }

  const stockBadgeClass = (stock) => {
    const s = Number(stock || 0);
    if (s <= 0) return "bg-danger-subtle text-danger";
    if (s < 10) return "bg-warning-subtle text-warning";
    return "bg-success-subtle text-success";
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-boxes text-primary" />
            <h3 className="mb-0 fw-bold">Raw Materials</h3>
          </div>
          <div className="text-muted">Manage stock and materials used in BOM.</div>
        </div>

        <button
          className="btn btn-outline-primary rounded-3 px-3"
          onClick={load}
          disabled={loading}
          data-cy="rm-refresh"
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
          data-cy="rm-error"
        >
          <i className="bi bi-exclamation-triangle mt-1" />
          <div>{error}</div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4" data-cy="rm-form-card">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <i
                className={`bi ${editing ? "bi-pencil-square" : "bi-plus-circle"} text-primary`}
              />
              <h5 className="mb-0 fw-semibold">
                {editing ? "Edit Raw Material" : "Create Raw Material"}
              </h5>
            </div>

            {editing && (
              <span className="badge bg-primary-subtle text-primary rounded-pill">
                Editing ID: {editing.id}
              </span>
            )}
          </div>

          <form onSubmit={editing ? update : create}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Code</label>
                <input
                  className="form-control"
                  data-cy="rm-code"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="RM01"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  data-cy="rm-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Material name"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Stock</label>
                <input
                  className="form-control"
                  data-cy="rm-stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 gap-2">
              {editing && (
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-3 px-4"
                  onClick={cancelEdit}
                  disabled={saving}
                  data-cy="rm-cancel"
                >
                  <i className="bi bi-x-circle me-2" />
                  Cancel
                </button>
              )}

              <button
                type="submit"
                data-cy="rm-save"
                className={`btn ${editing ? "btn-primary" : "btn-success"} rounded-3 px-4`}
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
                      className={`bi ${editing ? "bi-pencil-square" : "bi-check2-circle"} me-2`}
                    />
                    {editing ? "Update" : "Save"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4" data-cy="rm-list-card">
        <div className="card-body p-0">
          <div className="px-4 pt-4 pb-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-list-ul text-primary" />
              <h5 className="mb-0 fw-semibold">Raw Materials List</h5>
            </div>

            <span
              className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2"
              data-cy="rm-count"
            >
              {items.length} items
            </span>
          </div>

          {loading ? (
            <div className="px-4 pb-4 text-muted d-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm" />
              Loading raw materials...
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No raw materials yet"
              subtitle="Add materials to build BOM and enable production planning."
              tip="Tip: keep stock updated to get accurate producible quantity."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" data-cy="rm-table">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th className="text-end">Stock</th>
                    <th className="text-end" style={{ width: 240 }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} data-cy={`rm-row-${it.code}`}>
                      <td className="text-muted">{it.id}</td>
                      <td>
                        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                          {it.code}
                        </span>
                      </td>
                      <td className="fw-semibold">{it.name}</td>

                      <td className="text-end">
                        <span
                          className={`badge rounded-pill ${stockBadgeClass(it.stockQuantity)} px-3 py-2`}
                        >
                          <i className="bi bi-graph-up me-2" />
                          {fmtNumber.format(Number(it.stockQuantity || 0))}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-3"
                            onClick={() => startEdit(it)}
                            data-cy={`rm-edit-${it.code}`}
                          >
                            <i className="bi bi-pencil me-2" />
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger rounded-3"
                            onClick={() => remove(it.id)}
                            data-cy={`rm-delete-${it.code}`}
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
      </div>
    </div>
  );
}