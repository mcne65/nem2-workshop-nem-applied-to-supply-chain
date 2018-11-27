import {Injectable} from '@angular/core';

@Injectable()
export class ConstantsService {

  static apiURL: string = 'http://localhost:8080';
  static nodeURL: string = 'http://localhost:3000';
  static listenerURL: string = 'ws://localhost:3000';

}
