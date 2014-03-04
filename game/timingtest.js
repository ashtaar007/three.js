var lolol=new Float32Array(100*100*100);
  var jsjs=new Array(100);
  for(var i=0;i<100;i++){
    jsjs[i]=new Array(100);
    for(var j=0;j<100;j++){
      jsjs[i][j]=new Float32Array(100);
    }
  }
  
  var time = Date.now();
  for(var rep=0;rep<200;rep++){
    for(var i=0;i<100;i++){
      for(var j=0;j<100;j++){
        for(var k=0;k<100;k++){
          jsjs[i][j][k]=3.0;
        }
      }
    }
  }
  var res=(Date.now()-time)/rep;
  console.log(res);
  var time = Date.now();
  for(var rep=0;rep<200;rep++){
    for(var i=0;i<100;i++){
      for(var j=0;j<100;j++){
        for(var k=0;k<100;k++){
          lolol[i*100*100+j*100+k]=3.0;
        }
      }
    }
  }
  var res=(Date.now()-time)/rep;
  console.log(res);
  var last=100*100*100;
  var time = Date.now();
  for(var rep=0;rep<200;rep++){
    for(var i=0;i<last;i++){
      lolol[i]=3.0;
    }
  }
  var res=(Date.now()-time)/rep;
  console.log(res);
  var a=0.0;
  var time = Date.now();
  for(var rep=0;rep<200;rep++){
    for(var i=0;i<100;i++){
      for(var j=0;j<100;j++){
        for(var k=0;k<100;k++){
          a=jsjs[i][j][k];
        }
      }
    }
  }
  var res=(Date.now()-time)/rep;
  console.log(res);
  var time = Date.now();
  for(var rep=0;rep<200;rep++){
    for(var i=0;i<100;i++){
      for(var j=0;j<100;j++){
        for(var k=0;k<100;k++){
          a=lolol[i*100*100+j*100+k];
        }
      }
    }
  }
  var res=(Date.now()-time)/rep;
  console.log(res);
  var time = Date.now();
  for(var rep=0;rep<200;rep++){
    for(var i=0;i<last;i++){
      a=lolol[i];
    }
  }
  var res=(Date.now()-time)/rep;
  console.log(res);
  
  var px,py,pz,pa,ps,pd,pf,v,
  elapsedSep=0,
  elapsedObj=0,
  size=150000;
  x=new Uint8Array(size);
  y=new Uint8Array(size);
  z=new Uint8Array(size);
  a=new Uint8Array(size);
  s=new Uint8Array(size);
  d=new Uint8Array(size);
  f=new Uint8Array(size);
  vec=new Array();
  for(var i=0;i<size;i++){
      vec.push({
      x:0,
      y:0,
      z:0,
      a:0,
      s:0,
      d:0,
      f:0
      });
  }
  
  reps=1000000000/size;
  for(var j=0;j<reps;j++){
    var time=Date.now();
    for(var i=0;i<size;i++){
      px=x[i];
      py=y[i];
      pz=z[i];
      pa=a[i];
      ps=s[i];
      pd=d[i];
      pf=f[i];
    }
    elapsedSep+=Date.now()-time;
    
    var time=Date.now();
    for(var i=0;i<size;i++){
      v=vec[i];
      px=v.x;
      py=v.y;
      pz=v.z;
      pa=v.a;
      ps=v.s;
      pd=v.d;
      pf=v.f;
    }
    elapsedObj+=Date.now()-time;
    if (j%(reps/10)==0)
      console.log(j);
  }
  console.log('Seperate typed arrays: '+elapsedSep);
  console.log('Objects: '+elapsedObj);
  
  