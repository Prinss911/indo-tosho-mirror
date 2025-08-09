<template>
    <ClientOnly>
        <div class="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <!-- Header -->
            <div class="bg-white dark:bg-gray-800 shadow">
                <div class="container-extra-wide">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage registered users and their permissions
                            </p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <BackButton to="/admin" label="Back to Dashboard" />
                            <button
                                @click="showAddUserModal = true"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                                aria-label="Add new user"
                            >
                                <PlusIcon class="w-4 h-4 mr-2" aria-hidden="true" />
                                Add New User
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="container-extra-wide py-8">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <UsersIcon class="h-6 w-6 text-blue-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Total Users
                                        </dt>
                                        <dd
                                            class="text-lg font-medium text-gray-900 dark:text-white"
                                            data-testid="total-users"
                                        >
                                            {{ users.length }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <ShieldCheckIcon class="h-6 w-6 text-green-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Active Users
                                        </dt>
                                        <dd
                                            class="text-lg font-medium text-gray-900 dark:text-white"
                                            data-testid="active-users"
                                        >
                                            {{ activeUsers }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <CogIcon class="h-6 w-6 text-purple-400" />
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            Admins
                                        </dt>
                                        <dd
                                            class="text-lg font-medium text-gray-900 dark:text-white"
                                            data-testid="admin-users"
                                        >
                                            {{ adminUsers }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Users
                                </label>
                                <input
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Search by username or email..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Search users by username or email"
                                    @input="searchQuery = sanitizeSearchQuery($event.target.value)"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter by Role
                                </label>
                                <select
                                    v-model="selectedRole"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Filter users by role"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter by Status
                                </label>
                                <select
                                    v-model="selectedStatus"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-150"
                                    aria-label="Filter users by status"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            User
                                        </th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            Role
                                        </th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            Joined
                                        </th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            Last Active
                                        </th>
                                        <th
                                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr
                                        v-for="user in filteredUsers"
                                        :key="user.id"
                                        class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-10 w-10">
                                                    <div
                                                        class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
                                                    >
                                                        <UserIcon class="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                                                        {{ user.username }}
                                                    </div>
                                                    <div class="text-sm text-gray-500 dark:text-gray-400">
                                                        {{ user.email }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                                :class="{
                                                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200':
                                                        user.role === 'admin',
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
                                                        user.role === 'user'
                                                }"
                                            >
                                                {{ user.role }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex flex-col gap-1">
                                                <span
                                                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full status-badge"
                                                    :class="{
                                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                                                            user.status === 'active',
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                                                            user.status === 'inactive',
                                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                                                            user.status === 'banned'
                                                    }"
                                                >
                                                    {{ user.status }}
                                                </span>
                                                <span
                                                    v-if="user.status === 'banned' && user.has_deleted_posts"
                                                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                    title="Semua rilisan pengguna ini telah dihapus"
                                                >
                                                    no posts
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            {{ formatDate(user.joinedAt) }}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            {{ formatDate(user.lastActiveAt) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div class="flex justify-end space-x-2">
                                                <button
                                                    @click="editUser(user)"
                                                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 action-btn"
                                                >
                                                    <PencilIcon class="h-4 w-4" />
                                                </button>
                                                <Menu as="div" class="relative inline-block text-left">
                                                    <MenuButton
                                                        class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 action-btn"
                                                        :title="
                                                            user.status === 'active'
                                                                ? 'Nonaktifkan'
                                                                : user.status === 'inactive'
                                                                  ? 'Banned'
                                                                  : 'Aktifkan'
                                                        "
                                                    >
                                                        <ShieldExclamationIcon class="h-4 w-4" />
                                                    </MenuButton>
                                                    <transition
                                                        enter-active-class="transition ease-out duration-100"
                                                        enter-from-class="transform opacity-0 scale-95"
                                                        enter-to-class="transform opacity-100 scale-100"
                                                        leave-active-class="transition ease-in duration-75"
                                                        leave-from-class="transform opacity-100 scale-100"
                                                        leave-to-class="transform opacity-0 scale-95"
                                                    >
                                                        <MenuItems
                                                            class="absolute right-0 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                                            :class="{
                                                                'mt-2': isDropdownTopPosition(user),
                                                                'mb-2 bottom-full': !isDropdownTopPosition(user)
                                                            }"
                                                        >
                                                            <div class="px-1 py-1">
                                                                <MenuItem
                                                                    v-if="user.status !== 'active'"
                                                                    v-slot="{ active }"
                                                                >
                                                                    <button
                                                                        @click="toggleUserStatus(user, 'active')"
                                                                        :class="[
                                                                            active
                                                                                ? 'bg-blue-500 text-white'
                                                                                : 'text-gray-900 dark:text-gray-100',
                                                                            'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                                                        ]"
                                                                    >
                                                                        <ShieldCheckIcon
                                                                            class="mr-2 h-5 w-5"
                                                                            :class="
                                                                                active ? 'text-white' : 'text-blue-500'
                                                                            "
                                                                        />
                                                                        Aktifkan
                                                                    </button>
                                                                </MenuItem>
                                                                <MenuItem
                                                                    v-if="user.status !== 'inactive'"
                                                                    v-slot="{ active }"
                                                                >
                                                                    <button
                                                                        @click="toggleUserStatus(user, 'inactive')"
                                                                        :class="[
                                                                            active
                                                                                ? 'bg-yellow-500 text-white'
                                                                                : 'text-gray-900 dark:text-gray-100',
                                                                            'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                                                        ]"
                                                                    >
                                                                        <ShieldExclamationIcon
                                                                            class="mr-2 h-5 w-5"
                                                                            :class="
                                                                                active
                                                                                    ? 'text-white'
                                                                                    : 'text-yellow-500'
                                                                            "
                                                                        />
                                                                        Nonaktifkan
                                                                    </button>
                                                                </MenuItem>
                                                                <MenuItem
                                                                    v-if="user.status !== 'banned'"
                                                                    v-slot="{ active }"
                                                                >
                                                                    <button
                                                                        @click="toggleUserStatus(user, 'banned')"
                                                                        :class="[
                                                                            active
                                                                                ? 'bg-red-500 text-white'
                                                                                : 'text-gray-900 dark:text-gray-100',
                                                                            'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                                                        ]"
                                                                    >
                                                                        <ShieldExclamationIcon
                                                                            class="mr-2 h-5 w-5"
                                                                            :class="
                                                                                active ? 'text-white' : 'text-red-500'
                                                                            "
                                                                        />
                                                                        Banned
                                                                    </button>
                                                                </MenuItem>
                                                            </div>
                                                        </MenuItems>
                                                    </transition>
                                                </Menu>
                                                <button
                                                    @click="deleteUser(user)"
                                                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 action-btn"
                                                >
                                                    <TrashIcon class="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add User Modal -->
            <div
                v-if="showAddUserModal"
                class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            >
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                    <div class="mt-3">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New User</h3>
                        <form @submit.prevent="addUser">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Username
                                </label>
                                <input
                                    v-model="newUser.username"
                                    type="text"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    v-model="newUser.email"
                                    type="email"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    v-model="newUser.password"
                                    type="password"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <select
                                    v-model="newUser.role"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    @click="showAddUserModal = false"
                                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Confirmation Modal -->
        <div v-if="showStatusModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div class="mt-3">
                    <div
                        class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4"
                    >
                        <ShieldExclamationIcon class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">
                        Konfirmasi Perubahan Status
                    </h3>
                    <div class="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                        <p class="mb-2">
                            Anda akan mengubah status pengguna <strong>{{ userToModify?.username }}</strong>
                        </p>
                        <p class="mb-4">
                            dari <span class="font-semibold">{{ userToModify?.status }}</span> menjadi
                            <span class="font-semibold">{{ statusAction?.newStatus }}</span>
                        </p>

                        <!-- Option to delete posts when banning user -->
                        <div
                            v-if="statusAction?.newStatus === 'banned'"
                            class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4 text-left"
                        >
                            <p class="font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                                Pilihan untuk rilisan pengguna:
                            </p>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input
                                        type="radio"
                                        :value="true"
                                        v-model="statusAction.deleteUserPosts"
                                        class="mr-2 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span class="text-sm text-yellow-800 dark:text-yellow-200">
                                        Hapus semua rilisan pengguna
                                    </span>
                                </label>
                                <label class="flex items-center">
                                    <input
                                        type="radio"
                                        :value="false"
                                        v-model="statusAction.deleteUserPosts"
                                        class="mr-2 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <span class="text-sm text-yellow-800 dark:text-yellow-200">
                                        Hanya banned pengguna (rilisan tetap ada)
                                    </span>
                                </label>
                            </div>
                        </div>

                        <p v-if="statusAction?.deleteUserPosts" class="text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Semua rilisan pengguna akan dihapus
                        </p>
                    </div>
                    <div class="flex justify-center space-x-3">
                        <button
                            type="button"
                            @click="cancelStatusChange"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            @click="confirmStatusChange"
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        >
                            Konfirmasi
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div class="mt-3">
                    <div
                        class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4"
                    >
                        <TrashIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">Hapus Pengguna</h3>
                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <p class="mb-3 text-center">
                            Anda akan menghapus pengguna <strong>{{ userToModify?.username }}</strong>
                        </p>
                        <div
                            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4"
                        >
                            <p class="text-red-800 dark:text-red-200 text-xs">
                                ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Semua data pengguna
                                dan rilisan akan dihapus permanen.
                            </p>
                        </div>
                        <p class="mb-2 font-medium">
                            Ketik
                            <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{{
                                userToModify?.username
                            }}</code>
                            untuk konfirmasi:
                        </p>
                        <input
                            v-model="deleteConfirmationText"
                            type="text"
                            placeholder="Ketik username untuk konfirmasi"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                    </div>
                    <div class="flex justify-center space-x-3">
                        <button
                            type="button"
                            @click="cancelDelete"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            @click="confirmDelete"
                            :disabled="!isDeleteConfirmationValid"
                            :class="[
                                'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors',
                                isDeleteConfirmationValid
                                    ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            ]"
                        >
                            Hapus Pengguna
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Role Modal -->
        <div
            v-if="showEditRoleModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
        >
            <div class="relative p-4 w-full max-w-md">
                <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div class="p-6">
                        <div
                            class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full"
                        >
                            <CogIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center mb-4">
                            Ubah Role Pengguna
                        </h3>
                        <div class="mb-4">
                            <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                                Mengubah role untuk:
                                <strong class="text-gray-900 dark:text-white">{{ userToModify?.username }}</strong>
                            </p>
                            <div
                                class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4"
                            >
                                <div class="flex items-center">
                                    <ShieldExclamationIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                                    <div class="text-sm">
                                        <p class="text-yellow-800 dark:text-yellow-200">
                                            <strong>Role saat ini:</strong> {{ userToModify?.role }}
                                        </p>
                                        <p class="text-yellow-800 dark:text-yellow-200">
                                            <strong>Role baru:</strong> {{ editRoleAction?.newRole }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3"
                            >
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <CogIcon class="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm text-blue-800 dark:text-blue-200">
                                            Perubahan role akan mempengaruhi hak akses pengguna di sistem.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pilih Role Baru
                            </label>
                            <select
                                v-model="editRoleAction.newRole"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-center space-x-3 px-6 pb-6">
                        <button
                            type="button"
                            @click="cancelEditRole"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            @click="confirmEditRole"
                            :disabled="!editRoleAction?.newRole || editRoleAction?.newRole === userToModify?.role"
                            :class="[
                                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                editRoleAction?.newRole && editRoleAction?.newRole !== userToModify?.role
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200'
                            ]"
                        >
                            Ubah Role
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useSupabase } from "~/services/supabaseClient";
import { useToast } from "vue-toastification";
import { sanitizeSearchQuery } from "~/utils/sanitization";
import {
    ArrowLeftIcon,
    PlusIcon,
    UsersIcon,
    ShieldCheckIcon,
    CogIcon,
    UserIcon,
    PencilIcon,
    ShieldExclamationIcon,
    TrashIcon
} from "@heroicons/vue/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

// Middleware
definePageMeta({
    middleware: ["auth", "admin"]
});

const authStore = useAuthStore();
const toast = useToast();

// Initialize and fetch data when component mounts
onMounted(async () => {
    // Fetch users from Supabase
    await fetchUsers();
});

// Reactive state
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const showAddUserModal = ref(false);

// Modal states
const showStatusModal = ref(false);
const showDeleteModal = ref(false);
const showEditRoleModal = ref(false);
const userToModify = ref(null);
const statusAction = ref(null);
const deleteConfirmationText = ref("");
const editRoleAction = ref(null);

const newUser = ref({
    username: "",
    email: "",
    password: "",
    role: "user"
});

// Users data from Supabase
const users = ref([]);

// Function to fetch users from Supabase
const fetchUsers = async () => {
    try {
        const { client: supabase } = useSupabase();

        // First get profiles to access metadata for all users
        const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, metadata");

        const profilesMap = new Map();
        if (!profilesError && profilesData) {
            profilesData.forEach(profile => {
                profilesMap.set(profile.id, profile.metadata || {});
            });
        }

        // Create a database function to get users with email from auth.users
        // This requires a database function that can access auth schema
        const { data, error } = await supabase.rpc("get_users_with_auth_data");

        if (error) {
            console.warn("RPC function not available, falling back to profiles only:", error);

            // Fallback: fetch only from profiles table
            const { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (profilesError) throw profilesError;

            if (profilesData) {
                users.value = profilesData.map(profile => {
                    const metadata = profilesMap.get(profile.id) || {};
                    return {
                        id: profile.id,
                        username: profile.username,
                        email: profile.email || "Email not available",
                        role: profile.role || "user",
                        status: profile.status || "active",
                        joinedAt: new Date(profile.created_at),
                        lastActiveAt: new Date(profile.created_at),
                        has_deleted_posts: metadata.has_deleted_posts || false
                    };
                });
            }
        } else if (data) {
            // Use RPC function result and update status based on email confirmation
            users.value = data.map(user => {
                // If we have email_confirmed_at data from the RPC function
                if (user.hasOwnProperty("email_confirmed_at") && !user.email_confirmed_at && user.status === "active") {
                    // Update status in database
                    supabase
                        .from("profiles")
                        .update({
                            status: "inactive",
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", user.id);

                    // Update local user object
                    user.status = "inactive";
                }

                const metadata = profilesMap.get(user.id) || {};

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email || "Email not available",
                    role: user.role || "user",
                    status: user.status || "active",
                    joinedAt: new Date(user.created_at),
                    lastActiveAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date(user.created_at),
                    has_deleted_posts: metadata.has_deleted_posts || false
                };
            });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

// Computed
const filteredUsers = computed(() => {
    return users.value.filter(user => {
        const matchesSearch =
            !searchQuery.value ||
            user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesRole = !selectedRole.value || user.role === selectedRole.value;
        const matchesStatus = !selectedStatus.value || user.status === selectedStatus.value;

        return matchesSearch && matchesRole && matchesStatus;
    });
});

const activeUsers = computed(() => {
    return users.value.filter(user => user.status === "active").length;
});

const adminUsers = computed(() => {
    return users.value.filter(user => user.role === "admin").length;
});

// Computed for delete confirmation validation
const isDeleteConfirmationValid = computed(() => {
    if (!userToModify.value) return false;
    return deleteConfirmationText.value === userToModify.value.username;
});

// Methods
const formatDate = (date: Date | string) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(dateObj);
};

const addUser = async () => {
    try {
        const { client: supabase } = useSupabase();

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: newUser.value.email,
            password: newUser.value.password,
            email_confirm: false // Changed to false to require email confirmation
        });

        if (authError) throw authError;

        if (authData.user) {
            // 2. Create or update profile
            const { error: profileError } = await supabase.from("profiles").upsert({
                id: authData.user.id,
                username: newUser.value.username,
                email: newUser.value.email,
                role: newUser.value.role,
                status: "inactive", // Set to inactive until email is confirmed
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (profileError) throw profileError;

            // 3. Refresh user list
            await fetchUsers();

            // Reset form
            newUser.value = {
                username: "",
                email: "",
                password: "",
                role: "user"
            };

            showAddUserModal.value = false;
            toast.success(`Pengguna ${newUser.value.username} berhasil ditambahkan`);
        }
    } catch (error) {
        console.error("Error adding user:", error);
        toast.error(`Gagal menambahkan pengguna: ${error.message}`);
    }
};

const editUser = async (user: any) => {
    // Show edit role modal instead of directly updating
    showEditRoleConfirmation(user);
};

const showEditRoleConfirmation = (user: any) => {
    userToModify.value = user;
    editRoleAction.value = {
        newRole: user.role // Set current role as default
    };
    showEditRoleModal.value = true;
};

const confirmEditRole = async () => {
    if (!userToModify.value || !editRoleAction.value?.newRole) return;

    try {
        const newRole = editRoleAction.value.newRole;
        const userId = userToModify.value.id;
        const originalUsername = userToModify.value.username;

        console.log("Starting role update via API:", {
            userId,
            username: originalUsername,
            currentRole: userToModify.value.role,
            newRole
        });

        // Call API endpoint untuk update role
        const { data: apiResponse } = await $fetch("/api/admin/update-role-user", {
            method: "POST",
            body: {
                userId: userId,
                newRole: newRole
            }
        });

        console.log("API response:", apiResponse);

        // Update local state
        userToModify.value.role = newRole;

        // Refresh user list
        await fetchUsers();

        // Close modal and reset state
        showEditRoleModal.value = false;
        userToModify.value = null;
        editRoleAction.value = null;

        toast.success(`Role pengguna ${originalUsername} berhasil diubah menjadi ${newRole}`);
        console.log("User role updated successfully via API:", {
            username: originalUsername,
            newRole,
            apiData: apiResponse.data
        });
    } catch (error) {
        console.error("Error updating user role via API:", error);

        // Handle different types of errors
        let errorMessage = "Terjadi kesalahan tidak dikenal";
        if (error.data?.message) {
            errorMessage = error.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        toast.error(`Gagal mengubah role pengguna: ${errorMessage}`);
    }
};

const cancelEditRole = () => {
    showEditRoleModal.value = false;
    userToModify.value = null;
    editRoleAction.value = null;
};

const showStatusConfirmation = (user: any, newStatus: string, deleteUserPosts?: boolean) => {
    userToModify.value = user;
    statusAction.value = {
        newStatus,
        deleteUserPosts: deleteUserPosts !== undefined ? deleteUserPosts : false
    };
    showStatusModal.value = true;
};

const confirmStatusChange = async () => {
    if (!userToModify.value || !statusAction.value) return;

    try {
        const { newStatus, deleteUserPosts } = statusAction.value;

        // Call the API endpoint to update user status
        const response = await $fetch(`/api/admin/users/${userToModify.value.id}/status`, {
            method: "PUT",
            body: {
                status: newStatus,
                deleteUserPosts
            }
        });

        if (response.success) {
            // Update local state
            userToModify.value.status = newStatus;
            if (deleteUserPosts) {
                userToModify.value.has_deleted_posts = true;
            }

            showStatusModal.value = false;
            userToModify.value = null;
            statusAction.value = null;

            toast.success(`Status pengguna berhasil diubah menjadi ${newStatus}`);
            console.log(`User status changed to ${newStatus}`);
        } else {
            toast.error("Gagal mengubah status pengguna");
        }
    } catch (error) {
        console.error("Error toggling user status:", error);
        toast.error(`Gagal mengubah status pengguna: ${error.message}`);
    }
};

const cancelStatusChange = () => {
    showStatusModal.value = false;
    userToModify.value = null;
    statusAction.value = null;
};

const toggleUserStatus = async (user: any, newStatus?: string, deleteUserPosts?: boolean) => {
    // Determine new status if not provided
    if (!newStatus) {
        if (user.status === "active") {
            newStatus = "inactive";
        } else if (user.status === "inactive") {
            newStatus = "banned";
            // For banned status, show modal to ask about deleting posts
            showStatusConfirmation(user, newStatus);
            return;
        } else {
            newStatus = "active";
        }
    }

    // Show confirmation modal for important status changes
    if (newStatus === "banned" || (user.status === "banned" && newStatus === "active")) {
        showStatusConfirmation(user, newStatus, deleteUserPosts);
        return;
    }

    // For simple status changes, proceed directly
    try {
        // Call the API endpoint to update user status
        const response = await $fetch(`/api/admin/users/${user.id}/status`, {
            method: "PUT",
            body: {
                status: newStatus,
                deleteUserPosts
            }
        });

        if (response.success) {
            // Update local state
            user.status = newStatus;
            if (deleteUserPosts) {
                user.has_deleted_posts = true;
            }
            toast.success(`Status pengguna berhasil diubah menjadi ${newStatus}`);
            console.log(`User status changed to ${newStatus}`);
        } else {
            toast.error("Gagal mengubah status pengguna");
        }
    } catch (error) {
        console.error("Error toggling user status:", error);
        toast.error(`Gagal mengubah status pengguna: ${error.message}`);
    }
};

const showDeleteConfirmation = (user: any) => {
    userToModify.value = user;
    deleteConfirmationText.value = "";
    showDeleteModal.value = true;
};

const confirmDelete = async () => {
    if (!userToModify.value || !isDeleteConfirmationValid.value) return;

    try {
        const { client: supabase } = useSupabase();

        // Delete all user posts first
        const { error: postsError } = await supabase.from("posts").delete().eq("submitter_id", userToModify.value.id);

        if (postsError) {
            console.warn("Error deleting user posts:", postsError);
            toast.error(`Peringatan: Beberapa rilisan pengguna mungkin tidak terhapus: ${postsError.message}`);
        } else {
            console.log(`Semua rilisan pengguna ${userToModify.value.username} telah dihapus`);
            userToModify.value.has_deleted_posts = true;
        }

        // Delete user from auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userToModify.value.id);

        if (authError) throw authError;

        // Profile will be automatically deleted via database triggers
        // But we can explicitly delete it to be sure
        const { error: profileError } = await supabase.from("profiles").delete().eq("id", userToModify.value.id);

        if (profileError) console.warn("Error deleting profile:", profileError);

        // Refresh user list
        await fetchUsers();

        showDeleteModal.value = false;
        deleteConfirmationText.value = "";
        userToModify.value = null;

        toast.success("Pengguna berhasil dihapus");
        console.log("User deleted successfully");
    } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(`Gagal menghapus pengguna: ${error.message}`);
    }
};

const cancelDelete = () => {
    showDeleteModal.value = false;
    deleteConfirmationText.value = "";
    userToModify.value = null;
};

const deleteUser = async (user: any) => {
    showDeleteConfirmation(user);
};

// Function to determine if dropdown should appear at top or bottom
const isDropdownTopPosition = (user: any) => {
    // Get index of user in the filtered users array
    const userIndex = filteredUsers.value.findIndex(u => u.id === user.id);

    // If user is in the last 4 rows, show dropdown above
    return userIndex < filteredUsers.value.length - 4;
};
</script>
