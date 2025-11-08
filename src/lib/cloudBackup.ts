import type { BoardState } from "../types";

const DEFAULT_API_BASE = "https://api.anthonychiappone.com";
export const CLOUD_BACKUP_PROFILE = "task-manager-lite";
export const CLOUD_BACKUP_USER_ID = "00000000-0000-0000-0000-000000000001";

const API_BASE = (import.meta.env.VITE_BACKUP_API_BASE ?? DEFAULT_API_BASE).replace(
  /\/+$/,
  ""
);

const API_KEY = import.meta.env.VITE_BACKUP_API_KEY;

type BackupRecord = {
  id: string;
  profile: string;
  userId: string;
  payload: BoardState | null;
  createdAt: string;
};

type BackupRequestBody = {
  profile: string;
  userId: string;
  payload: BoardState;
};

const commonHeaders = (): HeadersInit => {
  if (!API_KEY) {
    throw new Error("Cloud backup API key is missing. Set VITE_BACKUP_API_KEY.");
  }

  return {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data.message || data.error)) ?? res.statusText;
    throw new Error(message || "Cloud backup request failed.");
  }
  return data;
};

const buildUrl = (path: string, search?: string) =>
  `${API_BASE}${path}${search ? `?${search}` : ""}`;

export const isCloudBackupConfigured = (): boolean => Boolean(API_KEY);

export const createBackup = async (payload: BoardState): Promise<BackupRecord> => {
  const res = await fetch(buildUrl("/v1/state-backups"), {
    method: "POST",
    headers: commonHeaders(),
    body: JSON.stringify({
      profile: CLOUD_BACKUP_PROFILE,
      userId: CLOUD_BACKUP_USER_ID,
      payload,
    } satisfies BackupRequestBody),
  });

  return (await handleResponse(res)) as BackupRecord;
};

export const fetchLatestBackup = async (): Promise<BoardState | null> => {
  if (!API_KEY) throw new Error("Cloud backup API key is missing. Set VITE_BACKUP_API_KEY.");

  const search = new URLSearchParams({
    profile: CLOUD_BACKUP_PROFILE,
  }).toString();

  const res = await fetch(buildUrl("/v1/state-backups/latest", search), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...commonHeaders(),
    },
  });

  if (res.status === 404) {
    return null;
  }

  const record = (await handleResponse(res)) as BackupRecord;
  return record?.payload ?? null;
};
