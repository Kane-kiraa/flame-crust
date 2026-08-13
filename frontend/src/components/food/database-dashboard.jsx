import { useEffect, useMemo, useState } from "react";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchDashboard } from "@/lib/food-api.jsx";

const tabs = [
  ["products", "Products"], ["customers", "Customers"], ["addresses", "Addresses"],
  ["orders", "Orders"], ["orderItems", "Order Items"], ["payments", "Payments"]
];

function money(value) {
  return typeof value === "number" || /^\d+\.\d+$/.test(String(value)) ? `$${Number(value).toFixed(2)}` : value;
}

export function DatabaseDashboard() {
  const [data, setData] = useState({});
  const [active, setActive] = useState("products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rows = data[active] ?? [];
  const columns = useMemo(() => rows.length ? Object.keys(rows[0]) : [], [rows]);

  const load = () => {
    setLoading(true); setError("");
    const controller = new AbortController();
    fetchDashboard(controller.signal).then(setData).catch((e) => { if (e.name !== "AbortError") setError("Could not load database data"); }).finally(() => setLoading(false));
    return () => controller.abort();
  };
  useEffect(load, []);

  return (
    <section id="dashboard" className="border-t border-border/60 bg-secondary/25 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"><Database className="size-3.5" /> Database UI</span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-foreground">Manage your data</h2>
            <p className="mt-2 text-muted-foreground">Products, customers, orders and payments from MySQL.</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={load}><RefreshCw className="mr-2 size-4" /> Refresh</Button>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map(([id, label]) => <button key={id} onClick={() => setActive(id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${active === id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>{label} <span className="ml-1 opacity-70">{(data[id] ?? []).length}</span></button>)}
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-warm">
          {loading ? <div className="p-8 text-center text-muted-foreground">Loading database...</div> : error ? <div className="p-8 text-center text-destructive">{error}</div> : rows.length === 0 ? <div className="p-8 text-center text-muted-foreground">No data in this table yet.</div> : <div className="max-h-[460px] overflow-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="sticky top-0 bg-secondary text-xs uppercase tracking-wider text-muted-foreground"><tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index} className="border-t border-border/50 hover:bg-secondary/40">{columns.map((column) => <td key={column} className="max-w-[260px] truncate px-4 py-3 text-foreground/80">{column === "image" ? <img src={row[column]} alt={row.name ?? "Product"} className="size-12 rounded-lg object-cover" /> : String(money(row[column]) ?? "—")}</td>)}</tr>)}</tbody></table></div>}
        </div>
      </div>
    </section>
  );
}
