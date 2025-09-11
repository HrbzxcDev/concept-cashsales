import { NextRequest, NextResponse } from 'next/server';
import { saveNotification } from '@/actions/notifications';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'skipped_cashsalescode';

    let notification;

    if (testType === 'skipped_cashsalescode') {
      notification = {
        type: 'skipped_cashsalescode' as const,
        title: '⚠️ Test: Skipped Cash Sales Codes Detected',
        message:
          'Test notification: Found 3 missing cash sales codes: CS001, CS003, CS005',
        data: {
          totalMissing: 3,
          missingCodes: ['CS001', 'CS003', 'CS005'],
          timestamp: new Date().toISOString()
        }
      };
    } else {
      notification = {
        type: 'general' as const,
        title: 'ℹ️ Test Notification',
        message: 'This is a test notification to verify the system is working.',
        data: {
          timestamp: new Date().toISOString()
        }
      };
    }

    const result = await saveNotification(notification);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification created successfully',
        notification: result.notification
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
