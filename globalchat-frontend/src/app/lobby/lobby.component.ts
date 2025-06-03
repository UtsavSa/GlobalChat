// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-lobby',
//   imports: [],
//   templateUrl: './lobby.component.html',
//   styleUrl: './lobby.component.css'
// })
// export class LobbyComponent {

// }

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent {
  username: string = '';

  constructor(private router: Router) {}

  joinRoom() {
    if (this.username.trim()) {
      this.router.navigate(['/room', this.username]);
    } else {
      alert('Please enter a username!');
    }
  }
}
