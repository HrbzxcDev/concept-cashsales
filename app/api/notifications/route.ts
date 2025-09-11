import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '@/actions/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'mark-all-read') {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
    }

    if (action === 'mark-read') {
      const notificationId = searchParams.get('id');
      if (!notificationId) {
        return NextResponse.json(
          { success: false, error: 'Notification ID is required' },
          { status: 400 }
        );
      }

      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
    }

    // Default: get all active notifications
    const result = await getActiveNotifications();
    if (result.success) {
      return NextResponse.json({
        success: true,
        notifications: result.notifications
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
