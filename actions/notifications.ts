import { db } from '@/utils/db/drizzle';
import { notificationsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export interface NotificationData {
  type: 'skipped_cashsalescode' | 'general';
  title: string;
  message: string;
  data?: any;
}

export async function saveNotification(notification: NotificationData) {
  try {
    const result = await db
      .insert(notificationsTable)
      .values({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null,
        isRead: false,
        isActive: true
      })
      .returning();

    return { success: true, notification: result[0] };
  } catch (error) {
    console.error('Failed to save notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getActiveNotifications() {
  try {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.isActive, true))
      .orderBy(notificationsTable.createdAt);

    return { success: true, notifications };
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notificationsTable.id, notificationId));

    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notificationsTable.isActive, true));

    return { success: true };
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
