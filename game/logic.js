
  //x,y,z,facecount, 4 bits for the normal vector, 12 for position,
  //1: 0 0 -1  n=-1*val
  //2: 0 0 1   v=val/2
  //4: 0 -1 0  n=-1*val/2
  //8: 0 1 0   n=val/4
  //16:-1 0 0  n=-1*val/4
  //32:1 0 0   n=val/8
  //works 0x1:0001 -> 0 0 -1 -> 1     sign =(-1+2*s) n1 = bit1*sign n2=bit2*sign n3=bit3*sign
  //works 0x9:1001 -> 0 0 1 -> 2
  //works 0x2:0010 -> 0 -1 0 -> 4
  //works 0xa:1010 -> 0 1 0 -> 8
  //0x4:0100 -> -1 0 0 -> 16
  //0xc:1100 -> 1 0 0 -> 32
  logic=0x1d10;
  /*
  0x1d10; //110100010000 ZM
  0x935f; //001101011111 ZP
  0x222c; //001000101100 YM
  0xacbb; //110010111011 YP
  0x4419; //010000011001 XM
  0xcb3e; //101100101110 XP
  var a=((logic&0x8000)>>15);
  var b=((logic&0x4000)>>14);
  var c=((logic&0x2000)>>13);
  var d=((logic&0x1000)>>12);*/
  var sign=(-1+2*((logic&0x8000)>>15));
  var n1=((logic&0x4000)>>14)*sign;
  var n2=((logic&0x2000)>>13)*sign;
  var n3=((logic&0x1000)>>12)*sign;
  //1st bit+1*(2nd bit*16+3rdbit*4+4thbit)
  var logicAmt=(((logic&0x8000)>>15)+1)*((((logic&0x4000)>>14)<<4)+(((logic&0x2000)>>13)<<2)+((logic&0x1000)>>12));
  //console.log((c<<1+d));
  //console.log(' a:'+a+' b:'+b+' c:'+c+' d:'+d);
  console.log(' sign:'+sign+' n1:'+n1+' n2:'+n2+' n3:'+n3+' logic:'+logicAmt);
  x=1;y=1;z=1;
  xm=x-0.5;
  ym=y-0.5;
  zm=z-0.5;
  console.log((logic&0x800)>>11);
  console.log((logic&0x400)>>10);
  console.log((logic&0x200)>>9);
  console.log((logic&0x100)>>8);
  console.log((logic&0x080)>>7);
  console.log((logic&0x040)>>6);
  console.log((logic&0x020)>>5);
  console.log((logic&0x010)>>4);
  //110100010000
  //1 means add 0.5