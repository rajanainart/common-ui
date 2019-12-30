import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/core/lib/base.component';
import { Broadcaster } from 'src/app/core/lib/broadcast.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent extends BaseComponent implements OnInit {
  customActions : string = '';
  xmlReportName : string = '';

  constructor(route : ActivatedRoute, private router : Router, private broadcast : Broadcaster) { 
    super(route);
    this.customActions = '[{"icon" : "note_add", "text" : "Add Deal", "callback" : "onNewDeal", "visible" : "true", "common-action" : "true" }]';

    var event = this.broadcast.on<object[]>(this.getXmlReportName()+'_onNewDeal');
    if (event)
      event.subscribe(xmlData => {
        this.router.navigateByUrl('/deal/new');    
      });
  }

  ngOnInit() { }
}
