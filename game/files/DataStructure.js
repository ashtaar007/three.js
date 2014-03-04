DataStructure = function(xmax,ymax,zmax){
  var nums = [xmax,ymax,zmax];
  nums.sort();
  this.xstep=ymax*zmax;
  this.ystep=zmax;
  //this.zstep=1;
  var size = xmax*ymax*zmax;
  this.type=new Uint8Array(size);
  //this.hp=new Float32Array(size);
  //this.visible=new Uint8Array(size);
  this.cube=new Uint8Array(size);
  this.faceIndex=new Uint32Array(size);
  this.numFaces=new Uint8Array(size);
  this.faceReplacement=new Uint32Array(1000);
  //this.
  this.x =new Uint8Array(size);
  this.y =new Uint8Array(size);
  this.z =new Uint8Array(size);
  this.geometry=new THREE.BufferGeometry();
  //4 vert per face
  //6 index per face
  //up to 6 face per cube
  
  vamt=size*8;
  iamt=size*12;
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
  this.faceCount=0;
}
DataStructure.prototype = {
  constructor: DataStructure,
  getIndex: function(x,y,z){
    return (x)*this.xstep + (y)*this.ystep + (z);
  },
  getPosition: function(index){
    obj={
      x:this.getX(index),
      y:this.getY(index),
      z:this.getZ(index)
    }
    return obj;
  },
  getX: function(index){
    return parseInt(index/xstep);
  },
  getY: function(index){
    return parseInt(index%xstep/ystep);
  },
  getZ: function(index){
    return index%ystep;
  },
  getColor: function(type){
    switch(type){
      case 0:
        color={
        r:0.8,b:0.2,g:0.2}
        break;
      case 1:
        color={
        r:0.1,b:0.9,g:0.5}
        break;
      case 2:
        color={
        r:0.1,b:0.3,g:0.7}
        break;
      case 3:
        color={
        r:0.7,b:0.1,g:0.7}
        break;
      default:
        color={
        r:Math.random(),b:Math.random(),g:Math.random()}
        break;   
    }
    return color;
  },
  getType: function(x,y,z){
    return type[this.getIndex(x,y,z)];
  },
  getCubeListIndex: function(x,y,z){
    return cube[this.getIndex(x,y,z)]-1;
  },
  addCube: function(cube, i){
      var index=this.getIndex(cube.x,cube.y,cube.z);
      this.type[index]=cube.type;
      this.cube[index]=1;
      this.x[i]=cube.x;
      this.y[i]=cube.y;
      this.z[i]=cube.z;
      this.numCubes++;
  },
  setFromCubeArray: function(cubes){
    for(var i=0;i<cubes.length;i++){
      this.addCube(cubes[i], i);
    }
  },
  printIndexList: function(){
    x=this.x; y=this.y; z=this.z;
    for(var i=0;i<this.numCubes;i++){
      console.log("x:"+x[i]+" y:"+y[i]+" z:"+z[i]+ " index:"+this.getIndex(x[i],y[i],z[i]));
    }
  },
  /**
  *@param index:cube's index
  *@param side: -x,x,-y,y,-z,z
  *@param v,i = vertices, indices offset
  *@param cr,cg,cb = color of face (r,g,b)
          
  **/
  addFace:function(index,side,cr,cg,cb){
    this.replaceFace(index,side,this.faceCount*4,this.faceCount*6,cr,cg,cb);
    this.faceCount++;
    geometry.offsets[0].count+=6;
    return 1;
  },
  replaceFace:function(index,side,v, i,cr,cg,cb){
    vb=v*3;ib=i;
    xmid=this.getX(index); ymid=this.getY(index); zmid=this.getZ(index);
    positions=this.geometry.attributes.position.array; 
    indices=this.geometry.attributes.index.array; 
    colors=this.geometry.attributes.color.array;
    normals=this.geometry.attributes.normal.array;
    switch(side){
    case '+y'://top side
      //v0=close left corner
      positions[vb]=xmid-0.5;colors[vb]=cr;normals[vb]=0;
      positions[vb+1]=ymid+0.5;colors[vb+1]=cg;normals[vb+1]=1;
      positions[vb+2]=zmid+0.5;colors[vb+2]=cb;normals[vb+2]=0;
      //v1=far left corner
      positions[vb+3]=xmid-0.5;colors[vb+3]=cr;normals[vb+3]=0;
      positions[vb+4]=ymid+0.5;colors[vb+4]=cg;normals[vb+4]=1;
      positions[vb+5]=zmid-0.5;colors[vb+5]=cb;normals[vb+5]=0;
      //v2=close right corner
      positions[vb+6]=xmid+0.5;colors[vb+6]=cr;normals[vb+6]=0;
      positions[vb+7]=ymid+0.5;colors[vb+7]=cg;normals[vb+7]=1;
      positions[vb+8]=zmid+0.5;colors[vb+8]=cb;normals[vb+8]=0;
      //v3=far right corner
      positions[vb+9]=xmid+0.5;colors[vb+9]=cr;normals[vb+9]=0;
      positions[vb+10]=ymid+0.5;colors[vb+10]=cg;normals[vb+10]=1;
      positions[vb+11]=zmid-0.5;colors[vb+11]=cb;normals[vb+11]=0;
      //looking from above, CCW indices will make the face have the correct frontside
      indices[ib]=v+0;
      indices[ib+1]=v+2;
      indices[ib+2]=v+1;
      indices[ib+3]=v+3;
      indices[ib+4]=v+1;
      indices[ib+5]=v+2;
      break;
    case '-y'://bottom side
      //v0=close left corner
      positions[vb]=xmid-0.5;colors[vb]=cr;normals[vb]=0;
      positions[vb+1]=ymid-0.5;colors[vb+1]=cg;normals[vb+1]=-1;
      positions[vb+2]=zmid+0.5;colors[vb+2]=cb;normals[vb+2]=0;
      //v1=far left corner
      positions[vb+3]=xmid-0.5;colors[vb+3]=cr;normals[vb+3]=0;
      positions[vb+4]=ymid-0.5;colors[vb+4]=cg;normals[vb+4]=-1;
      positions[vb+5]=zmid-0.5;colors[vb+5]=cb;normals[vb+5]=0;
      //v2=close right corner
      positions[vb+6]=xmid+0.5;colors[vb+6]=cr;normals[vb+6]=0;
      positions[vb+7]=ymid-0.5;colors[vb+7]=cg;normals[vb+7]=-1;
      positions[vb+8]=zmid+0.5;colors[vb+8]=cb;normals[vb+8]=0;
      //v3=far right corner
      positions[vb+9]=xmid+0.5;colors[vb+9]=cr;normals[vb+9]=0;
      positions[vb+10]=ymid-0.5;colors[vb+10]=cg;normals[vb+10]=-1;
      positions[vb+11]=zmid-0.5;colors[vb+11]=cb;normals[vb+11]=0;
      //looking from above, CCW indices will make the face have the correct frontside
      indices[ib]=v+0;
      indices[ib+1]=v+1;
      indices[ib+2]=v+2;
      indices[ib+3]=v+3;
      indices[ib+4]=v+2;
      indices[ib+5]=v+1;
      break;
    case '+x'://right side
      //v0=near bottom corner
      positions[vb]=xmid+0.5;colors[vb]=cr;normals[vb]=1;
      positions[vb+1]=ymid-0.5;colors[vb+1]=cg;normals[vb+1]=0;
      positions[vb+2]=zmid+0.5;colors[vb+2]=cb;normals[vb+2]=0;
      //v1=far bottom corner
      positions[vb+3]=xmid+0.5;colors[vb+3]=cr;normals[vb+3]=1;
      positions[vb+4]=ymid-0.5;colors[vb+4]=cg;normals[vb+4]=0;
      positions[vb+5]=zmid-0.5;colors[vb+5]=cb;normals[vb+5]=0;
      //v2=near top corner
      positions[vb+6]=xmid+0.5;colors[vb+6]=cr;normals[vb+6]=1;
      positions[vb+7]=ymid+0.5;colors[vb+7]=cg;normals[vb+7]=0;
      positions[vb+8]=zmid+0.5;colors[vb+8]=cb;normals[vb+8]=0;
      //v3=far top corner
      positions[vb+9]=xmid+0.5;colors[vb+9]=cr;normals[vb+9]=1;
      positions[vb+10]=ymid+0.5;colors[vb+10]=cg;normals[vb+10]=0;
      positions[vb+11]=zmid-0.5;colors[vb+11]=cb;normals[vb+11]=0;
      //looking from above, CCW indices will make the face have the correct frontside
      indices[ib]=v+0;
      indices[ib+1]=v+1;
      indices[ib+2]=v+2;
      indices[ib+3]=v+3;
      indices[ib+4]=v+2;
      indices[ib+5]=v+1;
      break;
    case '-x'://left side
      //v0=near bottom corner
      positions[vb]=xmid-0.5;colors[vb]=cr;normals[vb]=-1;
      positions[vb+1]=ymid-0.5;colors[vb+1]=cg;normals[vb+1]=0;
      positions[vb+2]=zmid+0.5;colors[vb+2]=cb;normals[vb+2]=0;
      //v1=far bottom corner
      positions[vb+3]=xmid-0.5;colors[vb+3]=cr;normals[vb+3]=-1;
      positions[vb+4]=ymid-0.5;colors[vb+4]=cg;normals[vb+4]=0;
      positions[vb+5]=zmid-0.5;colors[vb+5]=cb;normals[vb+5]=0;
      //v2=near top corner
      positions[vb+6]=xmid-0.5;colors[vb+6]=cr;normals[vb+6]=-1;
      positions[vb+7]=ymid+0.5;colors[vb+7]=cg;normals[vb+7]=0;
      positions[vb+8]=zmid+0.5;colors[vb+8]=cb;normals[vb+8]=0;
      //v3=far top corner
      positions[vb+9]=xmid-0.5;colors[vb+9]=cr;normals[vb+9]=-1;
      positions[vb+10]=ymid+0.5;colors[vb+10]=cg;normals[vb+10]=0;
      positions[vb+11]=zmid-0.5;colors[vb+11]=cb;normals[vb+11]=0;
      //looking from above, CCW indices will make the face have the correct frontside
      indices[ib]=v+0;
      indices[ib+1]=v+2;
      indices[ib+2]=v+1;
      indices[ib+3]=v+3;
      indices[ib+4]=v+1;
      indices[ib+5]=v+2;
      break;
    case '+z'://forward side
      //v0=bottom left corner
      positions[vb]=xmid-0.5;colors[vb]=cr;normals[vb]=0;
      positions[vb+1]=ymid-0.5;colors[vb+1]=cg;normals[vb+1]=0;
      positions[vb+2]=zmid+0.5;colors[vb+2]=cb;normals[vb+2]=1;
      //v1=bottom right corner
      positions[vb+3]=xmid+0.5;colors[vb+3]=cr;normals[vb+3]=0;
      positions[vb+4]=ymid-0.5;colors[vb+4]=cg;normals[vb+4]=0;
      positions[vb+5]=zmid+0.5;colors[vb+5]=cb;normals[vb+5]=1;
      //v2=top left corner
      positions[vb+6]=xmid-0.5;colors[vb+6]=cr;normals[vb+6]=0;
      positions[vb+7]=ymid+0.5;colors[vb+7]=cg;normals[vb+7]=0;
      positions[vb+8]=zmid+0.5;colors[vb+8]=cb;normals[vb+8]=1;
      //v3=top right corner
      positions[vb+9]=xmid+0.5;colors[vb+9]=cr;normals[vb+9]=0;
      positions[vb+10]=ymid+0.5;colors[vb+10]=cg;normals[vb+10]=0;
      positions[vb+11]=zmid+0.5;colors[vb+11]=cb;normals[vb+11]=1;
      //looking from above, CCW indices will make the face have the correct frontside
      indices[ib]=v+0;
      indices[ib+1]=v+1;
      indices[ib+2]=v+2;
      indices[ib+3]=v+3;
      indices[ib+4]=v+2;
      indices[ib+5]=v+1;
      break;
    case '-z'://back side
      //v0=bottom left corner
      positions[vb]=xmid-0.5;colors[vb]=cr;normals[vb]=0;
      positions[vb+1]=ymid-0.5;colors[vb+1]=cg;normals[vb+1]=0;
      positions[vb+2]=zmid-0.5;colors[vb+2]=cb;normals[vb+2]=-1;
      //v1=bottom right corner
      positions[vb+3]=xmid+0.5;colors[vb+3]=cr;normals[vb+3]=0;
      positions[vb+4]=ymid-0.5;colors[vb+4]=cg;normals[vb+4]=0;
      positions[vb+5]=zmid-0.5;colors[vb+5]=cb;normals[vb+5]=-1;
      //v2=top left corner
      positions[vb+6]=xmid-0.5;colors[vb+6]=cr;normals[vb+6]=0;
      positions[vb+7]=ymid+0.5;colors[vb+7]=cg;normals[vb+7]=0;
      positions[vb+8]=zmid-0.5;colors[vb+8]=cb;normals[vb+8]=-1;
      //v3=top right corner
      positions[vb+9]=xmid+0.5;colors[vb+9]=cr;normals[vb+9]=0;
      positions[vb+10]=ymid+0.5;colors[vb+10]=cg;normals[vb+10]=0;
      positions[vb+11]=zmid-0.5;colors[vb+11]=cb;normals[vb+11]=-1;
      //looking from above, CCW indices will make the face have the correct frontside
      indices[ib]=v+0;
      indices[ib+1]=v+2;
      indices[ib+2]=v+1;
      indices[ib+3]=v+3;
      indices[ib+4]=v+1;
      indices[ib+5]=v+2;
      break;
    
    }
  },
  addFaces: function(){
    for(var i=0;i<this.numCubes;i++){
      x=this.x[i]; y=this.y[i]; z=this.z[i];
      cube=this.cube;
      xstep=this.xstep; ystep=this.ystep;
      index=this.getIndex(x, y, z);
      color=this.getColor(this.type[index]);
      nz=index-1;
      pz=index+1;
      nx=index-xstep;
      px=index+xstep;
      ny=index-ystep;
      py=index+ystep;
      
      this.faceIndex[index]=this.faceCount;
      var count=0;
      count+=(!cube[nz])?this.addFace(index,'-z',color.r,color.g,color.b):0;
      count+=(!cube[pz])?this.addFace(index,'+z',color.r,color.g,color.b):0;
      count+=(!cube[ny])?this.addFace(index,'-y',color.r,color.g,color.b):0;
      count+=(!cube[py])?this.addFace(index,'+y',color.r,color.g,color.b):0;
      count+=(!cube[nx])?this.addFace(index,'-x',color.r,color.g,color.b):0;
      count+=(!cube[px])?this.addFace(index,'+x',color.r,color.g,color.b):0;
      this.numFaces[index]=count;
    }
  },
  removeCube: function(x,y,z){
      var index=this.getIndex(x,y,z);
      this.cube[index]=0;
      numFaces=this.numFaces[index];
      faceIndex=this.faceIndex[index];
      indiceStart=faceIndex*6;
      indiceEnd=indiceStart+numFaces*6;
      verticeStart=faceIndex*4;
      verticeEnd=verticeStart+numFaces*4;
      //remove face indices
      indices=this.geometry.attributes.index.array; 
      for(var i=indiceStart;i<indiceEnd;i++){
        indices[i]=0;
      }
  }
}