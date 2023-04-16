import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [MessageService]
})
export class RegisterComponent {

  public formUser: FormGroup;

  constructor(
    private _messageService: MessageService,
    private _userService: UserService,
  ) {
    this.formUser = new FormGroup(
      {
        name: new FormControl(''),
        surname: new FormControl(''),
        nick: new FormControl(''),
        email: new FormControl(''),
        password: new FormControl(''),
      }
    );
  }

  public onSubmit() {
    if (this.formUser.invalid) {
      this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Validate that all fields are well informed' });
    } else {
      this._userService.register(this.formUser.value).subscribe({
        next:() => {
          this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User registered' });
        },
        error:(err) =>{
          this._messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
        }
      });
    }
  }

  public onCancel() {
    this.formUser.reset();
  }
}
