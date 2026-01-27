import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { showNotification } from '@/app/lib/notifications';

/**
 * Laundry Reminder Scheduler
 * 
 * POST /api/reminders - Check laundry and send reminders
 * 
 * Checks items in laundry state and sends notifications if:
 * - Items have been in laundry for > 3 days (configurable)
 * - User has notifications enabled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const daysThreshold = body.daysThreshold || 3;

    // Find items in laundry state
    const laundryItems = await prisma.item.findMany({
      where: {
        state: 'laundry',
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (laundryItems.length === 0) {
      return NextResponse.json({
        message: 'No items in laundry',
        itemsChecked: 0,
        remindersSent: 0,
      });
    }

    // Check which items have been in laundry for too long
    const now = new Date();
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
    
    const oldLaundryItems = laundryItems.filter(item => {
      const timeSinceUpdate = now.getTime() - new Date(item.updatedAt).getTime();
      return timeSinceUpdate > thresholdMs;
    });

    if (oldLaundryItems.length === 0) {
      return NextResponse.json({
        message: 'No items overdue',
        itemsChecked: laundryItems.length,
        remindersSent: 0,
      });
    }

    // Send notification
    const maxItemsToShow = 5;
    const itemTitles = oldLaundryItems
      .slice(0, maxItemsToShow)
      .map(item => item.title || `Item ${item.id.slice(0, 8)}`)
      .join(', ');
    
    const remainingCount = oldLaundryItems.length - maxItemsToShow;
    const itemList = remainingCount > 0 
      ? `${itemTitles} and ${remainingCount} more`
      : itemTitles;

    const notificationSent = await showNotification({
      title: '🧺 Laundry Reminder',
      body: `You have ${oldLaundryItems.length} item(s) in laundry for over ${daysThreshold} days: ${itemList}`,
      tag: 'laundry-reminder',
    });

    return NextResponse.json({
      message: 'Reminder sent',
      itemsChecked: laundryItems.length,
      remindersSent: notificationSent ? 1 : 0,
      items: oldLaundryItems.map(item => ({
        id: item.id,
        title: item.title,
        daysSinceUpdate: Math.floor(
          (now.getTime() - new Date(item.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
        ),
      })),
    });
  } catch (error) {
    console.error('Error in laundry reminder:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check laundry reminders',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reminders - Check laundry status without sending notification
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysThreshold = parseInt(searchParams.get('daysThreshold') || '3');

    const laundryItems = await prisma.item.findMany({
      where: {
        state: 'laundry',
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    const now = new Date();
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
    
    const itemsWithDays = laundryItems.map(item => ({
      id: item.id,
      title: item.title,
      daysSinceUpdate: Math.floor(
        (now.getTime() - new Date(item.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
      ),
      overdue: (now.getTime() - new Date(item.updatedAt).getTime()) > thresholdMs,
    }));

    const overdueItems = itemsWithDays.filter(item => item.overdue);

    return NextResponse.json({
      total: laundryItems.length,
      overdue: overdueItems.length,
      threshold: daysThreshold,
      items: itemsWithDays,
    });
  } catch (error) {
    console.error('Error checking laundry:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check laundry status',
        },
      },
      { status: 500 }
    );
  }
}
