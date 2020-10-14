var PointCloud = require('./components/point-cloud.js');
var Utilities = require('./utils.js');
var Graphics = require('./graphics.js');

(function () {
	
	document.addEventListener('DOMContentLoaded',function(){

		PointCloud().init();
	});
})();