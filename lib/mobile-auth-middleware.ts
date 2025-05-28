import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  plan?: string;
  iat?: number;
  exp?: number;
}

export class AuthenticationError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Verifies JWT token from Authorization header
 * @param authHeader - The Authorization header value
 * @returns Decoded JWT payload
 * @throws AuthenticationError if token is invalid or missing
 */
export async function verifyMobileToken(authHeader: string | null): Promise<AuthenticatedUser> {
  console.log('🔐 Verifying mobile authentication token...');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('❌ Missing or invalid authorization header');
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('🔑 Token extracted from header');
  
  const jwtSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!jwtSecret) {
    console.error('💥 JWT secret not configured');
    throw new AuthenticationError('Server configuration error');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
    console.log(`✅ Token verified for user: ${decoded.email || decoded.sub}`);
    return decoded;
  } catch (error) {
    console.warn('❌ Invalid or expired token:', error instanceof Error ? error.message : 'Unknown error');
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Validates that a collection ID is a valid integer
 * @param id - The collection ID to validate
 * @returns The parsed integer ID
 * @throws AuthenticationError if ID is invalid
 */
export function validateCollectionId(id: string): number {
  const collectionId = parseInt(id);
  if (isNaN(collectionId) || collectionId <= 0) {
    throw new AuthenticationError('Invalid collection ID', 400);
  }
  return collectionId;
}

/**
 * Checks if a user owns a collection or if the collection is public (for read operations)
 * @param collection - The collection object with userId and isPublic properties
 * @param user - The authenticated user
 * @param requireOwnership - If true, only collection owner can access (for write operations)
 * @returns true if access is allowed
 * @throws AuthorizationError if access is denied
 */
export function checkCollectionAccess(
  collection: { userId: string | null; isPublic: boolean },
  user: AuthenticatedUser,
  requireOwnership: boolean = false
): boolean {
  if (requireOwnership) {
    // For write operations, only owner can access
    if (collection.userId !== user.sub) {
      throw new AuthorizationError('You can only modify your own collections');
    }
  } else {
    // For read operations, public collections or owned collections are accessible
    if (!collection.isPublic && collection.userId !== user.sub) {
      throw new AuthorizationError('Access denied to this collection');
    }
  }
  
  return true;
}
