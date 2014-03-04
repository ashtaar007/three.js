//From Obj3D
	this.id = THREE.Object3DIdCount ++;
	this.uuid = THREE.Math.generateUUID();
	this.name = '';
	this.parent = undefined;
	this.children = [];
	this.up = new THREE.Vector3( 0, 1, 0 );
	this.position = new THREE.Vector3();
	this._rotation = new THREE.Euler();
	this._quaternion = new THREE.Quaternion();
	this.scale = new THREE.Vector3( 1, 1, 1 );
	// keep rotation and quaternion in sync
	this._rotation._quaternion = this.quaternion;
	this._quaternion._euler = this.rotation;
	this.renderDepth = null;
	this.rotationAutoUpdate = true;
	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();
	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = true;
	this.visible = true;
	this.castShadow = false;
	this.receiveShadow = false;
	this.frustumCulled = true;
	this.userData = {};
//From Light
  color: new THREE.Color( hex );
THREE.AmbientLight = function ( hex ) //no new parameters
THREE.AreaLight = function ( hex, intensity ) 
  normal = new THREE.Vector3( 0, -1, 0 );
  right = new THREE.Vector3( 1, 0, 0 );
  intensity: <float>, [0:1]
  width: <float>, [0:1]
  height: <float>, [0:1]
  constantAttenuation: <float>
  linearAttenuation: <float>
  quadraticAttenuation: <float>
THREE.DirectionalLight = function ( hex, intensity )
  target = new THREE.Object3D();
  intensity: <float>, [0:1]
  castShadow: <boolean>
  onlyShadow: <boolean>
    shadowCameraNear = 50;
    shadowCameraFar = 5000;
    shadowCameraLeft = -500;
    shadowCameraRight = 500;
    shadowCameraTop = 500;
    shadowCameraBottom = -500;
    shadowCameraVisible = false;
    shadowBias = 0;
    shadowDarkness = 0.5;
    shadowMapWidth = 512;
    shadowMapHeight = 512;
    shadowCascade = false;
    shadowCascadeOffset = new THREE.Vector3( 0, 0, -1000 );
    shadowCascadeCount = 2;
    shadowCascadeBias = [ 0, 0, 0 ];
    shadowCascadeWidth = [ 512, 512, 512 ];
    shadowCascadeHeight = [ 512, 512, 512 ];
    shadowCascadeNearZ = [ -1.000, 0.990, 0.998 ];
    shadowCascadeFarZ  = [  0.990, 0.998, 1.000 ];
    shadowCascadeArray = [];
    shadowMap = null;
    shadowMapSize = null;
    shadowCamera = null;
    shadowMatrix = null;
THREE.HemisphereLight = function ( skyColorHex, groundColorHex, intensity )
  skycolor:  new THREE.Color( skyColorHex );
  groundColor = new THREE.Color( groundColorHex );
  intensity: <float>, [0:1]
THREE.PointLight = function ( hex, intensity, distance )
  intensity: <float>, [0:1]
  distance: <float>, [0:1]
THREE.SpotLight = function ( hex, intensity, distance, angle, exponent )
  target = new THREE.Object3D();
  intensity: <float>, [0:1]
  distance: <float>
  angle: <float>
  exponent: <int>
  castShadow: <boolean>
  onlyShadow: <boolean>
    shadowCameraNear = 50;
    shadowCameraFar = 5000;
    shadowCameraFov = 50;
    shadowCameraVisible = false;
    shadowBias = 0;
    shadowDarkness = 0.5;
    shadowMapWidth = 512;
    shadowMapHeight = 512;
    shadowMap = null;
    shadowMapSize = null;
    shadowCamera = null;
    shadowMatrix = null;
  

