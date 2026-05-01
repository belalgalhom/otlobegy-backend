import { Injectable, Logger } from '@nestjs/common';
import { RedisPubSubService } from '../redis/redis-pubsub.service';

export interface SocketPayload {
  room: string;
  event: string;
  data: unknown;
}

const SOCKET_CHANNEL = 'socket:emit';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  constructor(private readonly pubsub: RedisPubSubService) {}

  private async publish(payload: SocketPayload) {
    try {
      await this.pubsub.publish(SOCKET_CHANNEL, JSON.stringify(payload));
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(
          `Failed to publish socket event [${payload.event}]: ${err.message}`,
        );
      } else {
        this.logger.error(
          `Failed to publish socket event [${payload.event}]: ${String(err)}`,
        );
      }
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    return this.publish({ room: `user_${userId}`, event, data });
  }

  emitToRoom(room: string, event: string, data: unknown) {
    return this.publish({ room, event, data });
  }

  broadcast(event: string, data: unknown) {
    return this.publish({ room: '__broadcast__', event, data });
  }

  emitToSocket(socketId: string, event: string, data: unknown) {
    return this.publish({ room: socketId, event, data });
  }

  joinRoom(socketId: string, room: string) {
    return this.publish({ room: '__join__', event: socketId, data: room });
  }

  leaveRoom(socketId: string, room: string) {
    return this.publish({ room: '__leave__', event: socketId, data: room });
  }
}
