import React, { useState, useEffect } from 'react';
import { TrashIcon, LockClosedIcon, LockOpenIcon, PencilIcon, PlusIcon, ChatBubbleLeftIcon, UsersIcon, UserPlusIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';
import { adminUsersService } from '../../services/admin-users';
import SearchBar from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import UserFormModal from '../../components/UserFormModal';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  role: string;
  is_blocked: boolean;
  created_at: string;
  last_login: string | null;
  level?: {
    name: string;
    rank: number;
  };
}

interface UsersData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState<number | null>(null);

  // Form modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [levels, setLevels] = useState<any[]>([]);

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data: UsersData = await adminUsersService.getAllUsers(page, 20, {
        search: debouncedSearch,
        sortField,
        sortDirection
      });

      console.log("🚀 ~ file: Users.tsx:105 ~ fetchUsers ~ data:", data);
      
      setUsers(data?.users);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error while loading users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, sortField, sortDirection]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await adminUsersService.getUsersStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-400 dark:text-gray-600">⇅</span>;
    }
    return sortDirection === 'ASC'
      ? <span className="ml-1 text-amber-600 dark:text-amber-400">▲</span>
      : <span className="ml-1 text-amber-600 dark:text-amber-400">▼</span>;
  };

  // Load levels on mount
  useEffect(() => {
    const loadLevels = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/app/level/all`);
        if (response.ok) {
          const data = await response.json();
          setLevels(data.payload?.data || []);
        }
      } catch (error) {
        console.error('Error loading levels:', error);
      }
    };
    loadLevels();
  }, []);

  const handleBlock = async (user: User) => {
    try {
      setIsProcessing(true);
      await adminUsersService.blockUser(user.id);
      toast.success('User blocked successfully');
      setUsers(users.map(u => u.id === user.id ? { ...u, is_blocked: true } : u));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error while blocking');
    } finally {
      setIsProcessing(false);
    }
  };

  // Unblock user
  const handleUnblock = async (user: User) => {
    try {
      setIsProcessing(true);
      await adminUsersService.unblockUser(user.id);
      toast.success('User unblocked successfully');
      setUsers(users.map(u => u.id === user.id ? { ...u, is_blocked: false } : u));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error while unblocking');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete user
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      await adminUsersService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error while deleting');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create user
  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  // Start chat with user
  const handleStartChat = async (user: User) => {
    try {
      setIsChatLoading(user.id);
      
      const token = localStorage.getItem('accessToken');
      const response = await axiosClient.get(
        `${import.meta.env.VITE_BASE_URL}/app/direct/${user.id}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Chat opened');
        navigate('/admin/crm', { state: { selectedRoomId: response.data.payload.id } });
      } else {
        toast.error('Error while opening the chat');
      }
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast.error(error?.response?.data?.message || 'Error while opening the chat');
    } finally {
      setIsChatLoading(null);
    }
  };

  // Submit form
  const handleFormSubmit = async (formData: any) => {
    try {
      setIsFormSubmitting(true);
      
      if (editingUser) {
        // Update user
        await adminUsersService.updateUser(editingUser.id, formData);
        toast.success('User updated successfully');
        
        // Update local state
        setUsers(users.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...formData }
            : u
        ));
      } else {
        // Create user
        const newUser = await adminUsersService.createUser(formData);
        toast.success('User created successfully');
        
        // Refresh users list
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error while saving');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-bg-primary p-4 md:p-6 overflow-auto transition-colors duration-300">
      <div className="max-w-8xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              User Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-text-tertiary">Manage and control the platform's users</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            Create user
          </button>
        </div>

        {/* Stats Cards */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Users */}
            <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.totalUsers || 0}</p>
              </div>
            </div>

            {/* New Users This Week */}
            <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserPlusIcon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">New (7 days)</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.newUsersWeek || 0}</p>
              </div>
            </div>

            {/* Active Users */}
            <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">Active Users</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.activeUsers || 0}</p>
                <p className="text-xs text-gray-500 dark:text-text-muted mt-1">{stats.activeUsersPercentage || 0}% of total</p>
              </div>
            </div>

            {/* New Users This Month */}
            <div className="relative bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/5 dark:to-transparent" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ClockIcon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-text-tertiary mb-1">New (30 days)</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{stats.newUsersMonth || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Total */}
        <div className="bg-gradient-to-br from-amber-50/30 to-white dark:from-transparent dark:to-transparent dark:bg-bg-tertiary rounded-xl shadow-sm hover:shadow-md p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-200 dark:border-gray-800 transition-all duration-300">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name, email or phone..."
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-text-tertiary">Total: <span className="font-bold text-lg text-gray-900 dark:text-text-primary">{pagination.total}</span></p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-bg-tertiary">
          <thead className="bg-gray-50 dark:bg-bg-secondary">
            <tr>
              <th
                onClick={() => handleSort('firstname')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center">
                  User
                  <SortIcon field="firstname" />
                </div>
              </th>
              <th
                onClick={() => handleSort('email')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center">
                  Email
                  <SortIcon field="email" />
                </div>
              </th>
              <th
                onClick={() => handleSort('phone')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center">
                  Phone
                  <SortIcon field="phone" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider">
                Level
              </th>
              <th
                onClick={() => handleSort('role')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center">
                  Role
                  <SortIcon field="role" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider">
                Status
              </th>
              <th
                onClick={() => handleSort('last_login')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center">
                  Last login
                  <SortIcon field="last_login" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-text-tertiary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8">
                  <LoadingSkeleton />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8">
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-text-tertiary text-sm">
                      {search ? 'No user matching your search' : 'No users found'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-amber-900/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-black font-bold">
                        {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-text-primary">{user.firstname} {user.lastname}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-text-secondary">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-text-secondary">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.level ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                          {user.level.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-text-tertiary font-medium">#{user.level.rank}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_blocked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    }`}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-text-secondary">
                    {formatDate(user.last_login)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStartChat(user)}
                        disabled={isProcessing || isChatLoading === user.id}
                        className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors"
                        title="Start a chat"
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        disabled={isProcessing}
                        className="p-2 rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
                        title="Edit user"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {user.is_blocked ? (
                        <button
                          onClick={() => handleUnblock(user)}
                          disabled={isProcessing}
                          className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors"
                          title="Unblock user"
                        >
                          <LockOpenIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(user)}
                          disabled={isProcessing}
                          className="p-2 rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
                          title="Block user"
                        >
                          <LockClosedIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={isProcessing}
                        className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                        title="Delete user"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination 
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={editingUser}
        levels={levels}
        isLoading={isFormSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete user"
        message={`Are you sure you want to delete ${selectedUser?.firstname} ${selectedUser?.lastname}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        isLoading={isProcessing}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};

export default Users;