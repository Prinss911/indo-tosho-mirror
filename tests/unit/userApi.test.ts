import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDatabase } from "~/tests/mocks/database";
import { validate as uuidValidate } from "uuid";

describe("User API", () => {
    beforeEach(() => {
        // Reset the mock database before each test
        mockDatabase.reset();
    });

    describe("getUsers", () => {
        it("should return all users", () => {
            const users = mockDatabase.getUsers();
            expect(users).toBeInstanceOf(Array);
            expect(users.length).toBeGreaterThan(0);
        });
    });

    describe("getUserById", () => {
        it("should return a user by ID", () => {
            const users = mockDatabase.getUsers();
            const firstUser = users[0];
            const user = mockDatabase.getUserById(firstUser.id);
            expect(user).toBeDefined();
            expect(user?.id).toBe(firstUser.id);
        });

        it("should return undefined for non-existent user ID", () => {
            const user = mockDatabase.getUserById("non-existent-id");
            expect(user).toBeUndefined();
        });
    });

    describe("getUserByUsername", () => {
        it("should return a user by username", () => {
            const users = mockDatabase.getUsers();
            const firstUser = users[0];
            const user = mockDatabase.getUserByUsername(firstUser.username);
            expect(user).toBeDefined();
            expect(user?.username).toBe(firstUser.username);
        });

        it("should return undefined for non-existent username", () => {
            const user = mockDatabase.getUserByUsername("non-existent-username");
            expect(user).toBeUndefined();
        });
    });

    describe("createUser", () => {
        it("should create a new user", () => {
            const newUserData = {
                username: "testuser",
                email: "test@example.com",
                password: "password123",
                role: "user",
                isActive: true
            };

            const initialUsers = mockDatabase.getUsers();
            const newUser = mockDatabase.createUser(newUserData);
            const updatedUsers = mockDatabase.getUsers();

            expect(newUser).toBeDefined();
            expect(newUser.id).toBeDefined();
            expect(newUser.username).toBe(newUserData.username);
            expect(newUser.email).toBe(newUserData.email);
            expect(newUser.role).toBe(newUserData.role);
            expect(newUser.isActive).toBe(newUserData.isActive);
            expect(newUser.createdAt).toBeInstanceOf(Date);
            expect(updatedUsers.length).toBe(initialUsers.length + 1);
        });
    });

    describe("updateUser", () => {
        it("should update an existing user", () => {
            const users = mockDatabase.getUsers();
            const userToUpdate = users[0];
            const updates = {
                username: "updatedusername",
                email: "updated@example.com",
                isActive: false
            };

            const updatedUser = mockDatabase.updateUser(userToUpdate.id, updates);

            expect(updatedUser).toBeDefined();
            expect(updatedUser?.id).toBe(userToUpdate.id);
            expect(updatedUser?.username).toBe(updates.username);
            expect(updatedUser?.email).toBe(updates.email);
            expect(updatedUser?.isActive).toBe(updates.isActive);
        });

        it("should return undefined for non-existent user ID", () => {
            const updates = { username: "updatedusername" };
            const updatedUser = mockDatabase.updateUser("non-existent-id", updates);
            expect(updatedUser).toBeUndefined();
        });
    });

    describe("deleteUser", () => {
        it("should delete an existing user", () => {
            const users = mockDatabase.getUsers();
            const userToDelete = users[0];
            const initialUsersCount = users.length;

            const result = mockDatabase.deleteUser(userToDelete.id);
            const updatedUsers = mockDatabase.getUsers();

            expect(result).toBe(true);
            expect(updatedUsers.length).toBe(initialUsersCount - 1);
            expect(updatedUsers.find(u => u.id === userToDelete.id)).toBeUndefined();
        });

        it("should return false for non-existent user ID", () => {
            const result = mockDatabase.deleteUser("non-existent-id");
            expect(result).toBe(false);
        });
    });

    describe("getUserStats", () => {
        it("should return user statistics", () => {
            const stats = mockDatabase.getUserStats();

            expect(stats).toBeDefined();
            expect(stats.total).toBeGreaterThanOrEqual(0);
            expect(stats.active).toBeGreaterThanOrEqual(0);
            expect(stats.admins).toBeGreaterThanOrEqual(0);
            expect(stats.total).toBeGreaterThanOrEqual(stats.active);
            expect(stats.total).toBeGreaterThanOrEqual(stats.admins);
        });
    });
});
