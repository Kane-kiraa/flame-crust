import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AdminSidebar({ resources, onNavigate }) {
  const location = useLocation();
  const currentPath = location.pathname.replace("/admin/", "").replace("/admin", "");

  const handleNav = (path) => {
    onNavigate?.();
  };

  return (
    <aside className="w-56 sm:w-64 border-r border-border/60 bg-card flex-shrink-0 flex flex-col h-full">
      <div className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="size-5 text-primary" />
          <h2 className="font-serif text-lg font-bold text-foreground">Admin</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="rounded-full text-muted-foreground hover:text-foreground text-xs w-full justify-start"
        >
          <Link to="/">
            <ArrowLeft className="size-3.5 mr-1" />
            Back to site
          </Link>
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {resources.map(({ key, label, icon }) => {
          const isActive = currentPath === key || currentPath.startsWith(key + "/");
          return (
            <Link
              key={key}
              to={`/admin/${key}`}
              onClick={() => handleNav(`/admin/${key}`)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
