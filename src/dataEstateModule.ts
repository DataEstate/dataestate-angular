import * as angular from 'angular';
import VersionConstant from './constants/version.constant';
import StarRatingsFilter from './filters/star-ratings.filter';
import DeApiProvider from './providers/de-api.provider';
import DeEstatesService from './services/de-estates.service';
import DeAssetsService from './services/de-assets.service';
import DeUsersService from './services/de-users.service';
import DeTaxonomyService from './services/de-taxonomy.service';
import DeLocationsService from './services/de-locations.service';
import DeMultimediaService from './services/de-multimedia.service';
import DeSignupsService from './services/de-signup.service';
import { DeHelperService } from './services/de-helpers.service';
import { DeIconsProvider } from './providers/de-icons.provider';
import DeLinkDirective from './directives/de-link.directive';
import DeJsonDirective from './directives/de-json.directive';
import DeDateModelDirective from './directives/de-date-model.directive';
import DeImgCreditDirective from './directives/de-img-credit.directive';
import DeSearchDirective from './directives/de-search.directive';
import DeSearchBarDirective from './directives/de-search-bar.directive';
import DeChangeRegisterFactory from './factories/de-change-register.factory';
import DeTagInputDirective from './directives/de-tag-input.directive';
import ValidityFilter from './filters/validity.filter';
import FilterIdFilter from './filters/filter-id.filter';
import DeDropdownDirective from './directives/de-dropdown.directive';

const dataEstateModule = angular.module('dataEstateModule', []);

dataEstateModule
  .constant('VERSION', VersionConstant)
  .provider('DeApi', DeApiProvider)
  .service('DeEstates', DeEstatesService)
  .service('DeAssets', DeAssetsService)
  .service('DeUsers', DeUsersService)
  .service('DeTaxonomy', DeTaxonomyService)
  .service('DeLocations', DeLocationsService)
  .service('DeMultimedia', DeMultimediaService)
  .service('DeSignups', DeSignupsService)
  .service('DeHelper', DeHelperService)
  .provider('DeIcons', DeIconsProvider)
  .directive('deLink', DeLinkDirective)
  .directive('deJson', DeJsonDirective)
  .directive('deDateModel', DeDateModelDirective)
  .directive('deImgCredit', DeImgCreditDirective)
  .directive('deSearch', DeSearchDirective)
  .directive('deSearchBar', DeSearchBarDirective)
  .factory('DeChangeRegister', DeChangeRegisterFactory)
  .directive('deTagInput', DeTagInputDirective)
  .directive('deDropdown', DeDropdownDirective)
  .filter('validity', ValidityFilter)
  .filter('filterId', FilterIdFilter)
  .filter('starratings', StarRatingsFilter);

export default dataEstateModule;
