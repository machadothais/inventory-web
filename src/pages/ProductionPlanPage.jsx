import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

function EmptyState() {
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
        <rect x="22" y="34" width="72" height="10" rx="5" fill="#D8DEE4" />
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

      <h5 className="mb-1 fw-semibold">No producible items</h5>
      <div className="text-muted mb-3">
        Current stock doesn’t allow production for any product.
      </div>
      <div className="text-muted small">
        Tip: check Raw Materials stock levels or adjust BOM.
      </div>
    </div>
  );
}

export default function ProductionPlanPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fmtMoney = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    [],
  );

  const fmtNumber = useMemo(
    () => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }),
    [],
  );

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/api/production-plan");
      setData(res.data);
    } catch (e) {
      setError("Failed to load production plan. Check backend/CORS/port.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const items = data?.items ?? [];
  const hasItems = items.length > 0;

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <i className="bi bi-diagram-3 text-primary" />
              <h3 className="mb-0 fw-bold">Production Plan</h3>
            </div>
            <div className="text-muted">
              Overview of producible quantity based on current stock and BOM.
            </div>
          </div>

          <button
            onClick={load}
            className="btn btn-outline-primary rounded-3 px-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
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
            <div>{error}</div>
          </div>
        )}

        {!data && loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            Loading production plan...
          </div>
        ) : !data ? (
          <div className="text-muted">No data yet.</div>
        ) : !hasItems ? (
          <EmptyState />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Producible Qty</th>
                    <th className="text-end">Total Value</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it) => {
                    const qty = Number(it.producibleQuantity || 0);
                    const qtyBadge =
                      qty > 0
                        ? "bg-success-subtle text-success"
                        : "bg-secondary-subtle text-secondary";

                    return (
                      <tr key={it.productId}>
                        <td>
                          <div className="fw-semibold">{it.productName}</div>
                          <div className="text-muted small">{it.productCode}</div>
                        </td>

                        <td className="text-end">
                          {fmtMoney.format(Number(it.unitPrice || 0))}
                        </td>

                        <td className="text-end">
                          <span
                            className={`badge rounded-pill ${qtyBadge} px-3 py-2`}
                          >
                            <i className="bi bi-box-seam me-2" />
                            {fmtNumber.format(qty)}
                          </span>
                        </td>

                        <td className="text-end fw-semibold">
                          {fmtMoney.format(Number(it.totalValue || 0))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <div
                className="card border-0 shadow-sm rounded-4"
                style={{
                  background:
                    "linear-gradient(135deg, #F7FAFF 0%, #EEF4FF 100%)",
                  minWidth: 280,
                }}
              >
                <div className="card-body px-4 py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Total Value</div>
                      <div className="fs-4 fw-bold">
                        {fmtMoney.format(Number(data.totalValue || 0))}
                      </div>
                    </div>
                    <div
                      className="rounded-4 d-flex align-items-center justify-content-center"
                      style={{
                        width: 44,
                        height: 44,
                        background: "rgba(13,110,253,.12)",
                      }}
                      aria-hidden="true"
                    >
                      <i className="bi bi-cash-coin text-primary fs-5" />
                    </div>
                  </div>

                  <div className="text-muted small mt-2">
                    <i className="bi bi-info-circle me-1" />
                    Estimated value based on producible quantity.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}