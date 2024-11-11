// de-tag-input.directive.ts

import { IScope, IDirective, IAugmentedJQuery, IAttributes } from 'angular';

interface IDeTagInputScope extends IScope {
  tags: string[];
  delimiter?: string;
  maxLength?: number;
  maxSize: number;
  tagText?: string;

  canAddTags: () => boolean;
  deleteTag: (index: number) => void;
}

function DeTagInputDirective(): IDirective<IDeTagInputScope> {
  return {
    scope: {
      tags: '=ngModel',
      delimiter: '=?deTagDelimiter',
      maxLength: '=?deTagMax',
    },
    link: (
      scope: IDeTagInputScope,
      elem: IAugmentedJQuery,
      attrs: IAttributes
    ) => {
      // Set default values
      scope.maxSize =
        scope.maxLength !== undefined
          ? parseInt(scope.maxLength.toString(), 10)
          : 5;
      const delimit = scope.delimiter !== undefined ? scope.delimiter : ',';

      // Watch for changes in tagText
      scope.$watch('tagText', (newVal: string, oldVal: string) => {
        if (newVal && newVal[newVal.length - 1] === delimit) {
          if (!scope.tags) {
            scope.tags = [];
          }
          const insertVal = newVal.slice(0, -1).trim().replace(' ', '-');
          if (
            scope.tags.indexOf(insertVal) < 0 &&
            scope.tags.length < scope.maxSize
          ) {
            scope.tags.push(insertVal);
          }
          scope.tagText = '';
        }
      });

      // Determine if tags can be added
      scope.canAddTags = () => {
        if (!scope.tags) {
          return true;
        } else if (scope.tags.length < scope.maxSize) {
          return true;
        } else {
          return false;
        }
      };

      // Delete a tag at the given index
      scope.deleteTag = (index: number) => {
        if (scope.tags && index >= 0 && index < scope.tags.length) {
          scope.tags.splice(index, 1);
        }
      };
    },
    template: `
      <div class="tags-container">
        <div class="tags" ng-repeat="tag in tags">
          <span type="tag-text" ng-bind="tag"></span>
          <button class="tags-delete material-icons" ng-click="deleteTag($index)">close</button>
        </div>
        <div class="tags-input">
          <input class="tag-text" ng-model="tagText" ng-show="canAddTags()" placeholder="new tag">
          <span class="tags-message" ng-hide="canAddTags()" ng-cloak>Max. tags ({{maxSize}}) reached!</span>
        </div>
      </div>
    `,
  };
}

export default DeTagInputDirective;
