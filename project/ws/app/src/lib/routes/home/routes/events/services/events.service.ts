import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '..//../../../../../../../../../src/environments/environment'

const API_END_POINTS = {
  CREATE_EVENT: '/apis/proxies/v8/event/v4/create',
  UPDATE_EVENT: '/apis/proxies/v8/event/v4/update',
  PUBLISH_EVENT: '/apis/proxies/v8/event/v4/publish',
  SEARCH_EVENT: '/apis/proxies/v8/sunbirdigot/read',
  GET_PARTICIPANTS: '/apis/protected/v8/portal/mdo/mydepartment?allUsers=true',
  IMAGE_UPLOAD: '/apis/authContent/upload/igot/dopt/Public',
  SEARCH_USERS: '/apis/proxies/v8/user/v1/autocomplete',
  EVENT_DETAILS: '/apis/proxies/v8/event/v4/read',
  GET_EVENTS: '/apis/proxies/v8/sunbirdigot/search',
  CREATE_ASSET: 'apis/proxies/v8/action/content/v3/create',
  UPLOAD_FILE: 'apis/proxies/v8/upload/action/content/v3/upload',
  ARCHIVE_EVENT: '/apis/proxies/v8/event/v4/retire',
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {

  constructor(private http: HttpClient) { }

  crreateAsset(req: any): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.CREATE_ASSET}`, req)
  }

  uploadFile(val: any, formdata: any): Observable<any> {
    this.http.post<any>(`${API_END_POINTS.UPLOAD_FILE}/${val}`, formdata, {
      headers: {
        'content-type': 'application/json',
      },
    })
    return this.http.post<any>(`${API_END_POINTS.UPLOAD_FILE}/${val}`, formdata)
  }

  createEvent(req: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.CREATE_EVENT, req)
  }

  updateEvent(eventId: any, req: any): Observable<any> {
    return this.http.patch<any>(`${API_END_POINTS.UPDATE_EVENT}/${eventId}`, req)
  }

  publishEvent(eventId: string, req: any): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.PUBLISH_EVENT}/${eventId}`, req)
  }

  searchEvent(req: any) {
    return this.http.post<any>(API_END_POINTS.SEARCH_EVENT, req)
  }

  getEventsList(req: any) {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    })

    return this.http.post<any>(`${API_END_POINTS.GET_EVENTS}`, req, { headers })
  }

  getParticipants(): Observable<any> {
    return this.http.get<any>(API_END_POINTS.GET_PARTICIPANTS)
  }

  uploadCoverImage(req: any, eventId: string): Observable<any> {
    return this.http.post<any>(`${API_END_POINTS.IMAGE_UPLOAD}/${eventId}/artifacts`, req)
  }

  getEvents(): Observable<any> {
    return this.http.get<any>(API_END_POINTS.SEARCH_EVENT)
  }

  searchUser(value: any): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.SEARCH_USERS}/${value}`)
  }

  getEventDetails(eventID: any): Observable<any> {
    return this.http.get<any>(`${API_END_POINTS.EVENT_DETAILS}/${eventID}`)
  }

  retireEvent(eventId: any): Observable<any> {
    return this.http.delete<any>(`${API_END_POINTS.ARCHIVE_EVENT}/${eventId}`)
  }

  getPublicUrl(url: string): string {
    const mainUrl = url.split('/content').pop() || ''
    return `${environment.contentHost}/${environment.contentBucket}/content${mainUrl}`
  }
}
