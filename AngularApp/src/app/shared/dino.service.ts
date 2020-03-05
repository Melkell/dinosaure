import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Dino } from './dino.model';

@Injectable()
export class DinoService {
  selectedDino: Dino;
  dinos: Dino[];
  readonly baseURL = 'http://localhost:4000/dinos';

  constructor(private http: HttpClient) { }

  postDino(di : Dino){
    return this.http.post(this.baseURL, di)
  }

  getDinoList(){
    return this.http.get(this.baseURL)
  }

  putDino(di: Dino) {
    return this.http.put(this.baseURL + `/${di._id}`, di)
  }

  delDino(_id: string) {
    return this.http.delete(this.baseURL + `/${_id}`)
  }

}
