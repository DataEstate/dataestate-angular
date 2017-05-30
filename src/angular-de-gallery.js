//Version 0.5.3 //Tag Implementation
//REQUIRE DE-Module. 
de.provider('DeGalleryControl', function() {
	this.galleryId="";
	this.showGallery=false;
	this.triggerScope;
	this.$get=function() {
		this.isGalleryShown=function() {
			return this.showGallery;
		}
		this.toggleGallery=function(open) {
			this.showGallery=open==true?true:false;
			return this.showGallery;
		}
		this.setTriggerScope=function(triggerScope) {
			this.triggerScope=triggerScope;
		}
		return this;
	}
});
de.directive('deGalleryTrigger', function(DeGalleryControl) {
	return {
		scope: {
			galleryModel:"=?deGalleryModel", 
			galleryType:"=?deModelType", 
			onImgSelect:"&onSelectImage"
		},
		link: function(scope, element, attr) {
			element.on('click', function() {
				var type="object";
				// console.log(scope.galleryType);
				DeGalleryControl.setTriggerScope(scope);
				DeGalleryControl.toggleGallery(true);
				scope.$apply();
			});
		}
	}
});
de.directive('deGallery', function() {
	return {
		restrict:'E',
		scope: {
			gid:"@galleryId",
			showGallery:"=galleryShow",
			onGalleryOpen:"&",
			onGalleryClose:"&",
			onSelectImage:"&"
		},
		controller:function($scope, $element, DeMultimedia, DeGalleryControl) {
			var galleryId=$scope.gid;
			$scope.imgTabActive=true;
			$scope.fileTabActive=false;
			$scope.fileQueue={};
			$scope.tagFilters=[];
			$scope.shouldShow=function() {
				return DeGalleryControl.isGalleryShown();
			}
			$scope.toggleTags=function(tag) {
				var tagIndex=$scope.tagFilters.indexOf(tag);
				if (tagIndex < 0) {
					$scope.tagFilters.push(tag);
				}
				else {
					$scope.tagFilters.splice(tagIndex,1);
					console.log(tagIndex);
				}
			}
			$scope.tagActive=function(tag) {
				if ($scope.tagFilters.indexOf(tag) >=0) {
					return true;
				}
				else {
					return false;
				}
			}
			$scope.filtered=function(imageObj) {
				if ($scope.nameFilter!==undefined && $scope.nameFilter!="") {
					if (imageObj.name.indexOf($scope.nameFilter) >=0 || (imageObj.alt!==undefined && imageObj.alt.indexOf($scope.nameFilter)>=0)) {
						return true;
					}
					else {
						return false;
					}
				}
				else if ($scope.tagFilters.length <=0) {
					return true;
				}
				else if (imageObj.tags===undefined) {
					return false;
				}
				else {
					for (var i in imageObj.tags) {
						if ($scope.tagFilters.indexOf(imageObj.tags[i])>=0) {
							return true;
						}
					}
					return false;
				}
			}
			$scope.openGallery=function() {
				DeGalleryControl.toggleGallery(true);
			}
			$scope.closeGallery=function() {
				DeGalleryControl.toggleGallery(false);
			}
			$scope.loadImages=function() {
				DeMultimedia.data(galleryId).then(
					function success(res) {
						$scope.imageData=res.data;
						$scope.imageTags=[];
						for (var i in res.data) {
							if (res.data[i].tags !==undefined) {
								for (var j in res.data[i].tags) {
									if ($scope.imageTags.indexOf(res.data[i].tags[j]) < 0) {
										$scope.imageTags.push(res.data[i].tags[j]);
									}
								}
							}
						}
						console.log($scope.imageTags);
						//console.log($scope.imageData);
					},
					function error(err) {
						console.log("Error found");
					});
			}
			$scope.selectImage=function() {
				DeGalleryControl.triggerScope.onImgSelect({$imgContent:$scope.selectedImg});
				//Default Assignment
				var trigger=DeGalleryControl.triggerScope;
				// console.log(trigger);
				var assignType="object";
				if (trigger.galleryType !==undefined) {
					assignType=trigger.galleryType;
				}
				if (trigger.hasOwnProperty("galleryModel")) {
					var selectedImgData={
						id:$scope.selectedImg.id, 
						name:$scope.selectedImg.name,
						extension:$scope.selectedImg.extension,
						estate:$scope.selectedImg.estate,
						mime_type:$scope.selectedImg.mime_type,
						width:$scope.selectedImg.width,
						height:$scope.selectedImg.height,
						orientation:$scope.selectedImg.orientation,
						sizes:$scope.selectedImg.sizes,
						path:$scope.selectedImg.path,
						bytes:$scope.selectedImg.bytes,
						update_date:$scope.selectedImg.update_date
					};
					if ($scope.selectedImg.hasOwnProperty('alt')) {
						selectedImgData.alt=$scope.selectedImg.alt;
					}
					if ($scope.selectedImg.hasOwnProperty('author')) {
						selectedImgData.author=$scope.selectedImg.author;
					}
					if ($scope.selectedImg.hasOwnProperty('tags')) {
						selectedImgData.tags=$scope.selectedImg.tags;
					}
					if ($scope.selectedImg.hasOwnProperty('credit_url')) {
						selectedImgData.credit_url=$scope.selectedImg.credit_url;
					}
					switch(assignType) {
						case "array":
							console.log(trigger.galleryModel);
							if (trigger.galleryModel==undefined) {
								trigger.galleryModel=[];
							}
							trigger.galleryModel.push(selectedImgData);
							break;
						case "object":
						default:
							trigger.galleryModel=selectedImgData;
							break;
					}
				}			
				DeGalleryControl.toggleGallery(false);
			}
			$scope.saveImageMeta=function() {
				var selectedImgData={"data":{}};
				if ($scope.selectedImg.hasOwnProperty('alt')) {
					selectedImgData.data.alt=$scope.selectedImg.alt;
				}
				if ($scope.selectedImg.hasOwnProperty('author')) {
					selectedImgData.data.author=$scope.selectedImg.author;
				}
				if ($scope.selectedImg.hasOwnProperty('tags')) {
					selectedImgData.data.tags=$scope.selectedImg.tags;
					for (var i in $scope.selectedImg.tags) {
						if ($scope.imageTags.indexOf($scope.selectedImg.tags[i]) < 0) {
							$scope.imageTags.push($scope.selectedImg.tags[i]);
						}
					}
				}
				if ($scope.selectedImg.hasOwnProperty('credit_url')) {
					selectedImgData.data.credit_url=$scope.selectedImg.credit_url;
				}
				console.log($scope.selectedImg.id);
				DeMultimedia.update(galleryId+"/"+$scope.selectedImg.id, selectedImgData.data).then(
					function(res) {
						console.log(res.data);
					}
				)
			}
			$scope.activateTab=function(tabName) {
				if (tabName=='imgTab') {
					$scope.imgTabActive=true;
					$scope.fileTabActive=false;
				}
				else {
					$scope.imgTabActive=false;
					$scope.fileTabActive=true;
				}
			}
			$scope.deleteFile=function(index) {
				var file=$scope.imageData[index];
				file.removing=true;
				DeMultimedia.remove(galleryId, file.id).then(function(res) {
					$scope.imageData.splice(index, 1);
				}, 
				function(err) {
					//console.log(err);
				});
			}
			$scope.previewImg=function(imgObj) {
				$scope.selectedImg=imgObj;
			}
			$scope.addFile=function(file) {
				if (file !== undefined) {
					var fileContainer={
						"status":"PENDING",
						"file":file,
					};
					var rightNow=new Date();
					var nowTs=rightNow.getTime().toString();
					fileContainer.add_ts=nowTs;
					$scope.fileQueue[nowTs]=fileContainer;
					$scope.$apply();
				}
			}
			$scope.removeFile=function(fileKey) {
				console.log("Removing file "+fileKey+" from queue...");
				delete $scope.fileQueue[fileKey];
				//$scope.fileQueue.splice(index, 1);
			}
			$scope.uploadFiles=function() {
				var backup=[];
				var counter=0;
				var testCount=10;
				for (var i in $scope.fileQueue) {
					var fileObj=$scope.fileQueue[i];
					//REMOVE PROCEDURE
					$scope.uploadFile($scope.fileQueue[i]).then(function(res) {
						//Remove from queue
						var resFile=res.data.uploaded;
						var queueKey=resFile.add_ts;
						if (resFile !==undefined) {
							$scope.removeFile(queueKey);
						}
						if (Object.keys($scope.fileQueue).length <=0) {
						// if ($scope.fileQueue.length <=0) {
							$scope.loadImages();
							$scope.activateTab('imgTab');
						}
					});
				}
			}
			$scope.uploadFile=function(fileObj) {
				fileObj.isloading=true;
				var eh={
					progress:function(e) {
						// console.log('Upload progress');
						// console.log(e);
						fileObj.progress=e;
						fileObj.progress.percentage=e.loaded / e.total;
						// console.log(fileObj.progress.percentage);
					}
				};
				var meta={
					"add_ts":fileObj.add_ts
				}
				if (fileObj.meta !==undefined) {
					if (fileObj.meta.hasOwnProperty('alt')) {
						meta.alt=fileObj.meta.alt;
					}
					if (fileObj.meta.hasOwnProperty('author')) {
						meta.author=fileObj.meta.author;
					}
					if (fileObj.meta.hasOwnProperty('tags')) {
						meta.tags=fileObj.meta.tags.join(",");
					}
					if (fileObj.meta.hasOwnProperty('credit_url')) {
						meta.credit_url=fileObj.meta.credit_url;
					}
				}
				//console.log(meta);
				return DeMultimedia.upload(galleryId, fileObj.file, eh, meta);
			}
		},
		template:galleryTemplate
		//templateUrl:"/assets/js/angular-de-gallery-template.html"
	}
});
de.directive('deBindFiles', function() {
	return {
		scope: {
			onChange:"&deBindFiles"
		},
		link: function(scope, element,attrs) {
			element.on('change', function() {
				if (scope.onChange !==undefined) {
					if (element[0].files !==undefined) {
						for (var i in element[0].files) {
							console.log("Adding file: "+i);
							var fileObj=element[0].files[i];
							if (fileObj instanceof Blob) {
								scope.onChange({"file":element[0].files[i]});
							}
						}
					}
				}
			});
		}
	}
});
de.directive('dePreviewFile', function() {
	return {
		scope: {
			uploadFile:"=dePreviewFile"
		},
		link: function(scope, element,attrs) {
			var reader=new FileReader();
			reader.onload=function(e) {
				var filePreview="";
				var fileMime=scope.uploadFile.type.split("/");
				var fileType=fileMime[0];
				var fileExtension=fileMime[1];
				switch(fileType) {
					case "image":
						filePreview='<img class="preview preview-img" src="'+e.target.result+'" alt="preview">';
						break;
					default:
						filePreview='<div class="preview preview-'+fileExtension+'">'+fileExtension+' file</div>';
						break;
				}
				element.append(filePreview);
			};
			reader.readAsDataURL(scope.uploadFile);
		}
	}
});
de.filter('bytes', function() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	}
});
var galleryTemplate='<div class="gallery-mask" ng-show="shouldShow()" ng-click="closeGallery()"></div><div class="gallery-container" ng-init="loadImages()" ng-attr-id="gallery-{{id}}" ng-show="shouldShow()"><header class="gallery-header"><h2>Choose an Image</h2><button type="button" class="btn-op btn-close" ng-click="closeGallery()"></button></header><nav class="gallery-nav nav-tabs"><button type="button" class="btn-tab" ng-click="activateTab(\'imgTab\')" ng-class="{active : imgTabActive}">Gallery</button><button type="button" class="btn-tab" ng-click="activateTab(\'fileTab\')" ng-class="{active : fileTabActive}">Upload</button></nav><section class="gallery-content"><div class="gallery-tab img-tab" ng-show="imgTabActive"><div class="gallery-img-content"><div class="gallery-filters"><input type="text" ng-model="nameFilter" class="name-filter" placeholder="filter images by name"><div class="tags-filter tags-container"><div class="tag-filter-container" ng-repeat="tag in imageTags | orderBy"><button type="button" class="tags" ng-bind="tag" ng-click="toggleTags(tag)" ng-class="{\'active\':tagActive(tag)}"></button></div></div></div><div class="gallery-img-container" ng-repeat="imgObj in imageData" ng-show="filtered(imgObj)"><button type="button" class="btn-op btn-remove" ng-click="deleteFile($index)"></button><div class="gallery-img" ng-click="previewImg(imgObj)"><img ng-src="{{imgObj.sizes.thumb.path}}" ng-if="imgObj.type==\'image\'" ng-class="{\'portrait-img\':imgObj.orientation==\'portrait\'}"><i class="material-icons" ng-if="imgObj.type!=\'image\'">insert_drive_file</i><span ng-bind="imgObj.name" ng-if="imgObj.type!=\'image\'"></span></div><div class="img-remove" ng-if="imgObj.removing"></div></div></div><div class="gallery-preview-pane" ng-show="selectedImg"><div class="gallery-img-container"><div class="gallery-img" ng-class="{\'portrait-img\':selectedImg.orientation==\'portrait\', \'square-img\':selectedImg.orientation==\'square\'}"><img ng-src="{{selectedImg.sizes.medium.path}}" ng-if="selectedImg.type==\'image\'" ng-class="{\'portrait-img\':selectedImg.orientation==\'portrait\', \'square-img\':selectedImg.orientation==\'square\'}"><i class="material-icons" ng-if="selectedImg.type!=\'image\'">insert_drive_file</i><span ng-bind="selectedImg.name" ng-if="selectedImg.type!=\'image\'"></span></div></div><div class="gallery-img-meta"><dl><dt>Image Name: </dt><dd><span ng-bind="selectedImg.name"></span></dd><dt>Extension: </dt><dd><span ng-bind="selectedImg.extension"></span></dd><dt>Orientation:</dt><dd><span ng-bind="selectedImg.orientation"></span></dd><dt>Path: </dt><dd><span ng-bind="selectedImg.path"></span></dd><dt>Alt Text:</dt><dd><input type="text" ng-model="selectedImg.alt" placeholder="Alt text"></dd><dt>Tags:</dt><dd><div de-tag-input ng-model="selectedImg.tags"></div></dd><dt>Photographer:</dt><dd><input type="text" ng-model="selectedImg.author" placeholder="Photographer"></dd><dt>Credit Link:</dt><dd><input type="text" ng-model="selectedImg.credit_url" placeholder="Image credit\'s URL. "></dd></dl></div><div class="gallery-img-action"><button type="button" class="btn-select" ng-click="selectImage()">Select image</button><button type="button" class="btn-submit" ng-click="saveImageMeta()">Save image info</button></div></div></div><div class="gallery-tab file-tab" ng-show="fileTabActive"><div class="gallery-file-content"><div class="gallery-file-dropzone"></div><div class="gallery-file-container" ng-repeat="(fileKey,fileObj) in fileQueue"><div class="gallery-img-container"><button type="button" class="btn-op btn-remove" ng-click="removeFile(fileKey)"></button><div class="gallery-img"><div de-preview-file="fileObj.file"></div><div class="gallery-file-progress" ng-if="fileObj.isloading"><span>Uploading</span></div></div></div><div class="gallery-img-meta"><dl><dt>Image Name: </dt><dd><label class="file-name" ng-bind="fileObj.file.name"></label></dd><dt>File size: </dt><dd><span class="file-size" ng-bind="fileObj.file.size | bytes"></span></dd><dt>Alt Text:</dt><dd><input type="text" ng-model="fileQueue[fileKey].meta.alt" placeholder="Alt text"></dd><dt>Tags:</dt><dd><div de-tag-input ng-model="fileQueue[fileKey].meta.tags"></div></dd><dt>Photographer:</dt><dd><input type="text" ng-model="fileQueue[fileKey].meta.author" placeholder="Photographer"></dd><dt>Credit Link:</dt><dd><input type="text" ng-model="fileQueue[fileKey].meta.credit_url" placeholder="Image credit\'s URL. "></dd></dl></div></div></div><div class="gallery-file-action"><label for="upload-file" class="btn-upload">Choose Files</label><input type="file" id="upload-file" name="upload-file" de-bind-files="addFile(file)" multiple><button type="button" class="btn-upload-all" ng-click="uploadFiles()">Upload All</button></div></div></section></div>';

