import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { UserSidebar } from './UserSidebar'

interface UserMobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const UserMobileSidebar: React.FC<UserMobileSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="p-0 w-64 border-r border-border bg-card">
        <SheetHeader className="sr-only">
          <SheetTitle>User Navigation Menu</SheetTitle>
        </SheetHeader>
        <UserSidebar onCloseMobile={onClose} />
      </SheetContent>
    </Sheet>
  )
}

export default UserMobileSidebar
