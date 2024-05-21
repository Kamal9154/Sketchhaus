import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiUrlService } from 'src/app/shared/services/api-url.service';
import { HttpService } from 'src/app/shared/services/http-service';

@Component({
  selector: 'app-matterport',
  templateUrl: './matterport.component.html',
  styleUrls: ['./matterport.component.scss']
})
export class MatterportComponent implements OnInit {

  routdata = this.activatedroute.snapshot.queryParams
  matterportData: any;
  userfolder: any;
  dataNotFound = false


  constructor(
    private http: HttpService,
    private activatedroute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private apiurl: ApiUrlService,

  ) { }

  ngOnInit(): void {
    if (this.routdata.count != 0) {
      this.getMatterportVideo()
    } else {
      this.dataNotFound = true
    }
  }

  async getMatterportVideo() {
    let result = await this.http.post(this.apiurl.url.getMatterportFolder, { id: this.routdata.folder_id });
    this.matterportData = result
    this.userfolder = this.matterportData.data.models.results
    console.log('**************', this.userfolder.length);
  }

  getSafeUrl(id: string): SafeResourceUrl {
    const url = `https://my.matterport.com/show/?m=${id}&play=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


}