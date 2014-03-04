THREE.Object3D = function () {

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
};