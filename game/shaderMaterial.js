
//put this part in html file


<script id="vertexShader" type="x-shader/x-vertex">
varying vec3 vColor;
const vec3 lightDir=vec3(-0.37904902,-0.53066863,-0.758098044);
void main() {
  float lambertian = max(dot(lightDir,normal), 0.0);
  vColor = (0.68*lambertian+0.12)*color;
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);
}
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor,1.0);
}
</script>


//put this part in main method

var ma = new THREE.ShaderMaterial({
    vertexColors: THREE.VertexColors,
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  });