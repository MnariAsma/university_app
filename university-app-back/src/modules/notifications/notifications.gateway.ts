import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      let token = '';
      const authHeader = client.handshake.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (client.handshake.auth && client.handshake.auth.token) {
        token = client.handshake.auth.token;
      }

      if (token) {
        const decoded = this.jwtService.verify(token);
        
        // Join a room specific to this user
        client.join(`user_${decoded.sub}`);
        console.log(`Client connected and joined room user_${decoded.sub}: ${client.id}`);
      } else {
        client.disconnect();
      }
    } catch (error: any) {
      console.log('WebSocket connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Method to be called by NotificationsService
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }
}
