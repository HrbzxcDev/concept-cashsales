'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const { user, isLoading: authLoading } = useAuth();
  const viewOnlyUser = isViewOnlyRole(user?.role ?? null);
  const canManageUsers = canManageUsersRole(user?.role ?? null);

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

  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canManageUsers) {
      toast.error('Your role only allows viewing the site. Please contact an administrator for additional permissions.');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User created successfully');
        setFormData({ username: '', email: '', password: '', role: '' });
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Error creating user');
    } finally {
      setCreating(false);
    }
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
          <form onSubmit={createUser} className="space-y-6">
            <fieldset disabled={!canManageUsers} className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="alex.jordan"
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
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Generate a secure password"
                    required
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
              <div className="flex items-center justify-end">
                <Button type="submit" disabled={creating || !canManageUsers}>
                  {creating ? 'Creating user...' : 'Create account'}
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
          <div className="space-y-3 overflow-y-auto pr-1">
            {users.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between rounded-lg border px-4 py-2"
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
  );
}