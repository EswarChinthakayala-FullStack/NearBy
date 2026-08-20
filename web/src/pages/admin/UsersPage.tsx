import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TableRowSkeleton } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useAdminUsers, useToggleUserStatus, useUpdateUserRole } from '@/hooks/useAdmin'
import type { User } from '@/types/user'

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const pageSize = 15

  const { data: usersResponse, isLoading, isError, refetch } = useAdminUsers(page, pageSize, searchTerm, roleFilter)
  const toggleStatusMutation = useToggleUserStatus()
  const updateRoleMutation = useUpdateUserRole()

  const users: User[] = usersResponse?.data || []
  const pagination = usersResponse?.pagination

  const handleToggleStatus = (user: User) => {
    if (!user.id) return
    const newStatus = !user.is_active
    toggleStatusMutation.mutate({ userId: Number(user.id), isActive: newStatus })
  }

  const handleToggleRole = (user: User) => {
    if (!user.id) return
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    updateRoleMutation.mutate({ userId: Number(user.id), role: newRole })
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return name.slice(0, 2).toUpperCase()
    }
    return (email || 'U').slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Account Directory"
        description="Manage registered user authentication accounts, role permissions, and access status."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono px-3 py-1 bg-card/60">
              Total Accounts: <span className="font-bold text-foreground ml-1">{pagination?.total_items || users.length}</span>
            </Badge>
          </div>
        }
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md space-y-1">
          <p className="text-[11px] font-mono uppercase text-muted-foreground">Total Accounts</p>
          <h4 className="text-2xl font-extrabold text-foreground font-heading">{pagination?.total_items || users.length}</h4>
        </div>
        <div className="p-4 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md space-y-1">
          <p className="text-[11px] font-mono uppercase text-muted-foreground">Active Users</p>
          <h4 className="text-2xl font-extrabold text-emerald-500 font-heading">
            {users.filter((u) => u.is_active).length}
          </h4>
        </div>
        <div className="p-4 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md space-y-1">
          <p className="text-[11px] font-mono uppercase text-muted-foreground">System Administrators</p>
          <h4 className="text-2xl font-extrabold text-purple-400 font-heading">
            {users.filter((u) => u.role === 'admin').length}
          </h4>
        </div>
      </div>

      {/* Toolbar: Search & Role Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search by full name or email address..."
            className="pl-8 h-9 text-xs rounded-sm border-border/60 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-sm border border-border/50 shrink-0">
          <Button
            variant={roleFilter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setRoleFilter('all'); setPage(1); }}
            className={`h-7 px-3 text-xs font-semibold rounded-xs ${roleFilter === 'all' ? 'bg-primary text-primary-foreground' : ''}`}
          >
            All Roles
          </Button>
          <Button
            variant={roleFilter === 'admin' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setRoleFilter('admin'); setPage(1); }}
            className={`h-7 px-3 text-xs font-semibold rounded-xs ${roleFilter === 'admin' ? 'bg-purple-600 text-white' : ''}`}
          >
            Admins
          </Button>
          <Button
            variant={roleFilter === 'user' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setRoleFilter('user'); setPage(1); }}
            className={`h-7 px-3 text-xs font-semibold rounded-xs ${roleFilter === 'user' ? 'bg-emerald-600 text-white' : ''}`}
          >
            Users
          </Button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-sm border border-border/70 bg-card/60 backdrop-blur-md overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            iconName="error"
            title="Failed to Load Users"
            description="Unable to retrieve registered user accounts."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : users.length === 0 ? (
          <EmptyState
            iconName="profile"
            title="No Users Found"
            description={searchTerm ? `No users match "${searchTerm}".` : 'No registered users in directory.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 pl-4">User Account</th>
                  <th className="p-3.5">Role Scope</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Registered Date</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user) => (
                  <tr key={user.id || user.uuid} className="hover:bg-muted/30 transition-colors group">
                    {/* Avatar & Info */}
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-sm border border-border/70">
                          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.email} />
                          <AvatarFallback className="rounded-sm bg-primary/10 text-primary font-bold text-xs">
                            {getInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <h6 className="text-xs font-bold text-foreground truncate">
                            {user.full_name || 'Anonymous User'}
                          </h6>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5 font-mono">
                      {user.role === 'admin' ? (
                        <Badge variant="outline" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-purple-500/10 text-purple-400 border-purple-500/30">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                          User
                        </Badge>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {user.is_active ? (
                        <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 bg-destructive/10 text-destructive border-destructive/30">
                          Inactive
                        </Badge>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRole(user)}
                          disabled={updateRoleMutation.isPending}
                          className="h-7 text-[11px] font-semibold rounded-xs px-2"
                        >
                          {user.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                        </Button>
                        <Button
                          variant={user.is_active ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          disabled={toggleStatusMutation.isPending}
                          className="h-7 text-[11px] font-semibold rounded-xs px-2"
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/60 bg-muted/30 text-xs">
            <span className="text-muted-foreground font-medium">
              Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
              <span className="font-semibold text-foreground">{pagination.total_pages}</span>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-sm h-8 text-xs font-semibold"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-sm h-8 text-xs font-semibold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage
