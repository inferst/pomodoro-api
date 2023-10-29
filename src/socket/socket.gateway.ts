import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true, path: process.env.SOCKET_PATH })
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;

  constructor(private readonly socketService: SocketService) {
    console.log('constructor');
  }

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }
}
