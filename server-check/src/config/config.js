import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT || 4000);
export const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
export const VALKEY_URL = process.env.VALKEY_URL || "valkey://localhost:6379";
export const SESSION_TTL = Number(process.env.SESSION_TTL || 24 * 60 * 60);
export const OIDC_ISSUER = process.env.OIDC_ISSUER || "http://localhost:8000";
export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || "";
export const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || `${APP_BASE_URL}/`;
export const API_RATE_LIMIT = Number(process.env.API_RATE_LIMIT || 40);
export const API_RATE_WINDOW = Number(process.env.API_RATE_WINDOW || 10);
export const SOCKET_RATE_LIMIT = Number(process.env.SOCKET_RATE_LIMIT || 12);
export const SOCKET_RATE_WINDOW = Number(process.env.SOCKET_RATE_WINDOW || 10);
export const CHECK_EVENT_CHANNEL = "checkbox-updates";
export const CHECK_STATE_KEY = "checkbox:checked";
export const SESSION_PREFIX = "session:";
export const RATE_PREFIX = "rate:";
export const CHECKBOX_GRID_SIZE = Number(process.env.CHECKBOX_GRID_SIZE || 10000);
