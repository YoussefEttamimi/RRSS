import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from 'src/app/models/message';
import { SessionService } from 'src/app/services/session.service';
import { io } from 'socket.io-client';
import { MessageService } from 'src/app/services/message/message.service';
const socket = io('http://localhost:3800', { autoConnect: false });

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit, OnDestroy {
  public identity: any;
  public token: any;
  public messages: any;
  public message: Message;

  constructor(
    private _messageService: MessageService,
    private _sessionService: SessionService
  ) {
    this.identity = this._sessionService.getUser();
    this.token = this._sessionService.getToken();
    this.message = new Message('', '', '', '', this.identity._id, '');
  }

  ngOnInit() {
    this.getMessages();
    //Conectamos al servidor WS y escuchamos los eventos.
    socket.connect();
    socket.on('connect', () => {
      console.log('Conectado al servidor WS');
    });
    socket.emit('session_start', this.identity._id);
    socket.on('newMessageOK', (data) => {

    });
    socket.on('newMessageKO', (data) => {

    });
  }

  ngOnDestroy() {
    //Desconectamos y eliminamos los eventos.
    socket.disconnect();
    socket.off('connect');
    socket.off('newMessageOK');
    socket.off('newMessageKO');
  }

  getMessages() {
    // this._messageService.getReceivedMessages(this.token).subscribe({
    //   next: (response) => {
    //     this.messages = response.messages;
    //   },
    //   error: (err) => {},
    // });
  }

  sendMessage() {
    /*this._messageService.sendMessage(this.token, this.message).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {},
    });*/
    socket.emit('newMessage', this.token, this.message);
  }
}
