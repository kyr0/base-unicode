var h=/[\u0000-\u0008\u1c80-\u1c86\u000B-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF\u{E0100}-\u{E01EF}]/u,a=/[&$\+,:;~"`'=\?@#\s<>/\[\]\{\}|\\\^%]/u,F=/[0-9]/,f=["a-z","\u03B1-\u03C9","\u0430-\u044F","\u4E00-\u9FAF"],p=new RegExp(`^[${f.join("")}]*$`,"iu"),b=new Uint8Array(new Uint32Array([287454020]).buffer)[0]===68,g=2**16;function*d(o=g,r=!0,n=!0){for(let t=0;t<o;t++){let e=String.fromCodePoint(t);r&&p.test(e)&&!h.test(e)&&n&&!a.test(e)&&t<o&&(yield e)}}var x=(o=g,r=!0,n=!0)=>[...d(o,r,n)].join(""),i=x(),c=6,u=Math.ceil(Math.log(256**c)/Math.log(i.length)),S=o=>{let r="";for(let n=0;n<o.length;n+=c){let t=0;for(let e=n;e<n+c&&e<o.length;e++)t=t*256+o.charCodeAt(e);for(;t;){let e=t%i.length;t=(t-e)/i.length,r+=i[e]}}return r},E=o=>{let r="";for(let n=0;n<o.length;n+=u){let t=0,e=o.slice(n,n+u);for(let l=e.length-1;l>=0;l--)t=t*i.length+i.indexOf(e[l]);let s="";for(;t;){let l=t%256;t=(t-l)/256,s=String.fromCharCode(l)+s}r+=s}return r};export{f as CharacterClassRanges,a as IsNotUriSafe,F as IsSimpleDigit,h as IsUnicodeNonPrintableTest,i as alphabet,E as decodeToString,S as encode,b as isLittleEndian,x as makeAlphabet};