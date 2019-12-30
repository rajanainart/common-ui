import { HttpHeaders } from '@angular/common/http';

export function createHttpOptions(refresh = false) {
  if (refresh) {
    return new HttpHeaders({
      'x-refresh': 'true',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    });
  } else {
    return new HttpHeaders();
  }
}



