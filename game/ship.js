THREE.Ship = function(geometry, material){
  THREE.Mesh.call(this, geometry, material);
}
THREE.Ship.prototype = Object.create(THREE.Mesh.prototype);