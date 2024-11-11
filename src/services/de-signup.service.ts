import { IHttpPromise } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';

export interface IDeSignupsService {
  data(id?: string, params?: any): IHttpPromise<any>;
  update(id: string, data: any): IHttpPromise<any>;
  create(data: any): IHttpPromise<any>;
  commit(id: string): IHttpPromise<any>;
  checkEmail(address: string): IHttpPromise<any>;
}

class DeSignupsService implements IDeSignupsService {
  static $inject = ['DeApi'];

  constructor(private DeApi: IDeApiService) {}

  data(id: string = '', params: any = {}): IHttpPromise<any> {
    const endpoint = `/signups/data/${id}`;
    return this.DeApi.get(endpoint, params);
  }

  update(id: string, data: any): IHttpPromise<any> {
    const endpoint = `/signups/data/${id}`;
    return this.DeApi.put(endpoint, data);
  }

  create(data: any): IHttpPromise<any> {
    const endpoint = '/signups/data/';
    return this.DeApi.post(endpoint, data);
  }

  commit(id: string): IHttpPromise<any> {
    const endpoint = '/signups/commit/';
    const data = { id };
    return this.DeApi.post(endpoint, data);
  }

  checkEmail(address: string): IHttpPromise<any> {
    const endpoint = '/signups/email/';
    const data = { email: address };
    return this.DeApi.get(endpoint, data);
  }
}

export default DeSignupsService;
