import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { GLOBAL } from '../global';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
    this.url = GLOBAL.url;
  }

  public register(_user: User): Observable<any> {
    let params = JSON.stringify(_user);
    return this._http.post(this.url + 'register', params, {
      headers: this._sessionService.getHeaders(),
    });
  }

  public login(_user: User, getToken: boolean = false): Observable<any> {
    let params = {
      email: _user.email,
      password: _user.password,
      getToken: getToken,
    };
    return this._http.post(this.url + 'login', params, {
      headers: this._sessionService.getHeaders(),
    });
  }

  public editUser(_user: User): Observable<any> {
    let params = JSON.stringify(_user);
    return this._http.put(this.url + 'user/update/' + _user._id, params, {
      headers: this._sessionService.getHeaders(true),
    });
  }

  public getCounters(userId?: string): Observable<any> {
    if (userId) {
      return this._http.get(this.url + 'usercounters/' + userId, {
        headers: this._sessionService.getHeaders(true),
      });
    } else {
      return this._http.get(this.url + 'usercounters', {
        headers: this._sessionService.getHeaders(true),
      });
    }
  }

  public getUser(userId: string): Observable<any> {
    return this._http.get(this.url + 'user/' + userId, {
      headers: this._sessionService.getHeaders(true),
    });
  }

  public getUsers(page: number = 1): Observable<any> {
    return this._http.get(this.url + 'users/' + page, {
      headers: this._sessionService.getHeaders(true),
    });
  }
}
