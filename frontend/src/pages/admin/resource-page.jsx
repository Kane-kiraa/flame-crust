import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { resourceConfig } from "./resource-config.jsx";
import { list, get, create, update, remove } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";

function AdminResourcePage({ resource }) {
  const config = resourceConfig[resource];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dynamicOptions, setDynamicOptions] = useState({});

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await list(resource);
      if (Array.isArray(result)) {
        setData(result.map((item, index) => ({ ...item, _index: result.length - index })));
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    async function loadDynamicOptions() {
      const selectFields = config.fields.filter(f => f.type === "select" && f.optionsResource);
      for (const field of selectFields) {
        try {
          const res = await list(field.optionsResource);
          if (Array.isArray(res)) {
            setDynamicOptions(prev => ({
              ...prev,
              [field.name]: res.map(item => ({
                value: item[field.optionsMap?.value || "id"],
                label: item[field.optionsMap?.label || "name"]
              }))
            }));
          }
        } catch (e) {
          console.error(`Failed to load options for ${field.name}`, e);
        }
      }
    }
    loadDynamicOptions();
  }, [config]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({});
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const item = await get(resource, id);
      setEditingId(id);
      setFormData(item || {});
      setFormErrors({});
      setFormOpen(true);
    } catch (err) {
      toast.error(err.message || "Failed to load item");
    }
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    // Validate
    const errs = {};
    config.fields.forEach((f) => {
      if (f.required && f.type !== "checkbox") {
        const val = formData[f.name];
        if (val == null || String(val).trim() === "") {
          errs[f.name] = `${f.label} is required`;
        }
      }
    });
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      // Clean up form data - convert types
      const cleanData = {};
      config.fields.forEach((f) => {
        if (f.type === "boolean" || f.type === "checkbox") {
          cleanData[f.name] = Boolean(formData[f.name]);
        } else if (f.type === "number") {
          cleanData[f.name] = formData[f.name] !== "" && formData[f.name] != null
            ? Number(formData[f.name])
            : null;
        } else if (f.type === "date" || f.type === "datetime-local") {
          cleanData[f.name] = formData[f.name] === "" ? null : formData[f.name];
        } else {
          cleanData[f.name] = formData[f.name] ?? "";
        }
      });

      if (editingId) {
        await update(resource, editingId, cleanData);
        toast.success(`${config.label.slice(0, -1)} updated successfully`);
      } else {
        await create(resource, cleanData);
        toast.success(`${config.label.slice(0, -1)} created successfully`);
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(resource, deleteId);
      toast.success(`${config.label.slice(0, -1)} deleted`);
      setDeleteOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  if (!config) {
    return <ErrorState title="Unknown resource" description={`No configuration found for "${resource}"`} />;
  }

  const columnsWithActions = [
    ...config.columns.map(col => ({
      ...col,
      render: col.render ? (v, row) => col.render(v, row, async (updates) => {
        try {
          // Remove UI-only fields and merge updates
          const { _index, ...restRow } = row;
          const updatedRow = { ...restRow, ...updates };
          await update(resource, row.id, updatedRow);
          toast.success("Updated successfully");
          fetchData();
        } catch(err) {
          toast.error("Failed to update: " + err.message);
        }
      }) : undefined
    })),
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => openEdit(row.id)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={() => openDelete(row.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {config.label}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {data.length} {data.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage, search, and update {config.label.toLowerCase()} for Flame & Crust.
          </p>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-6 shadow-warm">
        {error ? (
          <ErrorState
            title="Failed to load data"
            description={error}
            onRetry={fetchData}
          />
        ) : (
          <DataTable
            columns={columnsWithActions}
            data={data}
            loading={loading}
            searchKeys={config.searchKeys}
            searchPlaceholder={`Search ${config.label.toLowerCase()}...`}
            emptyTitle={`No ${config.label.toLowerCase()} found`}
            emptyDescription={`Create your first ${config.label.slice(0, -1).toLowerCase()} to get started.`}
            actions={
              !config.disableCreate && (
                <Button
                  onClick={openCreate}
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 px-5 shadow-warm"
                >
                  <Plus className="size-4 mr-1.5" />
                  Add {config.label.slice(0, -1)}
                </Button>
              )
            }
          />
        )}
      </div>

      {/* Create/Edit Form Sheet */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-background shadow-warm-lg flex flex-col"
            >
              <div className="flex items-center justify-between px-5 sm:px-6 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-5 border-b border-border/60">
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {editingId ? "Edit" : "New"} {config.label.slice(0, -1)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {editingId ? `ID: ${editingId}` : "Fill in the details below"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
                {config.fields.map((field) => (
                  <div key={field.name}>
                    {field.type === "textarea" ? (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Textarea
                          id={field.name}
                          value={formData[field.name] ?? ""}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          placeholder={field.label}
                          className={cn(
                            "rounded-xl border-border/60 min-h-24",
                            formErrors[field.name] && "border-destructive"
                          )}
                        />
                        {formErrors[field.name] && (
                          <p className="text-xs text-destructive">{formErrors[field.name]}</p>
                        )}
                      </div>
                    ) : field.type === "select" ? (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <select
                          id={field.name}
                          value={formData[field.name] ?? ""}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          className={cn(
                            "w-full h-10 rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30",
                            formErrors[field.name] && "border-destructive"
                          )}
                        >
                          <option value="">Select...</option>
                          {(dynamicOptions[field.name] || field.options || []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {formErrors[field.name] && (
                          <p className="text-xs text-destructive">{formErrors[field.name]}</p>
                        )}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center gap-2 py-2">
                        <Checkbox
                          id={field.name}
                          checked={!!formData[field.name]}
                          onCheckedChange={(checked) => updateField(field.name, checked)}
                        />
                        <Label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    ) : field.type === "image" ? (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <div className="h-48 border border-border/60 rounded-xl overflow-hidden">
                          <ImageUpload 
                            onUploadSuccess={(url) => updateField(field.name, url)} 
                          />
                        </div>
                        {formData[field.name] && (
                           <p className="text-xs text-green-600 mt-1 truncate" title={formData[field.name]}>URL: {formData[field.name]}</p>
                        )}
                        {formErrors[field.name] && (
                          <p className="text-xs text-destructive">{formErrors[field.name]}</p>
                        )}
                      </div>
                    ) : (

                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                          id={field.name}
                          type={field.type}
                          step={field.step}
                          value={formData[field.name] ?? ""}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          placeholder={field.label}
                          className={cn(
                            "rounded-xl border-border/60",
                            formErrors[field.name] && "border-destructive"
                          )}
                        />
                        {formErrors[field.name] && (
                          <p className="text-xs text-destructive">{formErrors[field.name]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border/60 px-5 sm:px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  className="rounded-full flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </span>
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${config.label.slice(0, -1)}?`}
        description={`This will permanently delete this ${config.label.slice(0, -1).toLowerCase()}. This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default AdminResourcePage;
