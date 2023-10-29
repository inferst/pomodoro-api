import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { createPomodoro, pomodoroDefaultValues } from 'src/pomodoro/pomodoro';
import { PomodoroTimer } from 'src/types/pomodoro.types';
import {
  GetSettingsCallback,
  GetSettingsData,
  GetStateCallback,
  GetStateData,
  UpdateSettingsData,
} from 'src/types/socket.types';

type ClientState = {
  socket: Socket;
  roomId?: string;
};

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, ClientState> = new Map();
  private readonly pomodoroTimers: Map<string, PomodoroTimer> = new Map();

  constructor(private readonly logger: Logger) {}

  handleDisconnect(socket: Socket): void {
    const client = this.connectedClients.get(socket.id);

    if (client.roomId) {
      socket.leave(client.roomId);
    }

    this.connectedClients.delete(socket.id);

    this.logger.log('disconnected');
  }

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, { socket });

    this.logger.log('connected');
  }

  async handleUpdateSettings(socket: Socket, data: UpdateSettingsData) {
    const client = this.connectedClients.get(socket.id);
    const pomodoroTimer = this.pomodoroTimers.get(client.roomId);

    if (!pomodoroTimer) {
      return;
    }

    pomodoroTimer?.finish();

    const updatedTimer = createPomodoro({
      focusDuration: data.focusDuration,
      longBreakDuration: data.longBreakDuration,
      shortBreakDuration: data.shortBreakDuration,
      rounds: data.rounds,
      onStatusUpdate: (state) => {
        this.emitToRoom(socket, client.roomId, 'updateState', state);
      },
    });

    this.pomodoroTimers.set(client.roomId, updatedTimer);

    const state = this.pomodoroTimers.get(client.roomId).getState();

    this.emitToRoom(socket, client.roomId, 'updateState', state);

    this.logger.log('update settings');
  }

  async handleGetState(
    socket: Socket,
    data: GetStateData,
    callback: GetStateCallback,
  ) {
    const client = this.connectedClients.get(socket.id);
    const roomId = data.roomId;

    if (!roomId) {
      return;
    }

    if (!client.roomId) {
      await socket.join(roomId);
      this.connectedClients.set(socket.id, { ...client, roomId });
    }

    const pomodorTimer = this.pomodoroTimers.get(roomId);

    if (pomodorTimer) {
      const state = pomodorTimer.getState();
      callback(state);
    }

    this.logger.log('get state');
  }

  handleRun(socket: Socket) {
    const client = this.connectedClients.get(socket.id);
    const pomodoroTimer = this.pomodoroTimers.get(client.roomId);

    if (!pomodoroTimer) {
      return;
    }

    pomodoroTimer.run();

    const state = pomodoroTimer.getState();

    this.emitToRoom(socket, client.roomId, 'updateState', state);

    this.logger.log('run');
  }

  handlePause(socket: Socket) {
    const client = this.connectedClients.get(socket.id);
    const pomodoroTimer = this.pomodoroTimers.get(client.roomId);

    if (!pomodoroTimer) {
      return;
    }

    pomodoroTimer.pause();

    const state = pomodoroTimer.getState();

    this.emitToRoom(socket, client.roomId, 'updateState', state);

    this.logger.log('pause');
  }

  async handleGetSettings(
    socket: Socket,
    data: GetSettingsData,
    callback: GetSettingsCallback,
  ): Promise<void> {
    const client = this.connectedClients.get(socket.id);
    const roomId = data.roomId;

    if (!roomId) {
      return;
    }

    if (!client.roomId) {
      await socket.join(roomId);
      this.connectedClients.set(socket.id, { ...client, roomId });
    }

    let pomodoroTimer = this.pomodoroTimers.get(roomId);

    if (!pomodoroTimer) {
      pomodoroTimer = createPomodoro({
        focusDuration: pomodoroDefaultValues.focusDuration,
        longBreakDuration: pomodoroDefaultValues.longBreakDuration,
        shortBreakDuration: pomodoroDefaultValues.shortBreakDuration,
        rounds: pomodoroDefaultValues.rounds,
        onStatusUpdate: (state) => {
          this.emitToRoom(socket, client.roomId, 'updateState', state);
        },
      });

      this.pomodoroTimers.set(roomId, pomodoroTimer);
    }

    callback(pomodoroTimer.getSettings(), pomodoroTimer.getState());

    this.logger.log('get settings');
  }

  private emitToRoom<T>(socket: Socket, roomId: string, name: string, data: T) {
    socket.emit(name, data);
    socket.broadcast.to(roomId).emit(name, data);
  }
}
