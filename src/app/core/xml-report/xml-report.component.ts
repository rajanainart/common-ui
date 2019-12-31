import { Component, AfterContentChecked, OnInit, Input, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ReportFieldManager } from './xml-report.field';
import { NgForm, FormGroup, FormBuilder } from '@angular/forms';
import { RegexPattern } from '../lib/regex.pattern';
import { HttpService } from '../lib/http';
import { Broadcaster } from '../lib/broadcast.service';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';

declare var jquery:any;
declare var $:any;

interface XmlReportBaseMeta {
  id   : string;
  name : string;
}

interface XmlReportMetaData extends XmlReportBaseMeta {
  export    : string[];
  restUrl   : string;
  restQuery : string;
}

@Component({
  selector: 'app-xml-report',
  templateUrl: './xml-report.component.html',
  styleUrls: ['./xml-report.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class XmlReportComponent implements AfterContentChecked, OnInit {

  private gridForm : FormGroup;
  private filterVisibility : boolean = true;

  @Input("xmlReportName")
  xmlReportName : string;

  @Input("customAction")
  customActionString : string;

  isEditableTable : boolean = false;
  customActions : object = [];

  private current : string = '';
  private reportUrl : string;
  private meta : {};
  private data = new MatTableDataSource([]);

  paramMap     : string;
  currentPage  : number = 1;
  fieldManager : ReportFieldManager = null;
  displayType  : string = "";
  selectedFieldName : string = "";
  selectedRow  : object = [];
  RegexPattern : RegexPattern;

  @ViewChild(MatPaginator , {static: false}) paginator: MatPaginator;
  constructor(private http : HttpService, private route: ActivatedRoute, private router : Router, private broadcast : Broadcaster, private fb: FormBuilder) { 
    var id = this.getXmlReportName();
    this.reportUrl    = environment.serviceBaseUrl+'xml-report/'+id;
    this.RegexPattern = RegexPattern;
    this.gridForm     = fb.group({});
  }

  ngOnInit() : void {
    this.route.queryParams.subscribe(params => { 
      this.doRequest();
    });
    
    this.route.params.subscribe(params => { 
      this.doRequest();
    });

    this.paramMap = '';
    for (var key in this.route.snapshot.queryParams)
      this.paramMap+='_'+this.route.snapshot.queryParams[key];
    var event = this.broadcast.on<number>('XmlReportPageChange_'+this.getXmlReportName()+this.paramMap);
    if (event)
      event.subscribe(page => {
        this.callRestService(page);
      });
    var event1 = this.broadcast.on<object>('XmlReportDataChanged_'+this.getXmlReportName());
    if (event1)
        event1.subscribe(xmlData => {
          //this.bindData();
        });
  }

  isChildComponent() : boolean {
    return (!this.route.snapshot.paramMap.get('reportId')?true:false);
  }

  getXmlReportName() : string {
    var id = this.route.snapshot.paramMap.get('reportId');
    if (!id) {
      id = this.xmlReportName;
      this.currentPage = 1;
    }
    return id;
  }

  doRequest() : void {
    var id = this.getXmlReportName();
    this.reportUrl = environment.serviceBaseUrl+'xml-report/'+id;
    if (this.current != JSON.stringify(this.route.snapshot.queryParams)) {
      this.current = JSON.stringify(this.route.snapshot.queryParams);
      console.log('xml-report', this.current);
      this.refreshData();
    }
  }

  validateFilters(filters) : boolean {
    if (!this.meta) return true;
    for (let row of this.meta['schema']['fields']) {
      if (row['mandatory'] != 'true') continue;
      var found = false;
      for (let f of filters) {
        if (f['fieldId'] == row['id']) {
          found = true;
          break;
        }
      }
      if (!found) {
        alert('Mandatory filter '+row['name']+' is not defined');
        return false;
      }
    }
    return true;
  }

  buildRequestContent(page : number) : {} {
    var fm     = this.fieldManager;
    var body   = {};
    body['filter'] = fm != null ? fm.getAllXmlFieldsWithFilter() : [];
    body['params'] = {};
    if (this.route.snapshot.queryParams) {
      for (var key in this.route.snapshot.queryParams)
        body['params'][key] = this.route.snapshot.queryParams[key];
    }
    if (this.route.snapshot.params) {
      for (var key in this.route.snapshot.params)
        body['params'][key] = this.route.snapshot.params[key];
    }
    if (this.meta && this.meta['pagination'] == 'SERVER') {
      body['params']['currentPage'] = this.currentPage = page;
      body['params']['pageSize'   ] = this.meta['pageSizes'].length > 0 ? this.meta['pageSizes'][0] : this.meta['schema']['pageSize'];
    }
    else if (this.meta && this.meta['pagination'] == 'CLIENT')
      body['params']['currentPage'] = -1;
    console.log('filter',body);
    return body;
  }

  callRestService(page : number) : void {
    this.reportBusy = true;
    
    var url   = this.meta['restUrl'];
    var title = this.meta['name'];
    var body  = this.buildRequestContent(page);
    var valid = this.validateFilters(body['filter']);
    var child = this.isChildComponent();

    if (!valid) return;
    this.http.post(url, body).subscribe(data => {
      console.log('xml-report-data', data);

      var elements : Element[] = [];
      elements  = Object.assign(elements, data);
      this.data = new MatTableDataSource<Element>(elements);
      this.data.paginator = this.paginator;

      console.log('xml-report-data', this.data);
      
      if (this.meta && this.meta['pagination'] == 'SERVER')
        this.data._updatePaginator(data[0]['total-records']);

      if (!child)
        this.broadcast.broadcast('TitleChange', body['params']['title'] ? body['params']['title'] : title);
      this.reportBusy = false;
    });
  }

  ngAfterContentChecked(): void {
    try {
      $('.datepicker').datetimepicker({ 'format' : 'MM/DD/YYYY' });
      $('.datepicker').keydown(function(event) { return false; });

      var fm = this.fieldManager;
      $('.datepicker').on('dp.change', function(event) {
        if (fm != null)
          fm.updateField(event.currentTarget.id, this.value);
      });
    } catch(e) {}
  }

  refreshData() {
    var fm = this.fieldManager;
    this.http.getOfType<XmlReportMetaData>(this.reportUrl).subscribe(meta => {
      this.meta = meta;
      console.log('xml-report-meta', this.meta);
      this.callRestService(this.currentPage);
      this.addAllFilters();
    });
  }

  validateEditableControls() : String {
    var msg = 'VALID'
    $('.data-table-control').each(function() {
      if (msg == 'VALID') {
        if ($(this).attr('data-type') == 'INTEGER') {
          if (!RegexPattern.isValidValue(RegexPattern.INTEGER_REGEX, $(this).val()))
            msg =  $(this).attr('msg');
        }
        else if ($(this).attr('data-type') == 'NUMERIC') {
          if (!RegexPattern.isValidValue(RegexPattern.NUMERIC_REGEX, $(this).val()))
            msg = $(this).attr('msg');
        }
      }
    });
    return msg;
  }

  bindSelects(id : string, cols : object[]) : void {
    for (let s of this.meta['selects']) {
      for (let d of this.data['data'])
        d[s['id']+'_select'] = '';
    }
    for (let s of this.meta['selects']) {
      $('#'+id+' > thead tr').append('<th>'+s['name']+'</th>');
      var c  = {'data':s['id']+'_select', 'type':'string', 'className':'select-checkbox'};
      cols.push(c);
    }
  }

  initSelect2(id) : void {
    if (this.data['multi-select'] && this.data['multi-select'][id]) {
      var selects = this.data['multi-select'][id];
      $('#'+id+'_1').select2({
        multiple: true
        ,query: function (query){
            var data = {results: []};
             $.each(selects, function(){
                if(query.term.length == 0 || this.text.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ){
                    data.results.push({id: this.value, text: this.text });
                }
            });
            query.callback(data);
        }
      });
      $('#'+id+'_1').select2('open');
      var fm = this.fieldManager;
      $('#'+id+'_1').on("change", function(e) {
        fm.updateField(id+'_1', e.val.join(','));
      });
    }
  }

  addAllFilters() : void {
    if (this.fieldManager == null)
      this.fieldManager = new ReportFieldManager();

    for (let f of this.meta['schema']['fields'])
      this.fieldManager.buildXmlField(f['id'], f['name'], f['type']);
  }

  onFilterAddClick() : void {
    if (this.selectedFieldName == '') return;

    if (this.fieldManager == null)
      this.fieldManager = new ReportFieldManager();
    var field;
    for (let f of this.meta['schema']['fields']) {
      if (f['id'] == this.selectedFieldName) {
        field = f;
        break;
      }
    }
    this.fieldManager.buildXmlField(this.selectedFieldName, field['name'], field['type']);
  }

  onFilterDelete(name : string) : void {
    this.fieldManager.deleteField(name);
  }

  private reportBusy : boolean = false;

  onDisplayClick(type : string) : void {
    this.reportBusy = true;
    this.displayType = type;
    if (this.displayType == '') {
      this.currentPage = 1;
      this.refreshData();
      return;
    }

    var responseType = '';
    var targetUrl    = '';
    switch (this.displayType) {
      case 'xml':
        targetUrl    = 'restXmlUrl';
        responseType = 'text';
        break;
      case 'xls':
        targetUrl    = 'restXlsUrl';
        responseType = 'arraybuffer';
        break;
      case 'xlsx':
        targetUrl    = 'restXlsxUrl';
        responseType = 'arraybuffer';
        break;
      case 'json':
        targetUrl    = 'restUrl';
        responseType = 'json';
        break;
    }
    if (responseType != '') {
      var body  = this.buildRequestContent(-1);
      var valid = this.validateFilters(body['filter']);
      if (!valid) return;
      this.http.postWithAnyHeaders(this.meta[targetUrl], body, 
          { "responseType" : responseType }).subscribe(data => {
            XmlReportComponent.downloadFile(this.displayType == 'json' ? JSON.stringify(data) : data, 
                                            this.displayType, this.meta['name']+'.'+this.displayType);
            this.reportBusy = false;
      });
      this.currentPage = 1;
    }
  }

  getColumnList() {
    var cols = [];
    if (this.data != null) { 
      for (let row of this.meta['schema']['fields']) {
        if (!this.isColumnExcluded(row['id']))
          cols.push(row);
      }
    }
    return cols;
  }

  isFieldValid(form : NgForm, fieldName : string, fieldNo : number, type : number) : boolean {
    var name = fieldName+"_"+fieldNo;
    if (form.controls[name]) {
      if (type == 1 && form.controls[name].errors && form.controls[name].errors.required)
        return false;
      if (type == 2 && form.controls[name].errors && form.controls[name].errors.pattern)
        return false;
    }
    return true;
  }

  isColumnExcluded(name : string) : boolean {
    var excluded = false;
    if (this.meta['excludeCols']) {
      for (let e of this.meta['excludeCols']) {
        if (e == name) {
          excluded = true;
          break;
        }
      }
    }
    return excluded;
  }

  static downloadFile(data : any, type : string, name : string) : void {
    let   blob = new Blob([data], { type: 'application/'+type });
    const url  = window.URL.createObjectURL(blob);
    var   a    = document.createElement('a');

    a.setAttribute('href'    , url );
    a.setAttribute("download", name);
    var clickEvent = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
    });
    a.dispatchEvent(clickEvent);
  }
  
  onPageChange(event : PageEvent) : void {
    console.log(event);
    if (this.meta['pagination'] == 'SERVER') {
      this.reportBusy = true;
      this.broadcast.broadcast('XmlReportPageChange_'+this.xmlReportName+this.paramMap, event.pageIndex+1);
    }
  }

  static getDataTableColumnType(type : string) : string {
    var t = 'string';
    switch (type) {
      case 'NUMERIC':
      case 'INTEGER':
        t = 'num';
        break;
      case 'DATE':
        t = 'datetime';
        break;
    }
    return t;
  }

  getReportUrl  () : string { return this.reportUrl; }
  getReportMeta () { return this.meta!=null ? this.meta : {}; }
  getReportData () { return this.data!=null ? this.data : {}; }

  getColumnNames() {
    var result = [];
    if (this.meta['schema']['fields']) {
      for (let f of this.meta['schema']['fields'])
        result.push(f['id']);
    }
    return result;
  }
}
