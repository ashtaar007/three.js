var glob;
var okok;
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

  usePartGeometry(scene);
  mycubes=new Array();
  var time = Date.now();
  var xlength=3;
  var ylength=3;
  var zlength=3;
  
  for (var i=0;i<xlength;i++){
    for(var j=0;j<ylength;j++){
      for(var k=0;k<zlength;k++){
        mycubes.push(new Cube(i,j,k,1+k%3+i%3+j%3));
      }
    }
  }
  var ma = new THREE.MeshLambertMaterial( {
		color: 0xaaaaaa, ambient: 0xaaaaaa, vertexColors: THREE.VertexColors
	} );
  var ship=makeShip(xlength,ylength,zlength,mycubes,ma);
  scene.add(ship);
  var timeInitial=Date.now(),elapsed=0,frameCount=0;
  var logic = function(){
      for(var i=0;i<2;i++){
        data.removeCube(Math.floor(Math.random()*xlength),
        Math.floor(Math.random()*ylength),
        Math.floor(Math.random()*zlength));
      }
      data.updateCenter();
      mh.geometry.attributes.index.needsUpdate = true;
      mh.geometry.attributes.color.needsUpdate = true;
      mh.geometry.attributes.normal.needsUpdate = true;
      mh.geometry.attributes.position.needsUpdate = true;
  }
	var render = function () {
    //logic();
    requestAnimationFrame(render);
    elapsed=Date.now()-time;
    controls.update(elapsed);
    data.applyForce(elapsed/100,1,0,0,0,10,-10);
    updatePositionRotation(ship,data,elapsed/100);
    frameCount++;
    renderer.render(scene, camera);
    time = Date.now();
	};
  
	render();
}
function makeShip(xlength,ylength,zlength,mycubes,ma){
  data = new DataStructure(xlength,ylength,zlength);
  data.setFromCubeArray(mycubes);
  data.updateCenter();
  var time;
  var res=0;
  for(var rep=0;rep<1;rep++){
    data.resetLogical();
    time = Date.now();
    //data.addFacesToRegion(0,xlength,0,xlength,0,xlength);
    data.addFaces();
    res+=Date.now()-time;
  }
  res/=rep;
  mh = new THREE.Mesh( data.geometry, ma );
  mh.position=data.mcenter;
  ship = new THREE.Object3D();
  ship.add(mh);
  data.shipMatrixWorld=ship.matrixWorld;
  glob=data;
  okok=ship;
  return ship;
}
function updatePositionRotation(ship,data,dt){
  var mag = data.angularVelocity.length();
  var angle = mag*dt;
  var axis= data.angularVelocity.clone().divideScalar(mag);
  ship.position.x+=data.velocity.x*dt;
  ship.position.y+=data.velocity.y*dt;
  ship.position.z+=data.velocity.z*dt;
  ship.rotateOnAxis(axis,angle);
}
function usePartGeometry(scene){
  axis=new THREE.AxisHelper(100);
  axis.position.set(0,0,0);
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
