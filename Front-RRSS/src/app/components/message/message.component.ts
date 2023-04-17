import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from 'src/app/models/message';
import { SessionService } from 'src/app/services/session.service';
import { MessagesService } from 'src/app/services/message/message.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  providers: [MessageService],
})
export class MessageComponent implements OnInit, OnDestroy {
  public identity: any;
  public token: any;
  public messages: any;
  public message: Message;
  private socket: any;

  constructor(
    private _messagesService: MessagesService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.identity = this._sessionService.getUser();
    this.token = this._sessionService.getToken();
    this.socket = this._messagesService.connectSocket();
    this.message = new Message('', '', '', '', this.identity._id, '');
  }
  ngOnInit() {
    this.getMessages();

    //Conectamos al servidor WS y escuchamos los eventos.
    this.socket.connect();
    this.socket.on('connect', () => {});
    this.socket.emit('session_start', this.identity._id);
    this.socket.on('newMessageOK', (data: any) => {
      this.messages.push(data);
    });
    this.socket.on('newMessageKO', (data: any) => {
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: data,
      });
    });
  }

  ngOnDestroy() {
    //Desconectamos y eliminamos los eventos.
    this.socket.disconnect();
    this.socket.off('connect');
    this.socket.off('newMessageOK');
    this.socket.off('newMessageKO');
  }

  getMessages() {
    this._messagesService.getMessages().subscribe({
      next: (response) => {
        this.messages = response.messages;
      },
      error: (err) => {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      },
    });
  }

  sendMessage() {
    this.socket.emit('newMessage', this.token, this.message);
  }
}
