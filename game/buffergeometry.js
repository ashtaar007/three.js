function useBufferGeometry(scene){
  var triangles = 12;
  var vertices = 8;
  var s = 1/Math.sqrt(3);
  var setVertex = function(vin,px,py,pz){
    var i = vin*3;
    geometr.attributes.position.array[i]=5*px;
    geometr.attributes.position.array[i+1]=5*py;
    geometr.attributes.position.array[i+2]=5*pz;
    geometr.attributes.normal.array[i]=(px-0.5)*2*s;
    geometr.attributes.normal.array[i+1]=(py-0.5)*2*s;
    geometr.attributes.normal.array[i+2]=(pz+0.5)*2*s;
    geometr.attributes.color.array[i]=.5;
    geometr.attributes.color.array[i+1]=.5;
    geometr.attributes.color.array[i+2]=0;
  }
  var setFace = function(fin,i1,i2,i3){
    var i = fin*3;
    geometr.attributes.index.array[i]=i1;
    geometr.attributes.index.array[i+1]=i2;
    geometr.attributes.index.array[i+2]=i3;
  }
	var geometr = new THREE.BufferGeometry();
	geometr.addAttribute( 'index', Uint16Array, triangles * 3, 1 );
	geometr.addAttribute( 'position', Float32Array, vertices, 3 );
	geometr.addAttribute( 'normal', Float32Array, vertices, 3 );
	geometr.addAttribute( 'color', Float32Array, vertices, 3 );
  
  setVertex(0,0,0,0);
  setVertex(1,1,0,0);
  setVertex(2,0,1,0);
  setVertex(3,1,1,0);
  setVertex(4,0,0,-1);
  setVertex(5,1,0,-1);
  setVertex(6,0,1,-1);
  setVertex(7,1,1,-1);
  setFace(0,0,1,2);
  setFace(1,3,2,1);
  setFace(2,2,3,6);
  setFace(3,7,6,3);
  setFace(4,1,5,3);
  setFace(5,7,3,5);
  
  setFace(6,0,4,1);
  setFace(7,5,1,4);
  setFace(8,2,6,0);
  setFace(9,4,0,6);
  setFace(10,4,6,5);
  setFace(11,7,5,6);
  
  /*
  Draw call for each chunk is sending **count** indices starting from **start** offset 
  (from the beginning of index buffer) and these indices are interpreted as being themselves 
  offset by **index** number of vertices in corresponding attribute buffers 
  (thus you can address vertices with indices larger than 65,535)
  */
  geometr.offsets[0]={
    start: 0,
    index: 0,
    count: 3*triangles
  }
  var ma = new THREE.MeshPhongMaterial( {
		color: 0xaaaaaa, ambient: 0xaaaaaa, specular: 0xffffff, shininess: 250, vertexColors: THREE.VertexColors
	} );
  mh = new THREE.Mesh( geometr, ma );
  mh.position.set(-1,-1,-1);
	scene.add( mh );
  //console.log(geometr);
  //console.log(mh);
}