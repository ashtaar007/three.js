Lambert:

parameters = {
name: <string>
side:{
  THREE.FrontSide = 0;
  THREE.BackSide = 1;
  THREE.DoubleSide = 2;}
color: <hex>, (0x000000 -> 0xFFFFFF) R: 00 -> FF, G: 00 -> FF, B: 00 -> FF
ambient: <hex>, (0x000000 -> 0xFFFFFF) R: 00 -> FF, G: 00 -> FF, B: 00 -> FF
emissive: <hex>, (0x000000 -> 0xFFFFFF) R: 00 -> FF, G: 00 -> FF, B: 00 -> FF
wrapAround: <bool>
wrapRGB = new THREE.Vector3( 1, 1, 1 );
transparent: <boolean>
visible: <boolean>
opacity: <float>, [0:1]
map: new THREE.Texture( <Image> ),
lightMap: new THREE.Texture( <Image> ),
specularMap: new THREE.Texture( <Image> ),
envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] )
combine:{//combining textures
  THREE.MultiplyOperation = 0;
  THREE.MixOperation = 1;
  THREE.AddOperation = 2;}
reflectivity: <float>, [0:1]
refractionRatio: <float>, [0:1]
shading:{
  THREE.NoShading = 0;
  THREE.FlatShading = 1;
  THREE.SmoothShading = 2;}
blending:{
  THREE.NoBlending = 0;
  THREE.NormalBlending = 1;
  THREE.AdditiveBlending = 2;
  THREE.SubtractiveBlending = 3;
  THREE.MultiplyBlending = 4;
  THREE.CustomBlending = 5;}
    blendSrc:{
      THREE.ZeroFactor = 200;
      THREE.OneFactor = 201;
      THREE.SrcColorFactor = 202;
      THREE.OneMinusSrcColorFactor = 203;
      THREE.SrcAlphaFactor = 204;
      THREE.OneMinusSrcAlphaFactor = 205;
      THREE.DstAlphaFactor = 206;
      THREE.OneMinusDstAlphaFactor = 207;
      THREE.DstColorFactor = 208;
      THREE.OneMinusDstColorFactor = 209;
      THREE.SrcAlphaSaturateFactor = 210;}
    blendDst:{200 -> 207}
    blendEquation:{
      THREE.AddEquation = 100;
      THREE.SubtractEquation = 101;
      THREE.ReverseSubtractEquation = 102;
}
depthTest: <bool>,
depthWrite: <bool>,
polygonOffset: <bool>
polygonOffsetFactor: <float>
polygonOffsetUnits: <float>
alphaTest = 0;  
wireframe: <boolean>,
wireframeLinewidth: <float>, [0:1]
wireframeLinecap: {"butt","round","square"}
wireframeLinejoin: {"round","bevel","miter"}
vertexColors:{
  THREE.NoColors = 0;
  THREE.FaceColors = 1;
  THREE.VertexColors = 2;}
skinning: <bool>,
morphTargets: <bool>,
morphNormals: <bool>,
fog: <bool>
}

    
 Phong:

specular: <hex>, (0x000000 -> 0xFFFFFF) R: 00 -> FF, G: 00 -> FF, B: 00 -> FF
metal: <bool>
perPixel: <bool>
shininess: <float>, [0:1]
bumpMap: new THREE.Texture( <Image> ),
bumpScale: <float>, [0:1]
normalMap: new THREE.Texture( <Image> ),
normalScale: <Vector2>
