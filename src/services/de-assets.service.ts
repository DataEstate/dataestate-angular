import { IHttpPromise } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';

export interface IDeAssetsService {
  setEstate(estate: string): void;
  getEstate(): string;
  data(params?: any, id?: string): IHttpPromise<any>;
  articles(estate: string, slug?: string, params?: any): IHttpPromise<any>;
  timetable(params?: any): IHttpPromise<any>;
  flights(params?: any): IHttpPromise<any>;
  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any>;
  create(estate: string, type: string, data: any): IHttpPromise<any>;
  remove(id: string): IHttpPromise<any>;
  bulkRemove(estate: string, type: string, ids: string[]): IHttpPromise<any>;
}

class DeAssetsService implements IDeAssetsService {
  static $inject = ['DeApi'];
  private currentEstate: string = '';

  constructor(private DeApi: IDeApiService) {}

  setEstate(estate: string): void {
    this.currentEstate = estate;
  }

  getEstate(): string {
    return this.currentEstate;
  }

  data(params?: any, id: string = ''): IHttpPromise<any> {
    const endpoints = `/assets/data/${id}`;
    return this.DeApi.get(endpoints, params);
  }

  articles(
    estate: string,
    slug: string = '',
    params: any = {}
  ): IHttpPromise<any> {
    const endpoints = `/assets/articles/${estate}/${slug}`;
    return this.DeApi.get(endpoints, params);
  }

  timetable(params?: any): IHttpPromise<any> {
    const endpoints = '/assets/timetable/';
    return this.DeApi.get(endpoints, params);
  }

  flights(params?: any): IHttpPromise<any> {
    const endpoints = '/assets/flights/';
    return this.DeApi.get(endpoints, params);
  }

  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any> {
    const endpoints = `/assets/data/${id}`;
    const putData: any = { data };

    if (language !== undefined) {
      putData.language = language;
    }
    if (
      remove_data !== undefined &&
      remove_data !== null &&
      Object.keys(remove_data).length > 0
    ) {
      putData.remove = remove_data;
    }
    if (add_data !== undefined && add_data !== null) {
      putData.add = add_data;
    }

    return this.DeApi.put(endpoints, putData);
  }

  create(estate: string, type: string, data: any): IHttpPromise<any> {
    const endpoints = '/assets/data/';
    if (!data.hasOwnProperty('type')) {
      data.type = type;
    }
    if (estate === undefined || estate === '') {
      estate = this.currentEstate;
    }
    const postData = {
      data,
      estate_id: estate,
    };
    return this.DeApi.post(endpoints, postData);
  }

  remove(id: string): IHttpPromise<any> {
    const endpoints = `/assets/data/${id}`;
    return this.DeApi.delete(endpoints);
  }

  bulkRemove(estate: string, type: string, ids: string[]): IHttpPromise<any> {
    const endpoints = `/assets/data/${estate}`;
    const bulkPipeline = ids.map((id) => ({
      op: 'remove',
      path: `${type}/${id}`,
    }));
    return this.DeApi.patch(endpoints, bulkPipeline);
  }
}

export default DeAssetsService;
