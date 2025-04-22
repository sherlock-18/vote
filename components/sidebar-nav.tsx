import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { 
  Users, 
  VoteIcon, 
  BarChart3, 
  LogOut,
  UserPlus,
  Info,
  User
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  userRole: "user" | "admin";
}

export function SidebarNav({ className, userRole, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  const userItems = [
    {
      title: "Information",
      href: "/dashboard",
      icon: <Info className="mr-2 h-4 w-4" />,
    },
    {
      title: "Voter Registration",
      href: "/dashboard/register",
      icon: <UserPlus className="mr-2 h-4 w-4" />,
    },
    {
      title: "Voting Area",
      href: "/dashboard/voting",
      icon: <VoteIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Results",
      href: "/dashboard/results",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
  ];

  const adminItems = [
    {
      title: "Candidate Info",
      href: "/admin/dashboard",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: "Add Candidate",
      href: "/admin/dashboard/add-candidate",
      icon: <UserPlus className="mr-2 h-4 w-4" />,
    },
    {
      title: "Voters Details",
      href: "/admin/dashboard/voters",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Results",
      href: "/admin/dashboard/results",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
  ];

  const items = userRole === "admin" ? adminItems : userItems;
  const logoutHref = userRole === "admin" ? "/admin/logout" : "/logout";

  return (
    <nav
      className={cn(
        "flex flex-col space-y-1 h-full",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 dark:bg-blue-900 dark:text-blue-50 dark:hover:bg-blue-800"
              : "hover:bg-muted hover:text-foreground",
            "justify-start"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
      <div className="flex-1"></div>
      <Link
        href={logoutHref}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
        )}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Link>
    </nav>
  );
}