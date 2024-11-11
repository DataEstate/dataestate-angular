import * as angular from 'angular';

export interface IDeHelperService {
  inArray(item: any, array: any[], compare_key?: string): boolean;
  getQueryParameter(str?: string): any;
  getURLPaths(index?: number): any;
  getDiff(json1: any, json2: any, includeDelete?: boolean): any;
  isEmpty(jsonObj: any, testString?: boolean): boolean;
  model: {
    addItem(
      childScope: any,
      fieldKey?: string,
      atStart?: boolean,
      defaultItem?: any
    ): void;
    copyItem(
      childScope: any,
      itemIndex: number | string | null,
      objectScope: any
    ): void;
    removeItem(
      childScope: any,
      itemIndex?: number | string | null,
      fieldKey?: string
    ): void;
    addObject(
      childScope: any,
      fieldKey?: string,
      itemType?: string,
      objectId?: string
    ): void;
  };
}

class DeHelperService implements IDeHelperService {
  // Internal helper methods
  private getType(data: any): string {
    const typeString = Object.prototype.toString.call(data);
    if (typeString !== undefined) {
      return typeString.replace('[object ', '').replace(']', '');
    } else {
      return 'undefined';
    }
  }

  private removeEmpty(jsonOriginal: any): any {
    if (jsonOriginal === undefined) {
      return null;
    } else {
      const jsonData = JSON.parse(JSON.stringify(jsonOriginal));
      if (!this.isEmpty(jsonData)) {
        switch (this.getType(jsonData)) {
          case 'Array':
            for (let k = jsonData.length - 1; k >= 0; k--) {
              if (this.isEmpty(jsonData[k], true)) {
                jsonData.splice(k, 1);
              } else {
                jsonData[k] = this.removeEmpty(jsonData[k]);
                if (jsonData[k] === undefined || jsonData[k] === null) {
                  jsonData.splice(k, 1);
                }
              }
            }
            break;
          case 'Object':
            for (const k in jsonData) {
              if (this.isEmpty(jsonData[k], true)) {
                delete jsonData[k];
              } else {
                jsonData[k] = this.removeEmpty(jsonData[k]);
                if (jsonData[k] === undefined || jsonData[k] === null) {
                  delete jsonData[k];
                }
              }
            }
            break;
        }
        if (this.isEmpty(jsonData)) {
          return null;
        } else {
          return jsonData;
        }
      } else {
        return null;
      }
    }
  }

  // Public methods
  isEmpty(jsonObj: any, testString: boolean = true): boolean {
    let empty = false;

    switch (this.getType(jsonObj)) {
      case 'Array':
        if (jsonObj.length <= 0) {
          empty = true;
        } else {
          empty = true;
          for (const a of jsonObj) {
            if (!this.isEmpty(a)) {
              empty = false;
              break;
            }
          }
        }
        break;
      case 'Object':
        if (Object.keys(jsonObj).length <= 0) {
          empty = true;
        }
        break;
      case 'String':
        if (testString && jsonObj === '') {
          empty = true;
        }
        break;
      default:
        if (typeof jsonObj === 'undefined') {
          empty = true;
        }
        break;
    }
    return empty;
  }

  inArray(item: any, array: any[], compare_key?: string): boolean {
    if (array === undefined) {
      return false;
    } else {
      if (Array.isArray(item)) {
        for (const arrayItem of array) {
          for (const itemElement of item) {
            if (itemElement == arrayItem) {
              return true;
            }
          }
        }
      } else if (typeof item === 'object') {
        for (const arrayItem of array) {
          if (angular.equals(arrayItem, item)) {
            return true;
          }
        }
        return false;
      } else {
        if (compare_key !== undefined) {
          for (const arrayItem of array) {
            if (arrayItem[compare_key] == item) {
              return true;
            }
          }
        }
        return array.indexOf(item) >= 0;
      }
    }
  }

  getQueryParameter(str?: string): any {
    const locationSearch = document.location.search.replace(/(^\?)/, '');
    if (locationSearch === '') {
      return {};
    }
    const queryDoc: any = locationSearch
      .split('&')
      .reduce((result: any, n: string) => {
        const [key, value] = n.split('=');
        result[key] = value;
        return result;
      }, {});
    if (str === undefined) {
      return queryDoc;
    } else {
      return queryDoc[str];
    }
  }

  getURLPaths(index?: number): any {
    const urlPaths = window.location.pathname.split('/');
    urlPaths.shift(); // Remove the first empty string
    if (index === -1) {
      // Get last non-empty element
      let elem = urlPaths.pop();
      if (elem === '') {
        elem = urlPaths.pop();
      }
      return elem;
    } else if (index !== undefined) {
      return urlPaths[index];
    } else {
      return urlPaths;
    }
  }

  getDiff(json1: any, json2: any, includeDelete?: boolean): any {
    let changed: any = {};
    const removed: any = {};
    if (this.getType(json2) === 'Array') {
      changed = [];
    }
    if (
      typeof json2 === 'object' &&
      typeof json1 === 'object' &&
      !angular.equals(json1, json2)
    ) {
      const newJson = angular.copy(json2);
      for (const key in newJson) {
        if (
          !json1.hasOwnProperty(key) ||
          !angular.equals(json1[key], newJson[key])
        ) {
          newJson[key] = this.removeEmpty(newJson[key]);
          if (newJson[key] !== null) {
            changed[key] = newJson[key];
          }
        }
      }
      if (includeDelete === true) {
        for (const okey in json1) {
          if (!newJson.hasOwnProperty(okey) || newJson[okey] === null) {
            removed[okey] = '';
          }
        }
        return {
          changed: changed,
          removed: removed,
        };
      } else {
        return changed;
      }
    } else {
      return changed;
    }
  }

  // Model editor methods
  model = {
    addItem: (
      childScope: any,
      fieldKey?: string,
      atStart: boolean = false,
      defaultItem?: any
    ): void => {
      let newObj = {};
      if (defaultItem !== undefined) {
        newObj = defaultItem;
      }
      if (fieldKey !== undefined && fieldKey !== '') {
        if (!childScope.hasOwnProperty(fieldKey)) {
          childScope[fieldKey] = [];
        }
        if (atStart) {
          childScope[fieldKey].unshift(newObj);
        } else {
          childScope[fieldKey].push(newObj);
        }
      } else {
        if (atStart) {
          childScope.unshift(newObj);
        } else {
          childScope.push(newObj);
        }
      }
    },

    copyItem: (
      childScope: any,
      itemIndex: number | string | null,
      objectScope: any
    ): void => {
      const newObject = angular.copy(objectScope);
      if (newObject.hasOwnProperty('id')) {
        newObject.id = newObject.id + '-copy';
      }
      if (itemIndex === undefined || itemIndex === null) {
        childScope.splice(0, 0, newObject);
      } else {
        childScope.splice(itemIndex, 0, newObject);
      }
    },

    removeItem: (
      childScope: any,
      itemIndex?: number | string | null,
      fieldKey?: string
    ): void => {
      if (itemIndex === undefined || itemIndex === null) {
        if (fieldKey !== undefined) {
          childScope[fieldKey].splice(0);
        } else {
          childScope.splice(0);
        }
      } else {
        if (fieldKey !== undefined) {
          childScope[fieldKey].splice(itemIndex, 1);
        } else {
          childScope.splice(itemIndex, 1);
        }
      }
    },

    addObject: (
      childScope: any,
      fieldKey?: string,
      itemType?: string,
      objectId?: string
    ): void => {
      if (objectId === undefined) {
        const idPrefix = fieldKey === undefined ? 'temp' : fieldKey;
        objectId = this.getTempId(idPrefix);
      }
      if (fieldKey !== undefined) {
        if (!childScope.hasOwnProperty(fieldKey)) {
          childScope[fieldKey] = {};
        }
        while (childScope[fieldKey].hasOwnProperty(objectId)) {
          objectId = this.getTempId(fieldKey);
        }
        if (itemType === 'Array') {
          childScope[fieldKey][objectId] = [];
        } else {
          childScope[fieldKey][objectId] = {};
        }
      } else {
        while (childScope.hasOwnProperty(objectId)) {
          objectId = this.getTempId(fieldKey);
        }
        if (itemType === 'Array') {
          childScope[objectId] = [];
        } else {
          childScope[objectId] = {};
        }
      }
    },
  };

  // Helper method to generate temporary IDs
  private getTempId(prefix: string = 'temp'): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { DeHelperService };
