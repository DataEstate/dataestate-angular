import dataEstateModule from './dataEstateModule';

declare const require: (path: string) => unknown;

require('./directives/de-gallery.directive');
require('./directives/mde-menu-item.directive');
require('./directives/lazy-load.directive');

export default dataEstateModule;
