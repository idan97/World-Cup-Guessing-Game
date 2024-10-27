'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, UserPlus, Edit3 } from 'lucide-react'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string
  role: string
  number: number
}

const API_URL = 'http://127.0.0.1:8000/auth/users'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editedNumber, setEditedNumber] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      console.log('Response data:', response.data)
      // Explicitly map the data to ensure correct keys
      const usersData = response.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        number: user.number,
      }))
      setUsers(usersData)
      console.log('Users state after setting:', usersData)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`${API_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setUsers(users.filter(user => user.id !== userId))
      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePromoteUser = async (userId: string) => {
    try {
      await axios.put(`${API_URL}/${userId}/promote`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'manager' } : user
      ))
      toast({
        title: "Success",
        description: "User promoted to manager successfully.",
      })
    } catch (error) {
      console.error('Error promoting user:', error)
      toast({
        title: "Error",
        description: "Failed to promote user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditNumber = (user: User) => {
    setEditingUser(user)
    setEditedNumber(user.number)
  }

  const handleSaveNumber = async () => {
    if (editingUser && editedNumber !== null) {
      try {
        await axios.put(`${API_URL}/${editingUser.id}/update-number`, {
          number: editedNumber,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, number: editedNumber } : user
        ))
        setEditingUser(null)
        setEditedNumber(null)
        toast({
          title: "Success",
          description: "Colbo number updated successfully.",
        })
      } catch (error) {
        console.error('Error updating number:', error)
        toast({
          title: "Error",
          description: "Failed to update number. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Colbo Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.number}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {user.role !== 'manager' && (
                      <Button
                        onClick={() => handlePromoteUser(user.id)}
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEditNumber(user)}
                      size="sm"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit Number
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            account and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <AlertDialog open={true} onOpenChange={() => setEditingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Colbo Number</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              <input
                type="number"
                value={editedNumber ?? ''}
                onChange={(e) => setEditedNumber(Number(e.target.value))}
                className="input input-bordered w-full max-w-xs"
                placeholder="Enter Colbo Number"
              />
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEditingUser(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveNumber}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
