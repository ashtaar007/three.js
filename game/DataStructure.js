DataStructure = function(xmax,ymax,zmax){

  var size = xmax*ymax*zmax;
  
  this.x =new Uint8Array(size);
  this.y =new Uint8Array(size);
  this.z =new Uint8Array(size);
  this.type=new Array(xmax);
  this.faceIndex=new Array(xmax);
  this.logic=new Array(xmax);
  for(var i=0;i<xmax;i++){
    this.type[i]=new Array(ymax);
    this.faceIndex[i]=new Array(ymax);
    this.logic[i]=new Array(ymax);
    for(var j=0;j<ymax;j++){
      this.type[i][j]=new Uint32Array(zmax);
      this.faceIndex[i][j]=new Array(zmax);
      this.logic[i][j]=new Uint8Array(zmax);
      for(var k=0;k<zmax;k++){
        this.faceIndex[i][j][k]=new Array();
      }
    }
  }
  this.faceReplacement=new Array();
  this.geometry=new THREE.BufferGeometry();
  
  //4 vert per face
  //6 index per face
  //up to 6 face per cube
  //vamt should be 12 for safety, iamt should be 18 for safety
  var vamt=size*8,
  iamt=size*12,
  geometry=this.geometry;
  geometry.addAttribute( 'index', Uint16Array, iamt, 1 );
	geometry.addAttribute( 'position', Float32Array, vamt, 3 );
	geometry.addAttribute( 'normal', Float32Array, vamt, 3 );
	geometry.addAttribute( 'color', Float32Array, vamt, 3 );
  geometry.offsets[0]={
    start:0,
    index:0,
    count:0
  };
  this.numCubes=0;
  this.xSum=0;
  this.ySum=0;
  this.zSum=0;
  this.xxSum=0;
  this.mxySum=0;
  this.mxzSum=0;
  this.yySum=0;
  this.myzSum=0;
  this.zzSum=0;
  this.faceCount=0;
  this.center=new THREE.Vector3();
  this.mcenter=new THREE.Vector3();
  this.CI=new THREE.Matrix3();//inertia tensor around center of mass
  this.iCI=new THREE.Matrix3();//inverse inertia tensor
  this.shipMatrixWorld=this.CI;
  
  this.thrusterGroups=new Array();
  this.angularVelocity=new THREE.Vector3();
  this.velocity=new THREE.Vector3();
}
DataStructure.prototype = {
  constructor: DataStructure,
  applyForce: function(dt,fmx,fmy,fmz,fpx,fpy,fpz){
    //dt is time interval of force
    //fmx,fmy,fmz is force magnitude
    //fpx,fpy,fpz is force direction
    //translational acceleration
    tpm=dt/this.numCubes,
    e=this.shipMatrixWorld.elements,
    v=this.velocity;
    v.x+=tpm*(fmx*e[0]+fmy*e[4]+fmz*e[8]);
    v.y+=tpm*(fmx*e[1]+fmy*e[5]+fmz*e[9]);
    v.z+=tpm*(fmx*e[2]+fmy*e[6]+fmz*e[10]);
    
    //rotational acceleration
    
    var c=this.center,
    //force position - center
    dcx=fpx-c.x,
    dcy=fpy-c.y,
    dcz=fpz-c.z,
    //torques
    tx=dcy*fmz-dcz*fmy,
    ty=dcz*fmx-dcx*fmz,
    tz=dcx*fmy-dcy*fmx,
    
    //apply inertia tensor to angular velocity
    e=this.CI.elements,
    v=this.angularVelocity,
    vx=v.x,vy=v.y,vz=v.z,
    ax=e[0]*vx+e[3]*vy+e[6]*vz,
    ay=e[1]*vx+e[4]*vy+e[7]*vz,
    az=e[2]*vx+e[5]*vy+e[8]*vz,
    //cross angular velocity with result, subtract from torque
    bx=tx-(vy*az-vz*ay),
    by=ty-(vz*ax-vx*az),
    bz=tz-(vx*ay-vy*ax),
    //apply inverse inertia tensor to isolate rotational acceleration, mult t
    e=this.iCI.elements;
    v.x+=dt*(e[0]*bx+e[3]*by+e[6]*bz);
    v.y+=dt*(e[1]*bx+e[4]*by+e[7]*bz);
    v.z+=dt*(e[2]*bx+e[5]*by+e[8]*bz);
    
  },
  addCube: function(cube, i){
    this.x[i]=cube.x;
    this.y[i]=cube.y;
    this.z[i]=cube.z;
    this.type[cube.x][cube.y][cube.z]=cube.type;
    this.updateSums(cube.x,cube.y,cube.z,1);
  },
  updateSums: function(x,y,z,sign){//sign = 1 for add, sign = -1 for subtract
    var sx=sign*x,sy=sign*y,sz=sign*z;
    this.xSum+=sx;this.ySum+=sy;this.zSum+=sz;
    this.xxSum+=sx*x;this.yySum+=sy*y;this.zzSum+=sz*z;
    this.mxySum-=sx*y;this.mxzSum-=sx*z;this.myzSum-=sy*z;
    this.numCubes+=sign;
  },
  updateCenter: function(){
    var n =this.numCubes,
    x=this.xSum/n,
    y=this.ySum/n,
    z=this.zSum/n;
    this.center.set(x,y,z);
    this.mcenter.set(-x,-y,-z);
    this.updateInertiaMatrix();
  },
  updateInertiaMatrix: function(){

    var Cx=this.center.x,
    Cy=this.center.y,
    Cz=this.center.z,
    n=this.numCubes,
    nCxy=n*Cx*Cy,
    nCxz=n*Cx*Cz,
    nCyz=n*Cy*Cz,
    nCxxyy=n*(Cx*Cx+Cy*Cy),
    nCxxzz=n*(Cx*Cx+Cz*Cz),
    nCyyzz=n*(Cy*Cy+Cz*Cz),
    xxyy=this.xxSum+this.yySum,
    xxzz=this.xxSum+this.zzSum,
    yyzz=this.yySum+this.zzSum,
    mxy=this.mxySum,
    mxz=this.mxzSum,
    myz=this.myzSum;
    this.CI.set(
      yyzz-nCyyzz, mxy+nCxy, mxz+nCxz,
      mxy+nCxy, xxzz-nCxxzz, myz+nCyz,
      mxz+nCxz, myz+nCyz, xxyy-nCxxyy
    );
    this.iCI.getMatrix3Inverse(this.CI);
  },
  resetLogical: function(){
    this.faceCount=0;
    this.geometry.offsets[0].count=0;
    for(var i=0;i<this.numCubes;i++){
      this.logic[this.x[i]][this.y[i]][this.z[i]]=0;
    }
  },
  setFromCubeArray: function(cubes){
    var len=cubes.length;
    for(var i=0;i<len;i++){
      this.addCube(cubes[i], i);
    }
  },
  addFacesToRegion: function(xmin,xmax,ymin,ymax,zmin,zmax){//Inclusive on min, exclusive on max
    for(var x=xmin;x<xmax;x++){
      for(var y=ymin;y<ymax;y++){
        for(var z=zmin;z<zmax;z++){
          var type=this.type,typex=type[x],typexy=type[x][y],
          a=typex[y-1],b=typex[y+1],c=type[x-1],d=type[x+1];
      
          if(!typexy[z-1])
            this.addZM(x,y,z);
          if(!typexy[z+1])
            this.addZP(x,y,z);
          if(!a||!a[z])
            this.addYM(x,y,z);
          if(!b||!b[z])
            this.addYP(x,y,z);
          if(!c||!c[y][z])
            this.addXM(x,y,z);
          if(!d||!d[y][z])
            this.addXP(x,y,z);
        }
      }
    }
  },
  addFaces: function(){
    for(var i=0;i<this.numCubes;i++){
      var x=this.x[i],y=this.y[i],z=this.z[i],
          type=this.type,
          c=type[x-1],typex=type[x],d=type[x+1],
          a=typex[y-1],typexy=typex[y],b=typex[y+1];
      
      if(!typexy[z-1])
        this.addZM(x,y,z);
      if(!typexy[z+1])
        this.addZP(x,y,z);
      if(!a||!a[z])
        this.addYM(x,y,z);
      if(!b||!b[z])
        this.addYP(x,y,z);
      if(!c||!c[y][z])
        this.addXM(x,y,z);
      if(!d||!d[y][z])
        this.addXP(x,y,z);
    }
  },
  addZM:function(x,y,z){
    this.drawZM(x,y,z,this.faceCount);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawZM:function(x,y,z,faceCount){
    this.setIndices(faceCount);
    this.faceIndex[x][y][z].push(faceCount);
    var vb=faceCount*12,
    xp=x+0.5,xm=x-0.5,yp=y+0.5,ym=y-0.5,zp=z+0.5,zm=z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,this.type[x][y][z],0,0,-1);
    this.logic[x][y][z]+=1;
    positions[vb]=xp, positions[vb+1]=yp,positions[vb+2]=zm,
    positions[vb+3]=xp,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xm,positions[vb+7]=yp,positions[vb+8]=zm,
    positions[vb+9]=xm,positions[vb+10]=ym,positions[vb+11]=zm;
  },
  addZP:function(x,y,z){
    this.drawZP(x,y,z,this.faceCount);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawZP:function(x,y,z,faceCount){
    this.setIndices(faceCount);
    this.faceIndex[x][y][z].push(faceCount);
    var vb=faceCount*12,
    xp=x+0.5,xm=x-0.5,yp=y+0.5,ym=y-0.5,zp=z+0.5,zm=z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,this.type[x][y][z],0,0,1);
    this.logic[x][y][z]+=2;
    positions[vb]=xm,positions[vb+1]=ym,positions[vb+2]=zp,
    positions[vb+3]=xp,positions[vb+4]=ym,positions[vb+5]=zp,
    positions[vb+6]=xm,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xp,positions[vb+10]=yp,positions[vb+11]=zp;
  },
  addYM:function(x,y,z){
    this.drawYM(x,y,z,this.faceCount);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawYM:function(x,y,z,faceCount){
    this.setIndices(faceCount);
    this.faceIndex[x][y][z].push(faceCount);
    var vb=faceCount*12,
    xp=x+0.5,xm=x-0.5,yp=y+0.5,ym=y-0.5,zp=z+0.5,zm=z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,this.type[x][y][z],0,-1,0);
    this.logic[x][y][z]+=4;
    positions[vb]=xm,positions[vb+1]=ym,positions[vb+2]=zp,
    positions[vb+3]=xm,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xp,positions[vb+7]=ym,positions[vb+8]=zp,
    positions[vb+9]=xp,positions[vb+10]=ym,positions[vb+11]=zm;
  },
  addYP:function(x,y,z){
    this.drawYP(x,y,z,this.faceCount);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawYP:function(x,y,z,faceCount){
    this.setIndices(faceCount);
    this.faceIndex[x][y][z].push(faceCount);
    var vb=faceCount*12,
    xp=x+0.5,xm=x-0.5,yp=y+0.5,ym=y-0.5,zp=z+0.5,zm=z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,this.type[x][y][z],0,1,0);
    this.logic[x][y][z]+=8;
    positions[vb]=xp,positions[vb+1]=yp,positions[vb+2]=zm,
    positions[vb+3]=xm,positions[vb+4]=yp,positions[vb+5]=zm,
    positions[vb+6]=xp,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xm,positions[vb+10]=yp,positions[vb+11]=zp;
  },
  addXM:function(x,y,z){
    this.drawXM(x,y,z,this.faceCount);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawXM:function(x,y,z,faceCount){
    this.setIndices(faceCount);
    this.faceIndex[x][y][z].push(faceCount);
    var vb=faceCount*12,
    xp=x+0.5,xm=x-0.5,yp=y+0.5,ym=y-0.5,zp=z+0.5,zm=z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,this.type[x][y][z],-1,0,0);
    this.logic[x][y][z]+=16;
    positions[vb]=xm,positions[vb+1]=yp,positions[vb+2]=zm,
    positions[vb+3]=xm,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xm,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xm,positions[vb+10]=ym,positions[vb+11]=zp;
  },
  addXP:function(x,y,z){
    this.drawXP(x,y,z,this.faceCount);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawXP:function(x,y,z,faceCount){
    this.setIndices(faceCount);
    this.faceIndex[x][y][z].push(faceCount);
    var vb=faceCount*12,
    xp=x+0.5,xm=x-0.5,yp=y+0.5,ym=y-0.5,zp=z+0.5,zm=z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,this.type[x][y][z],1,0,0);
    this.logic[x][y][z]+=32;
    positions[vb]=xp,positions[vb+1]=ym,positions[vb+2]=zp,
    positions[vb+3]=xp,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xp,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xp,positions[vb+10]=yp,positions[vb+11]=zm;
  },
  setColorsNormals: function(vb,type,nx,ny,nz){
    var normals=this.geometry.attributes.normal.array,
    cr=(type&0x00FF0000)/0xFF0000,
    cg=(type&0x0000FF00)/0xFF00,
    cb=(type&0x000000FF)/0xFF,
    colors=this.geometry.attributes.color.array;  
    normals[vb]=nx,normals[vb+1]=ny,normals[vb+2]=nz,
    normals[vb+3]=nx,normals[vb+4]=ny,normals[vb+5]=nz,
    normals[vb+6]=nx,normals[vb+7]=ny,normals[vb+8]=nz,
    normals[vb+9]=nx,normals[vb+10]=ny,normals[vb+11]=nz; 
    colors[vb]=cr,colors[vb+1]=cg,colors[vb+2]=cb,
    colors[vb+3]=cr,colors[vb+4]=cg,colors[vb+5]=cb,
    colors[vb+6]=cr,colors[vb+7]=cg,colors[vb+8]=cb,
    colors[vb+9]=cr,colors[vb+10]=cg,colors[vb+11]=cb;
  },
  setIndices: function(faceCount){
    var indices=this.geometry.attributes.index.array,
    ib=faceCount*6,v=faceCount*4;
    indices[ib]=v,
    indices[ib+1]=v+1,
    indices[ib+2]=v+2,
    indices[ib+3]=v+3,
    indices[ib+4]=v+2,
    indices[ib+5]=v+1;
  },
  clearFace: function(faceIndex){
    var indiceStart=faceIndex*6,
    indiceEnd=indiceStart+6,
    indices=this.geometry.attributes.index.array;
    for(var i=indiceStart;i<indiceEnd;i++){
      indices[i]=0;
    }
  },
  removeCube: function(x,y,z){
    var typexy=this.type[x][y];
    if(!typexy[z])return;
    this.updateSums(x,y,z,-1);
    typexy[z]=0;
    var logic = this.logic[x][y][z],
    faceIndex=this.faceIndex[x][y][z],
    a=0,b=0;
    if(!(logic&1)){//-z
      a=this.faceReplacement.pop();
      if(a)
        this.drawZP(x,y,z-1,a);
      else
        this.addZP(x,y,z-1);
    }
    else{
      b=faceIndex.pop();
      this.faceReplacement.push(b);
      this.clearFace(b);
    }
    if(!(logic&2)){//+z
      a=this.faceReplacement.pop();
      if(a)
        this.drawZM(x,y,z+1,a);
      else
        this.addZM(x,y,z+1);
    }
    else{
      b=faceIndex.pop();
      this.faceReplacement.push(b);
      this.clearFace(b);
    }
    if(!(logic&4)){//-y
      a=this.faceReplacement.pop();
      if(a)
        this.drawYP(x,y-1,z,a);
      else
        this.addYP(x,y-1,z);
    }
    else{
      b=faceIndex.pop();
      this.faceReplacement.push(b);
      this.clearFace(b);
    }
    if(!(logic&8)){//+y
      a=this.faceReplacement.pop();
      if(a)
        this.drawYM(x,y+1,z,a);
      else
        this.addYM(x,y+1,z);
    }
    else{
      b=faceIndex.pop();
      this.faceReplacement.push(b);
      this.clearFace(b);
    }
    if(!(logic&16)){//-x
      a=this.faceReplacement.pop();
      if(a)
        this.drawXP(x-1,y,z,a);
      else
        this.addXP(x-1,y,z);
    }
    else{
      b=faceIndex.pop();
      this.faceReplacement.push(b);
      this.clearFace(b);
    }
    if(!(logic&32)){//+x
      a=this.faceReplacement.pop();
      if(a)
        this.drawXM(x+1,y,z,a);
      else
        this.addXM(x+1,y,z);
    }
    else{
      b=faceIndex.pop();
      this.faceReplacement.push(b);
      this.clearFace(b);
    }
  },
  getCount: function(logic){
    var sum=0;
    for(var i=0;i<6;i++){
    sum+=(logic>>i&1);
    }
    return sum;
  }
}