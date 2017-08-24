//v0.3.4
de.directive('mdeMenuItem',function() {
	return {
		restrict:'E',
		scope:{
			menuItem:'=ngModel'
		},
		link:function(scope,elem,attrs) {
			//Check current status
			var currentLink=location.pathname+location.search;
			if (scope.menuItem.link!==undefined && currentLink==scope.menuItem.link) {
				scope.currentMenuId=scope.menuItem.id;
			}
			else if (scope.menuItem.submenu !==undefined) {
				for (var i in scope.menuItem.submenu) {
					if (scope.menuItem.submenu[i].link !==undefined && currentLink==scope.menuItem.submenu[i].link) {
						scope.currentMenuId=scope.menuItem.id;
					}
				}
			}
			scope.toggleSubmenu=function(menuId) {
				if (menuId==scope.currentMenuId) {
					scope.currentMenuId="";
				}
				else {
					scope.currentMenuId=menuId;
				}
			}
			scope.shouldShowMenu=function(menuId) {
				return (menuId==scope.currentMenuId);
			}
			scope.isSelected=function(menuItem) {
				currentLink=location.pathname+location.search;
				if (currentLink==menuItem.link) {
					return true;
				}
				else if (menuItem.submenu !==undefined) {
					for (var i in menuItem.submenu) {
						if (menuItem.submenu[i].link !==undefined && currentLink==menuItem.submenu[i].link) {
							return true;
						}
					}
					return false;
				}
				else {
					return false;
				}
			}
		},
		template: '<md-button class="md-menu-link parent-menu-link" ng-class="{\'active\': isSelected(menuItem)}" ng-if="menuItem.submenu" ng-click="toggleSubmenu(menuItem.id)" arial-label="Menu links">'+
			'<div flex layout="row"><span ng-bind="menuItem.title" flex></span>'+
			'<md-icon md-font-set="md" flex="10" class="menu-icon-toggle" ng-class="{\'md-menu-opened\' : shouldShowMenu(menuItem.id)}">'+
			'expand_more</md-icon></div></md-button>'+
			'<md-button class="md-menu-link parent-menu-link" ng-if="!menuItem.submenu && menuItem.type!==\'api\'" ng-class="{\'active\': isSelected(menuItem)}" ng-href="{{menuItem.link}}" arial-label="Menu links">'+
			'<span ng-bind="menuItem.title"></span></md-button>'+
			'<ul class="md-sublist" ng-show="shouldShowMenu(menuItem.id) && menuItem.submenu" flex>'+
			'\n\t<li class="md-sublist-item"><md-button class="md-menu-link child-menu-link" ng-if="menuItem.link" ng-href="{{menuItem.link}}" aria-label="submenu link">'+
			'<span ng-bind="menuItem.title"></span></md-button></li>'+
			'\n\t<li class="md-sublist-item" ng-repeat="subItem in menuItem.submenu">'+
			'<md-button class="md-menu-link child-menu-link" ng-if="subItem.type!=\'internal\'" ng-class="{\'active\': isSelected(subItem)}" ng-href="{{subItem.link}}" aria-label="submenu links">'+
			'<span ng-bind="subItem.title"></span></md-button>'+
			'<md-button class="md-menu-link child-menu-link" ng-if="subItem.type==\'internal\'" ng-click="setSubView(menuItem.link)" aria-label="subme nu links">'+
			'<span ng-bind="subItem.title" ></span></md-button></li>'+
			'\n</ul>'
		}
	});