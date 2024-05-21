import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(
  ) { }
/*===========Validations Expression Start here ===========*/
notRequired_validator = [];
required = [Validators.required];
email = [Validators.required, Validators.minLength(6), Validators.maxLength(100),
  Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,25}$')];
password = [Validators.required, Validators.minLength(6),Validators.maxLength(20)];
mobile = [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern('^[0-9]+$')];
name = [Validators.required, Validators.minLength(2), Validators.maxLength(50)];
msgTitle = [Validators.required,Validators.minLength(2), Validators.maxLength(50)];
msgBody = [Validators.required,Validators.minLength(2), Validators.maxLength(150)];
/*===========Validations Expression End here ===========*/

}
