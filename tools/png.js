const fs=require('fs'), zlib=require('zlib');
function decode(p){
  const b=fs.readFileSync(p); let o=8,w=0,h=0,bd=0,ct=0,idat=[],plte=null,trns=null;
  while(o<b.length){const len=b.readUInt32BE(o),t=b.toString('ascii',o+4,o+8),d=b.slice(o+8,o+8+len);
    if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);bd=d[8];ct=d[9];}
    else if(t==='IDAT')idat.push(d); else if(t==='PLTE')plte=d; else if(t==='tRNS')trns=d;
    else if(t==='IEND')break; o+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));
  const ch={0:1,2:3,3:1,4:2,6:4}[ct], bpp=Math.max(1,ch*bd/8), stride=Math.ceil(w*ch*bd/8);
  const out=Buffer.alloc(h*stride); let p2=0;
  for(let y=0;y<h;y++){const f=raw[p2++],line=raw.slice(p2,p2+stride);p2+=stride;
    const cur=out.slice(y*stride,(y+1)*stride),prev=y>0?out.slice((y-1)*stride,y*stride):Buffer.alloc(stride);
    for(let i=0;i<stride;i++){const a=i>=bpp?cur[i-bpp]:0,bb=prev[i],c=i>=bpp?prev[i-bpp]:0,x=line[i];let v;
      if(f===0)v=x;else if(f===1)v=x+a;else if(f===2)v=x+bb;else if(f===3)v=x+((a+bb)>>1);
      else{const pa=Math.abs(bb-c),pb=Math.abs(a-c),pc=Math.abs(a+bb-2*c);v=x+(pa<=pb&&pa<=pc?a:pb<=pc?bb:c);}
      cur[i]=v&255;}}
  const px=(x,y)=>{if(ct===6){const i=y*stride+x*4;return[out[i],out[i+1],out[i+2],out[i+3]];}
    if(ct===2){const i=y*stride+x*3;return[out[i],out[i+1],out[i+2],255];}
    if(ct===3){const i=out[y*stride+x];return[plte[i*3],plte[i*3+1],plte[i*3+2],trns&&trns[i]!==undefined?trns[i]:255];}
    if(ct===4){const i=y*stride+x*2;return[out[i],out[i],out[i],out[i+1]];}
    const i=y*stride+x;return[out[i],out[i],out[i],255];};
  return {w,h,px};
}
const T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const crc=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=T[(c^b[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
function chunk(type,data){const l=Buffer.alloc(4);l.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type,'ascii'),data]);
  const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);}
function encode(w,h,getPx,out){
  const stride=w*4+1, raw=Buffer.alloc(h*stride);
  for(let y=0;y<h;y++){raw[y*stride]=0;
    for(let x=0;x<w;x++){const p=getPx(x,y),o=y*stride+1+x*4;raw[o]=p[0];raw[o+1]=p[1];raw[o+2]=p[2];raw[o+3]=p[3];}}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
  fs.writeFileSync(out,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]));
}
// escalado por promedio de area (mejor que vecino para ver legibilidad real)
function resize(src,W,H,out){
  const sx=src.w/W, sy=src.h/H;
  encode(W,H,(x,y)=>{
    let r=0,g=0,b=0,a=0,n=0;
    for(let j=Math.floor(y*sy);j<Math.min(src.h,Math.ceil((y+1)*sy));j++)
      for(let i=Math.floor(x*sx);i<Math.min(src.w,Math.ceil((x+1)*sx));i++){
        const p=src.px(i,j);r+=p[0];g+=p[1];b+=p[2];a+=p[3];n++;}
    return n?[r/n|0,g/n|0,b/n|0,a/n|0]:[0,0,0,0];
  },out);
}
module.exports={decode,encode,resize};
