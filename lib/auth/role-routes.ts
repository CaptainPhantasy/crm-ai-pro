/**
 * Role-based routing configuration
 * 
 * Determines which dashboard each role sees after login
 */

export type UserRole = 'owner' | 'admin' | 'dispatcher' | 'tech' | 'sales'

export const ROLE_ROUTES: Record<UserRole, string> = {
  tech: '/tech/dashboard',
  sales: '/sales/dashboard',
  dispatcher: '/office/dashboard',
  admin: '/inbox',
  owner: '/owner/dashboard',
}

export const MOBILE_ROUTES: Record<UserRole, string> = {
  tech: '/tech/dashboard',
  sales: '/sales/dashboard',
  dispatcher: '/office/dashboard',
  admin: '/inbox',
  owner: '/owner/dashboard',
}

/**
 * Get the appropriate route for a user based on their role
 */
export function getRouteForRole(role: UserRole | string | null): string {
  if (!role) return '/inbox'
  return ROLE_ROUTES[role as UserRole] || '/inbox'
}

/**
 * Check if a role has access to mobile-optimized dashboards
 */
export function isMobileRole(role: UserRole | string | null): boolean {
  return role === 'tech' || role === 'sales'
}

/**
 * Check if a role can manage other users
 */
export function canManageUsers(role: UserRole | string | null): boolean {
  return role === 'owner' || role === 'admin'
}

/**
 * Check if a role can view all jobs (not just assigned)
 */
export function canViewAllJobs(role: UserRole | string | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'dispatcher'
}

/**
 * Check if a role can clear escalations
 */
export function canClearEscalations(role: UserRole | string | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'dispatcher'
}

