"use client"

import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UnfoldMoreIcon,
  UserIcon,
  Settings02Icon,
  Notification01Icon,
  Shield01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"
import { useAuthStore } from '@/store/authStore'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user.name
    ? user.name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="h-8 w-8 rounded-sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-sm bg-emerald-500/20 text-emerald-400 font-bold text-xs font-mono">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <HugeiconsIcon icon={UnfoldMoreIcon} className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-sm p-1 shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm border-b border-border">
                  <Avatar className="h-8 w-8 rounded-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-sm bg-emerald-500/20 text-emerald-400 font-bold text-xs font-mono">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-bold text-foreground">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuGroup className="mt-1">
              <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                <HugeiconsIcon icon={UserIcon} className="size-3.5 mr-2 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/user/notifications')}>
                <HugeiconsIcon icon={Notification01Icon} className="size-3.5 mr-2 text-muted-foreground" />
                <span>Notifications</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/user/settings')}>
                <HugeiconsIcon icon={Settings02Icon} className="size-3.5 mr-2 text-muted-foreground" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/user/security')}>
                <HugeiconsIcon icon={Shield01Icon} className="size-3.5 mr-2 text-muted-foreground" />
                <span>Security</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-rose-400 focus:text-rose-400">
              <HugeiconsIcon icon={Logout01Icon} className="size-3.5 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavUser
