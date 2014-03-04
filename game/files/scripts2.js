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
	var renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
  //useBufferGeometry(scene);
  usePartGeometry(scene);
  mycubes=new Array();
  var time = Date.now();
  var xlength=15;
  var ylength=15;
  var zlength=15;
  /*
  
  for (var i=0;i<xlength-1;i+=2){
    for(var j=0;j<ylength-1;j+=2){
      for(var k=0;k<zlength;k++){
        mycubes.push(new Cube(i+k%2,j+k%2,k,k%2));
      }
    }
  }
  for (var i=0;i<xlength-1;i++){
    for(var j=0;j<ylength-1;j+=2){
      for(var k=1;k<zlength;k+=2){
        mycubes.push(new Cube(i,j,k,k%2));
      }
    }
  }*/
  
  for (var i=0;i<xlength;i++){
    for(var j=0;j<ylength;j++){
      for(var k=0;k<zlength;k++){
        mycubes.push(new Cube(i,j,k,k%3+i%3+j%3));
      }
    }
  }
  data = new DataStructure(xlength,ylength+1,zlength+1);
  data.setFromCubeArray(mycubes);
  data.addFaces();
  console.log(data);
  //data.removeCube(0,2,2);
  var ma = new THREE.MeshPhongMaterial( {
		color: 0xaaaaaa, ambient: 0xaaaaaa, specular: 0x101010, shininess: 250, vertexColors: THREE.VertexColors
	} );
  mh = new THREE.Mesh( data.geometry, ma );
  mh.position.set(0,0,0);
	scene.add( mh );

  
	var render = function () {
	requestAnimationFrame(render);
  controls.update( Date.now() - time );
  
  renderer.render(scene, camera);
  time = Date.now();
	};

	render();
}
function usePartGeometry(scene){
  axis=new THREE.AxisHelper(100);
  axis.position.set(-1,-1,-1);
  scene.add(axis)
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
}
