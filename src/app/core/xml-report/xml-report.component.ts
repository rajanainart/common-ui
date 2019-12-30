import { Component, AfterContentChecked, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
//import  * as FileSaver from 'angular-file-saver';
import { ReportFieldManager } from './xml-report.field';
import { NgForm, FormGroup, FormBuilder } from '@angular/forms';
import { RegexPattern } from '../lib/regex.pattern';
import { HttpService } from '../lib/http';
import { Broadcaster } from '../lib/broadcast.service';

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
  private data : {};

  paramMap     : string;
  currentPage  : number = 1;
  fieldManager : ReportFieldManager = null;
  displayType  : string = "";
  selectedFieldName : string = "";
  selectedRow  : object = [];
  RegexPattern : RegexPattern;

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
          this.bindData();
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
    body['params']['currentPage'] = this.currentPage = page;
    console.log('filter',body);
    return body;
  }

  callRestService(page : number) : void {
    var url   = this.meta['restUrl'];
    var title = this.meta['name'];
    var body  = this.buildRequestContent(page);
    var valid = this.validateFilters(body['filter']);
    var child = this.isChildComponent();

    if (!valid) return;
    this.http.post(url, body).subscribe(data => {
      console.log('xml-report-data',data);
      this.data = data;
      if (!child)
        this.broadcast.broadcast('TitleChange', body['params']['title'] ? body['params']['title'] : title);
      var instance = this;
      setTimeout(function() {instance.bindData();},500);
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

  broadcastUpdate() {
    var msg = this.validateEditableControls();
    if (msg != 'VALID') alert(msg);
    
    var data = this.data['data'];
    $('.data-table-control').each(function() {
      var index = $(this).attr('current-row-index');
      var id    = $(this).attr('id');
      var type  = $(this).attr('data-type');
      var value = $(this).val();

      if (type != 'CHECKBOX')
        data[parseInt(index)][id] = value;
      else
        data[parseInt(index)][id] = $(this).prop('checked') ? 'T' : 'F';
    });
    console.log('xml-report-update-data',data);
    this.broadcast.broadcast('XmlReportDataUpdate_'+this.xmlReportName+this.paramMap, data);
  } 

  containsEditableColumn(action : object) : boolean {
    if (action['common-action']) {
      if (action['common-action'] == 'true')
        return true;
    }
    else {
      var editable = false;
      for (let row of this.meta['schema']['fields']) {
        if (row['editable'] == 'true') {
          editable = true;
          break;
        }
      }
      return editable && ((this.data['data'].length > 0 && $('.data-table-control').size() != 0) || this.data['data'].length == 0);
    }
  }

  bindData() {
    var reportName = this.getXmlReportName();
    $('#divXmlReport_'+reportName).remove();
    $('#divReport_'+reportName).append(XmlReportComponent.getXmlReportDiv(reportName));

    var id   = "tblXmlReport_"+reportName;
    var cols = [];
    this.bindSelects(id, cols);

    /*var gridData = [];
    if (this.meta['groupByChildExpression'] && this.meta['groupByParentExpression']) {
      cols.push({'className':'details-control', 'orderable':false, 'data':null, 'defaultContent': ''});
      for (let row of this.data['data']) {
        if (eval(this.meta['groupByParentExpression']))
          gridData.push(row);
      }
    }
    else
      gridData = this.data['data'];*/

    this.isEditableTable = false;
    for (let row of this.meta['schema']['fields']) {
      $('#'+id+' > thead tr').append('<th>'+row['name']+'</th>');
      var type = XmlReportComponent.getDataTableColumnType(row['type']);
      var col  = {'data':row['id'], 'type':type, 'visible':!this.isColumnExcluded(row['id'])};
      if (type == 'datetime') {
        col['format'] = 'mm/dd/YYYY';
        col['fmt'] = 'mm/dd/YYYY';
      }
      if (row['editable'] == 'true') {
        this.isEditableTable = true;
        col['render'] = function (data, type, currentRow, settings) {
          if (currentRow['EDITABLE'] && currentRow['EDITABLE'] == '1' && (row['type'] == 'TEXT' || row['type'] == 'INTEGER' || row['type'] == 'NUMERIC'))
            return '<input class="form-control input-sm text-right data-table-control" style="width:100px" id="'+row['id']+'" name="'+row['id']+'" type="text" value='+data+' '+
                   'msg="Row:'+(parseInt(settings['row'])+1)+', Invalid value for '+row['name']+'" current-row-index="'+settings['row']+'" data-type="'+row['type']+'">';
          else if (currentRow['EDITABLE'] && currentRow['EDITABLE'] == '1' && row['type'] == 'CHECKBOX') {
            if (data == 'T')
              return '<input class="data-table-control" type="checkbox" checked="checked" id="'+row['id']+'" name="'+row['id']+'" '+
                     'current-row-index="'+settings['row']+'" data-type="CHECKBOX">';
            else
              return '<input class="data-table-control" type="checkbox" id="'+row['id']+'" name="'+row['id']+'" '+
                     'current-row-index="'+settings['row']+'" data-type="CHECKBOX">';
          }
          else
            return data;
        }
      }
      cols.push(col);
    }
  }

  broadcastCallback(callback : string) : void {
    this.broadcast.broadcast(this.getXmlReportName()+'_'+callback, this.getReportData());
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

  onDisplayClick(type : string) : void {
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

    //var params = this.route.snapshot.queryParams;
    //window.open(url);
    //FileSaver.saveAs(blob, (params['title']?params['title']:this.meta['name']) + '.'+this.displayType);
  }

  static applyDataTableCss(id : string) {
    //apply css styles by using style-name, as class is not rendered properly
    $('#'+id+'_wrapper').css('font-size', '12px');
    $('#'+id+'_wrapper').css('margin', '6px');
    $('#'+id+'_length').css('display', 'none');
  }

  static getXmlReportDiv(reportName : string) : string {
    return '<div id="divXmlReport_'+reportName+'">'+
           '<table id="tblXmlReport_'+reportName+'" class="display compact" style="width:100%">'+
           '<thead><tr></tr></thead>'+
           '<tbody></tbody>'+
           '</table>'+
           '</div>';
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
