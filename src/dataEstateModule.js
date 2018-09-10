//Version 0.5 new directives
var de=angular.module("dataEstateModule", []);
//CONSTANTS
de.constant('VERSION', 0.5);
 //Main Provider
de.provider('DeApi', function() {
	this.apiUrl="https://api.dataestate.net/v2"; //Default
	this.apiKey="";
	this.authType="api-key"; //Default v0.1.4
	this.oauthData={};
	//Configurations.
	this.setApi=function(api_url) {
		this.apiUrl=api_url;
	}
	this.setApiKey=function(api_key) {
		this.apiKey=api_key;
	}
	//v0.1.4
	this.setToken=function(auth_token) {
		this.oauthData.token=auth_token;
	}
	//v0.4.9: added "none" for proxies
	this.setAuthType=function(auth_type) {
		var allowedTypes=["token", "api-key", "none"];
		if (allowedTypes.indexOf(auth_type) >= 0) {
			this.authType=auth_type;
		}
	}
	this.getAuthType=function() {
		return this.authType;
	}
	//RETURN THIS
	this.$get=function($http) {
		//Base requester.
		this.get=function(endpoints, params) {
			if (endpoints !== undefined) {
				var httpReq={
					url:this.apiUrl+endpoints,
					method:"GET"
				};
				if (this.authType=="api-key") {
					if (params !==undefined && !params.hasOwnProperty("api_key")) {
						params.api_key=this.apiKey;
					}
				}
				else if (this.authType=="token") {
					httpReq.headers={
						"Authorization":"Bearer "+this.oauthData.token
					};
				}
				httpReq.params=params;
				return $http(httpReq);
			}
		}
		this.put=function(endpoints, data) {
			if (endpoints !==undefined) {
				var rh={};
				if (this.authType=="api-key") {
					rh["API-KEY"]=this.apiKey
				}
				else if (this.authType=="token") {
					rh["Authorization"]="Bearer "+this.oauthData.token;
				};
				return $http({
					url:this.apiUrl+endpoints,
					method:"PUT",
					data:data,
					headers:rh
				});
			}
		}
		this.post=function(endpoints, data) {
			if (endpoints !==undefined) {
				var rh={};
				if (this.authType=="api-key") {
					rh["API-KEY"]=this.apiKey
				}
				else if (this.authType=="token") {
					rh["Authorization"]="Bearer "+this.oauthData.token;
				}
				return $http({
					url:this.apiUrl+endpoints,
					method:"POST",
					data:data,
					headers:rh
				});
			}
		}
		this.delete=function(endpoints) {
			if (endpoints !==undefined) {
				var rh={};
				if (this.authType=="api-key") {
					rh["API-KEY"]=this.apiKey
				}
				else if (this.authType=="token") {
					rh["Authorization"]="Bearer "+this.oauthData.token;
				}
				return $http({
					url:this.apiUrl+endpoints,
					method:"DELETE",
					headers:rh
				});
			}
		}
		//Must follow RFC6902 structure
		this.patch=function(endpoints, pipeline) {
			if (endpoints !==undefined) {
				var rh={};
				if (this.authType=="api-key") {
					rh["API-KEY"]=this.apiKey
				}
				else if (this.authType=="token") {
					rh["Authorization"]="Bearer "+this.oauthData.token;
				}
				return $http({
					url:this.apiUrl+endpoints,
					method:"PATCH",
					data:pipeline,
					headers:rh
				});
			}
		} 
		return this;
	}
});
//Estate Service
de.factory('DeEstates', function(DeApi) {
	return {
		data: function(params, id) {
			if (id==undefined) {
				id="";
			}
			var endpoints="/estates/data/"+id;
			return DeApi.get(endpoints, params);
		},
		update: function(id, data, language, remove_data, add_data) {
			var endpoints="/estates/data/"+id;
			var putData={
				"data":data
			};
			if (language !==undefined && language !="english") {
				putData.language=language;
			}
			if (remove_data !==undefined && remove_data !==null) {
				putData.remove=remove_data;
			}
			if (add_data !==undefined && add_data !== null) {
				putData.add=add_data;
			}
			return DeApi.put(endpoints, putData);
		},
		create: function(category_code, data) {
			var endpoints="/estates/data/";
			var postData={
				"data":data
			}
			return DeApi.post(endpoints, postData);
		},
		remove: function(id) {
			var endpoints="/estates/data/"+id;
			return DeApi.delete(endpoints);
		}
	}
});
// v0.1.6: assets added categories as dictionary.
de.factory('DeAssets', function(DeApi) {
	var currentEstate="";
	return {
		setEstate:function(estate) {
			currentEstate=estate;
		},
		getEstate:function() {
			return currentEstate;
		},
		data: function(params, id) {
			if (id==undefined) {
				id="";
			}
			var endpoints="/assets/data/"+id;
			return DeApi.get(endpoints, params);
		},
		// v0.5
		articles: function(estate, slug, params = {}) {
			if (slug==undefined) {
				slug="";
			}
			var endpoints="/assets/articles/" + estate + "/" + slug;
			return DeApi.get(endpoints, params);
		},
		// v0.1.3
		timetable:function(params) {
			var endpoints="/assets/timetable/";
			return DeApi.get(endpoints, params);
		},
		//v0.1.8
		flights:function(params) {
			var endpoints="/assets/flights/";
			return DeApi.get(endpoints, params);
		},
		update: function(id, data, language, remove_data, add_data) {
			var endpoints="/assets/data/"+id;
			var putData={
				"data":data
			};
			if (language !==undefined) {
				putData.language=language;
			}
			if (remove_data !==undefined && remove_data !==null && Object.keys(remove_data).length > 0) {
				putData.remove=remove_data;
			}
			if (add_data !==undefined && add_data !== null) {
				putData.add=add_data;
			}
			return DeApi.put(endpoints, putData);
		},
		create: function(estate, type, data) {
			var endpoints="/assets/data/";
			if (!data.hasOwnProperty("type")) {
				data.type=type;
			}
			if (estate===undefined) {
				estate=currentEstate;
			}
			var postData={
				"data":data,
				"estate_id":estate
			}
			return DeApi.post(endpoints, postData);
		},
		remove: function(id) {
			var endpoints="/assets/data/"+id;
			return DeApi.delete(endpoints);
		}, 
		bulkRemove:function(estate, type, ids) {
			var endpoints="/assets/data/"+estate;
			var bulkPipeline=[];
			for (var i in ids) {
				bulkPipeline.push({"op":"remove", "path":type+"/"+ids[i]});
			}
			return DeApi.patch(endpoints, bulkPipeline);
		}
	}
});
// v0.3.6
de.factory('DeUsers', function(DeApi, $q) {
	var currentUser=null;
	return {
		data:function(reload) {
			var d=$q.defer();
			var endpoints="/users/data/";
			if (reload==true || currentUser===null) {
				DeApi.get(endpoints).then(
					function success(res) {
						currentUser=res.data;
						d.resolve(currentUser);
					},
					function error(err) {
						d.reject(err);
					});
			}
			else {
				d.resolve(currentUser);
			}
			return d.promise;
		}
	}
})
// v0.1.2: taxonomy - TODO: Get from API.
de.factory('DeTaxonomy', function(DeApi) {
	var subtypes=[
	    {
	        "type" : "LANDMARK",
	        "description" : "Landmark"
	    },
	    {
	        "type" : "EDUCATION",
	        "description" : "Educational"
	    },
	    {
	        "type" : "FOODDRINK",
	        "description" : "Food and Drink"
	    },
	    {
	        "type" : "MUSICAL",
	        "description" : "Musical Performance"
	    },
	    {
	        "type" : "CEREMONY",
	        "description" : "Ceremony"
	    },
	    {
	        "type" : "SPORT",
	        "description" : "Sports Event"
	    },
	    {
	        "type" : "PERFORMANCE",
	        "description" : "Performances"
	    },
	    {
	        "type" : "PARADE",
	        "description" : "March and Parade"
	    },
	    {
	        "type" : "CULTURAL",
	        "description" : "Cutural"
	    },
	    {
	        "type" : "ACTIVITY",
	        "description" : "Activities"
	    },
	    {
	        "type" : "MEDITATION",
	        "description" : "Meditation"
	    },
	    {
	        "type" : "PHOTOGRAPHY",
	        "description" : "Photography Event"
	    },
	    {
	        "type" : "TALK",
	        "description" : "Talks"
	    },
	    {
	        "type" : "FORUM",
	        "description" : "Forums"
	    },
	    {
	        "type" : "FOOD",
	        "description" : "Food"
	    },
	    {
	        "type" : "DESSERT",
	        "description" : "Snacks and Desserts"
	    },
	    {
	        "type" : "DRINK",
	        "description" : "Drinks"
	    },
	    {
	        "type" : "SHOP",
	        "description" : "Shops"
	    },
	    {
	        "type" : "INFO",
	        "description" : "Information"
	    },
	    {
	        "type" : "VOLUNTEER",
	        "description" : "Volunteers"
	    },
	    {
	        "type" : "DISPLAY",
	        "description" : "Art and Display"
	    },
	    {
	        "type" : "SERVICE",
	        "description" : "Services"
	    }
	];
	var locations=[
		{
			"id" : "BNELETTER",
			"name":"Brisbane Letters",
			"loc":[
				-27.474147,
				153.020482
			]
		},
		{
	        "id" : "QC",
	        "name" : "Queensland Conservatorium",
	        "loc" : [
	            -27.4768193,
	            153.0208075
	        ]
	    },
	    {
	    	"id":"LIANA",
	    	"name":"Liana Lounge",
	    	"loc": [
	    		-27.475902, 153.021213
	    	]
	    },
	    {
	        "loc" : [
	            -27.4706487,
	            153.0170457
	        ],
	        "id" : "GOMA",
	        "name" : "GOMA (Gallery of Modern Art)"
	    },
	    {
	        "id" : "CF",
	        "name" : "Cultural Forecourt",
	        "loc" : [
	            -27.4739896,
	            153.0203686
	        ]
	    },
	    {
	        "loc" : [
	            -27.4748418,
	            153.0212796
	        ],
	        "id" : "RB",
	        "name" : "Riverbank"
	    },
	    {
	        "loc" : [
	            -27.476474,
	            153.021173
	        ],
	        "name" : "Lumbini Garden",
	        "id" : "LG"
	    },
	    {
	        "loc" : [
	            -27.4771943,
	            153.0217732
	        ],
	        "id" : "NB",
	        "name" : "No Boundaries"
	    },
	    {
	        "loc" : [
	            -27.476186,
	            153.021666
	        ],
	        "name" : "Rainforest Green",
	        "id" : "RG"
	    },
	    {
	        "id" : "CMP",
	        "name" : "The South Bank Piazza",
	        "loc" : [
	            -27.4769716,
	            153.0214888
	        ]
	    },
	    {
	        "id" : "PAS",
	        "loc" : [
	            -27.474771,
	            153.0209563
	        ],
	        "name" : "Performing Arts Stage"
	    }
	];
	var categories={
		"ACCOMM":"Accommodation",
		"APP":"Application",
		"ATTRACTION": "Attraction",
		"COMPANY": "Company",
		"DESTINFO":"Destination Information",
		"EVENT":"Event",
		"GROUP":"Group",
		"HIRE":"Hire",
		"INFO":"Information Services",
		"JOURNEY":"Journey",
		"ORG":"Organisation",
		"RESTAURANT":"Food and Drink",
		"TOUR":"Tour",
		"TRANSPORT":"Transport"
	};
	var social=[
		{id:"in",name:"Instagram"},{id:"fb",name:"Facebook"},{id:"li",name:"LinkedIn"}, {id:"tw",name:"Twitter"},{id:"yt",name:"YouTube"}
	];
	return {
		subtypes: function() {
			return subtypes;
		},
		locations: function() {
			return locations;
		},
		categories: function() {
			return categories;
		},
		accreditations: function() {
			var endpoints="/taxonomy/data/ACCREDITN";
			return DeApi.get(endpoints, {});
		},//v0.3
		social:function() {
			return social;
		},
		data: function(params, id) {
			if (id==undefined) {
				id="";
			}
			var endpoints="/taxonomy/data/"+id;
			return DeApi.get(endpoints, params);
		},
		//v0.3.8
		update: function(id, data, language, remove_data, add_data) {
			var endpoints="/taxonomy/data/"+id;
			var putData={
				"data":data
			};
			if (language !==undefined) {
				putData.language=language;
			}
			if (remove_data !==undefined && remove_data !==null) {
				putData.remove=remove_data;
			}
			if (add_data !==undefined && add_data !== null) {
				putData.add=add_data;
			}
			return DeApi.put(endpoints, putData);
		},
		create:function(type,data) {
			var endpoints="/taxonomy/data/";
			if (!data.hasOwnProperty("type")) {
				data.type=type;
			}
			var postData={
				"data":data
			}
			return DeApi.post(endpoints, postData);
		},
		remove:function(id) {
			var endpoints="/taxonomy/data/"+id;
			return DeApi.delete(endpoints);
		}
	}
});
// v0.4.5
de.factory('DeLocations', function(DeApi) {
	return {
		data:function(params, id) {
			if (id==undefined) {
				id="";
			}
			var endpoints="/locations/data/"+id;
			return DeApi.get(endpoints, params);
		}, //v0.4.7
		update:function(id,data, language, remove_data, add_data) {
			var endpoints="/locations/data/"+id;
			var putData={
				"data":data
			};
			if (language !==undefined && language !="english") {
				putData.language=language;
			}
			if (remove_data !==undefined && remove_data !==null) {
				putData.remove=remove_data;
			}
			if (add_data !==undefined && add_data !== null) {
				putData.add=add_data;
			}
			return DeApi.put(endpoints, putData);
		}
	}
});
// v0.4.8
de.factory('DeCollectors', function(DeApi) {
	return {
		data:function(params, id) {
			if (id==undefined) {
				id="";
			}
			var endpoints="/collector/data/"+id;
			return DeApi.get(endpoints, params);
		},
		create:function(data, estate_id) {
			var endpoints="/collector/data/";
			var postData={
				"data":data
			}
			if (estate_id!==undefined) {
				postData.estate_id=estate_id;
			}
			return DeApi.post(endpoints, postData);
		}, 
		update:function(id,data,language,remove_data,add_data) {
			var endpoints="/collector/data/"+id;
			var putData={
				"data":data
			};
			if (language !==undefined && language !="english") {
				putData.language=language;
			}
			if (remove_data !==undefined && remove_data !==null) {
				putData.remove=remove_data;
			}
			if (add_data !==undefined && add_data !== null) {
				putData.add=add_data;
			}
			return DeApi.put(endpoints, putData);
		}
	}
});
// v0.2.4: Multimedia Merge
de.factory('DeMultimedia', function(DeApi, $http) {
	var multimedia=[];
	return {
		data: function(estate, params) {
			if (estate==undefined) {
				estate="";
			}
			var endpoints="/multimedia/"+estate;
			return DeApi.get(endpoints, params);
		},
		update:function(estate, data, remove_data, add_data) {
			var endpoints="/multimedia/"+estate;
			var putData={
				"data":data
			};
			if (remove_data !==undefined && remove_data !==null) {
				putData.remove=remove_data;
			}
			if (add_data !==undefined && add_data !== null) {
				putData.add=add_data;
			}
			return DeApi.put(endpoints, putData);
		},
		upload: function(estate, file, uploadEventHandlers, meta) {
			//Construct file.
			var endpoints="/multimedia/"+estate;
			var fd = new FormData();
			fd.append("file", file, file.name);
			fd.append("estate", estate);
			//v0.3.3
			if (meta!==undefined) {
				for (var m in meta) {
					fd.append(m, meta[m]);
				}
			}
			var rh={"Content-Type":undefined};
			if (DeApi.authType=="api-key") {
				rh["API-KEY"]=DeApi.apiKey
			}
			else if (DeApi.authType=="token") {
				rh["Authorization"]="Bearer "+DeApi.oauthData.token;
			}
			var httpRequest={
				url:DeApi.apiUrl+endpoints,
				method:"POST",
				data: fd,
				headers: rh,
				transformRequest:function(data,header) {
					return data;
				}
			};
			if (uploadEventHandlers !==undefined && uploadEventHandlers !="") {
				httpRequest.uploadEventHandlers=uploadEventHandlers;
			}
			return $http(httpRequest);
		},
		remove: function(estate, id) {
			var endpoints="/multimedia/"+estate+"/"+id;
			return DeApi.delete(endpoints);
		},
		loadLast: function() {
			//TODO: Use Promise
			return multimedia;
		}
	}
});
// v0.1.2: HELPER
de.factory('DeHelper', function() {
	function removeEmpty(jsonOriginal) {
		if (jsonOriginal===undefined) {
			return null;
		}
		else {
			var jsonData=JSON.parse(JSON.stringify(jsonOriginal));
			if (!isEmpty(jsonData)) {
				switch (getType(jsonData)) {
					case "Array":
						for (var k in jsonData) {
							if (isEmpty(jsonData[k], true)) {
								jsonData=jsonData.splice(k, 1);
							}
							else {
								jsonData[k]=removeEmpty(jsonData[k]);
								if (jsonData[k]==undefined || jsonData[k]===null) {
									jsonData.splice(k, 1);
								}
							}
						}
						break;
					case "Object":
						for (var k in jsonData) {
							if (isEmpty(jsonData[k], true)) {
								delete jsonData[k];
							}
							else {
								jsonData[k]=removeEmpty(jsonData[k]);
								if (jsonData[k]==undefined || jsonData[k]===null) {
									delete jsonData[k];
								}
							}
						}
						break;
				}
				if (isEmpty(jsonData)) {
					return null;
				}
				else {
					return jsonData;
				}
			}
			else {
				return null;
			}
		}
	}
	function isEmpty(jsonObj, testString) {
		var empty=false;
		if (typeof testString=='undefined') {
			testString=true;
		}
		else {
			testString=false;
		}
		switch(getType(jsonObj)) {
			case "Array":
				if (jsonObj.length <=0) {
					empty=true;
				}
				else {
					empty=true;
					for (var a in jsonObj) {
						if (!isEmpty(jsonObj[a])) {
							empty=false;
						}
					}
				}
				break;
			case "Object":
				if (Object.keys(jsonObj).length <= 0) {
					empty=true;
				}
				break;
			case "String":
				if (testString && jsonObj=="") {
					empty=true;
				}
				break;
			default:
				if (typeof jsonObj=='undefined') {
					empty=true;
				}
				break;
		}
		return empty;
	}
	function getType(data) {
		var typeString=Object.prototype.toString.call(data);
		if (typeString !== undefined) {
			return typeString.replace("[object ", "").replace("]", "");
		}
		else {
			return "undefined";
		}
	}
	//Model editor
	function addItem(childScope, fieldKey, atStart, defaultItem) {
		var newObj={};
		if (defaultItem !==undefined) {
			newObj=defaultItem;
		}
		if (fieldKey!==undefined && fieldKey!=="") {
			if (!childScope.hasOwnProperty(fieldKey)) {
				childScope[fieldKey]=[];
			}
			if (atStart==true) {
				childScope[fieldKey].unshift(newObj);
			}
			else {

				childScope[fieldKey].push(newObj);
			}
		}
		else {
			if (atStart==true) {
				childScope.unshift(newObj);
			}
			else {
				childScope.push(newObj);
			}
		}
	}
	function copyItem(childScope, itemIndex, objectScope) {
		var newObject=angular.copy(objectScope);
		if (newObject.hasOwnProperty("id")) {
			newObject.id=newObject.id+"-copy";
		}
		if (typeof itemIndex ==='undefined' || itemIndex=="null") {
			childScope.splice(0, 0, newObject);
		}
		else {
			childScope.splice(itemIndex, 0, newObject);
		}
	}
	function removeItem(childScope, itemIndex, fieldKey) {
		if (typeof itemIndex ==='undefined' || itemIndex=="null") {
			if (fieldKey !== undefined) {
				childScope[fieldKey].splice(0);
			}
			else {
				childScope.splice(0);
			}
		}
		else {
			if (fieldKey !== undefined) {
				childScope[fieldKey].splice(itemIndex,1);
			}
			else {
				childScope.splice(itemIndex,1);
			}
		}
	}
	function addObject(childScope, fieldKey, itemType, objectId) {
		if (objectId==undefined) {
			var idPrefix=(fieldKey==undefined) ? "temp":fieldKey;
			objectId=getTempId(fieldKey);
		}
		if (fieldKey!==undefined) {
			if (!childScope.hasOwnProperty(fieldKey)) {
				childScope[fieldKey]={};
			}
			while(childScope[fieldKey].hasOwnProperty(objectId)) {
				objectId=getTempId(idPrefix);
			}
			if (itemType=="Array") {
				childScope[fieldKey][objectId]=[];
			}
			else {
				childScope[fieldKey][objectId]={};
			}
		}
		else {
			while(childScope.hasOwnProperty(objectId)) {
				objectId=getTempId(idPrefix);
			}
			if (itemType=="Array") {
				childScope[objectId]=[];
			}
			else {
				childScope[objectId]={};
			}
		}
	}
	return {
		inArray:function(item, array, compare_key) {
			if (array==undefined) {
				return false;
			}
			else {
				if (Array.isArray(item)){
					for (var i in array) {
						for (var j in item) {
							if (item[j]==array[i]) {
								return true;
							}
						}
					}
				}
				else if (typeof item=="object")  {
					//var same=false;
					for (var i in array) {
						if (angular.equals(array[i], item)) {
							return true;
						}
					}
					return false;
				}
				else {
					if (compare_key !== undefined) {
						for (var i in array) {
							if (array[i][compare_key]==item) {
								return true;
							}
						}
					}
					return (array.indexOf(item) >= 0);
				}
			}
		},
		getQueryParameter:function(str) {
			var queryDoc=document.location.search.replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
			if (str === undefined) {
				return queryDoc;
			}
			else {
				return queryDoc[str];
			}
		}, //v0.2.9
		getURLPaths:function(index) {
			var urlPaths=window.location.pathname.split("/");
			urlPaths.shift(); //Remove the front, as it's always ""
			if (index==-1) { //Get last non empty element
				var elem=urlPaths.pop();
				if (elem=="") {
					elem=urlPaths.pop();
				}
				return elem;
			}
			else if (index !==undefined) {
				return urlPaths[index];
			}
			else {
				return urlPaths;
			}
		},
		getDiff: function(json1, json2, includeDelete) {
			var changed={};
			var removed={};
			if (getType(json2)=="Array") {
				changed=[];
			}
			if (typeof json2 == 'object' && typeof json1=='object' && !angular.equals(json1, json2)) {
				var newJson = angular.copy(json2);
				for (var key in newJson) {
					if (!json1.hasOwnProperty(key) || !angular.equals(json1[key], newJson[key])) {
						newJson[key]=removeEmpty(newJson[key]);
						if (newJson[key]!==null) {
							changed[key]=newJson[key];
						}
					}
				}
				if (includeDelete==true) {
					for (var okey in json1) {
						if (!newJson.hasOwnProperty(okey) || newJson[okey]==null) {
							removed[okey]="";
						}
					}
					return {
						"changed":changed,
						"removed":removed
					};
				}
				else {
					return changed;
				}
			}
			else {
				return changed;
			}
		},
		isEmpty: isEmpty,
		model: { //0.2.5
			addItem:addItem,
			copyItem:copyItem,
			removeItem:removeItem,
			addObject:addObject
		}
	}
});
// v0.2.2: Require CATEGORY ICONS
de.provider('DeIcons', function() {
	this.categoryURL="http://warehouse.dataestate.com.au/DE/categories/";
	//Config
	this.setCategoryURL=function(catURL) {
		this.categoryURL=catURL;
	};
	this.$get=function() {
		this.categoryIcon=function(categoryString) {
			if (categoryString !==undefined) {
				return this.categoryURL+categoryString+".svg";
			}
		}
		return this;
	}
});

//DIRECTIVES
/**
* deLink:
*  de-link=''
*  de-link-action='' (optional)
* Used to parse Data Estate Link objects. If object type is api or internal, then
* the de-link-action attribute is used to identify what function to call.
*/
//DE-LINK FORMAT CHANGED! Won't work with md-button
de.directive('deLink', function() {
	return {
		scope: {
			deLink:'=?deLink',
			apiAction:'&?deApiAction',
			internalAction:'&?deInternalAction',
			linkOptions:'=?deLinkOptions'
		},
		transclude:'element',
		link: function(scope, element, attrs, mdb) {
			var boundScope=scope.deLink;
			if (scope.deLink.type !==undefined) {
				if (scope.deLink.type=="api") {
					element.on('click', function() {
						scope.apiAction(
							{
								"$elem":element,
								"endpoints":scope.deLink.endpoints,
								"params":scope.deLink.params
							});
					});
				}
				else if (scope.deLink.type=="internal") {
					element.on('click', function() {
						scope.internalAction(
							{
								"$elem":element,
								"link":scope.deLink.link
							});
					});
				}
				else {
					if (scope.linkOptions!==undefined) {
						if (scope.linkOptions.targets !==undefined) {
							for (var typeKey in scope.linkOptions.targets) {
								if(typeKey==scope.deLink.type) {
									element.attr("target", scope.linkOptions.targets[typeKey]);
								}
							}
						}
					}
					element.attr("href", scope.deLink.link);
				}
			}
		}
	}
});
de.directive('deJson', function($parse) {
	return {
		restrict:'A',
		scope:{
			jsonValue:"=deJson"
		},
		link: function(scope, element, attrs) {
			if (scope.jsonValue !==undefined) {
				var jsonText = JSON.stringify(scope.jsonValue);
				element.text(jsonText);
			}
			element.on('change', function(ev) {
				scope.$apply(function() {
					try {
						scope.jsonValue=JSON.parse(ev.currentTarget.value);
					}
					catch (e) {
						alert(ev.currentTarget.value+" is not a valid JSON string. Changes not saved.");
					}
				});
			});
		}
	}
});
de.directive('deDateModel', function() {
	return {
		restrict:'A',
		scope: {
			dateObj:"=deDateModel"
		},
		link: function(scope, element, attrs) {
			if (scope.dateObj !==undefined) {
				if (typeof scope.dateObj=="string") {
					var dateString=scope.dateObj.split("+")[0];
					element.val(dateString);
				}
				else {
					var jsString=scope.dateObj.toISOString().split("Z")[0];
					element.val(jsString);
				}
			}
			element.on('change', function(ev) {
				scope.$apply(function() {
					if (element.val()!="") {
						scope.dateObj=element.val();
					}
				})
			});
		}
	}
});
de.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
            scope.$apply(function (){
                scope.$eval(attrs.ngEnter);
            });

            event.preventDefault();
        }
    });
	};
});
de.directive('deAnimateEnd', function($animate) {
	return {
		scope: {
			deAnimateEnd:'&'
		},
		link:function(scope,element,attr) {
			$animate.on('leave', element, function() {
				scope.deAnimateEnd({'$scope':scope,'$element':element});
			});
		}
	}
});
//v0.2.8 Immitation of angular-material tooltip
de.directive('deTooltip', function($document) {
	return {
		link: function(scope, element, attrs) {
			var parentElem=element.parent();
			var styles=[
				"position:absolute","z-index:100000"
			];
			element.addClass("de-tooltip");
			var styleString=styles.join(";");
			element.parent().on('mouseover', function(e) {
				element.attr("style", styleString);
				element.appendTo(parentElem.parent());
			});
			element.parent().on('mouseout', function() {
				element.remove();
			});
			element.remove();
		}
	}
});
//v0.4.6 - require dataEstateUI.css
de.directive('deImgCredit', function() {
	return {
		restrict:'A',
		scope: {
			creditText:'=?deImgCredit', 
			customClass:'@?deCreditClass'
		},
		link: function(scope, element, attrs) {
			if (scope.creditText!==undefined && scope.creditText !="") {
				var styleClass='';
				styleClass=scope.customClass ? ' '+scope.customClass:'';
				var creditHtml='<div class="de-img-credit'+styleClass+'">'+scope.creditText+'</div>';
				element.parent().append(creditHtml);
			}
		}
	}
});
//v0.4 - Added min length and onSelect function
de.directive('jqAutocomplete', function() {
	return {
		require:"ngModel",
		scope: {
			source:"=jqAutoSource",
			onCreate:"&?jqOnCreate",
			onSelect:"&?jqOnSelect",
			onFocus:"&?jqOnFocus",
			jqShowfield:"=",
			minLength:"=jqMinLength"
		},
		link: function(scope,element,attrs, modelCtrl) {
			element.autocomplete({
				minLength:(scope.minLength===undefined || isNaN(scope.minLength)) ? 2:scope.minLength,
				source:scope.source,
				create:function(event, ui) {
					if (scope.onCreate !==undefined) {
						scope.onCreate({'$event':event, 'element':element});
					}
				},
				focus:function(event,ui) {
					event.preventDefault();
					element.val(ui.item ? ui.item.label : "");
					//scope.onFocus({'$event':event, '$ui':ui});
				},
				select: function(event,ui) {
					event.preventDefault();
					modelCtrl.$setViewValue(ui.item.value);
					element.val(ui.item ? ui.item.label : "");
					if (attrs.jqShowfield == 'value') {
						element.val(ui.item ? ui.item.value : "");
					} else {
						element.val(ui.item ? ui.item.label : "");
					}
					if (scope.onSelect !==undefined && typeof scope.onSelect=="function") {
						scope.onSelect({'$event':event, '$ui':ui});
					}
				},
				change: function(event, ui) {
					event.preventDefault();
					if (ui.item===null) {
						element.val("");
						modelCtrl.$setViewValue(null);
					}
					else {
						modelCtrl.$setViewValue(ui.item.value);
					}
				}
			})
			.data("ui-autocomplete")._renderItem=function(ul, item) {
				var newText = String(item.label).replace(
                new RegExp(this.term, "ig"),
               '<span class="ui-autocomplete-highlight">'+this.term+"</span>");
				return $('<li class="ui-menu-item"></li>')
					.data("item.autocomplete", item)
					.append('<div class="ui-menu-item-wrapper">'+newText+'</div>')
					.appendTo(ul);
			}
		}
	}
});
//v0.3.4
de.directive('deCurrency', function() {
	return {
		restrict:'E',
		scope:{
			money:'=ngModel'
		},
		link:function(scope,elem, attrs) {
			scope.editing=false;
			scope.toggleEdit=function(isEditing) {
				scope.editing=isEditing;
			}
		},
		template:'<input type="number" ng-model="money" ng-show="editing" ng-blur="toggleEdit(false)"><span ng-bind="money | currency" ng-hide="editing" ng-click="toggleEdit(true)"></span>'
		}
});

//v0.5
/**
 * Custom built search input container. Requires an <input> with de-search-bar as attribute. 
 * Attributes:
 * location-label-alias (string) - Title for the location search result. Default is Location
 * estate-label-alias (string) - Title for the estate search result. Default is Estate
 * keyword-label-alias (string) - Title for the keyword search result. Default is Keyword
 * estate-url (string) - The base url to link to the estate detail view.
 */
de.directive('deSearch', function(DeEstates, DeAssets, DeLocations) {
	return {
		scope: {
			locationLabel:"@?locationLabelAlias",
			estateLabel:"@?estateLabelAlias",
			keywordLabel: "@?keywordLabelAlias",
			estateUrl:"@?estateUrl"
		}, 
		transclude:true,
		controller: ["$scope", "$element", function DeSearchController($scope, $element) {
			var vm = this;
			//Init
			this.$onInit = function() {
				vm.name = $scope.name;
				vm.searchText = "";
				vm.searchEstateOptions = [];
				vm.searchLocationOptions = [];
				vm.searchLocality = false;
				vm.searchState = false;
				$scope.popupOpen = false;
				$scope.showLocationSearch = false;
				$scope.showEstateSearch = false;
				var searchEstatePromise = false;
				var searchLocationPromise = false;
				//Set defaults
				vm.locationLabel = $scope.locationLabel !== undefined ? $scope.locationLabel : "Location";
				vm.estateLabel = $scope.estateLabel !== undefined ? $scope.estateLabel : "Estate";
				vm.keywordLabel = $scope.keywordLabel !== undefined ? $scope.keywordLabel : "Keyword";
				vm.estateUrl = $scope.estateUrl !== undefined ? $scope.estateUrl: "/detail/";
			}
			vm.setSearchControl = function(searchControl) {
				$scope.searchControl = searchControl;
			}
			vm.searchChanged = function(newSearch, oldSearch) { 
				vm.searchType = "";
				//Don't do search if empty or if there has been no changes. Clear everything
				if (newSearch == "") {
					vm.searchText = ""; 
					$scope.searchControl.searchText = ""; //Updates the child search bar. 
					$scope.searchControl.searchLocality = false;
					$scope.searchControl.searchState = false;
					vm.searchText = "";
					vm.searchLocality = false;
					vm.searchState = false;
					return;
				}
				if (vm.searchText == newSearch) { return; }
				vm.searchText = newSearch;
				vm.searchType = vm.keywordLabel;
				//TODO: Search modes. 
				//Setup search locations. 
				searchLocationPromise = DeLocations.data({
					name: vm.searchText, 
					fields: 'id,name,state_code,type',
					types: 'LOCALITY'
				}, 'data').then(function(response) {
					searchLocationPromise = false; //cleanup
					vm.searchLocationOptions = [];
					var j = 0;
					for (var i = 0; i < response.data.length && j < 5; i++) {
						if (!('state_code' in response.data[i])) { continue; }
						vm.searchLocationOptions.push({
							label: response.data[i].name + ', ' + response.data[i].state_code,
							locality: response.data[i].name,
							state_code: response.data[i].state_code
						});
						j++;
					}
					$scope.popupOpen = true;
					$scope.showLocationSearch = true;
				}, function(error) {console.log(error) });
				//Setup search estates. 
				searchEstatePromise = DeEstates.data({
					name: vm.searchText, 
					fields: 'id,name',
					size: 5
				}).then(function (response) {
						searchEstatePromise = false;
						vm.searchEstateOptions = [];
						for (var i = 0; i < Math.min(5, response.data.length); i++) {
							vm.searchEstateOptions.push({
								label: response.data[i].name,
								estateId: response.data[i].id
							});
						}
						$scope.popupOpen = true;	
						//vm.showSearch = true;
						$scope.showEstateSearch = true;
					}, function (error) { });
			}
			vm.searchLocationClicked = function(location) {
				$scope.searchControl.searchText = location.label; //Updates the child search bar. 
				$scope.searchControl.searchLocality = location.locality;
				$scope.searchControl.searchState = location.state_code;
				$scope.searchControl.searchUpdated();
				vm.searchText = location.label;
				vm.searchLocality = location.locality;
				vm.searchState = location.state_code;
				vm.searchType = vm.locationLabel.toLowerCase();
				$scope.showEstateSearch = false;
				$scope.showLocationSearch = false;
			}
			vm.searchKeywordClicked = function() {
				$scope.searchControl.searchLocality = false;
				$scope.searchControl.searchState = false;
				$scope.searchControl.searchUpdated();
				vm.searchLocality = false;
				vm.searchState = false;
				vm.searchType = vm.keywordLabel.toLowerCase();
				$scope.showEstateSearch = false;
				$scope.showLocationSearch = false;
			}
		}], 
		controllerAs: 'sc',
		link: function(scope, element, attr, ownCtrl) {
			//Track windows click for clickout close event. 
			var winClickEventConstant = "windowsClicked";
			window.onclick = function (ev) {
				$rootScope.$broadcast(winClickEventConstant);
			}
			scope.$on(winClickEventConstant, function (ev, data) {
				if (data) {
					if (data.$id != ev.currentScope.$id && ev.currentScope.popupOpen) {
						ev.currentScope.popupOpen = false; //No need to $apply, as previous event would've fired it off. 
						if (ev.currentScope.searchControl !== undefined && ev.currentScope.searchControl.onClose !== undefined) {
							var searchScope = {
								"keyword": ev.currentScope.searchControl.searchText,
								"locality": ev.currentScope.searchControl.searchLocality,
								"state_code": ev.currentScope.searchControl.searchState
							};
							ev.currentScope.searchControl.onClose({"$searchScope":searchScope});
						}
					}
				}
				else {
					scope.$apply(function () {
						if (ev.currentScope.popupOpen) {
							ev.currentScope.popupOpen = false;
							if (ev.currentScope.searchControl !== undefined && ev.currentScope.searchControl.onClose !== undefined) {
								var searchScope = {
									"keyword": ev.currentScope.searchControl.searchText,
									"locality": ev.currentScope.searchControl.searchLocality,
									"state_code": ev.currentScope.searchControl.searchState
								};
								ev.currentScope.searchControl.onClose({ "$searchScope": searchScope });
							}
						}
					});
				}
			});
		},
		template: '<div ng-transclude></div><span class="searchinput-type">{{sc.searchType}}</span>'+
			'<div class="searchinput-dropdown" ng-show="popupOpen">'+
				'<div class="keyword-search" ng-click="sc.searchKeywordClicked()"><h4>{{sc.keywordLabel}}: </h4><span class="search-term">{{sc.searchText}}</span></div>'+
				'<div ng-if="showLocationSearch"><h4>{{sc.locationLabel}}</h4>'+
					'<ul><li ng-repeat="searchOption in sc.searchLocationOptions track by $index" ng-click="sc.searchLocationClicked(searchOption)">'+
						'<span>{{searchOption.label}}</span>'+
					'</li></ul>'+
				'</div>'+
				'<div ng-if="showEstateSearch"><h4>{{sc.estateLabel}}</h4>'+
					'<ul><li ng-repeat="searchOption in sc.searchEstateOptions track by $index">'+
						'<span><a ng-href="{{sc.estateUrl + searchOption.estateId}}">{{searchOption.label}}</a></span>'+
					'</li></ul>'+
				'</div>'+
			'</div>'
	}
})
/**
 * Custom built search input that will search the Data Estate API. This requires the DE API services. Used as an attribute on INPUT
 * This requires the parent "de-search" container. 
 * search-types (| separated string) - Indicates what search types to enable. 
 * 	- KEYWORD (default) - No popup, just does a keyword search to the API. 
 *  - NAME (default) - Brings up a popup list of estates matching the name. 
 *  - LOCATION (default) - Brings up a list of locations. 
 * on-submit (function($searchScope)) - Optional. Used for when location is clicked or keyword is clocked.
 * 		Returns the $searchScope object, with three properties: keyword, locality and state_code. 
 * on-close (function($searchScope)) - Optional. Similar to the above, but fired when the dropdown closes. 
 * on-clear (function($searchScope)) - Optional. Fired when the search field is cleared. 
 */
.directive('deSearchBar', function() {
	return {
		restrict: "A",
		require: "^^?deSearch", 
		scope: {
			searchModes: "@?",
			searchText: "=?ngModel", 
			onSubmit: '&?',
			onClose: '&?',
			onClear: '&?'
		}, 
		link: function(scope, elem, attr, parentCtrl) {
			parentCtrl.setSearchControl(scope);
			scope.$watch('searchText', function(newVal, oldVal, curScope) {
				if (newVal != oldVal) {
					parentCtrl.searchChanged(newVal, oldVal);
				}
				if (newVal == "" && scope.onClear !== undefined) {
					scope.onClear({
						"$searchScope": {
							"keyword": "",
							"locality": false,
							"state_code": false
						}
					});
				}
			}, true);
			scope.searchUpdated = function() {
				if (scope.onSubmit !== undefined) {
					var searchScope = {
						"keyword":scope.searchText, 
						"locality":scope.searchLocality, 
						"state_code":scope.searchState
					};
					scope.onSubmit({"$searchScope":searchScope});
				}
			}
		}
	}
});

//v0.5
/**
 * Creates a custom dropdown menu. Used as an element. 
 * DOM Attributes:
 * multi (bool | expression) - Indicates whether the selection allows for multiple selection. 
 * label (expression) - Label of the control. It can be a function. 
 * options (array | expression) - The source of the dropdown menu. This needs to be an array. 
 * model (angular scope) - The two-way bound scope for the selected (array or single value), hijects the ng-model. 
 * label-model (angular scope) - Optional, used to contain selected "label" if the selected value is not sufficient.
 * label-field (string) - Optional. If the options is an array of objects, indicates which property to use to show in the option's label. 
 * value-field (string) - Optional. If the options is an array of objects, indicates which property to use to show in the option's value. Also shows what is returned. 
 * button-text (expression) - Optional. Used for the "Apply" button label. 
 * on-submit (function($searchScope, $event)) - Optional. Used for when the apply button is clicked. Default is closing the menu.
 * 		returns the $searchScope object with 2 properties, selectedValue and selectedLabel
 * on-close (function($searchScope, $event)) - Optional. Similar to on submit, but is fired with the dropdown window is dismissed. 
 */
de.directive('deDropdown', function($rootScope) {
	return {
		restrict: 'E', 
		scope: {
			multiple:'=multi',
			label:'=label', 
			options:'=options',
			model:'=ngModel',
			labelModel:'=?',
			labelField:'@?',
			valueField:'@?',
			buttonText:'=?buttonLabel', 
			onSubmit:'&?', 
			onClose: '&?'
		},
		link: function(scope, elem, attr) {
			scope.popupOpen=false;
			if (scope.buttonText === undefined) {
				scope.buttonText="Apply";
			}
			scope.clearButtonText = "Clear";
			var winClickEventConstant = "windowsClicked";
			window.onclick = function (ev) {
				$rootScope.$broadcast(winClickEventConstant);
			}
			//Bind custom event
			scope.$on(winClickEventConstant, function(ev, data) {
				if (data) {
					if (data.$id != ev.currentScope.$id && ev.currentScope.popupOpen) {
						ev.currentScope.popupOpen = false; //No need to $apply, as previous event would've fired it off. 
						if (ev.currentScope.onClose !== undefined) {
							var searchScope = {
								"selectedValue": scope.model,
								"selectedLabel": scope.labelModel
							};
							ev.currentScope.onClose({"$searchScope":searchScope, "$event":ev});
						}
					}
				}
				else {
					scope.$apply(function () {
						if (ev.currentScope.popupOpen) {
							ev.currentScope.popupOpen = false;
							if (ev.currentScope.onClose !== undefined) {
								var searchScope = {
									"selectedValue": scope.model,
									"selectedLabel": scope.labelModel
								};
								ev.currentScope.onClose({ "$searchScope": searchScope, "$event": ev });
							}
						}
					});
				}
			});
			//TODO: ADD PARENT ID!!!
			scope.parentId = attr.id===undefined ? scope.$id : attr.id;
			//if multi
			if (scope.model === undefined && scope.multiple) {
				scope.model = [];
			}
			scope.optionClicked=function(optionVal, ev) {
				if (ev) {
					ev.stopPropagation();
				}
				//For multi
				var checkedItem = optionVal;
				if (scope.valueField !== undefined) {
					checkedItem = optionVal[scope.valueField];
				}
				var itemIndex = -1;
				if (scope.multiple) {
					var itemIndex = scope.model.indexOf(checkedItem);
					if (itemIndex >= 0) { //has it. 
						scope.model.splice(itemIndex,1);
					}
					else {
						scope.model.push(checkedItem);
					}
				}
				else {
					scope.model=checkedItem;
					scope.popupOpen=false;
				}
				//Label Model (if used)
				if (scope.labelModel !== undefined) {
					var labelItem = optionVal;
					if (scope.labelField !== undefined) {
						labelItem = optionVal[scope.labelField];
					}
					if (scope.multiple) {
						if (itemIndex >= 0) { //has it. 
							scope.labelModel.splice(itemIndex, 1);
						}
						else {
							scope.labelModel.push(labelItem);
						}
					}
					else {
						scope.labelModel = labelItem;
					}
				}
			}
			scope.toggleDropdown=function(ev, open) {
				if (ev) {
					ev.stopPropagation();
					$rootScope.$broadcast("windowsClicked", scope);
				}
				scope.togglePopup(open);
			}
			scope.togglePopup = function(open) {
				if (open === undefined) {
					scope.popupOpen = !scope.popupOpen;
				}
				else {
					scope.popupOpen = open;
				}
			}
			scope.itemInArray=function(haystack, needle) {
				var needleItem = needle;
				
				if (scope.valueField !== undefined) {
					needleItem = needle[scope.valueField];
				}
				if (haystack.indexOf(needleItem) >= 0) {
					return true;
				}
				else {
					return false;
				}
			}
			scope.inputLabel=function(item) {
				if (scope.labelField !== undefined) {
					return item[scope.labelField];
				}
				else {
					return item;
				}
			}
			scope.submitSelection=function(ev) {
				if (scope.onSubmit !== undefined) {
					if (scope.onSubmit !== undefined) {
						var searchScope = {
							"selectedValue": scope.model,
							"selectedLabel": scope.labelModel
						};
						scope.onSubmit({ "$searchScope": searchScope, "$event":ev });
					}
				}
			};
			scope.clearSelection = function(ev) {
				if (ev) {
					ev.stopPropagation();
				}
				scope.model = [];
				if (scope.labelModel !== undefined ) {
					scope.labelModel = [];
				}
			}
			scope.noInvoke=function(ev) {
				ev.stopPropagation();
			}
		},
		template: '<div class="de-dropdown {{class}}" ng-click="toggleDropdown($event)">{{label}}</div><div class="de-dropdown-menu" ng-show="popupOpen"><ul class="de-dropdown-menu-list">'+
			'<li ng-repeat="option in options track by $index">'+
				'<label for="{{parentId}}-{{$index}}" ng-click="noInvoke($event)">'+
				'<input type="checkbox" name="{{parentId}}-{{$index}}" ng-checked="itemInArray(model, option)" id="{{parentId}}-{{$index}}" ng-show="multiple"'+
				' ng-click="optionClicked(option, $event)">'+
					'<span>{{ inputLabel(option) }}</span></label>'+
			'</li></ul><button type="button" class="de-button btn-clear" ng-click="clearSelection($event)" ng-if="multiple">{{ clearButtonText }}</button>'+
			'<button type="button" class="de-button" ng-click="submitSelection($selectedScope, $event)">{{ buttonText }}</button></div>'
	}
});
//v0.3.7
de.factory('DeChangeRegister', function(DeHelper) {
	var changeSets={};
	var originals={};
	var newData={};
	var trackedScopes={};
	function startTracking(setName, dataId, trackData) {
		if (setName !==undefined && dataId !==undefined && trackData !==undefined) {
			if (originals[setName]===undefined) {
				originals[setName]={};
			}
			if (newData[setName]===undefined) {
				newData[setName]={};
			}
			originals[setName][dataId]=angular.copy(trackData);
			newData[setName][dataId]=trackData;
			return true;
		}
	}
	return {
		//This will override original data.
		registerTracking:function(setName, dataId, trackData, trackScope) {
			if (setName !==undefined && dataId !==undefined && trackData !==undefined) {
				startTracking(setName, dataId, trackData, trackScope);
				if (trackScope !==undefined) {
					if (trackedScopes[setName]===undefined) {
						trackedScopes[setName]={};
					}
					trackedScopes[setName][dataId]=trackScope;
				}
			}
		},
		commitTracking:function(setName, dataId) {
			if (setName===undefined) {
				originals={};
				changeSets={};
			}
			else {
				if (newData[setName]!==undefined) {
					if (dataId!==undefined && newData[setName][dataId]!==undefined) {
						originals[setName][dataId]=angular.copy(newData[setName][dataId]);
						if (trackedScopes[setName]!==undefined && trackedScopes[setName][dataId]!==undefined) {
							if (typeof trackedScopes[setName][dataId].DeChangeReset==='function') {
								trackedScopes[setName][dataId].DeChangeReset();
							};
						}
					}
					else {
						originals[setName]=angular.copy(newData[setName]);
						if (trackedScopes[setName]!==undefined) {
							for (var k in trackedScopes[setName]) {
								if (typeof trackedScopes[setName][k].DeChangeReset==='function') {
									trackedScopes[setName][k].DeChangeReset();
								};
							}
						}
					}
				}
				if (changeSets[setName]!==undefined && dataId!==undefined) {
					delete changeSets[setName][dataId];
				}
			}
		},
		resetTracking:startTracking,
		//Return true if there're changes, false if none.
		trackChanges:function(setName, dataId, compareData) {
			if (originals[setName] !==undefined && originals[setName][dataId]!==undefined) {
				var changes=DeHelper.getDiff(originals[setName][dataId],compareData,true);
				if (!DeHelper.isEmpty(changes.changed) || !DeHelper.isEmpty(changes.removed)) {
				//if (!angular.equals(originals[setName][dataId], compareData)) {
					if (changeSets[setName]===undefined) {
						changeSets[setName]={};
					}
					changeSets[setName][dataId]=changes;
					return true;
				}
				else {
					if (changeSets[setName]!==undefined) {
						delete changeSets[setName][dataId];
					}
					return false;
				}
			}
		},
		getChanges:function(setName, dataId) {
			if (setName!==undefined) {
				if (changeSets[setName]!==undefined) {
					if (dataId===undefined || changeSets[setName][dataId]===undefined) {
						return changeSets[setName];
					}
					else {
						return changeSets[setName][dataId];
					}
				}
				else {
					return null;
				}
			}
			else {
				return null;
			}
		},
		getOriginals:function(setName, dataId) {
			if (setName !==undefined && originals[setName]!==undefined) {
				if (dataId!==undefined && originals[setName][dataId]!==undefined) {
					return originals[setName][dataId];
				}
				else {
					return originals[setName];
				}
			}
			else {
				return originals;
			}
		},
		hasChanged:function(setName, dataId) {
			var itHas=true;
			if (setName!==undefined) {
				if (changeSet[setName]===undefined) {
					itHas=false;
				}
				else if (dataId!==undefined) {
					if (changeSet[setName][dataId]===undefined) {
						itHas=false;
					}
				}
			}
			else {
				itHas=false;
			}
			return itHas;
		}
	}
});
//v0.3.7 - TODO: Revisit how "reset is used";
de.directive('deTrackChanges', function(DeChangeRegister) {
	return {
		scope: {
			trackModel:"=deTrackChanges",
			trackName:"=deTrackName",
			trackId:"=?deTrackId"
		},
		link:function(scope, elem, attrs) {
			var trackId=(scope.trackId===undefined) ? scope.$id : scope.trackId;
			DeChangeRegister.registerTracking(scope.trackName, trackId, scope.trackModel, scope);
			scope.$watch('trackModel', function(newVal, oldVal) {
				if (DeChangeRegister.trackChanges(scope.trackName, trackId, newVal)) {
					elem.addClass("data-changed");
				}
				else {
					elem.removeClass("data-changed");
				}
			}, true);
			scope.DeChangeReset=function() {
				elem.removeClass("data-changed");
			}
		}
	}
});
//v0.3.9 - Tags
de.directive('deTagInput', function() {
	return {
		scope: {
			tags:'=ngModel',
			delimiter:'=?deTagDelimiter',
			maxLength:'=?deTagMax'
		},
		link:function(scope,elem,attrs) {
			scope.maxSize=scope.maxLength===undefined?5:intVal(scope.maxLength);
			var delimit=scope.delimiter===undefined?",":scope.delimiter;
			scope.$watch('tagText', function(newVal, oldVal) {
				if (newVal!==undefined &&newVal[newVal.length-1]==delimit) {
					if (scope.tags==undefined) {
						scope.tags=[];
					}
					var insertVal=oldVal.trim().replace(" ", "-");
					if (scope.tags.indexOf(insertVal)<0 && scope.tags.length<scope.maxSize) {
						scope.tags.push(insertVal);
					}
					scope.tagText="";
				}
			});
			scope.canAddTags=function() {
				if (scope.tags===undefined) {
					return true;
				}
				else if (scope.tags.length < scope.maxSize) {
					return true;
				}
				else {
					return false;
				}
			}
			scope.deleteTag=function(index) {
				scope.tags.splice(index, 1);
			}
		},
		template:'<div class="tags-container">'+
							'<div class="tags" ng-repeat="tag in tags">'+
							'<span type="tag-text" ng-bind="tag"></span>'+
							'<button class="tags-delete material-icons" ng-click="deleteTag($index)">close</button>'+
							'</div>'+
							'<div class="tags-input">'+
							'<input class="tag-text" ng-model="tagText" ng-show="canAddTags()" placeholder="new tag">'+
							'<span class="tags-message" ng-hide="canAddTags()" ng-cloak>Max. tags ({{maxSize}}) reached!</span>'+
							'</div>'+
							'</div>'
	}
});
//FILTERS
de.filter('validity', function() {
	return function(valString) {
		if (isNaN(valString.charAt(0))) {
			valString=valString.replace("M", "1 month");
			valString=valString.replace("D", "1 day");
			valString=valString.replace("Y", "1 year");
		}
		else {
			valString=valString.replace("M", " months");
			valString=valString.replace("D", " days");
			valString=valString.replace("Y", " years");
		}
		return valString;
	}
});
de.filter('filterId', function() {
	return function(deObj, objId, field) {
		for (var i in deObj) {
			if (deObj[i].id==objId) {
				if (field===undefined) {
					return deObj[i];
				}
				else {
					return deObj[i][field];
				}
			}
		}
		return "";
	}
});
//v5.0
de.filter('starratings', function() {
	return function(ratingText) {
		var oneStar = '<span class="fa fa-star"></span>';
		var halfStar = '<span class="fa fa-star-half-empty"></span>';
		switch (ratingText) {
			case "NA":
				return '<div class="rating">Not Available</div>';
			case "1":
				return '<div class="rating">'+oneStar+'</div>';
			case "1.5":
				return '<div class="rating">' + oneStar + halfStar +'</div>';
			case "2":
				return '<div class="rating">' + oneStar + oneStar + '</div>';
			case "2.5":
				return '<div class="rating">' + oneStar + oneStar + halfStar + '</div>';
			case "3":
				return '<div class="rating">' + oneStar + oneStar + oneStar + '</div>';
			case "3.5":
				return '<div class="rating">' + oneStar + oneStar + oneStar + halfStar + '</div>';
			case "4":
				return '<div class="rating">' + oneStar + oneStar + oneStar + oneStar + '</div>';
			case "4.5":
				return '<div class="rating">' + oneStar + oneStar + oneStar + oneStar + halfStar +'</div>';
			case "5":
				return '<div class="rating">' + oneStar + oneStar + oneStar + oneStar + oneStar + '</div>';
			default:
				return "";
		}
	}
});
