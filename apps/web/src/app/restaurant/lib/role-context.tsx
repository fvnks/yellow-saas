'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RestaurantRole,
  RestaurantUser,
  INITIAL_RESTAURANT_USERS,
  ROLE_PERMISSIONS,
} from './restaurant-store';

interface RoleContextValue {
  users: RestaurantUser[];
  currentUser: RestaurantUser | null;
  currentRole: RestaurantRole;
  switchUser: (userId: string) => void;
  addUser: (user: RestaurantUser) => void;
  updateUser: (userId: string, patch: Partial<RestaurantUser>) => void;
  removeUser: (userId: string) => void;
  canAccess: (section: keyof Omit<RolePermissionSections, never>) => boolean;
  roleLabel: string;
}

type RolePermissionSections = {
  dashboard: boolean;
  pos: boolean;
  kiosk: boolean;
  kitchen: boolean;
  bar: boolean;
  sales: boolean;
  reservations: boolean;
  cashier: boolean;
  reports: boolean;
  users: boolean;
  admin: boolean;
};

const STORAGE_KEY = 'restaurant_active_user';

const RoleContext = createContext<RoleContextValue | null>(null);

export function RestaurantRoleProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<RestaurantUser[]>(INITIAL_RESTAURANT_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    }
    return INITIAL_RESTAURANT_USERS[0]?.id || '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && currentUserId) {
      window.localStorage.setItem(STORAGE_KEY, currentUserId);
    }
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;
  const currentRole: RestaurantRole = currentUser?.role || 'owner';
  const permissions = ROLE_PERMISSIONS.find((p) => p.role === currentRole);

  const canAccess = (section: keyof RolePermissionSections): boolean => {
    if (!permissions) return false;
    return permissions.sections[section];
  };

  const switchUser = (userId: string) => setCurrentUserId(userId);

  const addUser = (user: RestaurantUser) => setUsers((prev) => [...prev, user]);

  const updateUser = (userId: string, patch: Partial<RestaurantUser>) =>
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));

  const removeUser = (userId: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== userId));

  const roleLabel = ROLE_PERMISSIONS.find((p) => p.role === currentRole)?.label || '';

  return (
    <RoleContext.Provider
      value={{
        users,
        currentUser,
        currentRole,
        switchUser,
        addUser,
        updateUser,
        removeUser,
        canAccess,
        roleLabel,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRestaurantRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRestaurantRole must be used within RestaurantRoleProvider');
  }
  return ctx;
}
