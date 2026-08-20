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

interface UserNavItem {
  title: string
  href: string
  icon: IconName
}

interface UserNavGroup {
  label: string
  items: UserNavItem[]
}

const userNavGroups: UserNavGroup[] = [
  {
    label: "Explore",
    items: [
      { title: "Browse Places", href: "/app/places", icon: "places" },
      { title: "Categories", href: "/app/categories", icon: "categories" },
      { title: "Nearby Radar", href: "/app/map-radar", icon: "map" },
      { title: "AI Itinerary", href: "/app/ai-itinerary", icon: "sparkles" },
    ],
  },
  {
    label: "My Account",
    items: [
      { title: "Profile Settings", href: "/app/profile", icon: "profile" },
      { title: "Saved Bookmarks", href: "/app/favorites", icon: "favorite" },
    ],
  },
]

const userSecondaryItems = [
  { title: "Travel Guides", href: "/resources/travel-guides", icon: "route" as IconName },
  { title: "Community", href: "/community", icon: "user" as IconName },
  { title: "Help & Support", href: "/system-status", icon: "notifications" as IconName },
]

export function UserAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const location = useLocation()

  const currentUser = {
    name: user?.full_name || user?.name || "Traveler",
    email: user?.email || "user@nearby.ai",
    avatar: user?.avatar_url || user?.avatarUrl || "",
  }

  const isAdmin = user?.role === 'admin'

  return (
    <Sidebar variant="sidebar" className="border-r border-border" {...props}>
      {/* Sidebar Header — User Portal Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-emerald-600 text-white">
                <Icon name="navigation" size="sm" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold font-heading">Nearby</span>
                <span className="truncate text-xs text-muted-foreground">AI Travel Companion</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content — Navigation Groups */}
      <SidebarContent>
        {userNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.replace('/app', '') === item.href.replace('/app', '')
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

        {/* Admin Quick Link (for admin users only) */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Admin Console"
                    isActive={location.pathname.startsWith('/admin')}
                    render={<Link to="/admin" />}
                  >
                    <Icon name="admin" size="sm" className="text-amber-400" />
                    <span>Admin Console</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Secondary Links */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {userSecondaryItems.map((item) => (
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

export default UserAppSidebar
