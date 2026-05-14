/**
 * Represents a user returned from the API.
 */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Request body for creating a new user.
 */
export interface CreateUserBody {
  name: string;
  email: string;
}
