import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    redirectLink?: string;
  }) {
    // 1. Save to DB
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        redirectLink: data.redirectLink,
        read: false,
      },
    });

    // 2. Emit via WebSocket
    this.notificationsGateway.sendNotificationToUser(data.userId, notification);

    return notification;
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // limit to 50 recent notifications
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
