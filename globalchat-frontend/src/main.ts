// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));

//--------------------------------------


// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter, Routes } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';
// import { AppComponent } from './app/app.component';
// import { LobbyComponent } from './app/lobby/lobby.component';
// import { RoomComponent } from './app/room/room.component';
// import { VideoRoomComponent } from './app/video-room/video-room.component';

// const routes: Routes = [
//   { path: '', component: LobbyComponent },
//   { path: 'room', component: RoomComponent },
//   { path: 'video', component: VideoRoomComponent },
// ];

// bootstrapApplication(AppComponent, {
//   providers: [provideRouter(routes), provideHttpClient()],
// }).catch(err => console.error(err));


import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // ✅ Use this

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
}).catch(err => console.error(err));
