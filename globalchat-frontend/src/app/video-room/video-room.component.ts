// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-video-room',
//   imports: [],
//   templateUrl: './video-room.component.html',
//   styleUrl: './video-room.component.css'
// })
// export class VideoRoomComponent {

// }




import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-video-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
  providers: [SocketService],
})
export class VideoRoomComponent implements OnInit {
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  caller = '';
  callee = '';
  peerConnection!: RTCPeerConnection;
  localStream!: MediaStream;
  rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.caller = params.get('caller') || '';
      this.callee = params.get('callee') || '';

      console.log(`📞 ${this.caller} is on video call with ${this.callee}`);

      this.socketService.register(this.caller);

      await this.setupPeerConnection(this.callee);

      // Start the call only if this user is the caller
      if (this.callerInitiated()) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.socketService.sendSignal({
          to: this.callee,
          from: this.caller,
          data: { offer },
        });
      }
    });

    this.socketService.onSignal().subscribe(async ({ from, data }) => {
      console.log('📡 Signal received in video-room:', data);

      if (data.offer) {
        console.log('🟡 Offer received');
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socketService.sendSignal({
          to: from,
          from: this.caller,
          data: { answer },
        });
      }

      if (data.answer) {
        console.log('🟢 Answer received');
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }

      if (data.candidate) {
        console.log('🔵 ICE candidate received');
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    });
  }

  async setupPeerConnection(remoteUser: string) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.peerConnection.ontrack = (event) => {
      this.remoteVideoRef.nativeElement.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.sendSignal({
          to: remoteUser,
          from: this.caller,
          data: { candidate: event.candidate },
        });
      }
    };

    this.localVideoRef.nativeElement.srcObject = this.localStream;
  }

  callerInitiated(): boolean {
    // Simple logic: whoever pressed the call button is the caller
    // This assumes caller's name is passed via router params
    return !!this.caller && !!this.callee;
  }

  endCall(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.router.navigate(['/room', this.caller]);  // or this.username if defined locally
  }
}
