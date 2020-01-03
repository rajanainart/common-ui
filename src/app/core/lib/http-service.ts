import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HttpService {
    constructor(private http : HttpClient) {
    }

    getAllOfTypeWithHeaders<T>(url : string, headers : HttpHeaders) : Observable<T[]> {
        return this.http.get<T[]>(url, { headers : headers }).pipe(
                    tap(data => data)
                );
    }

    getAllOfType<T>(url : string) : Observable<T[]> {
        return this.http.get<T[]>(url).pipe(
                    tap(data => data)
                );
    }

    getOfTypeWithHeaders<T>(url : string, headers : HttpHeaders) : Observable<T> {
        return this.http.get<T>(url, { headers : headers }).pipe(
                    tap(data => data)
                );
    }

    getOfType<T>(url : string) : Observable<T> {
        return this.http.get<T>(url).pipe(
                    tap(data => data)
                );
    }

    getAllWithHeaders(url : string, headers : HttpHeaders) {
        return this.http.get(url, { headers : headers }).pipe(
                    tap(data => data)
                );
    }

    getAllWithAnyHeaders(url : string, headers : any) {
        return this.http.get(url, headers).pipe(
                    tap(data => data)
                );
    }

    getAll(url : string) {
        return this.http.get(url).pipe(
                    tap(data => data)
                );
    }

    post(url : string, body : any) {
        return this.http.post(url, body).pipe(
                    tap(data => data)
                );
    }

    postWithHeaders(url : string, body : any, headers : HttpHeaders) {
        return this.http.post(url, body, { headers : headers }).pipe(
                    tap(data => data)
                );
    }

    postWithAnyHeaders(url : string, body : any, headers : any) {
        return this.http.post(url, body, headers).pipe(
                    tap(data  => data)
                );
    }

    static getHttpParameters(queryString : string) : HttpParams {
        var params = new HttpParams({
            fromString: queryString
          });
        return params;
    }
}