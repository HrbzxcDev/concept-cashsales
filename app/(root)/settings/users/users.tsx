'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const isViewOnlyRole = (role?: string | null) => (role?.trim().toLowerCase() ?? '') === 'user';
const canManageUsersRole = (role?: string | null) => (role?.trim().toLowerCase() ?? '') === 'administrator';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Administrator'
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const viewOnlyUser = isViewOnlyRole(user?.role ?? null);
  const canManageUsers = canManageUsersRole(user?.role ?? null);
  const isEditing = Boolean(editingUserId);

  const fetchUsers = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setUsersLoading(true);
      }
      const response = await fetch('/api/auth/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const weight = (role: string) =>
        role.trim().toLowerCase() === 'administrator' ? 0 : 1;

      const weightDiff = weight(a.role) - weight(b.role);
      if (weightDiff !== 0) {
        return weightDiff;
      }

      return a.username.localeCompare(b.username);
    });
  }, [users]);

  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'Administrator'
    });
    setEditingUserId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManageUsers) {
      toast.error('Your role only allows viewing the site. Please contact an administrator for additional permissions.');
      return;
    }

    setCreating(true);

    try {
      const basePayload = {
        username: formData.username,
        email: formData.email,
        role: formData.role
      };

      const payload = isEditing
        ? {
            ...basePayload,
            ...(formData.password ? { password: formData.password } : {})
          }
        : {
            ...basePayload,
            password: formData.password
          };

      const url =
        isEditing && editingUserId
          ? `/api/auth/users/${editingUserId}`
          : '/api/auth/users';

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditing ? 'User Updated Successfully' : 'User Created Successfully');
        resetForm();
        fetchUsers();
      } else {
        toast.error(
          data.error || (isEditing ? 'Failed to Update User' : 'Failed to Create User')
        );
      }
    } catch (error) {
      toast.error(isEditing ? 'Error Updating User' : 'Error Creating User');
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (member: User) => {
    if (!canManageUsers) {
      toast.error('You do not have permission to manage users.');
      return;
    }

    setEditingUserId(member.id);
    setFormData({
      username: member.username,
      email: member.email,
      password: '',
      role: member.role
    });
  };

  const handlePromptDeleteUser = (userId: string) => {
    if (!canManageUsers) {
      toast.error('You do not have permission to manage users.');
      return;
    }

    const targetUser = users.find((member) => member.id === userId);
    if (!targetUser) {
      toast.error('Unable to find User Details.');
      return;
    }

    setDeleteDialogUser(targetUser);
  };

  const handleDeleteUser = async () => {
    if (!deleteDialogUser) {
      return;
    }

    const userId = deleteDialogUser.id;
    setDeletingUserId(userId);

    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        toast.success('User Deleted Successfully');
        if (editingUserId === userId) {
          resetForm();
        }
        setDeleteDialogUser(null);
        fetchUsers(true);
      } else {
        toast.error(data.error || 'Failed to Delete User');
      }
    } catch (error) {
      toast.error('Error Deleting User');
    } finally {
      setDeletingUserId(null);
    }
  };

  const closeDeleteDialog = () => {
    if (deletingUserId) {
      return;
    }
    setDeleteDialogUser(null);
  };

  if (authLoading || usersLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
      <Card className="border-muted-foreground/20">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Invite teammates and manage their permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {viewOnlyUser && (
            <div className="mb-6 rounded-md border border-dashed border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-muted-foreground">
              Your role is limited to viewing the site. You can browse existing users but need an administrator to grant additional permissions.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={!canManageUsers} className="space-y-6">
              {isEditing && (
                <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm text-primary">
                  Updating user. Make your changes and click Update user or cancel to return to creating accounts.
                </div>
              )}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">{isEditing ? 'Password (optional)' : 'Password'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      isEditing
                        ? 'Leave blank to keep Current Password'
                        : 'Generate a Secure Password'
                    }
                    required={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    disabled={!canManageUsers}
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                )}
                {isEditing && editingUserId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handlePromptDeleteUser(editingUserId)}
                    disabled={deletingUserId === editingUserId}
                  >
                    {deletingUserId === editingUserId ? 'Deleting...' : 'Delete user'}
                  </Button>
                )}
                <Button type="submit" disabled={creating || !canManageUsers}>
                  {creating
                    ? isEditing
                      ? 'Updating user...'
                      : 'Creating user...'
                    : isEditing
                      ? 'Update user'
                      : 'Create account'}
                </Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>

      <Card className="border-muted-foreground/20">
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>Current users with access to CashSales.</CardDescription>
        </CardHeader>
        <CardContent>
          {canManageUsers && (
            <p className="mb-3 text-xs text-muted-foreground">
              Double-click a team member to manage their account above.
            </p>
          )}
          <div className="max-h-80 space-y-3 overflow-y-auto pr-3">
            {sortedUsers.map((member) => (
              <div
                key={member.id}
                onDoubleClick={() => handleEditUser(member)}
                className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-2 transition hover:border-primary"
              >
                <div>
                  <div className="text-sm font-medium">{member.username}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {member.role}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No users found. Invite your first teammate to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
      <Dialog open={Boolean(deleteDialogUser)} onOpenChange={(open) => (open ? null : closeDeleteDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove{' '}
              <span className="font-semibold">
                {deleteDialogUser?.username}
              </span>{' '}
              ({deleteDialogUser?.email}) from CashSales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={Boolean(deletingUserId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={Boolean(deletingUserId)}
            >
              {deletingUserId ? 'Deleting...' : 'Delete user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}