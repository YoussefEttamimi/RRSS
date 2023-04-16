import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from '../global';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private url: string;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) {
    this.url = GLOBAL.url;
  }

  public upbloadImage(file: File, id: string): Observable<any> {
    let formData = new FormData();
    formData.append('image', file, file.name);
    return this._http.post(this.url + '/user/upload_image/' + id, formData, {
      headers: this._sessionService.getHeaders(true)
     });
  }

}
