var c=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames;var b=Object.prototype.hasOwnProperty;var S=(n,o)=>{for(var r in o)c(n,r,{get:o[r],enumerable:!0})},E=(n,o,r,t)=>{if(o&&typeof o=="object"||typeof o=="function")for(let e of F(o))!b.call(n,e)&&e!==r&&c(n,e,{get:()=>o[e],enumerable:!(t=x(o,e))||t.enumerable});return n};var I=n=>E(c({},"__esModule",{value:!0}),n);var U={};S(U,{CharacterClassRanges:()=>f,IsNotUriSafe:()=>a,IsSimpleDigit:()=>m,IsUnicodeNonPrintableTest:()=>h,alphabet:()=>l,decodeToString:()=>B,encode:()=>A,isLittleEndian:()=>k,makeAlphabet:()=>d});module.exports=I(U);var h=/[\u0000-\u0008\u1c80-\u1c86\u000B-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF\u{E0100}-\u{E01EF}]/u,a=/[&$\+,:;~"`'=\?@#\s<>/\[\]\{\}|\\\^%]/u,m=/[0-9]/,f=["a-z","\u03B1-\u03C9","\u0430-\u044F","\u4E00-\u9FAF"],C=new RegExp(`^[${f.join("")}]*$`,"iu"),k=new Uint8Array(new Uint32Array([287454020]).buffer)[0]===68,p=2**16;function*w(n=p,o=!0,r=!0){for(let t=0;t<n;t++){let e=String.fromCodePoint(t);o&&C.test(e)&&!h.test(e)&&r&&!a.test(e)&&t<n&&(yield e)}}var d=(n=p,o=!0,r=!0)=>[...w(n,o,r)].join(""),l=d(),u=6,g=Math.ceil(Math.log(256**u)/Math.log(l.length)),A=n=>{let o="";for(let r=0;r<n.length;r+=u){let t=0;for(let e=r;e<r+u&&e<n.length;e++)t=t*256+n.charCodeAt(e);for(;t;){let e=t%l.length;t=(t-e)/l.length,o+=l[e]}}return o},B=n=>{let o="";for(let r=0;r<n.length;r+=g){let t=0,e=n.slice(r,r+g);for(let i=e.length-1;i>=0;i--)t=t*l.length+l.indexOf(e[i]);let s="";for(;t;){let i=t%256;t=(t-i)/256,s=String.fromCharCode(i)+s}o+=s}return o};