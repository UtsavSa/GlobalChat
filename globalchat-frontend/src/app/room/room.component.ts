

//-------------------


// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { SocketService } from '../services/socket.service';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-room',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './room.component.html',
//   styleUrls: ['./room.component.css'],
//   providers: [SocketService],
// })
// export class RoomComponent implements OnInit {
//   username: string = '';
//   messages: { user: string; text: string }[] = [];
//   newMessage: string = '';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private socketService: SocketService
//   ) {}

//   ngOnInit(): void {
//     this.route.queryParams.subscribe((params) => {
//       this.username = params['username'] || 'Anonymous';
//     });

//     this.socketService.fetchPreviousChats().subscribe((chats) => {
//       this.messages = chats;
//     });

//     this.socketService.onMessage().subscribe((message) => {
//       this.messages.push(message);
//     });
//   }

//   sendMessage(): void {
//     if (this.newMessage.trim()) {
//       const message = { user: this.username, text: this.newMessage.trim() };
//       this.socketService.sendMessage(message);
//       this.newMessage = '';
//     }
//   }

//   handleKeyDown(event: KeyboardEvent): void {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       this.sendMessage();
//     }
//   }

//   callUser(userToCall: string): void {
//     this.router.navigate(['/video', this.username, userToCall]);
//   }
// }

//----------------------------




// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { SocketService } from '../services/socket.service';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-room',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './room.component.html',
//   styleUrls: ['./room.component.css']
  
// })

// export class RoomComponent implements OnInit {
//   username: string = '';
//   messages: { user: string; text: string }[] = [];
//   newMessage: string = '';
//   incomingCall = false;
//   callerName = '';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private socketService: SocketService
//   ) {}

//   // ngOnInit(): void {
//   //   this.route.queryParams.subscribe((params) => {
//   //     this.username = params['username'] || 'Anonymous';
//   //     this.socketService.register(this.username);
      
//   //   });
//   ngOnInit(): void {
//   this.route.params.subscribe((params) => {
//     this.username = params['username'] || 'Anonymous';
//     this.socketService.register(this.username);
//     this.loadMessages();
//   });
  

//     this.socketService.fetchPreviousChats().subscribe((chats) => {
//       this.messages = chats;
//     });

//     this.socketService.onMessage().subscribe((message) => {
//       this.messages.push(message);
//     });

//     // ✅ Listen for signaling
//     this.socketService.onSignal().subscribe(({ from, data }) => {
//       console.log('📡 Incoming signal in RoomComponent:', from, data);
//       if (data.offer) {
//         this.incomingCall = true;
//         this.callerName = from;
//       }
//     });
//   }

//   callUser(userToCall: string): void {
//   const dummyOffer = { type: 'offer', sdp: 'dummy-offer-placeholder' };

//   this.socketService.sendSignal({
//     to: userToCall,
//     from: this.username,
//     data: { offer: dummyOffer }
//   });

//   console.log(`📞 Calling ${userToCall} with offer...`);
//   this.router.navigate(['/video', this.username, userToCall]);
// }


//   acceptCall(): void {
//     this.incomingCall = false;
//     this.router.navigate(['/video', this.username, this.callerName]);
//   }

//   declineCall(): void {
//     this.incomingCall = false;
//     this.callerName = '';
//   }

//   sendMessage(): void {
//     if (this.newMessage.trim()) {
//       this.socketService.sendMessage({
//         user: this.username,
//         text: this.newMessage.trim()
//       });
//       this.newMessage = '';
//     }
//   }

//   handleKeyDown(event: KeyboardEvent): void {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       this.sendMessage();
//     }
//   }
// }


//------------------------

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  username: string = '';
  messages: { user: string; text: string }[] = [];
  newMessage: string = '';
  incomingCall = false;
  callerName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    // When using /room/:username route
    this.route.params.subscribe((params) => {
      this.username = params['username'] || 'Anonymous';
      console.log(`👤 Username in RoomComponent: ${this.username}`);

      this.socketService.register(this.username);
      this.loadMessages();
    });

    this.socketService.onMessage().subscribe((message) => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.socketService.onSignal().subscribe(({ from, data }) => {
      console.log('📡 Incoming signal in RoomComponent:', from, data);
      if (data.offer) {
        this.incomingCall = true;
        this.callerName = from;
      }
    });
  }

  // ✅ Load chat history
  loadMessages(): void {
    this.messages = [];
    this.socketService.fetchPreviousChats().subscribe((chats) => {
      this.ngZone.run(() => {
        this.messages = chats;
        console.log('✅ Loaded previous messages:', chats);
        this.cdr.detectChanges();

        // Delay scroll until DOM is fully painted
        this.scrollToBottom();
      });
    });
}


  callUser(userToCall: string): void {
    const dummyOffer = { type: 'offer', sdp: 'dummy-offer-placeholder' };

    this.socketService.sendSignal({
      to: userToCall,
      from: this.username,
      data: { offer: dummyOffer }
    });

    console.log(`📞 Calling ${userToCall} with offer...`);
    this.router.navigate(['/video', this.username, userToCall]);
  }

  acceptCall(): void {
    this.incomingCall = false;
    this.router.navigate(['/video', this.username, this.callerName]);
  }

  declineCall(): void {
    this.incomingCall = false;
    this.callerName = '';
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.socketService.sendMessage({
        user: this.username,
        text: this.newMessage.trim()
      });
      this.newMessage = '';
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
  setTimeout(() => {
    const chatBox = document.querySelector('.chat-box') as HTMLElement;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
      console.log('🔽 Auto-scrolled after message');
    }
  }, 50);
}

}
