import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { HttpRequest, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, OnChanges {

  public metaComplete = false;
  public dataComplete = false;

  private dataSource = [];
  private metaData = {};
  private sortColumn;
  private displayColumns = [];

  private _metaUrl;
  @Input()
  set metaUrl(metaUrl: string) {
    this._metaUrl = metaUrl;
  }

  private _dsUrl;
  @Input()
  set dataSourceUrl(dsUrl: string) {
    this._dsUrl = dsUrl;
  }

  private _refresh;
  @Input()
  set refresh(refresh : number) {
    this._refresh = refresh;
  }

  @Output() edit = new EventEmitter<number>();

  //get metaUrl(): string { return this._metaUrl; }

  constructor(private http : HttpClient) {}

  ngOnChanges() {
    this.bindData();
  }

  ngOnInit() {
    this.getData('GET', environment.serviceBaseUrl+'/rest/' + this._metaUrl).subscribe(data => {
      if (data && data['body']) {
        this.metaData = data['body'];
        var columns = data['body']['columns'];
        for (var idx=0; idx<columns.length; idx++) {
          if (columns[idx]['isVisible'] == true)
            this.displayColumns.push(columns[idx]['id']);
        }

        if (this.metaData['isEditable'] == true && this.displayColumns.indexOf('Edit') == -1)
          this.displayColumns.push('Edit');
      }
      this.metaComplete = true;
    });
    this.bindData();
  }

  showUpdatePanel(data: any): void {
    this.edit.emit(data);
  }

  bindData() {
    this.getData('POST', environment.serviceBaseUrl+'/rest/'+this._dsUrl).subscribe(data => {
      if (data && data['body'])
        this.dataSource = data['body'];
      this.dataComplete = true;
    });
  }

  getData(method : string, url : string): Observable<any> {
    const req = new HttpRequest(method, url, {}, {
      responseType: 'json'
    });
    return this.http.request(req).pipe(
      tap(_ => console.log('Made call to get data')),
      catchError(this.handleError('getData()', ))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
