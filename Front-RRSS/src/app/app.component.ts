import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './services/user/user.service';
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { SessionService } from './services/session.service';
import { Subscription } from 'rxjs';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public items: MenuItem[];
  private _user: Subscription;


  constructor(
    private _sessionService: SessionService,
  ) {
    this._user = new Subscription();
    this.items = [];
    this._user = this._sessionService.user$.subscribe(
      (user) =>
        this.visibleItems(user)
    );
  }
  ngOnDestroy(): void {
    this._user.unsubscribe();
  }
  ngOnInit(): void {
    this._sessionService.init();
  }

  private visibleItems(user: User): void {
    const isLogin = user ? true : false;
    this.items = [
      {
        label: 'Quit',
        icon: 'pi pi-fw pi-power-off',
        visible: isLogin,
        command: () => this.logout(),
        routerLink: ['/login'],
      },
      {
        label: 'Login',
        icon: 'pi pi-fw pi-sign-in',
        routerLink: ['/login'],
        visible: !isLogin,
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        routerLink: ['/user-edit'],
        visible: isLogin,
      },
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        routerLink: ['/home'],
        visible: isLogin,
      },
      {
        label: 'Users',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/users'],
        visible: isLogin,
      },
      {
        label: 'Register',
        icon: 'pi pi-fw pi-user-plus',
        routerLink: ['/register'],
        visible: !isLogin,
      },
      {
        label: 'Messages',
        icon: 'pi pi-fw pi-comment',
        routerLink: ['/message'],
        visible: isLogin,
      }
    ]
  }

  public logout(): void {
    this._sessionService.logout();
  }
}
