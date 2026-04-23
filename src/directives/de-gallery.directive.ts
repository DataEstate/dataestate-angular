import * as angular from 'angular';
import {
  IAugmentedJQuery,
  IDirective,
  IFilterFunction,
  IFilterService,
  IAttributes,
  IPromise,
  IScope,
} from 'angular';

interface IUploadProgressEvent {
  loaded: number;
  total: number;
  percentage?: number;
}

interface IQueuedFileMeta {
  alt?: string;
  author?: string;
  tags?: string[];
  credit_url?: string;
}

interface IQueuedFile {
  status: string;
  file: File;
  add_ts: string;
  meta?: IQueuedFileMeta;
  isloading?: boolean;
  progress?: IUploadProgressEvent;
}

interface IImageObject {
  id?: string;
  name?: string;
  extension?: string;
  estate?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  orientation?: string;
  sizes?: Record<string, { path: string }>;
  path?: string;
  bytes?: number;
  update_date?: string;
  alt?: string;
  caption?: string;
  author?: string;
  tags?: string[];
  credit_url?: string;
  sqId?: string;
  atdw_sq_number?: string;
  type?: string;
  removing?: boolean;
}

interface IDeGalleryTriggerScope extends IScope {
  galleryModel?: IImageObject | IImageObject[];
  galleryType?: 'object' | 'array' | string;
  onImgSelect: (args: { $imgContent: IImageObject | undefined }) => void;
}

interface IDeGalleryScope extends IScope {
  gid: string;
  showGallery: boolean;
  onGalleryOpen?: () => void;
  onGalleryClose?: () => void;
  onSelectImage?: (args: { $imgContent: IImageObject | undefined }) => void;
  loadOnOpen?: boolean;
  imgTabActive: boolean;
  fileTabActive: boolean;
  fileQueue: Record<string, IQueuedFile>;
  tagFilters: string[];
  shouldShow: boolean;
  imageData: IImageObject[];
  imageTags: string[];
  selectedImg?: IImageObject;
  nameFilter?: string;
  initGallery: () => void;
  toggleTags: (tag: string) => void;
  tagActive: (tag: string) => boolean;
  filtered: (imageObj: IImageObject) => boolean;
  openGallery: () => void;
  closeGallery: () => void;
  loadImages: () => void;
  selectImage: () => void;
  saveImageMeta: () => void;
  activateTab: (tabName: string) => void;
  deleteFile: (index: number) => void;
  previewImg: (imgObj: IImageObject) => void;
  addFile: (file?: File) => void;
  removeFile: (fileKey: string) => void;
  uploadFiles: () => void;
  uploadFile: (fileObj: IQueuedFile) => IPromise<any>;
}

interface IDeGalleryControlService {
  galleryId: string;
  showGallery: boolean;
  triggerScope?: IDeGalleryTriggerScope;
  galleryScope?: IDeGalleryScope;
  galleryLoaded: boolean;
  isGalleryShown: () => boolean;
  toggleGallery: (open: boolean) => void;
  setTriggerScope: (triggerScope: IDeGalleryTriggerScope) => void;
  setGalleryScope: (galleryScope: IDeGalleryScope) => void;
}

interface IDeGalleryControlProvider extends IDeGalleryControlService {
  $get: () => IDeGalleryControlService;
}

interface IDeMultimediaService {
  data: (gid: string) => IPromise<{ data: IImageObject[] }>;
  update: (endpoint: string, data: Record<string, unknown>) => IPromise<any>;
  remove: (gid: string, id?: string) => IPromise<any>;
  upload: (
    gid: string,
    file: File,
    events: { progress: (e: IUploadProgressEvent) => void },
    meta: Record<string, unknown>
  ) => IPromise<any>;
}

class DeGalleryControlProvider implements IDeGalleryControlProvider {
  galleryId = '';
  showGallery = false;
  triggerScope?: IDeGalleryTriggerScope;
  galleryScope?: IDeGalleryScope;
  galleryLoaded = false;

  $get = (): IDeGalleryControlService => {
    this.isGalleryShown = (): boolean => {
      return this.showGallery;
    };
    this.toggleGallery = (open: boolean): void => {
      this.showGallery = open === true;
      if (this.showGallery && this.galleryLoaded === false && this.galleryScope) {
        this.galleryScope.loadImages();
      }
      if (this.galleryScope) {
        this.galleryScope.shouldShow = this.showGallery;
      }
    };
    this.setTriggerScope = (triggerScope: IDeGalleryTriggerScope): void => {
      this.triggerScope = triggerScope;
    };
    this.setGalleryScope = (galleryScope: IDeGalleryScope): void => {
      this.galleryScope = galleryScope;
    };
    return this;
  };

  isGalleryShown = (): boolean => this.showGallery;
  toggleGallery = (_open: boolean): void => undefined;
  setTriggerScope = (_triggerScope: IDeGalleryTriggerScope): void => undefined;
  setGalleryScope = (_galleryScope: IDeGalleryScope): void => undefined;
}

function DeGalleryTriggerDirective(
  DeGalleryControl: IDeGalleryControlService
): IDirective<IDeGalleryTriggerScope> {
  return {
    scope: {
      galleryModel: '=?deGalleryModel',
      galleryType: '=?deModelType',
      onImgSelect: '&onSelectImage',
    },
    link: (scope: IDeGalleryTriggerScope, element: IAugmentedJQuery) => {
      element.on('click', () => {
        DeGalleryControl.setTriggerScope(scope);
        DeGalleryControl.toggleGallery(true);
        scope.$apply();
      });
    },
  };
}

DeGalleryTriggerDirective.$inject = ['DeGalleryControl'];

function buildSelectedImageData(selectedImg: IImageObject): IImageObject {
  const selectedImgData: IImageObject = {
    id: selectedImg.id,
    name: selectedImg.name,
    extension: selectedImg.extension,
    estate: selectedImg.estate,
    mime_type: selectedImg.mime_type,
    width: selectedImg.width,
    height: selectedImg.height,
    orientation: selectedImg.orientation,
    sizes: selectedImg.sizes,
    path: selectedImg.path,
    bytes: selectedImg.bytes,
    update_date: selectedImg.update_date,
  };

  if (Object.prototype.hasOwnProperty.call(selectedImg, 'alt')) {
    selectedImgData.alt = selectedImg.alt;
    selectedImgData.caption = selectedImg.caption;
  }
  if (Object.prototype.hasOwnProperty.call(selectedImg, 'author')) {
    selectedImgData.author = selectedImg.author;
  }
  if (Object.prototype.hasOwnProperty.call(selectedImg, 'tags')) {
    selectedImgData.tags = selectedImg.tags;
  }
  if (Object.prototype.hasOwnProperty.call(selectedImg, 'credit_url')) {
    selectedImgData.credit_url = selectedImg.credit_url;
  }
  if (Object.prototype.hasOwnProperty.call(selectedImg, 'sqId')) {
    selectedImgData.sqId = selectedImg.sqId;
  }
  if (Object.prototype.hasOwnProperty.call(selectedImg, 'atdw_sq_number')) {
    selectedImgData.atdw_sq_number = selectedImg.atdw_sq_number;
  }

  return selectedImgData;
}

function DeGalleryDirective(): IDirective<IDeGalleryScope> {
  return {
    restrict: 'E',
    scope: {
      gid: '@galleryId',
      showGallery: '=galleryShow',
      onGalleryOpen: '&',
      onGalleryClose: '&',
      onSelectImage: '&',
      loadOnOpen: '=?galleryLoadOnOpen',
    },
    controller: [
      '$scope',
      '$element',
      'DeMultimedia',
      'DeGalleryControl',
      function (
        $scope: IDeGalleryScope,
        $element: IAugmentedJQuery,
        DeMultimedia: IDeMultimediaService,
        DeGalleryControl: IDeGalleryControlService
      ) {
        void $element;
        $scope.imgTabActive = true;
        $scope.fileTabActive = false;
        $scope.fileQueue = {};
        $scope.tagFilters = [];
        $scope.shouldShow = false;
        $scope.imageData = [];
        $scope.imageTags = [];

        $scope.initGallery = (): void => {
          DeGalleryControl.setGalleryScope($scope);
          if ($scope.loadOnOpen === undefined || $scope.loadOnOpen === false) {
            $scope.loadImages();
          }
        };

        $scope.toggleTags = (tag: string): void => {
          const tagIndex = $scope.tagFilters.indexOf(tag);
          if (tagIndex < 0) {
            $scope.tagFilters.push(tag);
          } else {
            $scope.tagFilters.splice(tagIndex, 1);
            console.log(tagIndex);
          }
        };

        $scope.tagActive = (tag: string): boolean => {
          return $scope.tagFilters.indexOf(tag) >= 0;
        };

        $scope.filtered = (imageObj: IImageObject): boolean => {
          if ($scope.nameFilter !== undefined && $scope.nameFilter !== '') {
            return (
              (imageObj.name || '').indexOf($scope.nameFilter) >= 0 ||
              ((imageObj.alt || '').indexOf($scope.nameFilter) >= 0)
            );
          }
          if ($scope.tagFilters.length <= 0) {
            return true;
          }
          if (imageObj.tags === undefined) {
            return false;
          }
          for (const tag of imageObj.tags) {
            if ($scope.tagFilters.indexOf(tag) >= 0) {
              return true;
            }
          }
          return false;
        };

        $scope.openGallery = (): void => {
          DeGalleryControl.toggleGallery(true);
        };

        $scope.closeGallery = (): void => {
          DeGalleryControl.toggleGallery(false);
        };

        $scope.loadImages = (): void => {
          DeMultimedia.data($scope.gid).then(
            (res) => {
              $scope.imageData = res.data;
              $scope.imageTags = [];
              DeGalleryControl.galleryLoaded = true;
              for (const image of res.data) {
                if (image.tags !== undefined) {
                  for (const tag of image.tags) {
                    if ($scope.imageTags.indexOf(tag) < 0) {
                      $scope.imageTags.push(tag);
                    }
                  }
                }
              }
            },
            (_err) => undefined
          );
        };

        $scope.selectImage = (): void => {
          DeGalleryControl.triggerScope?.onImgSelect({
            $imgContent: $scope.selectedImg,
          });
          const trigger = DeGalleryControl.triggerScope;
          let assignType = 'object';
          if (trigger?.galleryType !== undefined) {
            assignType = trigger.galleryType;
          }
          if (trigger && Object.prototype.hasOwnProperty.call(trigger, 'galleryModel') && $scope.selectedImg) {
            const selectedImgData = buildSelectedImageData($scope.selectedImg);
            switch (assignType) {
              case 'array':
                if (trigger.galleryModel === undefined) {
                  trigger.galleryModel = [selectedImgData];
                } else {
                  (trigger.galleryModel as IImageObject[]).push(selectedImgData);
                }
                break;
              case 'object':
              default:
                trigger.galleryModel = selectedImgData;
                break;
            }
          }
          DeGalleryControl.toggleGallery(false);
        };

        $scope.saveImageMeta = (): void => {
          if (!$scope.selectedImg) {
            return;
          }
          const selectedImgData: { data: Record<string, unknown> } = { data: {} };
          if (Object.prototype.hasOwnProperty.call($scope.selectedImg, 'alt')) {
            selectedImgData.data.alt = $scope.selectedImg.alt;
          }
          if (Object.prototype.hasOwnProperty.call($scope.selectedImg, 'author')) {
            selectedImgData.data.author = $scope.selectedImg.author;
          }
          if (Object.prototype.hasOwnProperty.call($scope.selectedImg, 'tags')) {
            selectedImgData.data.tags = $scope.selectedImg.tags;
            for (const tag of $scope.selectedImg.tags || []) {
              if ($scope.imageTags.indexOf(tag) < 0) {
                $scope.imageTags.push(tag);
              }
            }
          }
          if (Object.prototype.hasOwnProperty.call($scope.selectedImg, 'credit_url')) {
            selectedImgData.data.credit_url = $scope.selectedImg.credit_url;
          }
          DeMultimedia.update(`${$scope.gid}/${$scope.selectedImg.id}`, selectedImgData.data).then(
            (res) => {
              console.log(res.data);
            }
          );
        };

        $scope.activateTab = (tabName: string): void => {
          if (tabName === 'imgTab') {
            $scope.imgTabActive = true;
            $scope.fileTabActive = false;
          } else {
            $scope.imgTabActive = false;
            $scope.fileTabActive = true;
          }
        };

        $scope.deleteFile = (index: number): void => {
          const file = $scope.imageData[index];
          if (!file) {
            return;
          }
          file.removing = true;
          DeMultimedia.remove($scope.gid, file.id).then(
            () => {
              $scope.imageData.splice(index, 1);
            },
            (_err) => undefined
          );
        };

        $scope.previewImg = (imgObj: IImageObject): void => {
          $scope.selectedImg = imgObj;
        };

        $scope.addFile = (file?: File): void => {
          if (file !== undefined) {
            const nowTs = new Date().getTime().toString();
            $scope.fileQueue[nowTs] = {
              status: 'PENDING',
              file,
              add_ts: nowTs,
            };
            console.log(file);
            $scope.$apply();
          }
        };

        $scope.removeFile = (fileKey: string): void => {
          console.log(`Removing file ${fileKey} from queue...`);
          delete $scope.fileQueue[fileKey];
        };

        $scope.uploadFiles = (): void => {
          for (const queueKey of Object.keys($scope.fileQueue)) {
            $scope.uploadFile($scope.fileQueue[queueKey]).then((res) => {
              const resFile = res.data.uploaded;
              const completedQueueKey = resFile.add_ts;
              if (resFile !== undefined) {
                $scope.removeFile(completedQueueKey);
              }
              if (Object.keys($scope.fileQueue).length <= 0) {
                $scope.loadImages();
                $scope.activateTab('imgTab');
              }
            });
          }
        };

        $scope.uploadFile = (fileObj: IQueuedFile): IPromise<any> => {
          fileObj.isloading = true;
          const eh = {
            progress: (e: IUploadProgressEvent) => {
              fileObj.progress = e;
              fileObj.progress.percentage = e.loaded / e.total;
            },
          };
          const meta: Record<string, unknown> = {
            add_ts: fileObj.add_ts,
          };
          if (fileObj.meta !== undefined) {
            if (Object.prototype.hasOwnProperty.call(fileObj.meta, 'alt')) {
              meta.alt = fileObj.meta.alt;
            }
            if (Object.prototype.hasOwnProperty.call(fileObj.meta, 'author')) {
              meta.author = fileObj.meta.author;
            }
            if (Object.prototype.hasOwnProperty.call(fileObj.meta, 'tags')) {
              meta.tags = fileObj.meta.tags?.join(',');
            }
            if (Object.prototype.hasOwnProperty.call(fileObj.meta, 'credit_url')) {
              meta.credit_url = fileObj.meta.credit_url;
            }
          }
          return DeMultimedia.upload($scope.gid, fileObj.file, eh, meta);
        };
      },
    ],
    template: galleryTemplate,
  };
}

function DeBindFilesDirective(): IDirective<IScope & { onChange?: (args: { file: File }) => void }> {
  return {
    scope: {
      onChange: '&deBindFiles',
    },
    link: (
      scope: IScope & { onChange?: (args: { file: File }) => void },
      element: IAugmentedJQuery
    ) => {
      element.on('change', () => {
        const input = element[0] as HTMLInputElement | undefined;
        if (scope.onChange !== undefined && input?.files !== undefined) {
          for (const fileObj of Array.from(input.files)) {
            console.log(`Adding file: ${fileObj.name}`);
            if (fileObj instanceof Blob) {
              scope.onChange({ file: fileObj });
            }
          }
        }
      });
    },
  };
}

function DePreviewFileDirective(): IDirective<IScope & { uploadFile: File }> {
  return {
    scope: {
      uploadFile: '=dePreviewFile',
    },
    link: (
      scope: IScope & { uploadFile: File },
      element: IAugmentedJQuery,
      _attrs: IAttributes
    ) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let filePreview = '';
        const fileMime = scope.uploadFile.type.split('/');
        const fileType = fileMime[0];
        const fileExtension = fileMime[1];
        switch (fileType) {
          case 'image':
            filePreview = `<img class="preview preview-img" src="${e.target?.result}" alt="preview">`;
            break;
          default:
            filePreview = `<div class="preview preview-${fileExtension}">${fileExtension} file</div>`;
            break;
        }
        element.append(filePreview);
      };
      reader.readAsDataURL(scope.uploadFile);
    },
  };
}

function BytesFilter(): IFilterFunction {
  return (bytes: string | number, precision?: number): string => {
    if (isNaN(parseFloat(bytes as string)) || !isFinite(bytes as number)) {
      return '-';
    }
    const resolvedPrecision = typeof precision === 'undefined' ? 1 : precision;
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const number = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
    return `${(Number(bytes) / Math.pow(1024, Math.floor(number))).toFixed(
      resolvedPrecision
    )} ${units[number]}`;
  };
}

const galleryTemplate = `<div class="gallery-mask" ng-show="shouldShow" ng-click="closeGallery()"></div>
<div class="gallery-container" ng-init="initGallery()" ng-attr-id="gallery-{{id}}" ng-show="shouldShow">
	<header class="gallery-header">
		<h2>Choose an Image</h2>
		<button type="button" class="btn-op btn-close" ng-click="closeGallery()"></button>
	</header>
	<nav class="gallery-nav nav-tabs">
		<button type="button" class="btn-tab" ng-click="activateTab('imgTab')" ng-class="{active : imgTabActive}">Gallery</button>
		<button type="button" class="btn-tab" ng-click="activateTab('fileTab')" ng-class="{active : fileTabActive}">Upload</button>
	</nav>
	<section class="gallery-content">
		<div class="gallery-tab img-tab" ng-show="imgTabActive">
			<div class="gallery-img-content">
				<div class="gallery-filters">
					<input type="text" ng-model="nameFilter" class="name-filter" placeholder="filter images by name">
					<div class="tags-filter tags-container">
						<div class="tag-filter-container" ng-repeat="tag in imageTags | orderBy">
							<button type="button" class="tags" ng-bind="tag" ng-click="toggleTags(tag)" ng-class="{'active':tagActive(tag)}"></button>
						</div>
					</div>
				</div>
				<div class="gallery-img-container" ng-repeat="imgObj in imageData" ng-show="filtered(imgObj)">
					<button type="button" class="btn-op btn-remove" ng-click="deleteFile($index)"></button>
					<div class="gallery-img" ng-click="previewImg(imgObj)">
						<img ng-src="{{imgObj.sizes.thumb.path}}" ng-if="imgObj.type=='image'" ng-class="{'portrait-img':imgObj.orientation=='portrait'}">
						<i class="material-icons" ng-if="imgObj.type!='image'">insert_drive_file</i>
						<span ng-bind="imgObj.name" ng-if="imgObj.type!='image'"></span>
					</div>
					<div class="img-remove" ng-if="imgObj.removing"></div>
				</div>
			</div>
			<div class="gallery-preview-pane" ng-show="selectedImg">
				<div class="gallery-img-container">
					<div class="gallery-img" ng-class="{'portrait-img':selectedImg.orientation=='portrait', 'square-img':selectedImg.orientation=='square'}">
						<img ng-src="{{selectedImg.sizes.medium.path}}" ng-if="selectedImg.type=='image'" ng-class="{'portrait-img':selectedImg.orientation=='portrait', 'square-img':selectedImg.orientation=='square'}">
						<i class="material-icons" ng-if="selectedImg.type!='image'">insert_drive_file</i>
						<span ng-bind="selectedImg.name" ng-if="selectedImg.type!='image'"></span>
					</div>
				</div>
				<div class="gallery-img-meta">
					<dl>
						<dt>Image Name: </dt>
						<dd>
							<span ng-bind="selectedImg.name"></span>
						</dd><dt>Extension: </dt>
						<dd>
							<span ng-bind="selectedImg.extension"></span></dd><dt>Orientation:</dt><dd><span ng-bind="selectedImg.orientation"></span>
						</dd>
						<dt>Path: </dt>
						<dd>
							<span ng-bind="selectedImg.path"></span>
						</dd>
						<dt>Alt Text:</dt>
						<dd>
							<input type="text" ng-model="selectedImg.alt" placeholder="Alt text">
						</dd>
						<dt>Tags:</dt>
						<dd>
							<div de-tag-input ng-model="selectedImg.tags"></div>
						</dd>
						<dt>Photographer:</dt>
						<dd>
							<input type="text" ng-model="selectedImg.author" placeholder="Photographer">
						</dd>
						<dt>Credit Link:</dt>
						<dd>
							<input type="text" ng-model="selectedImg.credit_url" placeholder="Image credit's URL. ">
						</dd>
					</dl>
				</div>
				<div class="gallery-img-action">
					<button type="button" class="btn-select" ng-click="selectImage()">Select image</button>
					<button type="button" class="btn-submit" ng-click="saveImageMeta()">Save image info</button>
				</div>
			</div>
		</div>
		<div class="gallery-tab file-tab" ng-show="fileTabActive">
			<div class="gallery-file-content">
				<div class="gallery-file-dropzone"></div>
				<div class="gallery-file-container" ng-repeat="(fileKey,fileObj) in fileQueue">
					<div class="gallery-img-container">
						<button type="button" class="btn-op btn-remove" ng-click="removeFile(fileKey)"></button>
						<div class="gallery-img">
							<div de-preview-file="fileObj.file"></div>
							<div class="gallery-file-progress" ng-if="fileObj.isloading">
								<span>Uploading</span>
							</div>
						</div>
					</div>
					<div class="gallery-img-meta">
						<dl>
							<dt>Image Name: </dt>
							<dd>
								<label class="file-name" ng-bind="fileObj.file.name"></label>
							</dd>
							<dt>File size: </dt>
							<dd>
								<span class="file-size" ng-bind="fileObj.file.size | bytes"></span>
							</dd>
							<dt>Alt Text:</dt>
							<dd>
								<input type="text" ng-model="fileQueue[fileKey].meta.alt" placeholder="Alt text">
							</dd>
							<dt>Tags:</dt>
							<dd>
								<div de-tag-input ng-model="fileQueue[fileKey].meta.tags"></div>
							</dd>
							<dt>Photographer:</dt>
							<dd>
								<input type="text" ng-model="fileQueue[fileKey].meta.author" placeholder="Photographer">
							</dd>
							<dt>Credit Link:</dt>
							<dd>
								<input type="text" ng-model="fileQueue[fileKey].meta.credit_url" placeholder="Image credit's URL. ">
							</dd>
						</dl>
					</div>
				</div>
			</div>
			<div class="gallery-file-action">
				<label for="upload-file" class="btn-upload">Choose Files</label>
				<input type="file" id="upload-file" name="upload-file" de-bind-files="addFile(file)" multiple>
				<button type="button" class="btn-upload-all" ng-click="uploadFiles()">Upload All</button>
			</div>
		</div>
	</section>
</div>`;

const de = angular.module('dataEstateModule');
de.provider('DeGalleryControl', DeGalleryControlProvider);
de.directive('deGalleryTrigger', DeGalleryTriggerDirective);
de.directive('deGallery', DeGalleryDirective);
de.directive('deBindFiles', DeBindFilesDirective);
de.directive('dePreviewFile', DePreviewFileDirective);
de.filter('bytes', BytesFilter);

export {
  BytesFilter,
  DeBindFilesDirective,
  DeGalleryControlProvider,
  DeGalleryDirective,
  DeGalleryTriggerDirective,
  DePreviewFileDirective,
};
