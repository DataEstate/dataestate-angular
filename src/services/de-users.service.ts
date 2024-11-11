import { IPromise, IQService } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';

export interface IDeUsersService {
  data(reload?: boolean): IPromise<any>;
}

class DeUsersService implements IDeUsersService {
  static $inject = ['DeApi', '$q'];

  private currentUser: any = null;

  constructor(private DeApi: IDeApiService, private $q: IQService) {}

  data(reload?: boolean): IPromise<any> {
    if (reload === true || this.currentUser === null) {
      return this.DeApi.get('/users/data/').then((res) => {
        this.currentUser = res.data;
        return this.currentUser;
      });
    } else {
      return this.$q.resolve(this.currentUser);
    }
  }
}

export default DeUsersService;
