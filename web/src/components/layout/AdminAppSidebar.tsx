import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { Icon, type IconName } from "@/components/common/Icon"
import { useAuthStore } from "@/store/authStore"
import { Badge } from "@/components/ui/badge"

interface AdminNavItem {
  title: string
  href: string
  icon: IconName
  badge?: string
}

interface AdminNavGroup {
  label: string
  items: AdminNavItem[]
}

const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: "admin" },
    ],
  },
  {
    label: "Content Management",
    items: [
      { title: "Places Index", href: "/admin/places", icon: "places" },
      { title: "Categories", href: "/admin/categories", icon: "categories" },
    ],
  },
  {
    label: "Moderation",
    items: [
      { title: "Review Queue", href: "/admin/reviews", icon: "ratings" },
      { title: "User Accounts", href: "/admin/users", icon: "profile" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Activity Logs", href: "/admin/logs", icon: "clock" },
      { title: "Sync Jobs", href: "/admin/sync", icon: "refresh" },
    ],
  },
]

const adminSecondaryItems = [
  { title: "Back to Site", href: "/", icon: "navigation" as IconName },
  { title: "API Docs", href: "/docs/api", icon: "route" as IconName },
]

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const location = useLocation()

  const currentUser = {
    name: user?.full_name || user?.name || "Administrator",
    email: user?.email || "admin@nearby.ai",
    avatar: user?.avatar_url || user?.avatarUrl || "",
  }

  return (
    <Sidebar variant="sidebar" className="border-r border-border" {...props}>
      {/* Sidebar Header — Admin Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-amber-600 text-white">
                <Icon name="admin" size="sm" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold font-heading">Nearby Admin</span>
                <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                  Control Center
                  <Badge variant="accent" className="text-[8px] px-1 py-0 uppercase font-mono bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Admin
                  </Badge>
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content — Navigation Groups */}
      <SidebarContent>
        {adminNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        render={<Link to={item.href} />}
                      >
                        <Icon name={item.icon} size="sm" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Secondary Links */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {adminSecondaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton size="sm" render={<Link to={item.href} />}>
                    <Icon name={item.icon} size="sm" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer — User Profile */}
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AdminAppSidebar
