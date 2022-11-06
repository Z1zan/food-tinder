import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';


export interface ApiRes {
  apiVersion: string;
  status: string;
  data: {
    currency: string;               // for some futures
    machineProducts: Product[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public apiUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  public getAllFood(): Observable<Product[]> {
    return this.http.get<ApiRes>(`${this.apiUrl}/machines/4bf115ee-303a-4089-a3ea-f6e7aae0ab94`)
      .pipe(
        map(res => {
          if (res.status === 'success') {
            return res.data?.machineProducts;
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  private handleError(err) {
    let errorMessage: string;
    console.log('ERROR: ', err);
    if (err.error instanceof ErrorEvent) {
      errorMessage = `Error is : ${err.error.message}`;
    } else {
      errorMessage = `Error number is ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
