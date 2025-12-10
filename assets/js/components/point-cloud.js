import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import gfx from '../graphics.js';

export default function() {
	
	let message = document.querySelector('.message');
	var pastData;
	var settings = {
		defaultCameraLocation: {
			x: -100,
			y: 50,
			z: 100
		},
		messageDuration: 2000,
		colors: {
			worldColor: new THREE.Color('#000'),
			gridColor: new THREE.Color('#111')
		},
		gridSize: 100,
		axes: {
			color: 0xffffff,
			count: 20,
			tickLength: 1
		}
	};
	
	var uniqueCountries = []; // whiskey
	var colors = ['red', 'blue', 'green', 'white', 'purple', 'pink', 'orange', '#710C96']; // whiskey
	var bubbles = [], clickedLabels = [], dataPointLabels = [], bubbleOpacity = .15;
	
	var renderer, scene, camera, controls, floor;
	var targetList = [];
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000'), blue = new THREE.Color(0x0000ff);
	var stats = new Stats();
	var bottomLeft, nearestCorner;
	
	let interps = [d3.interpolateRainbow, d3.interpolateRgb('#450F66', '#B36002'), d3.interpolateRgb('white', 'red'), d3.interpolateSinebow, d3.interpolateYlOrRd, d3.interpolateYlGnBu,d3.interpolateRdPu, d3.interpolatePuBu, d3.interpolateGnBu, d3.interpolateBuPu, d3.interpolateCubehelixDefault, d3.interpolateCool, d3.interpolateWarm, d3.interpolateCividis, d3.interpolatePlasma, d3.interpolateMagma, d3.interpolateInferno, d3.interpolateViridis, d3.interpolateTurbo, d3.interpolatePurples, d3.interpolateReds, d3.interpolateOranges, d3.interpolateGreys, d3.interpolateGreens, d3.interpolateBlues, d3.interpolateSpectral, d3.interpolateRdYlBu, d3.interpolateRdBu, d3.interpolatePuOr, d3.interpolatePiYG, d3.interpolatePRGn]
	let colorSchemes = [d3.schemeCategory10, d3.schemeAccent, d3.schemeDark2, d3.schemePaired, d3.schemePastel1, d3.schemePastel2, d3.schemeSet1, d3.schemeSet2, d3.schemeSet3, d3.schemeTableau10];

	return {
		
		init: function() {
			let self = this;
			self.loadFont();
		},
		
		begin: function() {
			
			let self = this;
			scene = gfx.setUpScene();
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			floor = self.addGrid(settings.gridSize, settings.colors.worldColor, settings.colors.gridColor);
			controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			gfx.setUpLights();
			gfx.setCameraLocation(camera, settings.defaultCameraLocation);
			self.addStars();
			self.setUpButtons();
			self.bubbleChart();
			
			var animate = function() {
				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
				self.everyFrame();
			};
			animate(); 
		},
		
		everyFrame: function() {
			
			dataPointLabels.forEach(function(label) {
				label.quaternion.copy(camera.quaternion);
			});
		},
		
		addStars: function() {
			let geometry = new THREE.BufferGeometry();
			let vertices = [];
			for (let i = 0; i < 10000; i ++ ) {
				
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
				
				// if any coordinates in range, pull out from vertices at i
			}
			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			let particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
			scene.add( particles );
		},
		
		reset: function() {
			
			message.textContent = '';
			
			for (let i = scene.children.length - 1; i >= 0; i--) {
				let obj = scene.children[i];
			}
		},
		
		loadFont: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			// Use relative path for production build
			fontPath = 'fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				gfx.appSettings.font.smallFont.font = font;
				gfx.appSettings.font.largeFont.font = font;
				// if (utils.mobile()) {
				// 	gfx.appSettings.font.smallFont = 5;
				// 	gfx.appSettings.font.largeFont = 5;
				// }
				self.begin();
				if (gfx.appSettings.axesHelper.activateAxesHelper) gfx.labelAxesHelper();
			},
			function(event) {}, // in progress event
			function(event) { // error event
				gfx.appSettings.font.enable = false;
				self.begin();
			});
		},
		
		setUpButtons: function() {
			let self = this;
			let message = document.getElementById('message');
			document.addEventListener('keyup', function(event) {
				
				let one = 49;
				let two = 50;
				let three = 51;
				let four = 52;
				let r = 82;
				let space = 32;
				let a = 65;
				
				if (event.keyCode === one) {
					self.reset();
				}
				if (event.keyCode === two) {
					self.reset();
				}
				if (event.keyCode === three) {
					self.reset();
				}
				if (event.keyCode === four) {
					self.reset();
				}
				if (event.keyCode === r) {
					self.reset();
				}
				if (event.keyCode === space) {
					console.log(camera);
				}
				if (event.keyCode === a) {
					gfx.toggleAxesHelper();
				}
			});
			
			window.russells_magical_mouse = new THREE.Vector2();
			let onMouseMove = function(event) {
				window.russells_magical_mouse.x = ( (event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width ) * 2 - 1;
				window.russells_magical_mouse.y = -( (event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height ) * 2 + 1;
				
				let hoveredItems = gfx.intersects(event, camera, targetList);
				self.handleHovers(hoveredItems);
			};
			window.addEventListener('mousemove', onMouseMove, false);
			
			document.querySelector('canvas').addEventListener('click', function(event) {
				let clickedItems = gfx.intersects(event, camera, targetList);
				self.handleClicks(clickedItems);
			});
		},
		
		hideAllBubbleLabels: function() {
			let self = this;
			if (bubbles) bubbles.forEach(function(mesh, index) {
				self.hideLabel(mesh);
			});
		},
		
		hideClickedBubbleLabels: function() {
			
			if (clickedLabels) clickedLabels.forEach(function(mesh, index) {
				scene.remove(mesh);
			});
			clickedLabels = [];
		},
		
		handleHovers: function(hoveredItems) {
			let self = this;
			self.hideAllBubbleLabels();
			
			if (hoveredItems) {
				self.showLabel(hoveredItems[0].object);
			}
		},
		
		showLabel: function(mesh) {
			mesh.line.visible = true;
			mesh.label.visible = true;
			mesh.material.opacity = bubbleOpacity + .25;
		},
		
		hideLabel: function(mesh) {
			mesh.line.visible = false;
			mesh.label.visible = false;
			mesh.material.opacity = bubbleOpacity;
		},
		
		handleClicks: function(clickedItems) {
			let self = this;
			let label;
			if (clickedItems) {
				self.showLabel(clickedItems[0].object);
				// clickedLabels.push(label[0], label[1]);
			}
			else {
				self.hideClickedBubbleLabels();
			}
		},
		
		addGrid: function(size, worldColor, gridColor) {
				
			let zBuff = gfx.appSettings.zBuffer;
			var planeGeometry = new THREE.PlaneBufferGeometry(size, size);
			planeGeometry.rotateX(-Math.PI / 2);
			var planeMaterial = new THREE.ShadowMaterial();

			var plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.position.y = -1;
			plane.receiveShadow = true;
			scene.add(plane);
			var helper = new THREE.GridHelper(size, 20, gridColor, gridColor);
			helper.material.opacity = .75;
			helper.material.transparent = true;
			helper.position.set(zBuff, 0, -zBuff);
			scene.add(helper);
			
			let wall = new THREE.GridHelper(size, 20, gridColor, gridColor);
			wall.material.opacity = .75;
			wall.material.transparent = true;
			
			let left = wall.clone();
			left.rotation.x = Math.PI/2;
			left.position.set(0, size/2, -size/2 - zBuff);
			scene.add(left);
			let right = helper.clone();
			right.rotation.set(Math.PI/2, 0, Math.PI/2);
			right.position.set(size/2, size/2, -zBuff);
			scene.add(right);
			
			let white = 0xffffff;
			bottomLeft = new THREE.Vector3(-size/2, 0, -size/2), nearestCorner = new THREE.Vector3(-size/2, 0, size/2);
			gfx.drawLineFromPoints(bottomLeft, new THREE.Vector3(-size/2, size, -size/2), white, .5);
			gfx.drawLineFromPoints(bottomLeft, new THREE.Vector3(-size/2, 0, size/2), white, .5);
			gfx.drawLineFromPoints(new THREE.Vector3(-size/2, 0, size/2), new THREE.Vector3(size/2, 0, size/2), white, .5);

			scene.background = worldColor;
			//scene.fog = new THREE.FogExp2(new THREE.Color('black'), 0.002);
			
			return plane;
		},
		
		bubbleChart: function() {
			
			let self = this;
			d3.csv('./data/whiskeys.csv', self.preprocessWhiskey).then(function(dataset) {

				let maxRadius = 6.5;
				
				let name = d3.extent(dataset, function(d) { return +d.name; });
				let price = d3.extent(dataset, function(d) { return +d.price; });
				let age = d3.extent(dataset, function(d) { return +d.age; });
				let minRating = d3.min(dataset, function(d) { return +d.rating; });
				let maxRating = d3.max(dataset, function(d) { return +d.rating; });
				minRating = 70;
				maxRating = 100;
				let minPrice = d3.min(dataset, function(d) { return +d.price; });
				let maxPrice = d3.max(dataset, function(d) { return +d.price; });
				minPrice = 25;
				maxPrice = 125;
				let minAge = d3.min(dataset, function(d) { return +d.age; });
				let maxAge = d3.max(dataset, function(d) { return +d.age; });
				maxAge = 25;

				let xScale = d3.scaleLinear().domain(age).range([-settings.gridSize/2 + maxRadius, settings.gridSize/2 - maxRadius]);
				let yScale = d3.scaleLinear().domain([minRating, maxRating]).range([maxRadius, settings.gridSize - maxRadius]);
				let zScale = d3.scaleLinear().domain(price).range([-settings.gridSize/2 + maxRadius, settings.gridSize/2 - maxRadius])
				let radiusScale = d3.scaleLinear().domain(price).range([.25, maxRadius]);
				// let colorScale = d3.scaleQuantize().domain(country).range(colors);
				
				let color = null;
				dataset.forEach(function(row, index) {
					var geometry = new THREE.SphereGeometry(radiusScale(row.price), 15, 15);
					
					if (row.country === 'USA') color = 0x0000ff;
					if (row.country === 'Scotland') color = 0xff0000;
					var material = new THREE.MeshBasicMaterial({
						color: color,
						transparent: true,
						opacity: bubbleOpacity
					});
					
					let sphere = new THREE.Mesh(geometry, material);
					sphere.position.set(xScale(row.age), yScale(row.rating), zScale(row.price));
					sphere.label = row.name + ' $' + row.price;
					
					self.placeLabel(sphere);
					targetList.push(sphere);
					bubbles.push(sphere);
					scene.add(sphere);
				});
				
				let titlePos = new THREE.Vector3(0, settings.gridSize + 6, -settings.gridSize/2);
				let title = gfx.labelLarge(titlePos, 'Distilling Whiskey Ratings', white);
				
				self.addLegend();
				self.labelAxis('Age', 'x', minAge, maxAge);
				self.labelAxis('Rating', 'y', minRating, maxRating);
				self.labelAxis('Price (USD)', 'z', minPrice, maxPrice, '$');
			});
		},
		
		addLegend: function() {
			
			let zOffset = new THREE.Vector3(0, 0, 15);
			
			let usLabelPosition = new THREE.Vector3(settings.gridSize/2, 10, settings.gridSize/2).add(zOffset);
			let usLabel = gfx.labelLarge(usLabelPosition, 'US', white, new THREE.Vector3(0, -Math.PI/2));
			let textGeometry = usLabel.geometry;
			textGeometry.computeBoundingBox();
			let textWidth = textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z;
			let translation = new THREE.Vector3(0, 0, 1).multiplyScalar(textWidth / 2);
			usLabel.position.add(translation);
			usLabelPosition.add(translation);
			
			let scotlandLabelPosition = new THREE.Vector3(settings.gridSize/2, 0, settings.gridSize/2).add(zOffset);
			let scotlandLabel = gfx.labelLarge(scotlandLabelPosition, 'Scotland', white, new THREE.Vector3(0, -Math.PI/2));
			textGeometry = scotlandLabel.geometry;
			textGeometry.computeBoundingBox();
			textWidth = textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z;
			translation = new THREE.Vector3(0, 0, 1).multiplyScalar(textWidth / 2);
			scotlandLabel.position.add(translation);
			scotlandLabelPosition.add(translation);
			
			let radius = 3;
			let geometry = new THREE.SphereGeometry(3, 15, 15);
			let material = new THREE.MeshBasicMaterial({
				color: 0xff0000,
				transparent: true,
				opacity: bubbleOpacity
			});
			
			let scotlandSphere = new THREE.Mesh(geometry, material);
			let spherePos = new THREE.Vector3(settings.gridSize/2, radius/2, settings.gridSize/2 + 10);
			
			scotlandSphere.position.set(spherePos.x, spherePos.y, spherePos.z);
			scene.add(scotlandSphere);
			
			geometry = new THREE.SphereGeometry(3, 15, 15);
			material = new THREE.MeshBasicMaterial({
				color: 0x0000ff,
				transparent: true,
				opacity: bubbleOpacity
			});
			let usSphere = new THREE.Mesh(geometry, material);
			usSphere.position.set(spherePos.x, spherePos.y + 10, spherePos.z);
			scene.add(usSphere);
		},
		
		labelAxis: function(label, axis, min, max, preUnit, postUnit) {
			preUnit = preUnit || '';
			postUnit = postUnit || '';
			
			let axisScaleLabelColor = 0xffffff;
			let count = settings.axes.count;
			let length = settings.gridSize;
			let interval = length/count;
			let tickLength = settings.axes.tickLength;
			let tick = new THREE.Vector3(-tickLength, 0, 0), tickRight = new THREE.Vector3(0, 0, tickLength);
			
			let axisLabelOffset = -6;
			let charWidth = settings.gridSize/50;
			
			if (axis === 'x') {
				
				for (let i = 0; i < count + 1; i += 2) {
					let tickOrigin = gfx.movePoint(nearestCorner, new THREE.Vector3(i*interval, 0, 0));
					gfx.drawLine(tickOrigin, tickRight);
					let label = (((max - min) / 20) * i) + min;
					if (label > 1000000) label = label.toExponential();
					label = Math.round(label).toString();
					let offset = new THREE.Vector3(-.6, -1, (interval/100)*(label.length) + 2);
					gfx.labelPoint(gfx.movePoint(tickOrigin, offset), label, settings.axes.color, new THREE.Vector3(0, 0, 0));
				}
				gfx.labelLarge(new THREE.Vector3(0, axisLabelOffset, settings.gridSize/2 - axisLabelOffset), label, settings.axes.color);
			}
			else if (axis === 'y') {
				
				for (let i = 0; i < count + 1; i += 2) {
					let tickOrigin = gfx.movePoint(bottomLeft, new THREE.Vector3(0, i*interval, 0));
					gfx.drawLine(tickOrigin, tick);
					let label = (((max - min) / 20) * i) + min;
					if (label > 1000000) label = label.toExponential();
					label = Math.round(label).toString();
					let offset = new THREE.Vector3(-(interval/4)*(label.length+1) , -1, 0);
					gfx.labelPoint(gfx.movePoint(tickOrigin, offset), label, settings.axes.color);
				}
				let yAxisLabel = gfx.labelLarge(new THREE.Vector3(-settings.gridSize/2, settings.gridSize/2, -settings.gridSize/2), label, 0xffffff);
				let textGeometry = yAxisLabel.geometry;
				textGeometry.computeBoundingBox();
				let translation = new THREE.Vector3(-1, 0, 0).multiplyScalar((textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x)).add(new THREE.Vector3(axisLabelOffset, 0, 0));
				yAxisLabel.position.add(translation);
			}
			else if (axis === 'z') {
				
				for (let i = 2; i < count + 1; i += 2) {
					let tickOrigin = gfx.movePoint(bottomLeft, new THREE.Vector3(0, 0, i*interval));
					gfx.drawLine(tickOrigin, tick);
					let label = (((max - min) / 20) * i) + min;
					if (label > 1000000) label = label.toExponential();
					label = preUnit + Math.round(label).toString() + postUnit;
					let offset = new THREE.Vector3(-(interval/8)*(label.length+1) - 3, -1, 0);
					gfx.labelPoint(gfx.movePoint(tickOrigin, offset), label, settings.axes.color);
				}
				gfx.labelLarge(new THREE.Vector3(-settings.gridSize/2 + axisLabelOffset, axisLabelOffset, 0), label, settings.axes.color, new THREE.Vector3(0, -Math.PI / 2, 0));
			}
		},
		
		placeLabel: function(mesh) {
			let line = new THREE.Vector3(0, 10, 0);
			let padding = .5;
			let offset = mesh.position.clone().add(new THREE.Vector3(0, mesh.geometry.parameters.radius + padding, 0));
			let lineMesh = gfx.drawLine(offset, line, white, .75);
			
			let labelOrigin = gfx.movePoint(mesh.position, line.clone().add(new THREE.Vector3(0, padding, 0)));
			let nameLabel = gfx.labelPoint(new THREE.Vector3(0, 0, 0), mesh.label, settings.axes.color);
			nameLabel.position.set(labelOrigin.x, labelOrigin.y, labelOrigin.z);
			
			nameLabel.geometry.computeBoundingBox(); // center align text
			let translation = new THREE.Vector3(-1, 0, 0).multiplyScalar((nameLabel.geometry.boundingBox.max.x - nameLabel.geometry.boundingBox.min.x) / 2).add(new THREE.Vector3(0, padding * 2 + mesh.geometry.parameters.radius, 0));
			nameLabel.geometry.translate(translation.x, translation.y, translation.z);
			labelOrigin.add(new THREE.Vector3(0, translation.y, 0));
			
			mesh.label = nameLabel;
			mesh.line = lineMesh;
			lineMesh.visible = false;
			nameLabel.visible = false;
			
			dataPointLabels.push(nameLabel);
		},
		
		preprocessWhiskey: function(row) {
			
			if (!uniqueCountries.includes(row.Country)) uniqueCountries.push(row.Country);
			if (row.Name !== '*' && row.Rating !== '*' && row.Country !== '*' && row.Category !== '*' && row.Age !== '*' && row.ABV !== '*' && row.Brand !== '*' && row.Price !== '*' && parseInt(row.Price) < 125 && parseInt(row.Age) < 25 && (row.Country === 'USA' || row.Country === 'Scotland')) {

				return {
					name: row.Name,
					rating: parseInt(row.Rating),
					country: row.Country,
					category: row.Category,
					age: parseInt(row.Age),
					abv: parseFloat(row.ABV),
					brand: row.Brand,
					price: row.Price
				};
			}
		}
	}
}