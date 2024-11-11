import * as angular from 'angular';
import { IScope } from 'angular';
import { IDeHelperService } from '../services/de-helpers.service';

interface IChange {
  changed: any;
  removed: any;
}

interface IChangeSet {
  [dataId: string]: IChange;
}

interface IChangeSets {
  [setName: string]: IChangeSet;
}

interface IDataSet {
  [dataId: string]: any;
}

interface IDataSets {
  [setName: string]: IDataSet;
}

interface ITrackedScopes {
  [setName: string]: {
    [dataId: string]: ITrackedScope;
  };
}

interface ITrackedScope extends IScope {
  DeChangeReset?: () => void;
}

export interface IDeChangeRegisterService {
  registerTracking(
    setName: string,
    dataId: string | number,
    trackData: any,
    trackScope?: ITrackedScope
  ): void;
  commitTracking(setName?: string, dataId?: string | number): void;
  resetTracking(
    setName: string,
    dataId: string | number,
    trackData: any
  ): boolean | undefined;
  trackChanges(
    setName: string,
    dataId: string | number,
    compareData: any
  ): boolean | undefined;
  getChanges(setName?: string, dataId?: string | number): any;
  getOriginals(setName?: string, dataId?: string | number): any;
  hasChanged(setName: string, dataId?: string | number): boolean;
}

function DeChangeRegisterFactory(
  DeHelper: IDeHelperService
): IDeChangeRegisterService {
  const changeSets: IChangeSets = {};
  const originals: IDataSets = {};
  const newData: IDataSets = {};
  const trackedScopes: ITrackedScopes = {};

  function startTracking(
    setName: string,
    dataId: string | number,
    trackData: any
  ): boolean | undefined {
    if (
      setName !== undefined &&
      dataId !== undefined &&
      trackData !== undefined
    ) {
      if (!originals[setName]) {
        originals[setName] = {};
      }
      if (!newData[setName]) {
        newData[setName] = {};
      }
      originals[setName][dataId] = angular.copy(trackData);
      newData[setName][dataId] = trackData;
      return true;
    }
  }

  return {
    // This will override original data.
    registerTracking: function (
      setName: string,
      dataId: string | number,
      trackData: any,
      trackScope?: ITrackedScope
    ): void {
      if (
        setName !== undefined &&
        dataId !== undefined &&
        trackData !== undefined
      ) {
        startTracking(setName, dataId, trackData);
        if (trackScope !== undefined) {
          if (!trackedScopes[setName]) {
            trackedScopes[setName] = {};
          }
          trackedScopes[setName][dataId] = trackScope;
        }
      }
    },

    commitTracking: function (
      setName?: string,
      dataId?: string | number
    ): void {
      if (setName === undefined) {
        // Reset all tracking
        for (const key in originals) {
          if (originals.hasOwnProperty(key)) {
            delete originals[key];
          }
        }
        for (const key in changeSets) {
          if (changeSets.hasOwnProperty(key)) {
            delete changeSets[key];
          }
        }
      } else {
        if (newData[setName]) {
          if (dataId !== undefined && newData[setName][dataId] !== undefined) {
            originals[setName][dataId] = angular.copy(newData[setName][dataId]);
            const scope = trackedScopes[setName]?.[dataId];
            if (scope && typeof scope.DeChangeReset === 'function') {
              scope.DeChangeReset();
            }
          } else {
            originals[setName] = angular.copy(newData[setName]);
            if (trackedScopes[setName]) {
              for (const k in trackedScopes[setName]) {
                if (trackedScopes[setName].hasOwnProperty(k)) {
                  const scope = trackedScopes[setName][k];
                  if (scope && typeof scope.DeChangeReset === 'function') {
                    scope.DeChangeReset();
                  }
                }
              }
            }
          }
        }
        if (changeSets[setName] && dataId !== undefined) {
          delete changeSets[setName][dataId];
        }
      }
    },

    resetTracking: startTracking,

    // Return true if there are changes, false if none.
    trackChanges: function (
      setName: string,
      dataId: string | number,
      compareData: any
    ): boolean | undefined {
      if (
        originals[setName] !== undefined &&
        originals[setName][dataId] !== undefined
      ) {
        const changes = DeHelper.getDiff(
          originals[setName][dataId],
          compareData,
          true
        );
        if (
          !DeHelper.isEmpty(changes.changed) ||
          !DeHelper.isEmpty(changes.removed)
        ) {
          if (!changeSets[setName]) {
            changeSets[setName] = {};
          }
          changeSets[setName][dataId] = changes;
          return true;
        } else {
          if (changeSets[setName]) {
            delete changeSets[setName][dataId];
          }
          return false;
        }
      }
    },

    getChanges: function (setName?: string, dataId?: string | number): any {
      if (setName !== undefined) {
        if (changeSets[setName] !== undefined) {
          if (
            dataId === undefined ||
            changeSets[setName][dataId] === undefined
          ) {
            return changeSets[setName];
          } else {
            return changeSets[setName][dataId];
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    },

    getOriginals: function (setName?: string, dataId?: string | number): any {
      if (setName !== undefined && originals[setName] !== undefined) {
        if (dataId !== undefined && originals[setName][dataId] !== undefined) {
          return originals[setName][dataId];
        } else {
          return originals[setName];
        }
      } else {
        return originals;
      }
    },

    hasChanged: function (setName: string, dataId?: string | number): boolean {
      let itHas = true;
      if (setName !== undefined) {
        if (changeSets[setName] === undefined) {
          itHas = false;
        } else if (dataId !== undefined) {
          if (changeSets[setName][dataId] === undefined) {
            itHas = false;
          }
        }
      } else {
        itHas = false;
      }
      return itHas;
    },
  };
}

DeChangeRegisterFactory.$inject = ['DeHelper'];

export default DeChangeRegisterFactory;
