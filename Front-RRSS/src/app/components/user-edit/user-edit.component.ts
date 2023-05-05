import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user/user.service';
import { GLOBAL } from 'src/app/services/global';
import { UploadService } from 'src/app/services/upload/upload.service';
import { SessionService } from 'src/app/services/session.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  providers: [MessageService]
})
export class UserEditComponent implements OnInit {

  public formUser: FormGroup;
  public userLogged: User;
  public url: string;

  constructor(
    private _userService: UserService,
    private _messageService: MessageService,
    private _uploadService: UploadService,
    private _sessionService: SessionService,
  ) {
    this.userLogged = this._sessionService.getUser();
    this.formUser = new FormGroup(
      {
        name: new FormControl(this.userLogged.name),
        surname: new FormControl(this.userLogged.surname),
        nick: new FormControl(this.userLogged.nick),
        email: new FormControl(this.userLogged.email),
        role: new FormControl(this.userLogged.role),
        image: new FormControl(''),
      });
    this.url = `${GLOBAL.url}user/get_image/${this.userLogged.image}`;
  }

  ngOnInit(): void { }

  public onSubmit() {
    if (this.formUser.invalid) {
      this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Validate that all fields are well informed' });
    } else {
      const userEdit = {
        ... this.formUser.value,
        _id: this.userLogged._id,
        image: undefined,
      }

      const observables = this.formUser.value.image ? [
        this._uploadService.upbloadImage(this.formUser.value.image, userEdit._id),
      ] : [
        this._userService.editUser(userEdit),
      ];
      forkJoin(observables).subscribe({
        next: (rep) => {
          this._messageService.add({ severity: 'success', summary: 'Success', detail: 'User edited' });
          if (rep[1]?.user.image) {
            this._sessionService.setUser({ ...rep[0].user, image: rep[1].user.image });
            this.url = `${GLOBAL.url}user/get_image/${rep[1].user.image}`;
          } else {
            this._sessionService.setUser(rep[0].user);
          }
        },
        error: (err) => {
          this._messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
        }
      });
    }
  }

  public onUpload(event: any) {
    for (let file of event.files) {
      this.formUser.patchValue({ image: file });
    }
  }

  public onClear(event: any) {
    this.formUser.patchValue({ image: null });
  }


  public onCancel() {
    this.formUser.reset();
  }


}
