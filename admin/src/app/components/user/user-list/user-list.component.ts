import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { MatPaginator, } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  filtered;
  searchfilter = '';
  statusfilter = '';
  progressfilter = '';
  id;
  confirmResut;
  filteredUser: any = [];
  selected: any = [];
  notificationFormGroup: any
  submitted = false
  toastIds = [];
  allcheck: boolean = false

  displayedColumns: string[] = ['select', 'sno', 'image', 'name', 'matterport_folder_name', 'email', 'status', 'progress_status', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  // dataSource;

  constructor(

    private http: HttpService,
    private apiurl: ApiUrlService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private validation: ValidationService,

  ) {
    this.getsubadmin();


    this.id = localStorage.getItem('user_id')
  }


  ngOnInit(): void {
    this.notificationFormGroup = this.fb.group({
      msgtitle: ['', this.validation.msgTitle],
      msgbody: ['', this.validation.msgBody],
    })
  }

  view(id) {
    this.router.navigate(['/view/' + id])
  }

  async getsubadmin() {
    let result = await this.http.post(this.apiurl.url.getuserlist, { filter: this.searchfilter, sfilter: this.statusfilter, pfilter: this.progressfilter },)
   console.log('testing-----------',result);
    if (result['status']) {
      this.filtered = result['data']
      this.filteredUser = this.filtered
      this.dataSource = new MatTableDataSource(this.filtered);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    else {
      this.filteredUser = []
    }
    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }

  }

  /* delete user starts */
  deleteInvoice(content, id) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => {
        this.deleteuser(id);
        this.confirmResut = `Closed with: ${result}`;
      }, (reason) => {
        this.confirmResut = `Dismissed with: ${reason}`;
      });
  }
  async deleteuser(id) {
    for (let i = 0; i < this.toastIds.length; i++) {
      this.toastr.remove(this.toastIds[i]);
    }
    this.toastIds = []
    let result = await this.http.post(this.apiurl.url.deleteuserById, { user_id: id });
    if (result['status'] != true) {
      let s = this.toastr.error(result['message'], '', { timeOut: 2000, closeButton: true, progressBar: true })
      this.toastIds.push(s.toastId)
    }
    else {
      this.getsubadmin();
      let s = this.toastr.success(result['message'], '', { timeOut: 2000, closeButton: true, progressBar: true })
      this.toastIds.push(s.toastId)
    }

    if (result['message'] == 'Wrong authorization' || result['message'] == 'Session is expired please login again') {
      localStorage.clear()
      this.router.navigateByUrl("/sessions/signin")
      this.toastr.error(result['message'])
    }

  }
  /* delete user ends */

  /* filter user starts */
  applyFilter(filter: string) {

    this.searchfilter = filter
    this.getsubadmin();
  }
  statusFilter(sfilter: string) {

    this.statusfilter = sfilter
    this.getsubadmin();
  }
  progressstatusFilter(pfilter: any) {

    this.progressfilter = pfilter
    this.getsubadmin();
  }
  /* filter user ends */

  async changeStatus(id, oldstatus) {
    let status
    if (oldstatus == 1) status = 0
    if (oldstatus == 0) status = 1
    for (let i = 0; i < this.toastIds.length; i++) {
      this.toastr.remove(this.toastIds[i]);
    }
    this.toastIds = []
    let result = await this.http.post(this.apiurl.url.changeUserStatus, { status: status, id: id });
    if (result['status']) {
      let s = this.toastr.success(result['message'], '', { timeOut: 2000 });
      this.toastIds.push(s.toastId)
      this.getsubadmin();
    }
    else {
      let s = this.toastr.error(result['message'], '', { timeOut: 2000 });
      this.toastIds.push(s.toastId)
    }

  }
  isChecked: any

  getChecked(data) {
    const item = this.selected.filter((e) => e.id == data.id);
    this.isChecked = item.length > 0 ? true : false
    return this.isChecked;
  }

  assign(data) {
    // this.allUser = true;
    let result = this.checkValueExist(this.selected, data);
    if (result) {
      let index = this.selected.indexOf(data);
      this.selected.splice(index, 1);
    }
    else this.selected.push(data);
    this.ref.detectChanges();
    this.filteredUser?.length != this.selected.length ? this.allcheck = false : this.allcheck = true

  }
  checkValueExist(arr, data) {
    let found = arr.some(el => el == data);
    return found;
  }
  selectAllUser() { // DONE

    if (this.filteredUser.length != this.selected.length) {
      this.selected = this.filteredUser.map((e: any) => e);
      // this.allUser = false;
    } else {
      this.selected = [];
      // this.allUser = true;
    }
    this.filteredUser?.length != this.selected.length ? this.allcheck = false : this.allcheck = true;
    this.ref.detectChanges();
  }
  sendNotificationInvoice(content) {

    if (this.selected.length < 1) {
      for (let i = 0; i < this.toastIds.length; i++) {
        this.toastr.remove(this.toastIds[i]);
      }
      this.toastIds = []
      let s = this.toastr.error('Please select at least a user')
      this.toastIds.push(s.toastId)

      return
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => { }, (reason) => {

        this.submitted = false
        this.notificationFormGroup.reset();
        this.modalService.dismissAll();

      });
  }
  async sendNotification() {
try {
  
  // this.modalService.dismissAll()
  this.submitted = true
  if (this.notificationFormGroup.invalid) return

  let body = {
      msgbody: this.notificationFormGroup.value.msgbody,
      msgtitle: this.notificationFormGroup.value.msgtitle,
      user_ids: this.selected,
      created_at: moment().format('YYYY-MM-DD HH-mm-ss')
    }
    
    // return
    
    let result = await this.http.post(this.apiurl.url.sendNotification, body);
    
    if (result['status']) {
      for (let i = 0; i < this.toastIds.length; i++) {
        this.toastr.remove(this.toastIds[i]);
      }
      let s = this.toastr.success(result['message'], '', { timeOut: 2000 });
      this.toastIds.push(s.toastId)
      this.selected = [];
      this.submitted = false
      this.notificationFormGroup.reset();
      this.modalService.dismissAll();
      
    }
    else {
      let s = this.toastr.error(result['message'], '', { timeOut: 2000 });
      this.toastIds.push(s.toastId)
    }
    this.filteredUser?.length != this.selected.length ? this.allcheck = false : this.allcheck = true;
  } catch (error) {
    console.log(error)
    this.toastr.success('Something went wrong please try again later', '', { timeOut: 2000 });
  }
    
  }
  
  
}

