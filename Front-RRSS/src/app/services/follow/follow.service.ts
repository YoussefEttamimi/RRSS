import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from '../session.service';
import { GLOBAL } from '../global';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  private url: string;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) {
    this.url = GLOBAL.url;
  }


  public addFollow(id: string) {
    const params = {
      id: id,
    };
    return this._http.post(this.url + 'follow', params, {
      headers: this._sessionService.getHeaders()
     });
  }

}
