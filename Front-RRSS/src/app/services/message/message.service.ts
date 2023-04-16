import { Injectable } from '@angular/core';
import { GLOBAL } from '../global';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private url;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
    this.url = GLOBAL.url;
  }

  public getReceivedMessages(token: any) {
    return this._http.get(this.url + 'messages/received', {
      headers: this._sessionService.getHeaders(token),
    });
  }
}
