updateVelocity2: function(dt){
    var force=new THREE.Vector3(1,0,0);
    this.accel.x=1.0/this.numCubes*dt;
    this.accel.y=0.0/this.numCubes*dt;
    this.accel.z=0.0/this.numCubes*dt;
    var distToCenter=new THREE.Vector3(0,10,-10);
    distToCenter.subVectors(distToCenter,this.center);
    var torque = distToCenter.clone(); 
    torque.crossVectors(torque,force);
    this.torque.copy(torque);

    
    var tempVec = this.angularVelocity.clone();
    tempVec.applyMatrix3(this.CI);
    tempVec.crossVectors(this.angularVelocity,tempVec);
    tempVec.subVectors(torque,tempVec);
    tempVec.applyMatrix3(this.iCI);
    tempVec.multiplyScalar(dt);
    this.angularVelocity.addVectors(this.angularVelocity,tempVec); 
  },