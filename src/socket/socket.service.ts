import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Pomodoro, createPomodoro } from 'src/pomodoro/pomodoro';

type ClientState = {
  socket: Socket;
  roomId?: string;
};

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, ClientState> = new Map();
  private readonly pomodoroStates: Map<string, Pomodoro> = new Map();

  private socket: Socket;

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, { socket });

    this.socket = socket;

    socket.on('disconnect', () => {
      console.log('disconnected');
      const clientState = this.connectedClients.get(clientId);

      if (clientState.roomId) {
        socket.leave(clientState.roomId);
      }

      this.connectedClients.delete(clientId);
    });

    socket.on('server_init', async (data) => {
      const clientState = this.connectedClients.get(clientId);

      const roomId = data.roomId;
      if (!clientState.roomId) {
        await socket.join(roomId);
        this.connectedClients.set(clientId, { ...clientState, roomId });
      }

      const pomodoroState = this.pomodoroStates.get(roomId);

      if (!pomodoroState) {
        pomodoroState?.clearTimer();

        this.pomodoroStates.set(
          roomId,
          createPomodoro({
            focusDuration: data.focusDuration,
            longBreakDuration: data.longBreakDuration,
            shortBreakDuration: data.shortBreakDuration,
            rounds: data.rounds,
            onUpdateState: (state) => {
              socket.emit('client_update', { ...state, isFinished: true });
              socket.broadcast
                .to(roomId)
                .emit('client_update', { ...state, isFinished: true });
            },
          }),
        );
      }

      console.log('server_init', data);
    });

    socket.on('server_update', async (data) => {
      const clientState = this.connectedClients.get(clientId);
      const pomodoroState = this.pomodoroStates.get(clientState.roomId);

      pomodoroState?.clearTimer();

      this.pomodoroStates.set(
        clientState.roomId,
        createPomodoro({
          focusDuration: data.focusDuration,
          longBreakDuration: data.longBreakDuration,
          shortBreakDuration: data.shortBreakDuration,
          rounds: data.rounds,
          onUpdateState: (state) => {
            socket.emit('client_update', { ...state, isFinished: true });
            socket.broadcast
              .to(clientState.roomId)
              .emit('client_update', { ...state, isFinished: true });
          },
        }),
      );

      const state = this.pomodoroStates.get(clientState.roomId).getState();

      socket.emit('client_update', state);
      socket.broadcast.to(clientState.roomId).emit('client_update', state);

      console.log('server_update', data);
    });

    socket.on('server_get', async (data, callback) => {
      const clientState = this.connectedClients.get(clientId);

      const roomId = data.roomId;
      if (!clientState.roomId) {
        await socket.join(roomId);
        this.connectedClients.set(clientId, { ...clientState, roomId });
      }

      const pomodoroState = this.pomodoroStates.get(roomId);

      if (pomodoroState) {
        const state = pomodoroState.getState();
        callback(state);
      }

      console.log('server_get');
    });

    socket.on('server_toggle', (play) => {
      const clientState = this.connectedClients.get(clientId);
      const pomodoroState = this.pomodoroStates.get(clientState.roomId);

      console.log(play);

      if (play) {
        pomodoroState.start();
      } else {
        pomodoroState.clearTimer();
      }

      const state = pomodoroState.getState();

      socket.emit('client_update', state);
      socket.broadcast.to(clientState.roomId).emit('client_update', state);

      console.log('server_toggle', state);
    });

    console.log('connected');
  }
}
