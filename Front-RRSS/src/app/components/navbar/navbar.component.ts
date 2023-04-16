import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { GLOBAL } from 'src/app/services/global';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @Input()
  public items: MenuItem[] = [];
  public urlImage: string;
  private _user: Subscription;


  constructor(
    private _sessionService: SessionService,
  ) {
    this._user = new Subscription();
    this.urlImage = "";
    this._user = this._sessionService.user$.subscribe(
      (user) => this.imgUrl(user)
    );
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this._user.unsubscribe();
  }
  private imgUrl(user: User): void {
    if (user) {
      this.urlImage = `${GLOBAL.url}user/get_image/${user.image}`;
    } else {
      this.urlImage = "https://primefaces.org/cdn/primeng/images/primeng.svg";

    }
  }


}
