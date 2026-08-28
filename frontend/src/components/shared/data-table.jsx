import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "./search-input";
import { TableSkeleton } from "./loading-skeleton";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [5, 10, 20, 50];

export function DataTable({
  columns,
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  pageSize: controlledPageSize,
  onPageChange,
  onSearchChange,
  actions,
  emptyTitle = "No items found",
  emptyDescription = "There are no items to display.",
  className,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key || "id");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(controlledPageSize || 10);

  // Sync pageSize when controlledPageSize changes (e.g. products -> 5)
  useEffect(() => {
    if (controlledPageSize) {
      setPageSize(controlledPageSize);
      setPage(0);
    }
  }, [controlledPageSize]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(0);
    onSearchChange?.(value);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredData = useMemo(() => {
    if (!search || searchKeys.length === 0) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val != null && String(val).toLowerCase().includes(lower);
      })
    );
  }, [data, search, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedData = sortedData.slice(safePage * pageSize, (safePage + 1) * pageSize);

  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length} className={className} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {searchable && (
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="sm:max-w-xs flex-1"
          />
        )}
        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>

      {pagedData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} className="py-10" />
      ) : (
        <>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {columns.map((col) => (
                    <TableHead key={col.key} className={cn(col.className)}>
                      {col.sortable ? (
                        <button
                          onClick={() => handleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {col.label}
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        col.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedData.map((row, i) => (
                  <TableRow key={row.id ?? i}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn(col.className, col.cellClassName)}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-md border border-border/60 bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-2">
                {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sortedData.length)} of {sortedData.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage === 0}
                onClick={() => setPage(0)}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage(totalPages - 1)}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
