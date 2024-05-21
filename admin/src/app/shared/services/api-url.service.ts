import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {

  constructor() { }
  public url = {
    login: 'admin/login',
    getadminUserById: 'admin/getadminUserById/',
    forgotpassword: 'admin/forgotpassword',
    getuserlist: 'admin/getuserlist',
    getUserById: 'admin/getUserById',
    uploadpdf: 'admin/uploadPdf',
    changeproress: 'admin/changeproress',
    dashboardTotalcounts :'admin/dashboardTotalcounts',
    userchart: 'admin/userchart',
    initialuserchart: 'admin/initialuserchart',
    inprogressuserchart: 'admin/inprogressuserchart',
    delivereduserchart: 'admin/delivereduserchart',
    deleteuserById: 'admin/deleteuserById',
    getusrefolder: 'admin/getusrefolder',
    getusreimagesbyfolder: 'admin/getusreimagesbyfolder',
    adminUpdate: 'admin/adminUpdate',
    changeUserStatus:'admin/changeUserStatus/',
    deleteiamges:'admin/deleteiamges',
    sendNotification:'admin/sendNotification',
    deletetoken:'admin/deletetoken',
    getuserpdffiles:'admin/getuserpdffiles',
    deletefolders:'admin/deletefolders',
    deletepdf:'admin/deletepdf',
    getMatterportFolder:'admin/getMatterportFolder',
    
    
    

    

    EditProfile: 'EditProfile/',
    Resetpassword: 'Resetpassword/',
    registration: 'registration',
    getnavbar: 'getnavbar',
    getNavbardata: 'getNavbardata/',
    getnavbarList: 'getnavbarList/',
    // deleteuserById: 'deleteuserById/',

  }
}
