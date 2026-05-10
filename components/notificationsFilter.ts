import type { Notification, NotificationPreferences } from "./types";

export function filterNotificationsByPreferences(
  list: Notification[],
  prefs: NotificationPreferences
): Notification[] {
  return list.filter((n) => {
    if (!prefs.expiryAlerts && n.type === "warning") return false;
    if (!prefs.friendActivity && n.type === "info") return false;
    if (!prefs.weeklyDigest && n.type === "success") return false;
    return true;
  });
}
