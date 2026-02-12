import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export default function BomEditor({ product, onClose }) {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [bomItems, setBomItems] = useState([]);

  const [form, setForm] = useState({ rawMaterialId: "", quantityRequired: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const productId = product?.id;

  async function loadRawMaterials() {
    const { data } = await api.get("/api/raw-materials");
    setRawMaterials(data);
  }

  async function loadBom() {
    const { data } = await api.get(`/api/products/${productId}/bom`);
    setBomItems(data);
  }

  async function loadAll() {
    if (!productId) return;
    setError("");
    setLoading(true);
    try {
      await Promise.all([loadRawMaterials(), loadBom()]);
    } catch (e) {
      setError("Failed to load BOM/raw materials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditingId(null);
    setEditQty("");
    loadAll();
  }, [productId]);

  const rawMaterialOptions = useMemo(() => {
    const usedIds = new Set(
      bomItems.map((it) => it.rawMaterial?.id).filter(Boolean),
    );
    return rawMaterials.map((rm) => ({ ...rm, disabled: usedIds.has(rm.id) }));
  }, [rawMaterials, bomItems]);

  async function addItem(e) {
    e.preventDefault();

    if (!form.rawMaterialId || !form.quantityRequired) {
      setError("Select a raw material and enter quantity required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.post(`/api/products/${productId}/bom`, {
        rawMaterialId: Number(form.rawMaterialId),
        quantityRequired: Number(form.quantityRequired),
      });

      setForm({ rawMaterialId: "", quantityRequired: "" });
      await loadBom();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Failed to add BOM item (maybe already associated).";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(bomId) {
    if (!confirm("Remove this BOM item?")) return;

    setError("");
    setLoading(true);
    try {
      await api.delete(`/api/products/${productId}/bom/${bomId}`);
      if (editingId === bomId) {
        setEditingId(null);
        setEditQty("");
      }
      await loadBom();
    } catch (e) {
      setError("Failed to remove BOM item.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item) {
    setError("");
    setEditingId(item.id);
    setEditQty(String(item.quantityRequired ?? ""));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQty("");
    setError("");
  }

  async function saveEdit(item) {
    if (!productId) return;

    const qty = Number(editQty);
    if (!editQty || Number.isNaN(qty) || qty <= 0) {
      setError("Quantity must be a number greater than 0.");
      return;
    }

    setError("");
    setSavingEdit(true);
    try {
      await api.put(`/api/products/${productId}/bom/${item.id}`, {
        rawMaterialId: item.rawMaterial?.id,
        quantityRequired: qty,
      });

      setEditingId(null);
      setEditQty("");
      await loadBom();
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Failed to update BOM item quantity.";
      setError(msg);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div
      data-cy="bom-editor"
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }} data-cy="bom-title">
            BOM (Composition)
          </h3>
          <div style={{ fontSize: 12, opacity: 0.7 }} data-cy="bom-product-info">
            Product: <b>{product?.name}</b> ({product?.code})
          </div>
        </div>

        <button
          data-cy="bom-close"
          onClick={onClose}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
          }}
        >
          Close
        </button>
      </div>

      <form
        onSubmit={addItem}
        style={{ display: "grid", gap: 10 }}
        data-cy="bom-form"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Raw Material</label>
            <select
              data-cy="bom-raw-material-select"
              value={form.rawMaterialId}
              onChange={(e) =>
                setForm((f) => ({ ...f, rawMaterialId: e.target.value }))
              }
              style={{ width: "100%", padding: 8 }}
              disabled={loading || savingEdit}
            >
              <option value="">Select...</option>
              {rawMaterialOptions.map((rm) => (
                <option key={rm.id} value={rm.id} disabled={rm.disabled}>
                  {rm.code} - {rm.name} {rm.disabled ? "(already added)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.7 }}>
              Quantity required
            </label>
            <input
              data-cy="bom-quantity-input"
              type="number"
              step="0.01"
              value={form.quantityRequired}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantityRequired: e.target.value }))
              }
              placeholder="e.g. 2.5"
              style={{ width: "100%", padding: 8 }}
              disabled={loading || savingEdit}
            />
          </div>

          <button
            data-cy="bom-add"
            type="submit"
            disabled={loading || savingEdit}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {error && (
          <p data-cy="bom-error" style={{ color: "crimson", margin: 0 }}>
            {error}
          </p>
        )}
      </form>

      <div style={{ height: 14 }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0 }}>Items</h4>
        <button
          data-cy="bom-refresh"
          onClick={loadAll}
          disabled={loading || savingEdit}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p data-cy="bom-loading">Loading...</p>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table
            data-cy="bom-table"
            width="100%"
            cellPadding="8"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th align="left">Raw material</th>
                <th align="left">Quantity required</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bomItems.map((it) => {
                const isEditing = editingId === it.id;

                return (
                  <tr
                    key={it.id}
                    style={{ borderTop: "1px solid #f0f0f0" }}
                    data-cy={`bom-row-${it.id}`}
                  >
                    <td>
                      <div style={{ fontWeight: 600 }} data-cy="bom-row-name">
                        {it.rawMaterial?.name ?? "—"}
                      </div>
                      <div
                        style={{ fontSize: 12, opacity: 0.7 }}
                        data-cy="bom-row-code"
                      >
                        {it.rawMaterial?.code ?? ""}
                      </div>
                    </td>

                    <td data-cy="bom-row-qty">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          style={{ width: 140, padding: 6 }}
                          disabled={savingEdit}
                        />
                      ) : (
                        it.quantityRequired
                      )}
                    </td>

                    <td align="right">
                      {isEditing ? (
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            onClick={() => saveEdit(it)}
                            disabled={savingEdit}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 10,
                              border: "1px solid #0d6efd",
                              background: "#0d6efd",
                              color: "white",
                              cursor: "pointer",
                            }}
                            data-cy={`bom-save-${it.id}`}
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>

                          <button
                            onClick={cancelEdit}
                            disabled={savingEdit}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 10,
                              border: "1px solid #ddd",
                              background: "white",
                              cursor: "pointer",
                            }}
                            data-cy={`bom-cancel-${it.id}`}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            onClick={() => startEdit(it)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 10,
                              border: "1px solid #ddd",
                              background: "white",
                            }}
                            data-cy={`bom-edit-${it.id}`}
                          >
                            Edit
                          </button>

                          <button
                            data-cy={`bom-remove-${it.id}`}
                            onClick={() => removeItem(it.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 10,
                              border: "1px solid #ddd",
                              background: "white",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {bomItems.length === 0 && (
                <tr>
                  <td colSpan="3" data-cy="bom-empty">
                    No BOM items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}