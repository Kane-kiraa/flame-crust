import { useState, useMemo, useEffect } from "react";
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

const PAGE_SIZES = [5, 10, 20, 50, "All"];

export function DataTable({
  columns,
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  pageSize: controlledPageSize,
  serverSide = false,
  page: controlledPage,
  totalCount,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  actions,
  emptyTitle = "No items found",
  emptyDescription = "There are no items to display.",
  className,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key || "id");
  const [sortDir, setSortDir] = useState("asc");
  const [localPage, setLocalPage] = useState(0);
  const [pageSize, setPageSize] = useState(controlledPageSize || 10);

  const currentPage = serverSide ? (controlledPage ?? 0) : localPage;

  useEffect(() => {
    if (controlledPageSize !== undefined) {
      setPageSize(controlledPageSize);
    }
  }, [controlledPageSize]);

  const handlePageChange = (newPage) => {
    if (serverSide) {
      onPageChange?.(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    if (serverSide) {
      onPageSizeChange?.(newSize);
    } else {
      setLocalPage(0);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    if (!serverSide) setLocalPage(0);
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
    if (serverSide || !search || searchKeys.length === 0) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val != null && String(val).toLowerCase().includes(lower);
      })
    );
  }, [data, search, searchKeys, serverSide]);

  const sortedData = useMemo(() => {
    if (serverSide || !sortKey) return filteredData;
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
  }, [filteredData, sortKey, sortDir, serverSide]);

  const totalItems = serverSide ? (totalCount ?? data.length) : sortedData.length;
  const actualPageSize = pageSize === "All" ? Math.max(totalItems, 1) : Number(pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / actualPageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pagedData = serverSide ? data : sortedData.slice(safePage * actualPageSize, (safePage + 1) * actualPageSize);

  if (loading && pagedData.length === 0) {
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

      {pagedData.length === 0 && !loading ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="rounded-[24px] border border-border/40 overflow-hidden bg-card/40 backdrop-blur-md relative shadow-sm">
            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-border/40">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "text-[11px] font-black text-muted-foreground uppercase tracking-[0.15em] py-4",
                        col.className
                      )}
                    >
                      {col.sortable && !serverSide ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold"
                        >
                          {col.label}
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="size-3 text-primary" />
                            ) : (
                              <ArrowDown className="size-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
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
                {pagedData.map((row, idx) => (
                  <TableRow
                    key={row.id ?? idx}
                    className="border-border/40 hover:bg-secondary/40 transition-colors group"
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn("py-4 text-sm font-medium", col.className)}>
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
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
                  const val = e.target.value === "All" ? "All" : Number(e.target.value);
                  handlePageSizeChange(val);
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
                {totalItems === 0 ? "0 of 0" : `${safePage * actualPageSize + 1}–${Math.min((safePage + 1) * actualPageSize, totalItems)} of ${totalItems}`}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage === 0}
                onClick={() => handlePageChange(0)}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage === 0}
                onClick={() => handlePageChange(safePage - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage >= totalPages - 1}
                onClick={() => handlePageChange(safePage + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                disabled={safePage >= totalPages - 1}
                onClick={() => handlePageChange(totalPages - 1)}
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
