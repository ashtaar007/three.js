function display(a, name){//Assumes only called on a vector or a matrix
  var c=1000000;
  var str= "";
  if(a.hasOwnProperty('elements')){//Matrix
    a=a.elements;
    if(a.length==9){//3x3 Matrix
      if(name)
        console.log(name+':');
      console.log(Math.round(a[0]*c)/c+"  "+Math.round(a[3]*c)/c+"  "+Math.round(a[6]*c)/c);
      console.log(Math.round(a[1]*c)/c+"  "+Math.round(a[4]*c)/c+"  "+Math.round(a[7]*c)/c);
      console.log(Math.round(a[2]*c)/c+"  "+Math.round(a[5]*c)/c+"  "+Math.round(a[8]*c)/c);
    }
  }
  else{//Vector
    console.log((name?(name+": "):"")+Math.round(a.x*c)/c+"  "+Math.round(a.y*c)/c+"  "+Math.round(a.z*c)/c);
  }
}
THREE.Matrix3.prototype.getMatrix3Inverse=function(a){
  var a=a.elements,
  a00 = a[0], a01 = a[1], a02 = a[2],
  a10 = a[3], a11 = a[4], a12 = a[5],
  a20 = a[6], a21 = a[7], a22 = a[8],

  b01 = a22 * a11 - a12 * a21,
  b11 = -a22 * a10 + a12 * a20,
  b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
  det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        console.log('matrix not invertible!!');
        return null;
    }
    det = 1.0 / det;

    this.elements[0] = b01 * det;
    this.elements[1] = (-a22 * a01 + a02 * a21) * det;
    this.elements[2] = (a12 * a01 - a02 * a11) * det;
    this.elements[3] = b11 * det;
    this.elements[4] = (a22 * a00 - a02 * a20) * det;
    this.elements[5] = (-a12 * a00 + a02 * a10) * det;
    this.elements[6] = b21 * det;
    this.elements[7] = (-a21 * a00 + a01 * a20) * det;
    this.elements[8] = (a11 * a00 - a01 * a10) * det;
    return this;
}
THREE.Vector3.prototype.applyMatrix4Partial=function(m){
    var x = this.x, y = this.y, z = this.z,
		e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8]  * z;
		this.y = e[1] * x + e[5] * y + e[9]  * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;

		return this;
}