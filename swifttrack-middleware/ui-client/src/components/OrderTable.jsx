export default function OrderTable({ orders, onSetStatus }) {
  return (
    <table className="orders">
      <thead>
        <tr>
          <th>Order</th>
          <th>Product</th>
          <th>Address</th>
          <th>Status</th>
          <th style={{ width: 260 }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ opacity: 0.7, padding: 14 }}>
              No orders
            </td>
          </tr>
        ) : (
          orders.map((o) => (
            <tr key={o.order_id || o.id}>
              <td>{String(o.order_id || o.id).slice(0, 8)}...</td>
              <td>{o.product_id}</td>
              <td>{o.address}</td>
              <td>{o.status}</td>

              <td>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    onClick={() => onSetStatus(o.order_id || o.id, "PICKED_UP")}
                  >
                    Picked Up
                  </button>

                  <button
                    className="btn"
                    onClick={() => onSetStatus(o.order_id || o.id, "IN_TRANSIT")}
                  >
                    In Transit
                  </button>

                  <button
                    className="btn primary"
                    onClick={() => onSetStatus(o.order_id || o.id, "DELIVERED")}
                  >
                    Mark Delivered
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}