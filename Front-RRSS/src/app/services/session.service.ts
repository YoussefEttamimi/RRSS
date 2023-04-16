import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Stats } from 'src/app/models/stats';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private user: Subject<User> = new Subject<User>();
  public user$ = this.user.asObservable();

  private token: Subject<string> = new Subject<string>();
  public token$ = this.token.asObservable();

  private stats: Subject<Stats> = new Subject<Stats>();
  public stats$ = this.stats.asObservable();

  constructor() {}

  init(): void {
    const user = this.getUser();
    const token = this.getToken();
    this.user.next(user);
    this.token.next(token);
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.user.next(user);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.token.next(token);
  }

  setStats(stats: Stats): void {
    localStorage.setItem('stats', JSON.stringify(stats));
    this.stats.next(stats);
  }


  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): any {
    return localStorage.getItem('token') || null;
  }

  getStats(): any {
    const stats = localStorage.getItem('stats');
    return stats ? JSON.parse(stats) : null;
  }

  getHeaders(isToken: boolean = false): HttpHeaders {
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/json'
    );
    if (isToken) {
      const token = this.getToken();
      if (token) {
        headers = headers.set(
          'Authorization',
          token
        );
      }
    }
    return headers;
  }


  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('stats');
    const user = this.getUser();
    this.user.next(user);
    const token = this.getToken();
    this.token.next(token);
    const stats = this.getStats();
    this.stats.next(stats);
  }

}
