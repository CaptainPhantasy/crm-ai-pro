'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserPlus, Shield, User, Wrench, MessageSquare } from 'lucide-react'
import { UserDialog } from '@/components/admin/user-dialog'
import { User as UserType } from '@/types'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user && (data.user.role === 'admin' || data.user.role === 'owner')) {
          setIsAdmin(true)
          fetchUsers()
        } else {
          router.push('/inbox')
        }
      } else {
        router.push('/inbox')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/inbox')
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  function handleAddUser() {
    setEditingUser(null)
    setUserDialogOpen(true)
  }

  function handleEditUser(user: UserType) {
    setEditingUser(user)
    setUserDialogOpen(true)
  }

  function getRoleIcon(role: string | null) {
    switch (role) {
      case 'owner':
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'tech':
        return <Wrench className="w-4 h-4" />
      case 'dispatcher':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  function getRoleColor(role: string | null) {
    switch (role) {
      case 'owner':
        return { bg: '#6938EF', text: '#FFFFFF' }
      case 'admin':
        return { bg: '#4B79FF', text: '#FFFFFF' }
      case 'tech':
        return { bg: '#56D470', text: '#FFFFFF' }
      case 'dispatcher':
        return { bg: '#FFA24D', text: '#FFFFFF' }
      default:
        return { bg: '#F2F4F7', text: '#667085' }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-neutral-500">Checking access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">User Management</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage users and their roles</p>
        </div>
        <Button 
          onClick={handleAddUser}
          className="bg-[#4B79FF] hover:bg-[#3366FF] text-white shadow-md"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All users in your account</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No users found</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const roleColors = getRoleColor(user.role)
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10" style={{ backgroundColor: '#EBF0FF' }}>
                        <AvatarFallback className="text-[#4B79FF] font-semibold">
                          {user.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{user.full_name || 'Unnamed User'}</span>
                          <Badge
                            style={{
                              backgroundColor: roleColors.bg,
                              color: roleColors.text,
                              borderColor: 'rgba(0,0,0,0.1)',
                              borderWidth: '1px',
                            }}
                            className="flex items-center gap-1"
                          >
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role || 'No role'}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="border-[#4B79FF] text-[#4B79FF] hover:bg-[#EBF0FF]"
                    >
                      Edit
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={editingUser}
        onSuccess={fetchUsers}
      />
    </div>
  )
}

