Cube = function(x,y,z,type){
  this.x=x;
  this.y=y;
  this.z=z;
  this.type=type;
  this.getColor();

}  
Cube.prototype={
constructor: Cube,
encodeType: function(r,g,b){
  red=Math.floor(0xFF*r);
  green=Math.floor(0xFF*g);
  blue=Math.floor(0xFF*b);
  this.type=0x01000000*this.type+red*0x10000+green*0x100+blue;
},
getColor: function(){
    switch(this.type){
      case 0:
        this.encodeType(0.8,0.2,0.2);
        break;
      case 1:
        this.encodeType(0.1,0.5,0.9);
        break;
      case 2:
        this.encodeType(0.1,0.7,0.3);
        break;
      case 3:
        this.encodeType(0.7,0.7,0.1);
        break;
      default:
        this.encodeType(Math.random(),Math.random(),Math.random());
        break;   
    }
  },
}