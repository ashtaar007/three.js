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
  var amb = new THREE.AmbientLight( 0x202020);
  scene.add( amb);
  var light = new THREE.DirectionalLight( 0xeeeeeeee, 1.0);
  light.position.set(-50,-70,-100);
  scene.add(light);
  var time = Date.now();
	var renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

var cube = new Array();
var ship = new THREE.Object3D();
cubegeo=new THREE.CubeGeometry( 1, 1, 1 );
for (var i=0;i<3;i++){
  cube[i]=new Array();
  for(var j=0;j<3;j++){
    cube[i][j]=new Array();
    for(var k=0;k<3;k++){
      var cubecolor=0x660000*(i+0.5)+0x006600*(j+0.5)+0x000066*(k+0.5);
      cube[i][j][k]=new THREE.Mesh(cubegeo,new THREE.MeshPhongMaterial({color: cubecolor,ambient: cubecolor, specular: 0x000000, shininess: 250}));
      cube[i][j][k].position.set(i,j,k);
      ship.add(cube[i][j][k]);
    }
  }
}
scene.add(ship);
console.log(ship);

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
angle=0;
radius=10;
axis=new THREE.AxisHelper(100);
  axis.position.set(0,0,0);
  scene.add(axis)
var render = function () {
	requestAnimationFrame(render);
  elapsed=Date.now() - time;
  angle+=elapsed/1000;
  ship.position.set(radius*Math.cos(angle),radius*Math.sin(angle),0);
  ship.rotation.z=angle;
  controls.update( elapsed);
  
  renderer.render(scene, camera);
  time = Date.now();
	};

	render();
}