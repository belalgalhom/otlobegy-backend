import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { JWT_ACCESS_SERVICE } from '../../common/constants/jwt.constants';
import { RedisPubSubService } from '../redis/redis-pubsub.service';
import { SocketPayload } from './socket.service';

const SOCKET_CHANNEL = 'socket:emit';

@WebSocketGateway({
  namespace: 'events',
  cors: { origin: '*' },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    @Inject(JWT_ACCESS_SERVICE)
    private readonly jwtService: JwtService,
    private readonly pubsub: RedisPubSubService,
  ) {}

  afterInit(server: Server) {
    this.pubsub.subscribe(SOCKET_CHANNEL, (message) => {
      try {
        const payload: SocketPayload = JSON.parse(message);
        this.handleRedisMessage(payload);
      } catch (err) {
        if (err instanceof Error) {
          this.logger.error(`Failed to parse socket payload: ${err.message}`);
        } else {
          this.logger.error(`Failed to parse socket payload: ${String(err)}`);
        }
      }
    });

    server.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Unauthorized'));

        const payload = this.jwtService.verify(token);
        socket.data.user = payload;
        socket.join(`user_${payload.sub}`);
        next();
      } catch (err) {
        if (err instanceof Error) {
          this.logger.warn(`WS auth failed: ${err.message}`);
        } else {
          this.logger.warn(`WS auth failed: ${String(err)}`);
        }
        next(new Error('Unauthorized'));
      }
    });
  }

  private handleRedisMessage({ room, event, data }: SocketPayload) {
    if (room === '__broadcast__') {
      this.server.emit(event, data);
      return;
    }

    if (room === '__join__') {
      this.server.in(event).socketsJoin(data as string);
      return;
    }

    if (room === '__leave__') {
      this.server.in(event).socketsLeave(data as string);
      return;
    }

    this.server.to(room).emit(event, data);
  }

  handleConnection(client: Socket) {
    this.logger.log(`✅ Client Connected: ${client.data.user?.sub} (${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client Disconnected: ${client.data.user?.sub ?? 'unknown'} (${client.id})`);
  }
}