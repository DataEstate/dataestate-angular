import * as angular from 'angular';
import VersionConstant from './constants/version.constant';
import StarRatingsFilter from './filters/star-ratings.filter';
import DeApiProvider from './providers/de-api.provider';

const dataEstateModule = angular.module('dataEstateModule', []);

dataEstateModule
  .constant('VERSION', VersionConstant)
  .provider('DeApi', DeApiProvider)
  .filter('starratings', StarRatingsFilter);

export default dataEstateModule;
