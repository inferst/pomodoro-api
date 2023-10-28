import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true, path: '/api' })
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;

  constructor(private readonly socketService: SocketService) {
    console.log('constructor');
    // this.server.emit('message', {
    //   name: tags['display-name'],
    //   userId: tags['user-id'],
    //   message: message,
    // });
  }

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }
}
