import { Logger, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway, SocketService, Logger],
  exports: [SocketService],
})
export class SocketModule {}
