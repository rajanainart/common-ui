import { Component, OnInit } from '@angular/core';
import { XmlReportBaseMeta } from 'src/app/core/xml-report/xml-report.field';
import { HttpService } from 'src/app/core/services/http-service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/core/lib/base.component';

interface XmlReportGroupMetaData extends XmlReportBaseMeta {
  xmlReports : string[];
  groupType  : string;
}

@Component({
  selector: 'app-report-group',
  templateUrl: './report-group.component.html',
  styleUrls: ['./report-group.component.scss']
})
export class ReportGroupComponent extends BaseComponent implements OnInit {
  private reportGroupUrl : string;
  private reportGroup    : XmlReportGroupMetaData;
  private currentRoute   : ActivatedRoute;
  private environment;

  constructor(route : ActivatedRoute, private http : HttpService) { 
    super(route);
    this.currentRoute   = route;
    this.environment    = environment;
    this.reportGroupUrl = environment.serviceBaseUrl+'xml-report/group/'+this.getXmlReportName();
  }

  ngOnInit() {
    this.currentRoute.queryParams.subscribe(params => { 
      this.refreshData();
    });
    
    this.currentRoute.params.subscribe(params => { 
      this.refreshData();
    });
  }

  refreshData() {
    this.http.getOfType<XmlReportGroupMetaData>(this.reportGroupUrl).subscribe(meta => {
      this.reportGroup = meta;
      console.log('xml-report-group-meta', meta);
    });
  }
}
