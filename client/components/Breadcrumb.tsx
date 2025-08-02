import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
}

const routeNames: Record<string, string> = {
  "": "Inbox",
  integrations: "Integrations",
  "integrations/management": "Integration Management",
  settings: "Settings",
  calendar: "Calendar",
  tasks: "Tasks",
  slack: "Slack Integration",
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
  ];

  let currentPath = "";
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    const routeKey = pathSegments.slice(0, i + 1).join("/");
    const label =
      routeNames[routeKey] ||
      pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1);

    breadcrumbItems.push({
      label,
      href: currentPath,
    });
  }

  // Don't show breadcrumbs on the home page
  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground bg-background border-b px-6 py-3">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          <Link
            to={item.href}
            className={cn(
              "hover:text-foreground transition-colors flex items-center space-x-1",
              index === breadcrumbItems.length - 1 &&
                "text-foreground font-medium",
            )}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  );
}
