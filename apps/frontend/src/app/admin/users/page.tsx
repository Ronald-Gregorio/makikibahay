
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import { Button } from "@/components/ui/index";
import { Edit, Trash2, Home, BedDouble, Save, X, Search, MoreHorizontal, UserX, UserCheck } from "lucide-react";
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
} from "@/components/ui/index";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/index";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/index";
import { Label } from "@/components/ui/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/index";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/index";


import { dashboardService } from "@/services/api/dashboard";

type User = { id: string; name: string; email: string; role: string; status: string; listingsCount: number; rentedCount: number; joined: string; };

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        dashboardService.getAdminUsers()
            .then((data) => {
                setUsers(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = users;

        // Filter by search query (name or email)
        if (searchQuery) {
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by role
        if (roleFilter !== 'all') {
            result = result.filter(user => user.role === roleFilter);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(result);

    }, [searchQuery, roleFilter, statusFilter, users]);


    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(filteredUsers.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleSelectRow = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUserIds(prev => [...prev, userId]);
        } else {
            setSelectedUserIds(prev => prev.filter(id => id !== userId));
        }
    };

    const handleBulkSuspend = () => {
        setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Suspended' } : u));
        setSelectedUserIds([]);
        toast({ title: "Bulk Action", description: `${selectedUserIds.length} users have been suspended.` });
    }

    const handleBulkActivate = () => {
        setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Active' } : u));
        setSelectedUserIds([]);
        toast({ title: "Bulk Action", description: `${selectedUserIds.length} users have been activated.` });
    }

    const handleBulkDelete = () => {
        setUsers(prev => prev.filter(u => !selectedUserIds.includes(u.id)));
        setSelectedUserIds([]);
        toast({ variant: 'destructive', title: "Bulk Action", description: `${selectedUserIds.length} users have been deleted.` });
    }

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">User Management</h1>
                <p className="text-muted-foreground mt-2">
                    A list of all users on the platform.
                </p>
            </header>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filters & Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by role..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                    {selectedUserIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Actions ({selectedUserIds.length})
                                    <MoreHorizontal className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleBulkActivate}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate Selected
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBulkSuspend}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Suspend Selected
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={handleBulkDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        {loading ? 'Loading...' : `${filteredUsers.length} of ${users.length} users shown.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Listings/Rented</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onUpdateUser={handleUpdateUser}
                                    isSelected={selectedUserIds.includes(user.id)}
                                    onSelectRow={handleSelectRow}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

function UserRow({ user, onUpdateUser, isSelected, onSelectRow }: { user: User, onUpdateUser: (user: User) => void, isSelected: boolean, onSelectRow: (userId: string, checked: boolean) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdateUser(editedUser);
        setIsEditing(false);
        toast({ title: "User Updated", description: `${editedUser.name}'s information has been saved.` });
    };

    const handleCancel = () => {
        setEditedUser(user); // Revert changes
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: 'role' | 'status') => (value: string) => {
        setEditedUser({ ...editedUser, [name]: value });
    };

    const isOwner = user.role === 'owner';

    return (
        <Dialog onOpenChange={(open) => !open && setIsEditing(false)}>
            <TableRow data-state={isSelected ? "selected" : undefined}>
                <TableCell>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectRow(user.id, !!checked)}
                        aria-label={`Select user ${user.name}`}
                    />
                </TableCell>
                <TableCell>
                    <DialogTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <Avatar>
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name[0]}`} alt={user.name} data-ai-hint="person" />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold hover:underline">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    </DialogTrigger>
                </TableCell>
                <TableCell>
                    <Badge variant={isOwner ? 'secondary' : 'outline'} className="capitalize">{user.role}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500' : ''}>{user.status}</Badge>
                </TableCell>
                <TableCell>
                    {isOwner ? (
                        <span className="flex items-center gap-1"><Home className="h-4 w-4" /> {user.listingsCount}</span>
                    ) : (
                        <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {user.rentedCount}</span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will suspend the user account. They will not be able to log in.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Suspend</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
            </TableRow>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl">{user.name}</DialogTitle>
                            <DialogDescription>{user.email}</DialogDescription>
                        </div>
                        {!isEditing ? (
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Edit className="h-5 w-5" /></Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button size="icon" onClick={handleSave}><Save className="h-5 w-5" /></Button>
                                <Button variant="outline" size="icon" onClick={handleCancel}><X className="h-5 w-5" /></Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>
                {isEditing ? (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={editedUser.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" value={editedUser.role} onValueChange={handleSelectChange('role')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" value={editedUser.status} onValueChange={handleSelectChange('status')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-right text-muted-foreground">Role</span>
                            <div className="col-span-2">
                                <Badge variant={isOwner ? 'secondary' : 'outline'} className="capitalize">{user.role}</Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-right text-muted-foreground">Status</span>
                            <div className="col-span-2">
                                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500' : ''}>{user.status}</Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-right text-muted-foreground">Joined</span>
                            <span className="col-span-2">{new Date(user.joined).toLocaleDateString()}</span>
                        </div>
                        {isOwner ? (
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="text-right text-muted-foreground">Listings</span>
                                <span className="col-span-2 font-semibold">{user.listingsCount}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 items-center gap-4">
                                <span className="text-right text-muted-foreground">Rented</span>
                                <span className="col-span-2 font-semibold">{user.rentedCount}</span>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}






