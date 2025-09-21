import axios, { AxiosInstance, AxiosRequestConfig, Method } from "axios";
import dotenv from "dotenv";
import { adkLogger } from "../app/logs/logger";

dotenv.config({ path: "../../.env" });

/**
 * Base URL of the backend API. Defaults to the docker service endpoint.
 */
export const backendBaseUrl: string = process.env.BACKEND_BASE_URL || "http://backend:4343/api/v1";

/**
 * Preconfigured Axios client for backend API calls.
 */
export const backendClient: AxiosInstance = axios.create({
  baseURL: backendBaseUrl,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

const serviceEmail: string = process.env.SERVICE_ACCOUNT_LOGIN || "service@example.com";
const servicePassword: string = process.env.SERVICE_ACCOUNT_PASSWORD || "secret";

let jwtToken: string | null = null;
let tokenExpiresAt: number | null = null; // epoch seconds

/**
 * Authenticate the service account and cache the JWT in memory.
 * Refresh window: 55 minutes by default.
 */
export async function loginServiceAccount(): Promise<void> {
  try {
    adkLogger.info("Logging in service account to backend", { serviceEmail });
    const response = await backendClient.post("/auth/email/login", {
      email: serviceEmail,
      password: servicePassword,
    });
    const token = response?.data?.token as string | undefined;
    if (!token) throw new Error("Login response missing token");
    jwtToken = token;
    const now = Math.floor(Date.now() / 1000);
    tokenExpiresAt = now + 55 * 60;
  } catch (error: any) {
    adkLogger.error("Service account login failed", { message: error?.message, status: error?.response?.status });
    throw error;
  }
}

/**
 * Return authorization headers, logging in if needed or token expired.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const now = Math.floor(Date.now() / 1000);
  if (!jwtToken || !tokenExpiresAt || now >= tokenExpiresAt) {
    await loginServiceAccount();
  }
  return { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` };
}

/**
 * Perform an authenticated request, retrying once on 401 by re-authenticating.
 */
export async function makeAuthenticatedRequest<T = any>(method: Method, url: string, config?: AxiosRequestConfig): Promise<T> {
  const headers = await getAuthHeaders();
  try {
    const res = await backendClient.request<T>({ method, url, ...config, headers: { ...headers, ...(config?.headers || {}) } });
    return res.data as T;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      // Force re-auth and retry once
      jwtToken = null;
      tokenExpiresAt = null;
      const retryHeaders = await getAuthHeaders();
      const res = await backendClient.request<T>({ method, url, ...config, headers: { ...retryHeaders, ...(config?.headers || {}) } });
      return res.data as T;
    }
    throw error;
  }
}
