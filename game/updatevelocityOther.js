updateVelocity: function(dt){
    var fmx=1, fmy=0, fmz=0,
    fpx=0,fpy=10,fpz=-10,
    //translational acceleration
    tpm=dt/this.numCubes,
    e=this.shipMatrixWorld.elements,
    v=this.velocity;
    v.x+=tpm*(fmx*e[0]+fmy*e[4]+fmz*e[8]);
    v.y+=tpm*(fmx*e[1]+fmy*e[5]+fmz*e[9]);
    v.z+=tpm*(fmx*e[2]+fmy*e[6]+fmz*e[10]);
    //rotational acceleration
    var c=this.center,
    dcx=fpx-c.x,
    dcy=fpy-c.y,
    dcz=fpz-c.z,
    tx=dcy*fmz-dcz*fmy,
    ty=dcz*fmx-dcx*fmz,
    tz=dcx*fmy-dcy*fmx,
    
    
    
    e=this.CI.elements,
    v=this.angularVelocity,
    ax=e[0]*v.x+e[3]*v.y+e[6]*v.z,
    ay=e[1]*v.x+e[4]*v.y+e[7]*v.z,
    az=e[2]*v.x+e[5]*v.y+e[8]*v.z,
    
    
    bx=tx-(v.y*az-v.z*ay),
    by=ty-(v.z*ax-v.x*az),
    bz=tz-(v.x*ay-v.y*ax),
    
    
    e=this.iCI.elements;
    v.x=dt*(e[0]*bx+e[3]*by+e[6]*bz);
    v.y=dt*(e[1]*bx+e[4]*by+e[7]*bz);
    v.z=dt*(e[2]*bx+e[5]*by+e[8]*bz);
  },