import axios, { AxiosInstance } from "axios";
import { telegramConfig } from "../config/telegram.config";
import { BaseService } from "../shared/base/base-service";
import { ServiceCredentials, TokenData, HttpMethod, AuthenticatedRequestConfig } from "../shared/types";
import { ERROR_CODES, retryWithBackoff } from "../shared/utils";

/**
 * Authentication service for managing service account authentication
 */
export class AuthService extends BaseService {
  private readonly httpClient: AxiosInstance;
  private tokenData: TokenData | null = null;

  constructor() {
    super("AuthService");
    this.httpClient = axios.create({
      baseURL: telegramConfig.backendBaseUrl,
      timeout: telegramConfig.requestTimeoutMs,
      headers: { "Content-Type": "application/json" },
    });

    this.logInitialization();
  }

  /**
   * Authenticates the service account and caches the JWT token
   * @param credentials - Service account credentials
   * @returns Promise that resolves when authentication is complete
   */
  async authenticate(credentials: ServiceCredentials): Promise<void> {
    try {
      this.logInfo("Authenticating service account", { email: credentials.email });

      const response = await this.httpClient.post("/auth/email/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const token = response?.data?.token;
      if (!token) {
        throw this.createError("Login response missing token", ERROR_CODES.AUTH_FAILED);
      }

      // Calculate token expiration (55 minutes from now)
      const now = Math.floor(Date.now() / 1000);
      this.tokenData = {
        token,
        expiresAt: now + 55 * 60, // 55 minutes
      };

      this.logInfo("Service account authenticated successfully", {
        email: credentials.email,
        expiresAt: new Date(this.tokenData.expiresAt * 1000).toISOString(),
      });
    } catch (error) {
      this.logError("Service account authentication failed", error, {
        email: credentials.email,
        status: (error as any)?.response?.status,
      });
      throw this.createError("Authentication failed", ERROR_CODES.AUTH_FAILED);
    }
  }

  /**
   * Gets authentication headers, refreshing token if needed
   * @param credentials - Service account credentials for refresh
   * @returns Promise with authentication headers
   */
  async getAuthHeaders(credentials: ServiceCredentials): Promise<Record<string, string>> {
    const now = Math.floor(Date.now() / 1000);

    // Check if token is expired or missing
    if (!this.tokenData || now >= this.tokenData.expiresAt) {
      this.logInfo("Token expired or missing, re-authenticating");
      await this.authenticate(credentials);
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.tokenData!.token}`,
    };
  }

  /**
   * Performs an authenticated request with automatic retry on 401
   * @param method - HTTP method
   * @param url - Request URL
   * @param config - Request configuration
   * @param credentials - Service account credentials
   * @returns Promise with response data
   */
  async makeAuthenticatedRequest<T = any>(method: HttpMethod, url: string, config: AuthenticatedRequestConfig = {}, credentials: ServiceCredentials): Promise<T> {
    return retryWithBackoff(
      async () => {
        const headers = await this.getAuthHeaders(credentials);

        try {
          const response = await this.httpClient.request<T>({
            method,
            url,
            ...config,
            headers: { ...headers, ...(config.headers || {}) },
          });

          return response.data;
        } catch (error: any) {
          if (error?.response?.status === 401) {
            // Force re-authentication and retry
            this.logInfo("Received 401, forcing re-authentication");
            this.tokenData = null;
            const retryHeaders = await this.getAuthHeaders(credentials);
            const retryResponse = await this.httpClient.request<T>({
              method,
              url,
              ...config,
              headers: { ...retryHeaders, ...(config.headers || {}) },
            });
            return retryResponse.data;
          }
          throw error;
        }
      },
      2,
      1000,
    ); // 2 retries with 1 second base delay
  }

  /**
   * Checks if the current token is valid
   * @returns True if token is valid and not expired
   */
  isTokenValid(): boolean {
    if (!this.tokenData) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < this.tokenData.expiresAt;
  }

  /**
   * Clears the cached token
   */
  clearToken(): void {
    this.tokenData = null;
    this.logInfo("Token cleared");
  }

  /**
   * Gets the current token data
   * @returns Current token data or null
   */
  getTokenData(): TokenData | null {
    return this.tokenData;
  }
}
