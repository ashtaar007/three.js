DataStructure = function(xmax,ymax,zmax){

  var size = xmax*ymax*zmax;
  this.xmax=xmax;
  this.ymax=ymax;
  this.zmax=zmax;
  this.point=new Array(xmax);
  for(var i=0;i<xmax;i++){
    this.point[i]=new Array(ymax);
    for(var j=0;j<ymax;j++){
      this.point[i][j]=new Array(zmax);
      for(var k=0;k<zmax;k++){
        this.point[i][j][k]=new Point(i,j,k);
      }
    }
  }
  this.createPointWeb();
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
  this.start=new Point(-1,-1,-1);
  this.end=new Point(-1,-1,-1);
  this.end.next=null;
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
  createPointWeb: function(){
    var point,
    xmax=this.xmax,
    ymax=this.ymax,
    zmax=this.zmax;
    for(var x=0;x<xmax;x++){
      for(var y=0;y<ymax;y++){
        for(var z=0;z<zmax;z++){
          point=this.point[x][y][z];
          if(z==0)
            point.ZM=null;
          else
            point.ZM=this.point[x][y][z-1];
          if(z==this.zmax-1)
            point.ZP=null;
          else
            point.ZP=this.point[x][y][z+1];
          if(y==0)
            point.YM=null;
          else
            point.YM=this.point[x][y-1][z];
          if(y==this.ymax-1)
            point.YP=null;
          else
            point.YP=this.point[x][y+1][z];
          if(x==0)
            point.XM=null;
          else
            point.XM=this.point[x-1][y][z];
          if(x==this.xmax-1)
            point.XP=null;
          else
            point.XP=this.point[x+1][y][z];  
        }
      }
    }
  },
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
  },
  setFromCubeArray: function(cubes){
    var len=cubes.length,
    x,y,z,
    cube,point,cubeNext;
    var initialpoint=this.point[cubes[0].x][cubes[0].y][cubes[0].z];
    initialpoint.previous=this.start;
    this.start.next=initialpoint;
    
    for(var i=0;i<len;i++){
      cube=cubes[i];
      x=cube.x;y=cube.y;z=cube.z;
      point=this.point[x][y][z];
      point.type=cube.type;
      this.updateSums(x,y,z,1);
      //creates Linked List
      if(i==len-1){
        point.next=this.end;
        this.end.previous=point;
      }
      else{
        cubeNext=cubes[i+1];
        point.next=this.point[cubeNext.x][cubeNext.y][cubeNext.z];
        point.next.previous=point;
      }
    }
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
    var pointer=this.start.next;
    var end = this.end;
    while(pointer!==end){
      pointer.ZMface=-1;
      pointer.ZPface=-1;
      pointer.YMface=-1;
      pointer.YPface=-1;
      pointer.XMface=-1;
      pointer.XPface=-1;
      pointer=pointer.next;
    }
  },
  addFacesToRegion: function(xmin,xmax,ymin,ymax,zmin,zmax){//Inclusive on min, exclusive on max
    for(var x=xmin;x<xmax;x++){
      for(var y=ymin;y<ymax;y++){
        for(var z=zmin;z<zmax;z++){
        }
      }
    }
  },
  addFaces: function(){
    var pointer=this.start.next;
    var end = this.end;
    while(pointer!==end){
      if(!pointer.ZM||!pointer.ZM.type)
        this.addZMFace(pointer);
      if(!pointer.ZP||!pointer.ZP.type)
        this.addZPFace(pointer);
      if(!pointer.YM||!pointer.YM.type)
        this.addYMFace(pointer);
      if(!pointer.YP||!pointer.YP.type)
        this.addYPFace(pointer);
      if(!pointer.XM||!pointer.XM.type)
        this.addXMFace(pointer);
      if(!pointer.XP||!pointer.XP.type)
        this.addXPFace(pointer);
      pointer=pointer.next;
    }
  },
  addZMFace:function(pointer){
    a=this.faceReplacement.pop();
    if(a)
      this.replaceZMFace(pointer,a);
    else{
      this.replaceZMFace(pointer,this.faceCount);
      this.faceCount++;
      this.geometry.offsets[0].count+=6;
    }
  },
  replaceZMFace:function(pointer,faceCount){
    this.setIndices(faceCount);
    var vb=faceCount*12,
    xp=pointer.x+0.5,xm=pointer.x-0.5,yp=pointer.y+0.5,ym=pointer.y-0.5,zp=pointer.z+0.5,zm=pointer.z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,pointer.type,0,0,-1);
    pointer.ZMface=faceCount;
    positions[vb]=xp, positions[vb+1]=yp,positions[vb+2]=zm,
    positions[vb+3]=xp,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xm,positions[vb+7]=yp,positions[vb+8]=zm,
    positions[vb+9]=xm,positions[vb+10]=ym,positions[vb+11]=zm;
  },
  addZPFace:function(pointer){
    a=this.faceReplacement.pop();
    if(a)
      this.replaceZPFace(pointer,a);
    else{
      this.replaceZPFace(pointer,this.faceCount);
      this.faceCount++;
      this.geometry.offsets[0].count+=6;
    }
  },
  replaceZPFace:function(pointer,faceCount){
    this.setIndices(faceCount);
    var vb=faceCount*12,
    xp=pointer.x+0.5,xm=pointer.x-0.5,yp=pointer.y+0.5,ym=pointer.y-0.5,zp=pointer.z+0.5,zm=pointer.z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,pointer.type,0,0,1);
    pointer.ZPface=faceCount;
    positions[vb]=xm,positions[vb+1]=ym,positions[vb+2]=zp,
    positions[vb+3]=xp,positions[vb+4]=ym,positions[vb+5]=zp,
    positions[vb+6]=xm,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xp,positions[vb+10]=yp,positions[vb+11]=zp;
  },
  addYMFace:function(pointer){
    a=this.faceReplacement.pop();
    if(a)
      this.replaceYMFace(pointer,a);
    else{
      this.replaceYMFace(pointer,this.faceCount);
      this.faceCount++;
      this.geometry.offsets[0].count+=6;
    }
  },
  replaceYMFace:function(pointer,faceCount){
    this.setIndices(faceCount);
    var vb=faceCount*12,
    xp=pointer.x+0.5,xm=pointer.x-0.5,yp=pointer.y+0.5,ym=pointer.y-0.5,zp=pointer.z+0.5,zm=pointer.z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,pointer.type,0,-1,0);
    pointer.YMface=faceCount;
    positions[vb]=xm,positions[vb+1]=ym,positions[vb+2]=zp,
    positions[vb+3]=xm,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xp,positions[vb+7]=ym,positions[vb+8]=zp,
    positions[vb+9]=xp,positions[vb+10]=ym,positions[vb+11]=zm;
  },
  addYPFace:function(pointer){
    a=this.faceReplacement.pop();
    if(a)
      this.replaceYPFace(pointer,a);
    else{
      this.replaceYPFace(pointer,this.faceCount);
      this.faceCount++;
      this.geometry.offsets[0].count+=6;
    }
  },
  replaceYPFace:function(pointer,faceCount){
    this.setIndices(faceCount);
    var vb=faceCount*12,
    xp=pointer.x+0.5,xm=pointer.x-0.5,yp=pointer.y+0.5,ym=pointer.y-0.5,zp=pointer.z+0.5,zm=pointer.z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,pointer.type,0,1,0);
    pointer.YPface=faceCount;
    positions[vb]=xp,positions[vb+1]=yp,positions[vb+2]=zm,
    positions[vb+3]=xm,positions[vb+4]=yp,positions[vb+5]=zm,
    positions[vb+6]=xp,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xm,positions[vb+10]=yp,positions[vb+11]=zp;
  },
  addXMFace:function(pointer){
    a=this.faceReplacement.pop();
    if(a)
      this.replaceXMFace(pointer,a);
    else{
      this.replaceXMFace(pointer,this.faceCount);
      this.faceCount++;
      this.geometry.offsets[0].count+=6;
    }
  },
  replaceXMFace:function(pointer,faceCount){
    this.setIndices(faceCount);
    var vb=faceCount*12,
    xp=pointer.x+0.5,xm=pointer.x-0.5,yp=pointer.y+0.5,ym=pointer.y-0.5,zp=pointer.z+0.5,zm=pointer.z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,pointer.type,-1,0,0);
    pointer.XMface=faceCount;
    positions[vb]=xm,positions[vb+1]=yp,positions[vb+2]=zm,
    positions[vb+3]=xm,positions[vb+4]=ym,positions[vb+5]=zm,
    positions[vb+6]=xm,positions[vb+7]=yp,positions[vb+8]=zp,
    positions[vb+9]=xm,positions[vb+10]=ym,positions[vb+11]=zp;
  },
  addXPFace:function(pointer){
    a=this.faceReplacement.pop();
    if(a)
      this.replaceXPFace(pointer,a);
    else{
      this.replaceXPFace(pointer,this.faceCount);
      this.faceCount++;
      this.geometry.offsets[0].count+=6;
    }
  },
  replaceXPFace:function(pointer,faceCount){
    this.setIndices(faceCount);
    var vb=faceCount*12,
    xp=pointer.x+0.5,xm=pointer.x-0.5,yp=pointer.y+0.5,ym=pointer.y-0.5,zp=pointer.z+0.5,zm=pointer.z-0.5,
    positions=this.geometry.attributes.position.array;
    this.setColorsNormals(vb,pointer.type,1,0,0);
    pointer.XPface=faceCount;
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
  removeFace: function(faceIndex){
    this.faceReplacement.push(faceIndex);
    var indiceStart=faceIndex*6,
    indiceEnd=indiceStart+6,
    indices=this.geometry.attributes.index.array;
    for(var i=indiceStart;i<indiceEnd;i++){
      indices[i]=0;
    }
  },
  removeUnfacedCube: function(pointer){
    if(!pointer.type)return;
    pointer.previous.next=pointer.next;
    pointer.next.previous=pointer.previous;
    this.updateSums(pointer.x,pointer.y,pointer.z,-1);
    pointer.type=0;
  },
  removeCube: function(pointer){
    if(!pointer.type)return;
    pointer.previous.next=pointer.next;
    pointer.next.previous=pointer.previous;
    this.updateSums(pointer.x,pointer.y,pointer.z,-1);
    pointer.type=0;
    this.removeFaces(pointer);
  },
  removeFaces: function(pointer){
    var a=0,
    ZMface=pointer.ZMface,
    ZPface=pointer.ZPface,
    YMface=pointer.YMface,
    YPface=pointer.YPface,
    XMface=pointer.XMface,
    XPface=pointer.XPface;
    if(ZMface===-1)//-z
      this.addZPFace(pointer.ZM);
    else
      this.removeFace(ZMface);
    if(ZPface===-1)//+z
      this.addZMFace(pointer.ZP);
    else
      this.removeFace(ZPface);
    if(YMface===-1)//-y
      this.addYPFace(pointer.YM);
    else
      this.removeFace(YMface);
    if(YPface===-1)//+y
      this.addYMFace(pointer.YP);
    else
      this.removeFace(YPface);
    if(XMface===-1)//-x
      this.addXPFace(pointer.XM);
    else
      this.removeFace(XMface);
    if(XPface===-1)//+x
      this.addXMFace(pointer.XP);
    else
      this.removeFace(XPface);
  }
}