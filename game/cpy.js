DataStructure = function(xmax,ymax,zmax){

  var size = xmax*ymax*zmax;
  
  this.x =new Uint8Array(size);
  this.y =new Uint8Array(size);
  this.z =new Uint8Array(size);
  this.type=new Array(xmax);
  this.r=new Array(xmax);
  this.g=new Array(xmax);
  this.b=new Array(xmax);
  this.faceIndex=new Array(xmax);
  this.logic=new Array(xmax);
  for(var i=0;i<xmax;i++){
    this.type[i]=new Array(ymax);
    this.r[i]=new Array(ymax);
    this.g[i]=new Array(ymax);
    this.b[i]=new Array(ymax);
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
  
  var vamt=size*8;
  var iamt=size*12;
  var geometry=this.geometry;
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
  extractColor: function(x,y,z){
    var type=this.type[x][y][z];
    r=(type&0x00FF0000)/0xFF0000;
    g=(type&0x0000FF00)/0xFF00;
    b=(type&0x000000FF)/0xFF;
    console.log(r)
    console.log(g)
    console.log(b)
  },
  addCube: function(cube, i){
      this.x[i]=cube.x;
      this.y[i]=cube.y;
      this.z[i]=cube.z;
      this.type[cube.x][cube.y][cube.z]=cube.type;
      this.numCubes++;
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
          var type=this.type;var typex=type[x];var typexy=type[x][y];
          var a=typex[y-1];var b=typex[y+1];var c=type[x-1];var d=type[x+1];
      
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
      var x=this.x[i];var y=this.y[i];var z=this.z[i];
      var type=this.type;var typex=type[x];var typexy=type[x][y];
      var a=typex[y-1];var b=typex[y+1];var c=type[x-1];var d=type[x+1];
      
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
  draw:function(x,y,z,faceCount,logic){
    this.setPositionsColorsNormals(x-0.5,y-0.5,z-0.5,faceCount*12,this.type[x][y][z],logic);
    this.setIndices(faceCount);
    //1st bit+1*(2nd bit*16+3rdbit*4+4thbit)
    this.logic[x][y][z]+=(((logic&0x8000)>>15)+1)*((((logic&0x4000)>>14)<<4)+(((logic&0x2000)>>13)<<2)+((logic&0x1000)>>12));
    this.faceIndex[x][y][z].push(faceCount);
  },
  setPositionsColorsNormals: function(xm,ym,zm,vb,type,logic){
    var sign=(-1+2*((logic&0x8000)>>15));
    var nx=((logic&0x4000)>>14)*sign;
    var ny=((logic&0x2000)>>13)*sign;
    var nz=((logic&0x1000)>>12)*sign;
    var cr=(type&0x00FF0000)/0xFF0000;
    var cg=(type&0x0000FF00)/0xFF00;
    var cb=(type&0x000000FF)/0xFF;
    var attributes=this.geometry.attributes
    var colors=attributes.color.array;
    var normals=attributes.normal.array;
    var positions=attributes.position.array;
    //var hex=0x0800;
    var a;
    for(var i=0;i<4;i++){
      a=3*i;
      positions[vb+a]= xm+((logic&(0x0800>>a))>>(11-a));
      positions[vb+a+1]= ym+((logic&(0x0800>>(a+1)))>>(10-a));
      positions[vb+a+2]= zm+((logic&(0x0800>>(a+2)))>>(9-a));
      colors[vb+a]=cr;
      colors[vb+a+1]=cg;
      colors[vb+a+2]=cb;
      normals[vb+a]=nx;
      normals[vb+a+1]=ny;
      normals[vb+a+2]=nz;
    }
  },
  setIndices: function(faceCount){
    var indices=this.geometry.attributes.index.array; 
    var ib = faceCount*6;
    var v = faceCount*4;
    indices[ib]=v;
    indices[ib+1]=v+1;
    indices[ib+2]=v+2;
    indices[ib+3]=v+3;
    indices[ib+4]=v+2;
    indices[ib+5]=v+1;
  },
  addZM:function(x,y,z){
    this.draw(x,y,z,this.faceCount,0x1d10);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawZM:function(x,y,z,faceCount){
    this.draw(x,y,z,faceCount,0x1d10);
  },
  addZP:function(x,y,z){
    this.draw(x,y,z,this.faceCount,0x935f);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawZP:function(x,y,z,faceCount){
    this.draw(x,y,z,faceCount,0x935f);
  },
  addYM:function(x,y,z){
    this.draw(x,y,z,this.faceCount,0x222c);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawYM:function(x,y,z,faceCount){
    this.draw(x,y,z,faceCount,0x222c);
  },
  addYP:function(x,y,z){
    this.draw(x,y,z,this.faceCount,0xacbb);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawYP:function(x,y,z,faceCount){
    this.draw(x,y,z,faceCount,0xacbb);
  },
  addXM:function(x,y,z){
    this.draw(x,y,z,this.faceCount,0x4419);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawXM:function(x,y,z,faceCount){
    this.draw(x,y,z,faceCount,0x4419);
  },
  addXP:function(x,y,z){
    this.draw(x,y,z,this.faceCount,0xcb3e);
    this.faceCount++;
    this.geometry.offsets[0].count+=6;
  },
  drawXP:function(x,y,z,faceCount){
    this.draw(x,y,z,faceCount,0xcb3e);
  },
  clearFace: function(faceIndex){
    var indiceStart=faceIndex*6;
    var indiceEnd=indiceStart+6;
    var indices=this.geometry.attributes.index.array;
    for(var i=indiceStart;i<indiceEnd;i++){
      indices[i]=0;
    }
  },
  removeCube: function(x,y,z){
    if(!this.type[x][y][z])return;
    this.type[x][y][z]=0;
    var logic = this.logic[x][y][z];
    var faceIndex=this.faceIndex[x][y][z];
    var a=0; var b=0;
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