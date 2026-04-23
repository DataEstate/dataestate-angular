import * as angular from 'angular';
import { IAugmentedJQuery, IDirective, IScope } from 'angular';

interface IMdeMenuItem {
  id?: string;
  title?: string;
  type?: string;
  link?: string;
  submenu?: IMdeMenuItem[];
}

interface IMdeMenuItemScope extends IScope {
  menuItem: IMdeMenuItem;
  currentMenuId: string;
  toggleSubmenu: (menuId?: string) => void;
  shouldShowMenu: (menuId?: string) => boolean;
  isSelected: (menuItem: IMdeMenuItem) => boolean;
}

const TEMPLATE =
  '<md-button class="md-menu-link parent-menu-link" ng-class="{\'active\': isSelected(menuItem)}" ng-if="menuItem.submenu" ng-click="toggleSubmenu(menuItem.id)" arial-label="Menu links">' +
  '<div flex layout="row"><span ng-bind="menuItem.title" flex></span>' +
  '<md-icon md-font-set="md" flex="10" class="menu-icon-toggle" ng-class="{\'md-menu-opened\' : shouldShowMenu(menuItem.id)}">' +
  'expand_more</md-icon></div></md-button>' +
  '<md-button class="md-menu-link parent-menu-link" ng-if="!menuItem.submenu && menuItem.type!==\'api\' && menuItem.type!==\'external\'" ng-class="{\'active\': isSelected(menuItem)}" ng-href="{{menuItem.link}}" arial-label="Menu links">' +
  '<span ng-bind="menuItem.title"></span></md-button>' +
  '<a class="md-button md-menu-link parent-menu-link" ng-if="!menuItem.submenu && menuItem.type===\'external\'" href="{{menuItem.link}}" target="_blank" rel="noopener noreferrer" arial-label="Menu links">' +
  '<div flex layout="row"><span ng-bind="menuItem.title" flex></span><md-icon md-font-set="md" flex="10" class="menu-icon-toggle">open_in_new</md-icon></div></a>' +
  '<ul class="md-sublist" ng-show="shouldShowMenu(menuItem.id) && menuItem.submenu" flex>' +
  '\n\t<li class="md-sublist-item"><md-button class="md-menu-link child-menu-link" ng-if="menuItem.link" ng-href="{{menuItem.link}}" aria-label="submenu link">' +
  '<span ng-bind="menuItem.title"></span></md-button></li>' +
  '\n\t<li class="md-sublist-item" ng-repeat="subItem in menuItem.submenu">' +
  '<md-button class="md-menu-link child-menu-link" ng-if="subItem.type!=\'internal\'" ng-class="{\'active\': isSelected(subItem)}" ng-href="{{subItem.link}}" aria-label="submenu links">' +
  '<span ng-bind="subItem.title"></span></md-button>' +
  '<md-button class="md-menu-link child-menu-link" ng-if="subItem.type==\'internal\'" ng-click="setSubView(menuItem.link)" aria-label="subme nu links">' +
  '<span ng-bind="subItem.title" ></span></md-button></li>' +
  '\n</ul>';

function hasMatchingLink(
  items: IMdeMenuItem[] | undefined,
  currentLink: string
): boolean {
  if (!items) {
    return false;
  }

  return items.some((item) => item.link !== undefined && currentLink === item.link);
}

function MdeMenuItemDirective(): IDirective<IMdeMenuItemScope> {
  return {
    restrict: 'E',
    scope: {
      menuItem: '=ngModel',
    },
    link: (scope: IMdeMenuItemScope, elem: IAugmentedJQuery) => {
      const getCurrentLink = (): string => location.pathname + location.search;

      const updateCurrentMenuId = (): void => {
        const currentLink = getCurrentLink();

        if (scope.menuItem.link !== undefined && currentLink === scope.menuItem.link) {
          scope.currentMenuId = scope.menuItem.id || '';
          return;
        }

        if (hasMatchingLink(scope.menuItem.submenu, currentLink)) {
          scope.currentMenuId = scope.menuItem.id || '';
        }
      };

      updateCurrentMenuId();

      scope.toggleSubmenu = (menuId?: string): void => {
        scope.currentMenuId = menuId === scope.currentMenuId ? '' : menuId || '';
      };

      scope.shouldShowMenu = (menuId?: string): boolean => {
        return menuId === scope.currentMenuId;
      };

      scope.isSelected = (menuItem: IMdeMenuItem): boolean => {
        const currentLink = getCurrentLink();
        return (
          currentLink === menuItem.link ||
          hasMatchingLink(menuItem.submenu, currentLink)
        );
      };
    },
    template: TEMPLATE,
  };
}

const de = angular.module('dataEstateModule');
de.directive('mdeMenuItem', MdeMenuItemDirective);

export default MdeMenuItemDirective;
