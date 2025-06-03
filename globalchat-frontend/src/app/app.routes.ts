// app.routes.ts
// app.routes.ts
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { RoomComponent } from './room/room.component';
import { VideoRoomComponent } from './video-room/video-room.component';

export const routes: Routes = [
  { path: '', redirectTo: 'lobby', pathMatch: 'full' },
  { path: 'lobby', component: LobbyComponent },
  { path: 'room/:username', component: RoomComponent },
  { path: 'video/:caller/:callee', component: VideoRoomComponent },
  { path: 'video', component: VideoRoomComponent },
];
