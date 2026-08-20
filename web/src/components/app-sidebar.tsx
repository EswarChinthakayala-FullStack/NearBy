import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Icon } from "@/components/common/Icon"
import { AppLogo } from "@/components/common/AppLogo"
import { useAuthStore } from "@/store/authStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const location = useLocation()

  const currentUser = {
    name: user?.full_name || user?.name || "Traveler",
    email: user?.email || "user@nearby.ai",
    avatar: user?.avatar_url || user?.avatarUrl || "",
  }

  const isAdmin = user?.role === 'admin'
  const isAdminRoute = location.pathname.startsWith('/admin')

  const userNavMain = [
    {
      title: "User Dashboard",
      url: "/user/dashboard",
      icon: <Icon name="home" size="sm" className="text-emerald-500" />,
      items: [
        { title: "Overview", url: "/user/dashboard" },
        { title: "Notifications", url: "/user/notifications" },
      ],
    },
    {
      title: "Explore Destinations",
      url: "/user/browse",
      icon: <Icon name="navigation" size="sm" className="text-teal-400" />,
      isActive: true,
      items: [
        { title: "Browse Places", url: "/user/browse" },
        { title: "Categories", url: "/user/categories" },
        { title: "Nearby Radar", url: "/user/nearby" },
        { title: "AI Search", url: "/user/ai-search" },
        { title: "AI Itinerary", url: "/user/ai-itinerary" },
      ],
    },
    {
      title: "My Account",
      url: "/user/profile",
      icon: <Icon name="profile" size="sm" className="text-blue-400" />,
      items: [
        { title: "Profile Settings", url: "/user/profile" },
        { title: "Notifications & Alerts", url: "/user/notifications" },
        { title: "Saved Bookmarks", url: "/user/favorites" },
        { title: "My Reviews", url: "/user/reviews" },
        { title: "My Trips", url: "/user/trips" },
        { title: "Security", url: "/user/security" },
        { title: "Settings", url: "/user/settings" },
        { title: "Help Center", url: "/user/help-center" },
      ],
    },
  ]

  const adminNavMain = [
    {
      title: "Admin Overview",
      url: "/admin",
      icon: <Icon name="admin" size="sm" className="text-amber-400" />,
      isActive: true,
      items: [
        { title: "Dashboard", url: "/admin" },
        { title: "Activity Logs", url: "/admin/logs" },
        { title: "Sync Jobs", url: "/admin/sync" },
      ],
    },
    {
      title: "Content Management",
      url: "/admin/places",
      icon: <Icon name="places" size="sm" className="text-emerald-400" />,
      items: [
        { title: "Places Index", url: "/admin/places" },
        { title: "Create Place", url: "/admin/places/new" },
        { title: "Categories", url: "/admin/categories" },
      ],
    },
    {
      title: "Moderation & Users",
      url: "/admin/reviews",
      icon: <Icon name="ratings" size="sm" className="text-purple-400" />,
      items: [
        { title: "Review Queue", url: "/admin/reviews" },
        { title: "User Accounts", url: "/admin/users" },
      ],
    },
  ]

  const navMain = isAdminRoute ? adminNavMain : userNavMain

  const navSecondary = [
    ...(isAdmin && !isAdminRoute
      ? [
          {
            title: "Admin Console",
            url: "/admin",
            icon: <Icon name="admin" size="sm" className="text-amber-400" />,
          },
        ]
      : []),
    ...(isAdminRoute
      ? [
          {
            title: "User Portal",
            url: "/user/dashboard",
            icon: <Icon name="profile" size="sm" className="text-emerald-400" />,
          },
        ]
      : []),
    {
      title: "Public Landing",
      url: "/",
      icon: <Icon name="home" size="sm" />,
    },
    {
      title: "API Docs",
      url: "/docs/api",
      icon: <Icon name="route" size="sm" />,
    },
  ]

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-border" {...props}>
      {/* Header Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to={isAdminRoute ? "/admin" : "/user/dashboard"} />}>
              <AppLogo size={32} showText={false} animated={false} />
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-bold font-heading">
                  {isAdminRoute ? "Nearby Admin" : "Nearby Portal"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {isAdminRoute ? "Control Center" : "AI Travel Companion"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Nav Content */}
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Footer User Menu */}
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
