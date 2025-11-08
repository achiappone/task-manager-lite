import { useEffect, useRef } from "react";
import type { BoardState } from "../types";
import { useStore, selectBoardState, replaceBoardState } from "../store";
import {
  createBackup,
  fetchLatestBackup,
  isCloudBackupConfigured,
} from "../lib/cloudBackup";

const AUTO_BACKUP_DELAY_MS = 90_000; // 90 seconds

const useInitialRestore = () => {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (!isCloudBackupConfigured()) return;
    attemptedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const payload = await fetchLatestBackup();
        if (cancelled || !payload) return;
        replaceBoardState(payload);
      } catch (error) {
        console.error("[cloud-backup] Initial restore failed.", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
};

const useAutoBackup = () => {
  useEffect(() => {
    if (!isCloudBackupConfigured()) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let pendingState: BoardState | null = null;
    let busy = false;
    let cancelled = false;

    const flush = async () => {
      if (!pendingState || busy || cancelled) return;
      busy = true;
      const snapshot = pendingState;
      pendingState = null;
      try {
        await createBackup(snapshot);
      } catch (error) {
        console.error("[cloud-backup] Auto backup failed.", error);
      } finally {
        busy = false;
      }
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void flush();
      }, AUTO_BACKUP_DELAY_MS);
    };

    const unsubscribe = useStore.subscribe((state, previousState) => {
      if (
        previousState &&
        state.columns === previousState.columns &&
        state.tasks === previousState.tasks
      ) {
        return;
      }
      pendingState = selectBoardState(state);
      schedule();
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);
};

export const useCloudBackupLifecycle = () => {
  useInitialRestore();
  useAutoBackup();
};
