import { Component } from '@angular/core';
import { io } from 'socket.io-client';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  socket: any;
  constructor() { }

}
