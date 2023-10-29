import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'src/types/socket.types';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true, path: process.env.SOCKET_PATH })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Socket;

  constructor(private readonly socketService: SocketService) {}

  handleDisconnect(socket: Socket) {
    this.socketService.handleDisconnect(socket);
  }

  handleConnection(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  ): void {
    this.socketService.handleConnection(socket);

    socket.on('getSettings', (data, callback) =>
      this.socketService.handleGetSettings(socket, data, callback),
    );

    socket.on('updateSettings', (data) =>
      this.socketService.handleUpdateSettings(socket, data),
    );

    socket.on('getState', (data, callback) =>
      this.socketService.handleGetState(socket, data, callback),
    );

    socket.on('run', () => this.socketService.handleRun(socket));

    socket.on('pause', () => this.socketService.handlePause(socket));
  }
}
