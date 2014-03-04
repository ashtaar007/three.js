function main(){
  var blocker = document.getElementById( 'blocker' );
			var instructions = document.getElementById( 'instructions' );

			// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			if ( havePointerLock ) {

				var element = document.body;

				var pointerlockchange = function ( event ) {

					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

						controls.enabled = true;

						blocker.style.display = 'none';

					} else {

						controls.enabled = false;

						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';

						instructions.style.display = '';

					}

				}

				var pointerlockerror = function ( event ) {

					instructions.style.display = '';

				}

				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

				instructions.addEventListener( 'click', function ( event ) {

					instructions.style.display = 'none';

					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

					if ( /Firefox/i.test( navigator.userAgent ) ) {

						var fullscreenchange = function ( event ) {

							if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

								document.removeEventListener( 'fullscreenchange', fullscreenchange );
								document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

								element.requestPointerLock();
							}

						}

						document.addEventListener( 'fullscreenchange', fullscreenchange, false );
						document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

						element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

						element.requestFullscreen();

					} else {

						element.requestPointerLock();

					}

				}, false );

			} else {

				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

			}








  var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  controls = new THREE.MyControls( camera );
	scene.add(camera);
  var amb = new THREE.AmbientLight( 0x0C0C0C);
  scene.add( amb);
  var time = Date.now();
	var renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

  renderer.shadowMapEnabled=false;
  renderer.shadowMapType = THREE.PCFShadowMap;

  var light = new THREE.DirectionalLight( 0xeeeeeeee, 1.0);
  light.castShadow=true;
  light.position.set( 450, 50, 450 );
  scene.add( light );
  console.log(light);

  light.shadowCameraLeft=-30;
  light.shadowCameraRight=30;
  light.shadowCameraBottom=-30;
  light.shadowCameraTop=30;
  light.shadowCameraNear=425;
  light.shadowCameraFar=1000;
 light.shadowBias = 0.001;
  light.shadowMapWidth=2048;
  light.shadowMapHeight=2048;
  
  var partgeometry = new THREE.Geometry();

				for ( var i = 0; i < 10000; i ++ ) {

					var vertex = new THREE.Vector3();
					vertex.x = THREE.Math.randFloatSpread( 2000 );
					vertex.y = THREE.Math.randFloatSpread( 2000 );
					vertex.z = THREE.Math.randFloatSpread( 2000 );

					partgeometry.vertices.push( vertex );

				}

				var particles = new THREE.ParticleSystem( partgeometry, new THREE.ParticleSystemMaterial( { color: 0x888888 } ) );
				scene.add( particles );
  var loader = new THREE.JSONLoader();
	loader.load( "../objects/roundspaceship.js", createScene );
  function createScene( geometry, materials ) {
    //console.log(geometry);
    console.log(materials[0]);
    materials[0] = new THREE.MeshPhongMaterial({
    color:0x4040A9,
    //color:0x000000,
    specular:0x202020,
    //emissive:new THREE.Color(0x4040A9),
    id:materials[0].id,
    uuid:materials[0].uuid,
    ambient:new THREE.Color(0x4040A9),
    //wireframe:true
    metal:true,
    name:materials[0].name
    });
    console.log(materials[0])
    var material = new THREE.MeshFaceMaterial( materials );
    console.log(material);
    ship = new THREE.Ship(geometry, material);
    ship.castShadow=true;
    ship.receiveShadow=true;
    console.log(ship);
    scene.add(ship);
    
    
    //console.log(scene);
  }
	var render = function () {
	requestAnimationFrame(render);

	//cube.rotation.x += 0.03;
	//cube.rotation.y += 0.01;
  controls.update( Date.now() - time );

  renderer.render(scene, camera);
  time = Date.now();
	};

	render();
}