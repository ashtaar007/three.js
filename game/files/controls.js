THREE.MyControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );
  var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
  var moveDown = false;
  var moveUp = false;
  var rollLeft = false;
  var rollRight = false;
  var tmpQuaternion = new THREE.Quaternion();
  var rotationVector = new THREE.Vector3( 0, 0, 0 );
	var velocity = new THREE.Vector3();
  var rotSpeed = .003;
  var rollSpeed = .01;
  this.enabled = false;

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {
		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    tmpQuaternion.set(-movementY*rotSpeed,-movementX*rotSpeed,0.0,1.0).normalize();
    camera.quaternion.multiply(tmpQuaternion );
	};

	var onKeyDown = function ( event ) {
    if ( scope.enabled === false ) return;
		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;
        
      case 16: // shift
				moveDown = true;
				break;
        
      case 32: // space
				moveUp = true;
				break;
      case 81: //e
				rollRight=true;
				break;
      case 69: //q
				rollLeft=true;
				break;
      case 67: //c
				console.log(camera.position)
				break;
		}

	};

	var onKeyUp = function ( event ) {
    if ( scope.enabled === false ) return;
		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;
      
      case 16: // shift
				moveDown = false;
				break;
        
      case 32: // space
				moveUp = false;
				break;
      case 81: //e
				rollRight=false;
				break;
      case 69: //q
				rollLeft=false;
				break;
		}
	};
	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	this.getObject = function () {

		return camera;

	};

	this.update = function ( delta ) {
		delta *= 0.1;
    
		velocity.x += ( - velocity.x ) * 0.5 * delta;
    velocity.y += ( - velocity.y ) * 0.5 * delta;
		velocity.z += ( - velocity.z ) * 0.5 * delta;
    
    changeCos=0.12*delta;
    changeSin=0;
    
    if(rollLeft&&!rollRight){
    tmpQuaternion.set(0.0,0.0,-rollSpeed,1.0).normalize();
    camera.quaternion.multiply(tmpQuaternion );
    }
    if(rollRight){
    tmpQuaternion.set(0.0,0.0,rollSpeed,1.0).normalize();
    camera.quaternion.multiply(tmpQuaternion );
    }
		if ( moveForward ){
    velocity.z -= changeCos;
    velocity.y += changeSin;
    }
		if ( moveBackward ){
    velocity.z += changeCos;
    velocity.y -= changeSin;
    }
		if ( moveLeft ) velocity.x -= 0.12 * delta;
		if ( moveRight ) velocity.x += 0.12 * delta;
    
    if ( moveDown ){
    velocity.y -= changeCos;
    velocity.z -= changeSin;
    }
		if ( moveUp ){
    velocity.y += changeCos;
    velocity.z += changeSin;
    }
		camera.translateX( velocity.x );
    camera.translateY( velocity.y );
		camera.translateZ( velocity.z );


	};

};
