import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ProductionPlanPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const res = await api.get("/api/production-plan");
      setData(res.data);
    } catch (e) {
      setError("Failed to load production plan.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Production Plan</h3>
        <button onClick={load} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}>
          Refresh
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Product</th>
                  <th align="left">Unit Price</th>
                  <th align="left">Producible Qty</th>
                  <th align="left">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {data.items?.map((it) => (
                  <tr key={it.productId} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{it.productName}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{it.productCode}</div>
                    </td>
                    <td>{it.unitPrice}</td>
                    <td>{it.producibleQuantity}</td>
                    <td>{it.totalValue}</td>
                  </tr>
                ))}
                {(!data.items || data.items.length === 0) && (
                  <tr>
                    <td colSpan="4">No producible items with current stock.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, minWidth: 240 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Total Value</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{data.totalValue}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
