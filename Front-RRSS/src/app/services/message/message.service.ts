import { Injectable } from '@angular/core';
import { GLOBAL } from '../global';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../session.service';
import { io } from 'socket.io-client';
import { Message } from 'src/app/models/message';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private url;
  private socketUrl;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
    this.url = GLOBAL.url;
    this.socketUrl = GLOBAL.urlSocket;

  }

  public connectSocket() {
    return io(this.socketUrl, { autoConnect: false });
  }

  public getReceivedMessages(token: any) {
    return this._http.get(this.url + 'messages/received', {
      headers: this._sessionService.getHeaders(token),
    });
  }
  sendMessage(message: Message): Observable<any> {
    let params = JSON.stringify(message);

    return this._http.post(this.url + 'message', params, {
      headers: this._sessionService.getHeaders(true),
    });
  }

  getMessages(): Observable<any> {
    return this._http.get(this.url + 'messages', {
      headers: this._sessionService.getHeaders(true),
    });
  }
}
