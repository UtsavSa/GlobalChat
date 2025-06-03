// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {
//   private socket: Socket;

//   constructor() {
//     // Connect to the backend Socket.IO server
//     //this.socket = io('http://localhost:3300'); // Update this URL if backend runs elsewhere
//     this.socket = io('https://bc5b-2600-1700-6f27-35b0-cd3e-ec4c-96f7-52bb.ngrok-free.app');


//   }

//   // Emit a message
//   sendMessage(message: any): void {
//     this.socket.emit('newMessage', message);
//   }

//   // Listen for incoming messages
//   onMessage(): Observable<any> {
//     return new Observable((observer) => {
//       this.socket.on('messageReceived', (data) => {
//         observer.next(data);
//       });
//     });
//   }

//   // Fetch previous chats
//   fetchPreviousChats(): Observable<any[]> {
//     return new Observable((observer) => {
//       this.socket.on('previousChats', (data) => {
//         observer.next(data);
//       });
//     });
//   }
// }

//-----------------------------------------



// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {
//   private socket: Socket;

//   constructor() {
//     // Replace this URL with your actual backend Ngrok URL
//     this.socket = io("http://localhost:3300/");

//     // ✅ Log when socket connects
//     this.socket.on('connect', () => {
//       console.log('✅ Connected to Socket.IO server. Socket ID:', this.socket.id);
//     });

//     // ❌ Log connection errors
//     this.socket.on('connect_error', (err) => {
//       console.error('❌ Connection error:', err.message);
//     });

//     // ✅ Log disconnection
//     this.socket.on('disconnect', (reason) => {
//       console.warn('⚠️ Disconnected from server. Reason:', reason);
//     });

//     // ✅ Optional: log reconnection attempts
//     this.socket.io.on('reconnect_attempt', () => {
//       console.log('🔁 Attempting to reconnect...');
//     });
//   }

//   // Emit a message
//   sendMessage(message: any): void {
//     console.log('📤 Sending message:', message);
//     this.socket.emit('newMessage', message);
//   }

//   // Listen for incoming messages
//   onMessage(): Observable<any> {
//     return new Observable((observer) => {
//       this.socket.on('messageReceived', (data) => {
//         console.log('📥 Message received:', data);
//         observer.next(data);
//       });
//     });
//   } 

//   // Fetch previous chats
//   fetchPreviousChats(): Observable<any[]> {
//   return new Observable((observer) => {
//     console.log('🛰 Subscribed to previousChats...');
//     this.socket.emit('requestPreviousChats');  // 💡 proactively ask
//     this.socket.on('previousChats', (data) => {
//       console.log('📨 Received previousChats:', data);
//       observer.next(data);
//     });
//   });
// }


//   sendSignal(data: { to: string; from: string; data: any }) {
//   this.socket.emit('signal', data);
// }

// onSignal(): Observable<any> {
//   return new Observable(observer => {
//     this.socket.on('signal', (data) => {
//       console.log('📡 Signal received in service:', data); // ✅ ADD THIS
//       observer.next(data);
//     });
//   });
// }


// register(username: string) {
//   console.log(`📲 Registering username with socket server: ${username}`);
//   this.socket.emit('register', username);
//   setTimeout(() => {
//     this.socket.emit('requestPreviousChats');
//   }, 100);
// }



// }



import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private previousChatsObserver: ((data: any[]) => void) | null = null;

  constructor() {
    // Replace with your server URL or Ngrok URL
    //this.socket = io('http://localhost:3300/');
    this.socket = io();

    // ✅ Log successful connection
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server. Socket ID:', this.socket.id);
    });

    // ❌ Log connection error
    this.socket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
    });

    // ⚠️ Log disconnection
    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Disconnected from server. Reason:', reason);
    });

    // 🔁 Optional: log reconnection
    this.socket.io.on('reconnect_attempt', () => {
      console.log('🔁 Attempting to reconnect...');
    });

    // 📨 Handle incoming previousChats only once
    this.socket.on('previousChats', (data) => {
      console.log('📨 Received previousChats:', data);
      if (this.previousChatsObserver) {
        this.previousChatsObserver(data);
        this.previousChatsObserver = null; // prevent reuse
      }
    });
  }

  // ✅ Register user
  register(username: string): void {
    console.log(`📲 Registering username with socket server: ${username}`);
    this.socket.emit('register', username);

    // Optional delay to wait for backend to process registration
    setTimeout(() => {
      this.socket.emit('requestPreviousChats');
    }, 100);
  }

  // ✅ Send a new message
  sendMessage(message: any): void {
    console.log('📤 Sending message:', message);
    this.socket.emit('newMessage', message);
  }

  // ✅ Listen for new messages
  onMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('messageReceived', (data) => {
        console.log('📥 Message received:', data);
        observer.next(data);
      });
    });
  }

  // ✅ Fetch chat history (with safe listener handling)
  fetchPreviousChats(): Observable<any[]> {
    return new Observable((observer) => {
      console.log('🛰 Requesting previous chats...');
      this.previousChatsObserver = (data: any[]) => {
        observer.next(data);
      };
      this.socket.emit('requestPreviousChats');
    });
  }

  // ✅ Send WebRTC signal
  sendSignal(data: { to: string; from: string; data: any }): void {
    this.socket.emit('signal', data);
  }

  // ✅ Listen for WebRTC signal
  onSignal(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('signal', (data) => {
        console.log('📡 Signal received in service:', data);
        observer.next(data);
      });
    });
  }
}
