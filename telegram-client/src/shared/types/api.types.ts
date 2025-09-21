import { AxiosRequestConfig, Method } from "axios";

/**
 * HTTP method type
 */
export type HttpMethod = Method;

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Response status */
  status: number;
  /** Response message */
  message?: string;
}

/**
 * Error response interface
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: any;
}

/**
 * Authenticated request configuration
 */
export interface AuthenticatedRequestConfig extends AxiosRequestConfig {
  /** Request data */
  data?: any;
  /** Request parameters */
  params?: Record<string, any>;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Service status */
  status: "healthy" | "unhealthy";
  /** Service name */
  service: string;
  /** Timestamp */
  timestamp: string;
  /** Additional health data */
  data?: any;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page limit */
  limit?: number;
  /** Page offset */
  offset?: number;
}

/**
 * Service account credentials
 */
export interface ServiceCredentials {
  /** Service email */
  email: string;
  /** Service password */
  password: string;
}

/**
 * JWT token data
 */
export interface TokenData {
  /** JWT token */
  token: string;
  /** Token expiration timestamp */
  expiresAt: number;
}
