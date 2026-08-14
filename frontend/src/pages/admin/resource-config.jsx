// Field definitions for each admin resource
export const resourceConfig = {
  products: {
    label: "Products",
    icon: "📦",
    searchKeys: ["name", "category"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "name", label: "Name", sortable: true },
      { key: "price", label: "Price", sortable: true, render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
      { key: "category", label: "Category", sortable: true, render: (v) => v ? <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">{v}</span> : "—" },
      { key: "rating", label: "Rating", sortable: true, render: (v) => v != null ? `⭐ ${v}` : "—" },
      { key: "popular", label: "Popular", render: (v) => v ? "✅" : "—" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "price", label: "Price", type: "number", required: true, step: "0.01" },
      { name: "category", label: "Category", type: "select", required: true, options: [
        { value: "pizza", label: "Pizza" },
        { value: "pizza-bagels", label: "Pizza Bagels" },
        { value: "burgers", label: "Burgers" },
        { value: "sides", label: "Sides" },
      ]},
      { name: "image", label: "Image URL", type: "text", required: false },
      { name: "tags", label: "Tags (comma-separated)", type: "text", required: false },
      { name: "rating", label: "Rating", type: "number", required: false, step: "0.1" },
      { name: "spicy", label: "Spicy", type: "checkbox", required: false },
      { name: "vegetarian", label: "Vegetarian", type: "checkbox", required: false },
      { name: "popular", label: "Popular", type: "checkbox", required: false },
    ],
  },
  categories: {
    label: "Categories",
    icon: "📂",
    searchKeys: ["name", "slug"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "name", label: "Name", sortable: true },
      { key: "slug", label: "Slug", sortable: true },
      { key: "sort_order", label: "Order", sortable: true },
      { key: "active", label: "Active", render: (v) => v ? "✅" : "❌" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "sort_order", label: "Sort Order", type: "number", required: false },
      { name: "active", label: "Active", type: "checkbox", required: false },
    ],
  },
  customers: {
    label: "Customers",
    icon: "👥",
    searchKeys: ["name", "email", "phone"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "phone", label: "Phone" },
      { key: "created_at", label: "Created", sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: false },
      { name: "phone", label: "Phone", type: "tel", required: false },
    ],
  },
  orders: {
    label: "Orders",
    icon: "📋",
    searchKeys: ["order_number", "status"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "order_number", label: "Order Number", sortable: true },
      { key: "status", label: "Status", sortable: true, render: (v) => {
        const colors = {
          pending: "bg-yellow-100 text-yellow-800",
          confirmed: "bg-blue-100 text-blue-800",
          preparing: "bg-orange-100 text-orange-800",
          delivered: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[v] || "bg-secondary"}`}>{v || "—"}</span>;
      }},
      { key: "total", label: "Total", sortable: true, render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
      { key: "created_at", label: "Created", sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    ],
    fields: [
      { name: "order_number", label: "Order Number", type: "text", required: true },
      { name: "customer_id", label: "Customer ID", type: "number", required: true },
      { name: "status", label: "Status", type: "select", required: true, options: [
        { value: "PENDING", label: "Pending" },
        { value: "CONFIRMED", label: "Confirmed" },
        { value: "PREPARING", label: "Preparing" },
        { value: "DELIVERED", label: "Delivered" },
        { value: "CANCELLED", label: "Cancelled" },
      ]},
      { name: "subtotal", label: "Subtotal", type: "number", required: true, step: "0.01" },
      { name: "delivery_fee", label: "Delivery Fee", type: "number", required: false, step: "0.01" },
      { name: "total", label: "Total", type: "number", required: true, step: "0.01" },
      { name: "notes", label: "Notes", type: "textarea", required: false },
    ],
  },
  payments: {
    label: "Payments",
    icon: "💳",
    searchKeys: ["method", "status"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "order_id", label: "Order ID", sortable: true },
      { key: "method", label: "Method", sortable: true },
      { key: "amount", label: "Amount", sortable: true, render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
      { key: "status", label: "Status", sortable: true, render: (v) => {
        const colors = {
          completed: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          failed: "bg-red-100 text-red-800",
        };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[v] || "bg-secondary"}`}>{v || "—"}</span>;
      }},
      { key: "created_at", label: "Created", sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    ],
    fields: [
      { name: "order_id", label: "Order ID", type: "text", required: true },
      { name: "method", label: "Method", type: "select", required: true, options: [
        { value: "CARD", label: "Card" },
        { value: "ABA_PAY", label: "ABA Pay" },
        { value: "CASH", label: "Cash" },
      ]},
      { name: "amount", label: "Amount", type: "number", required: true, step: "0.01" },
      { name: "status", label: "Status", type: "select", required: true, options: [
        { value: "PENDING", label: "Pending" },
        { value: "PAID", label: "Paid" },
        { value: "FAILED", label: "Failed" },
      ]},
    ],
  },
  drivers: {
    label: "Drivers",
    icon: "🚗",
    searchKeys: ["name", "status"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "name", label: "Name", sortable: true },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status", sortable: true, render: (v) => {
        const colors = {
          available: "bg-green-100 text-green-800",
          busy: "bg-yellow-100 text-yellow-800",
          offline: "bg-gray-100 text-gray-800",
        };
        return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[v] || "bg-secondary"}`}>{v || "—"}</span>;
      }},
      { key: "rating", label: "Rating", sortable: true, render: (v) => v != null ? `⭐ ${v}` : "—" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "status", label: "Status", type: "select", required: true, options: [
        { value: "ONLINE", label: "Online" },
        { value: "BUSY", label: "Busy" },
        { value: "OFFLINE", label: "Offline" },
      ]},
      { name: "rating", label: "Rating", type: "number", required: false, step: "0.1" },
    ],
  },
  coupons: {
    label: "Coupons",
    icon: "🎟️",
    searchKeys: ["code"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "code", label: "Code", sortable: true },
      { key: "discount_value", label: "Discount", sortable: true, render: (v) => v != null ? v : "—" },
      { key: "min_order_amount", label: "Min Order", sortable: true, render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
      { key: "expires_at", label: "Expires", sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
      { key: "active", label: "Active", render: (v) => v ? "✅" : "❌" },
    ],
    fields: [
      { name: "code", label: "Code", type: "text", required: true },
      { name: "discount_type", label: "Discount Type", type: "select", required: true, options: [
        { value: "PERCENTAGE", label: "Percentage" },
        { value: "FIXED", label: "Fixed" },
      ]},
      { name: "discount_value", label: "Discount Value", type: "number", required: true, step: "0.01" },
      { name: "min_order_amount", label: "Min Order", type: "number", required: false, step: "0.01" },
      { name: "expires_at", label: "Expires At", type: "date", required: false },
      { name: "active", label: "Active", type: "checkbox", required: false },
    ],
  },
  users: {
    label: "Users",
    icon: "👤",
    searchKeys: ["username", "email"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "username", label: "Username", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role_id", label: "Role ID", sortable: true },
      { key: "active", label: "Active", render: (v) => v ? "✅" : "❌" },
    ],
    fields: [
      { name: "username", label: "Username", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "role_id", label: "Role ID", type: "number", required: true },
      { name: "active", label: "Active", type: "checkbox", required: false },
    ],
  },
  roles: {
    label: "Roles",
    icon: "🛡️",
    searchKeys: ["name"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "name", label: "Name", sortable: true },
      { key: "permissions", label: "Permissions" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "permissions", label: "Permissions (JSON)", type: "textarea", required: true },
    ],
  },
  audit_logs: {
    label: "Audit Logs",
    icon: "📝",
    searchKeys: ["action", "entity", "user_id"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "user_id", label: "User ID", sortable: true },
      { key: "action", label: "Action", sortable: true },
      { key: "entity", label: "Entity", sortable: true },
      { key: "created_at", label: "Date", sortable: true, render: (v) => v ? new Date(v).toLocaleString() : "—" },
    ],
    fields: [
      // Audit logs are usually read-only
    ],
  },
  product_options: {
    label: "Product Options",
    icon: "⚙️",
    searchKeys: ["name", "product_id"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "product_id", label: "Product ID", sortable: true },
      { key: "name", label: "Name", sortable: true },
      { key: "is_required", label: "Required", render: (v) => v ? "✅" : "—" },
    ],
    fields: [
      { name: "product_id", label: "Product ID", type: "number", required: true },
      { name: "name", label: "Option Name (e.g. Size)", type: "text", required: true },
      { name: "is_required", label: "Required", type: "checkbox", required: false },
    ],
  },
  product_variants: {
    label: "Product Variants",
    icon: "🧩",
    searchKeys: ["name", "option_id"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "option_id", label: "Option ID", sortable: true },
      { key: "name", label: "Variant Name", sortable: true },
      { key: "price_adjustment", label: "Price Adj.", sortable: true, render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
      { key: "active", label: "Active", render: (v) => v ? "✅" : "❌" },
    ],
    fields: [
      { name: "option_id", label: "Option ID", type: "number", required: true },
      { name: "name", label: "Variant Name (e.g. Large)", type: "text", required: true },
      { name: "price_adjustment", label: "Price Adjustment", type: "number", required: true, step: "0.01" },
      { name: "active", label: "Active", type: "checkbox", required: false },
    ],
  },
  reviews: {
    label: "Reviews",
    icon: "⭐",
    searchKeys: ["product_id", "customer_id", "comment"],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "w-16" },
      { key: "product_id", label: "Product ID", sortable: true },
      { key: "rating", label: "Rating", sortable: true, render: (v) => `⭐ ${v}` },
      { key: "comment", label: "Comment" },
      { key: "created_at", label: "Date", sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    ],
    fields: [
      { name: "product_id", label: "Product ID", type: "number", required: true },
      { name: "customer_id", label: "Customer ID", type: "number", required: true },
      { name: "rating", label: "Rating (1-5)", type: "number", required: true, step: "1" },
      { name: "comment", label: "Comment", type: "textarea", required: false },
    ],
  },
};
