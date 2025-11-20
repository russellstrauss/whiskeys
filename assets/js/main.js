import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Lut } from 'three/examples/jsm/math/Lut.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import utils from './utils.js';
// Set utils on window and globalThis before other modules try to access it
window.utils = utils;
globalThis.utils = utils;
// Import graphics.js first so gfx is available when point-cloud.js loads
import gfx from './graphics.js';
window.gfx = gfx;
globalThis.gfx = gfx;
import PointCloud from './components/point-cloud.js';

(function () {
	
	document.addEventListener('DOMContentLoaded',function(){

		PointCloud().init();
	});
})();