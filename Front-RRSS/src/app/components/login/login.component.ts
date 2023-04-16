import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscribable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent {
  public formUser: FormGroup;

  constructor(
    private _messageService: MessageService,
    private _userService: UserService,
    private _router: Router,
    private _sessionService: SessionService,
  ) {
    this.formUser = new FormGroup(
      {
        email: new FormControl(''),
        password: new FormControl(''),
      }
    );
  }

  public onSubmit() {

    if (this.formUser.invalid) {
      this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Validate that all fields are well informed' });
    } else {
      this._userService.login(this.formUser.value, true).subscribe({
        next: (rep) => {
          if (rep.token) {
            this._sessionService.setToken(rep.token);
          }
          this._sessionService.setUser(rep.user);
          this.getCounters();
          this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User logged' });
          this._router.navigate(['/home']);
        },
        error: (err) => {
          this._messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
        }
      });
    }
  }

  private getCounters() {
    this._userService.getCounters().subscribe({
      next: (response) => {
       this._sessionService.setStats(response);
      },
      error: (err) => {
        this._messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
      },
    });
  }

  public onCancel() {
    this.formUser.reset();
  }

}
