import { IHttpPromise, IHttpService, identity } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';

export interface IDeMultimediaService {
  data(estate?: string, params?: any): IHttpPromise<any>;
  update(
    estate: string,
    data: any,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any>;
  upload(
    estate: string,
    file: File,
    uploadEventHandlers?: { [key: string]: any },
    meta?: { [key: string]: any }
  ): IHttpPromise<any>;
  remove(estate: string, id: string): IHttpPromise<any>;
  loadLast(): any[]; // Adjust the type based on your multimedia data structure
}

class DeMultimediaService implements IDeMultimediaService {
  static $inject = ['DeApi', '$http'];

  private multimedia: any[] = [];

  constructor(private DeApi: IDeApiService, private $http: IHttpService) {}

  data(estate: string = '', params?: any): IHttpPromise<any> {
    const endpoint = `/multimedia/${estate}`;
    return this.DeApi.get(endpoint, params);
  }

  update(
    estate: string,
    data: any,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any> {
    const endpoint = `/multimedia/${estate}`;
    const putData: any = { data };

    if (remove_data != null) {
      putData.remove = remove_data;
    }
    if (add_data != null) {
      putData.add = add_data;
    }

    return this.DeApi.put(endpoint, putData);
  }

  upload(
    estate: string,
    file: File,
    uploadEventHandlers?: { [key: string]: any },
    meta?: { [key: string]: any }
  ): IHttpPromise<any> {
    const endpoint = `/multimedia/${estate}`;
    const fd = new FormData();
    fd.append('file', file, file.name);
    fd.append('estate', estate);

    if (meta) {
      for (const key in meta) {
        if (meta.hasOwnProperty(key)) {
          fd.append(key, meta[key]);
        }
      }
    }

    const headers: any = { 'Content-Type': undefined };

    // Access DeApi properties via methods or public properties
    if (this.DeApi.getAuthType() === 'api-key') {
      headers['API-KEY'] = this.DeApi.getApiKey();
    } else if (this.DeApi.getAuthType() === 'token') {
      headers['Authorization'] = `Bearer ${this.DeApi.getToken()}`;
    }

    const httpRequest = {
      url: this.DeApi.getApiUrl() + endpoint,
      method: 'POST',
      data: fd,
      headers: headers,
      transformRequest: identity,
      uploadEventHandlers: uploadEventHandlers,
    };

    return this.$http(httpRequest);
  }

  remove(estate: string, id: string): IHttpPromise<any> {
    const endpoint = `/multimedia/${estate}/${id}`;
    return this.DeApi.delete(endpoint);
  }

  loadLast(): any[] {
    // TODO: Use Promise
    return this.multimedia;
  }
}

export default DeMultimediaService;
