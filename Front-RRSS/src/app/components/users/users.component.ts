import { Component } from '@angular/core';
import { User } from 'src/app/models/user';
import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  public users: User[];
  public url: string;
  public totalRecords: number;
  public pages: number;
  public listFollows: string[];
  public listFollowers: string[];

  constructor(
    private _userService: UserService,
  ) {
    this.users = [];
    this.url = GLOBAL.url + 'user/get_image/';
    this.totalRecords = 0;
    this.pages = 0;
    this.listFollows = [];
    this.listFollowers = [];
  }

  public ngOnInit(): void { }

  loadUsersLazy(event: any) {
    const page = event.first / event.rows + 1;
    this._userService.getUsers(page).subscribe({
      next: (users) => {
        this.users = users.users
        this.totalRecords = users.total;
        this.pages = users.pages;
        this.listFollowers = users.users_follow_me;
        this.listFollows = users.users_following;
      },
      error: (error) => console.log(error),
    });
  }


}
