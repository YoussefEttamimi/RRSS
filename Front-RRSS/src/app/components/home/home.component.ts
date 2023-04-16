import { Component } from '@angular/core';
import { io } from 'socket.io-client';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  socket: any;
  constructor() {
    this.socket = io('http://localhost:3800');

    this.socket.on('connect', () => {
      console.log('Conexión establecida');
    });

    this.socket.on('message', (data: string) => {
      console.log('Mensaje recibido: ', data);
    });

  }

}
