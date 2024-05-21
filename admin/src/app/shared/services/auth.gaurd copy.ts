import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGaurd implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService,

  ) { }

  canActivate() {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigateByUrl('/sessions/signin');
      return false;
    }
  }
}
@Injectable({
  providedIn: 'root'
})
export class AuthGaurd1 implements CanActivate {

  constructor(
    private auth: AuthService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let page = route.data.page

    let idd = localStorage.getItem('user_id')
    let typ = localStorage.getItem('user_type')

    if (typ != '1') {

      if (this.auth.checkAuth2(idd)) {
        return true
      } else {
        return false
      }
    }
    else return true
  }
}
