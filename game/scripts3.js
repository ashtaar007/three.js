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
  window.addEventListener( 'resize', onWindowResize, false );
  stats = new Stats();
  document.body.appendChild( stats.domElement ); 
  var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  controls = new THREE.MyControls( camera );
	scene.add(camera);
  var amb = new THREE.AmbientLight( 0x202020);
  scene.add( amb);
  var light = new THREE.DirectionalLight( 0xeeeeeeee, 1.0);
  //light = new THREE.SpotLight( 0xeeeeee, 1, 0, Math.PI / 2, 1 );
  light.position.set(-50,-70,-100);
  
  scene.add(light);
	var renderer = new THREE.WebGLRenderer({antialias:true, sortObjects:false});
  
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

  usePartGeometry(scene);
  mycubes=new Array();
  var time = Date.now();
  var xlength=45;
  var ylength=45;
  var zlength=45;
  
  for (var i=0;i<xlength;i++){
    for(var j=0;j<ylength;j++){
      for(var k=0;k<zlength;k++){
        mycubes.push(new Cube(i,j,k,1+k%3+i%3+j%3));
      }
    }
  }
  var ma2 = new THREE.MeshLambertMaterial( {
		color: 0xaaaaaa, ambient: 0xaaaaaa, vertexColors: THREE.VertexColors, alphaTest:0.5
	} );
  var makeShip=function(){
    data = new DataStructure(xlength,ylength,zlength);
    data.setFromCubeArray(mycubes);
    data.updateCenter();
    var time;
    var res=0;
    for(var rep=0;rep<1;rep++){
      data.resetLogical();
      time = Date.now();
      data.addFaces();
      //data.addFacesToRegion(0,xlength,0,ylength,0,zlength);
      res+=Date.now()-time;
    }
    res/=rep;
    console.log(res);
    data.updateOffsets();
    mh = new THREE.Mesh( data.geometry, ma2 );
    mh.position=data.mcenter;
    ship = new THREE.Object3D();
    ship.add(mh);
    ship.delPos=new THREE.Vector3();
    data.shipMatrixWorld=ship.matrixWorld;
    glob=data;
    okok=ship;
    return ship;
  }
  var useShadow=function(){
    light.castShadow=true;
    light.shadowCameraVisible=true;
    light.shadowCameraRight     =  20;
    light.shadowCameraLeft     = -20;
    light.shadowCameraTop      =  20;
    light.shadowCameraBottom   = -20;
    light.shadowCameraFov=20;
    light.shadowCameraNear = 130;
    light.shadowCameraFar = 2500;
    light.target.position.set( 0, 0, 0 );
    renderer.shadowMapEnabled   = true;
    
    renderer.shadowMapWidth = 4096;
    renderer.shadowMapHeight = 4096

    renderer.shadowMapBias = -0.00022;
    renderer.shadowMapDarkness = 0.55;
    renderer.shadowMapType=1;
    mh.castShadow=true;
    mh.receiveShadow=true;
  }
  var ship=makeShip();
  scene.add(ship);
  var timeInitial=Date.now(),elapsed=0,frameCount=0;
  
  var logic = function(){
      for(var i=0;i<100;i++){
        var x=Math.floor(Math.random()*xlength),
        y=Math.floor(Math.random()*ylength),
        z=Math.floor(Math.random()*zlength),
        point=data.point[x][y][z];
        data.removeCube(point);
      }
      data.updateCenter();
      data.updateOffsets();
      mh.geometry.attributes.index.needsUpdate = true;
      mh.geometry.attributes.color.needsUpdate = true;
      mh.geometry.attributes.normal.needsUpdate = true;
      mh.geometry.attributes.position.needsUpdate = true;
  }
  
	var render = function () {
    logic();
    setTimeout( function() {
      requestAnimationFrame(render);
    }, 1000 / 30 );
    elapsed=Date.now()-time;
    controls.update(elapsed);
    data.applyForce(elapsed/100,1000,0,0,0,0,0);
    updatePositionRotation(ship,data,elapsed/100);
    ship.position.addVectors(data.center,ship.delPos);
    frameCount++;
    stats.update();
    renderer.render(scene, camera);
    time = Date.now();
	};
  
  //useShadow();
	render();
}
function updatePositionRotation(ship,data,dt){
  var mag = data.angularVelocity.length();
  var angle = mag*dt;
  var axis= data.angularVelocity.clone().divideScalar(mag);
  ship.delPos.x+=data.velocity.x*dt;
  ship.delPos.y+=data.velocity.y*dt;
  ship.delPos.z+=data.velocity.z*dt;
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
function onWindowResize() {
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize( window.innerWidth, window.innerHeight );
}  