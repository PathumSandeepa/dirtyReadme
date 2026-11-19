(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,42751,e=>{"use strict";var t=e.i(65582),r=e.i(54245);let a=(...e)=>{let t=new Set;for(let r of e)if("string"==typeof r)for(let e of r.split(/\s+/))e&&t.add(e);return[...t].join(" ")},o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"},s=(0,r.createContext)({}),i=(0,r.forwardRef)(({color:e,size:t,width:i,height:n,strokeWidth:l,absoluteStrokeWidth:c,nonScalingStroke:d,className:m="",children:p,iconNode:x=[],icon:h={node:x,aliases:[],size:24},...g},u)=>{let{size:f=24,strokeWidth:b=2,absoluteStrokeWidth:y=!1,nonScalingStroke:k=!1,color:w="currentColor",className:v=""}=(0,r.useContext)(s)??{},j=!!p||(e=>{if(null==e||"object"!=typeof e)return!1;for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&(t.startsWith("aria-")||"role"===t||"title"===t)&&null!=e[t])return!0;return!1})(g),[C,$,N=[]]=function(e,t={}){return function(e,t={}){let r=t.attributeNames??{},s=e=>r[e]??e,i=e.size??e.width??o.width,n=e.size??e.height??o.height,l=e.aliases?.filter(e=>"string"==typeof e&&""!==e.trim()).map(e=>`lucide-${e}`)??[],c=[...e.name?[`lucide-${e.name}`]:[],...l],d=t.className?.split(" ").filter(Boolean)??[],m=!1===t.includeDefaultClasses?a(...d):a("lucide",...c,...d),p=t.absoluteStrokeWidth?Number(t.strokeWidth??o["stroke-width"])*Number(e.size??e.width??o.width)/Number(t.size??t.width??o.width):t.strokeWidth??o["stroke-width"];return["svg",{...Object.entries(o).reduce((e,[t,r])=>(e[s(t)]=r,e),{}),..."color"in t&&t.color&&{[s("stroke")]:t.color},..."size"in t&&null!=t.size&&{[s("width")]:t.size,[s("height")]:t.size},..."width"in t&&null!=t.width&&{[s("width")]:t.width},..."height"in t&&null!=t.height&&{[s("height")]:t.height},[s("stroke-width")]:p,...m&&{[s("class")]:m},[s("viewBox")]:`0 0 ${i} ${n}`,...!1===t.hasA11yProp?{[s("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(e=>{let[r,a,o]=e,i=t.nonScalingStroke?{[s("vector-effect")]:"non-scaling-stroke",...a}:a;return o?[r,i,o]:[r,i]})]}(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}(h,{color:e??w,width:i??t??f,height:n??t??f,strokeWidth:l??b,absoluteStrokeWidth:c??y,nonScalingStroke:d??k,className:a(v,m),hasA11yProp:j,attributes:g});return(0,r.createElement)(C,{ref:u,...$},[...N.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(p)?p:[p]])});function n(e,t=[],a=[]){let o,s="string"==typeof e?function(e,t,r=[]){if(null==t)throw Error("[lucide]: iconNode is required when icon name is used");return{name:e?.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),size:24,node:t,...r.length>0?{aliases:r}:{}}}(e,t,a):e,l=(0,r.forwardRef)(({className:e,...t},a)=>(0,r.createElement)(i,{ref:a,icon:s,className:e,...t}));return s.name&&(l.displayName=(o=(e=>{let t="",r=!1;for(let a of e){if("-"===a||"_"===a||a<=" "){r=t.length>0;continue}0===t.length?t+=a.toLowerCase():t+=r?a.toUpperCase():a,r=!1}return t})(s.name)).charAt(0).toUpperCase()+o.slice(1)),l}let l={name:"activity",size:24,node:[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]};l.node;let c=n(l),d={name:"camera",size:24,node:[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]};d.node;let m=n(d),p={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};p.node;let x=n(p),h={name:"code-xml",size:24,node:[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]],aliases:["code-2"]};h.node;let g=n(h),u={name:"copy",size:24,node:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]};u.node;let f=n(u),b={name:"cpu",size:24,node:[["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M17 20v2",key:"1rnc9c"}],["path",{d:"M17 2v2",key:"11trls"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M2 17h2",key:"7oei6x"}],["path",{d:"M2 7h2",key:"asdhe0"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"M20 17h2",key:"1fpfkl"}],["path",{d:"M20 7h2",key:"1o8tra"}],["path",{d:"M7 20v2",key:"4gnj0m"}],["path",{d:"M7 2v2",key:"1i4yhu"}],["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"8",y:"8",width:"8",height:"8",rx:"1",key:"z9xiuo"}]]};b.node;let y=n(b),k={name:"download",size:24,node:[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]};k.node;let w=n(k),v={name:"pen-line",size:24,node:[["path",{d:"M13 21h8",key:"1jsn5i"}],["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],aliases:["edit-3"]};v.node;let j=n(v),C={name:"eye",size:24,node:[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};C.node;let $=n(C),N={name:"file-text",size:24,node:[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]};N.node;let M=n(N),S={name:"git-commit-horizontal",size:24,node:[["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}],["line",{x1:"3",x2:"9",y1:"12",y2:"12",key:"1dyftd"}],["line",{x1:"15",x2:"21",y1:"12",y2:"12",key:"oup4p8"}]],aliases:["git-commit"]};S.node;let E=n(S),F={name:"image",size:24,node:[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]};F.node;let L=n(F),T={name:"layers",size:24,node:[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],aliases:["layers-3"]};T.node;let A=n(T),R={name:"loader-circle",size:24,node:[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],aliases:["loader-2"]};R.node;let D=n(R),B={name:"palette",size:24,node:[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]]};B.node;let U=n(B),O={name:"refresh-cw",size:24,node:[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]};O.node;let P=n(O),I={name:"rotate-ccw",size:24,node:[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]};I.node;let G=n(I),H={name:"share-2",size:24,node:[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]};H.node;let z=n(H),Y={name:"sliders-vertical",size:24,node:[["path",{d:"M10 8h4",key:"1sr2af"}],["path",{d:"M12 21v-9",key:"17s77i"}],["path",{d:"M12 8V3",key:"13r4qs"}],["path",{d:"M17 16h4",key:"h1uq16"}],["path",{d:"M19 12V3",key:"o1uvq1"}],["path",{d:"M19 21v-5",key:"qua636"}],["path",{d:"M3 14h4",key:"bcjad9"}],["path",{d:"M5 10V3",key:"cb8scm"}],["path",{d:"M5 21v-7",key:"1w1uti"}]],aliases:["sliders"]};Y.node;let X=n(Y),Z={name:"sparkles",size:24,node:[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],aliases:["stars"]};Z.node;let _=n(Z),V={name:"terminal",size:24,node:[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]};V.node;let W=n(V),q={name:"square-user-round",size:24,node:[["path",{d:"M18 21a6 6 0 0 0-12 0",key:"kaz2du"}],["circle",{cx:"12",cy:"11",r:"4",key:"1gt34v"}],["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]],aliases:["user-square-2"]};q.node;let K=n(q),J={name:"users",size:24,node:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]};J.node;let Q=n(J),ee={name:"zap",size:24,node:[["path",{d:"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",key:"1v7up4"}]]};ee.node;let et=n(ee),er={name:"file-code-corner",size:24,node:[["path",{d:"M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35",key:"1wthlu"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"m5 16-3 3 3 3",key:"331omg"}],["path",{d:"m9 22 3-3-3-3",key:"lsp7cz"}]],aliases:["file-code-2"]};er.node;let ea=n(er),eo={name:"git-branch",size:24,node:[["path",{d:"M15 6a9 9 0 0 0-9 9V3",key:"1cii5b"}],["circle",{cx:"18",cy:"6",r:"3",key:"1h7g24"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}]]};eo.node;let es=n(eo),ei={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};ei.node;let en=n(ei),el=[{id:"tulkun",name:"Cyber-Tulkun",subtitle:"Armored Leviathan",designation:"UNIT-01 // CETACEA-MK4",description:"Massive rounded whale-leviathan chassis with sensor optics, segmented dorsal plates, feathered pectoral wings, and trailing fiber-optic cables.",defaultTitle:"APEX CYBER-TULKUN"},{id:"serpent",name:"Cyber-Serpent",subtitle:"Mecha Sky-Dragon",designation:"UNIT-02 // OROCHI-V7",description:"Sleek undulating sky-dragon with optical visor crest, spine-mounted mechanical feathers, and sweeping tail ribbons.",defaultTitle:"SKY-DRAGON SERPENT"},{id:"manta",name:"Cyber-Manta",subtitle:"Aether Ray",designation:"UNIT-03 // MOBULA-X9",description:"Aerodynamic gliding manta frame with wide articulated feathered wings, forward sensor prongs, and dual cyber-tendrils.",defaultTitle:"AETHER CYBER-MANTA"}],ec=[{id:"side",name:"Lateral Side Glide",shortLabel:"Side",description:"Classic lateral profile showcasing modular head armor, articulated pectoral wings, dorsal feather crest, and trailing tail cables."},{id:"dive",name:"3/4 Dynamic Dive",shortLabel:"Dive",description:"Angled pitch-down diving perspective highlighting arched dorsal carapace, sweeping foreground wing, and kinetic flow."},{id:"top",name:"Dorsal Top-Down",shortLabel:"Top",description:"Full symmetric wingspan view revealing twin feathered wings, spinal armor plates, pelvic stabilizer fins, and splayed tail arrays."}],ed=[{stage:1,rank:"PROTOTYPE",shortCode:"1.PRTO",minCommits:0,rangeLabel:"0 - 149",sampleCommits:64,unlocks:"Compact juvenile frame, short spine plating, blunt optic sensor dome, and 4 starter wing feathers."},{stage:2,rank:"RECON",shortCode:"2.RCON",minCommits:150,rangeLabel:"150 - 499",sampleCommits:320,unlocks:"Lengthened chassis, cranial neural whips sprout behind the brow, active energy conduits, and 5 wing feathers."},{stage:3,rank:"ARMORED",shortCode:"3.ARMR",minCommits:500,rangeLabel:"500 - 1,199",sampleCommits:840,unlocks:"Dorsal feather crest unfolds, secondary ventral stabilizer paddles emerge, and 6 elongated pectoral feathers."},{stage:4,rank:"APEX",shortCode:"4.APEX",minCommits:1200,rangeLabel:"1,200 - 2,499",sampleCommits:1680,unlocks:"Heavy segmented carapace armor, full gyro-optic ear assembly, 8 articulated wing feathers, and full tail cable array."},{stage:5,rank:"ASCENDED",shortCode:"5.ASCD",minCommits:2500,rangeLabel:"2,500+",sampleCommits:2940,unlocks:"Maximum leviathan wingspan, glowing apex energy battle-scars, crown halo crest, and overcharged emitter filaments."}],em=[{id:"mecha-prototype",name:"Mecha Prototype",tagline:"75% Matte White / Safety Orange / Cyber Green",colors:{primary:"#F4F6F8",accent:"#FF6B00",energy:"#00E676",frame:"#1F242D"}},{id:"stealth-carbon",name:"Stealth Carbon / Cyan",tagline:"Gunmetal Slate / Electric Cyan / Mint Core",colors:{primary:"#2C3545",accent:"#00D2FF",energy:"#00FFA3",frame:"#11161F"}},{id:"crimson-mecha",name:"Crimson Mecha",tagline:"Pearl Titanium / Crimson Red / Amber Plasma",colors:{primary:"#ECE7EB",accent:"#FF1E42",energy:"#FFAB00",frame:"#1E1720"}},{id:"solar-gold",name:"Solar Gold",tagline:"Warm Ceramic / Solar Gold / Ion Cyan",colors:{primary:"#F5EFE4",accent:"#FFB300",energy:"#00E5FF",frame:"#231F1A"}}],ep={creature:"tulkun",view:"side",windowMode:"annual",colorMode:"canonical",themeId:"mecha-prototype",colors:{...em[0].colors,background:"transparent"},backgroundMode:"transparent",animationSpeed:1,showHud:!0,customTitle:"",commits:1680,username:"PathumSandeepa",languages:[{name:"TypeScript",color:"#3178C6",share:54},{name:"JavaScript",color:"#F1E05A",share:28},{name:"Python",color:"#3572A5",share:18}]};function ex(e,t){switch(e){case"transparent":return"transparent";case"black":return"#000000";case"github-dark":return"#0D1117";case"custom":return eh(t,"#0D1117")}}function eh(e,t="#F4F6F8"){let r=e.trim();if(/^#[0-9a-fA-F]{6}$/.test(r))return r.toUpperCase();if(/^#[0-9a-fA-F]{3}$/.test(r)){let e=r[1],t=r[2],a=r[3];return`#${e}${e}${t}${t}${a}${a}`.toUpperCase()}return t}function eg(e){let t=eh(e).slice(1);return[parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)]}function eu(e,t,r){var a,o,s;let i,[n,l,c]=eg(e),[d,m,p]=eg(t),x=Math.max(0,Math.min(1,r));return a=n*(1-x)+d*x,o=l*(1-x)+m*x,s=c*(1-x)+p*x,"#"+[(i=e=>Math.max(0,Math.min(255,Math.round(e))))(a),i(o),i(s)].map(e=>e.toString(16).padStart(2,"0")).join("").toUpperCase()}function ef(e){let[t,r,a]=eg(e).map(e=>e/255);return .2126*t+.7152*r+.0722*a}function eb(e,t){let r=t[0]?.color??"#3178C6",a=t[1]?.color??"#FF6B00",o=t[2]?.color??"#00E676",s=eu("#F4F6F8",r,.18),i=eh(a,"#FF6B00"),n=.35>ef(o)?eu(o,"#FFFFFF",.35):eh(o,"#00E676");return{...e,colorMode:"languages",themeId:"custom",languages:t,colors:{...e.colors,primary:s,accent:i,energy:n,frame:eu("#1F242D",r,.2)}}}function ey(e){let t=eh(e.colors.primary,"#F4F6F8"),r=eh(e.colors.accent,"#FF6B00"),a=eh(e.colors.energy,"#00E676"),o=eh(e.colors.frame,"#1F242D"),s=ef(t)>.45,i="#F4F6F8"===t?"#D0D7DE":s?eu(t,"#64748B",.24):eu(t,"#0B0F17",.25),n=s?eu(t,"#FFFFFF",.65):eu(t,"#CBD5E1",.22),l=s?eu(t,"#334155",.38):eu(t,"#05070B",.48),c=s?eu(t,"#1E293B",.52):eu(t,"#030508",.62);return{armorHighlight:n,armorMain:t,armorMid:i,armorShadow:l,armorFar:c,accentMain:r,accentDeep:eu(r,"#000000",.34),energyMain:a,energyBright:eu(a,"#FFFFFF",.45),frameMain:o,frameLight:eu(o,"#94A3B8",.16),frameDark:"#1F242D"===o?"#0D1117":eu(o,"#000000",.52),seamStroke:s?"#1F242D":"#0A0D12",background:"transparent"===e.backgroundMode?"transparent":ex(e.backgroundMode,e.colors.background),isLightArmor:s}}function ek(e){let t=Math.max(0,Math.floor(e||0));for(let e=ed.length-1;e>=0;e--)if(t>=ed[e].minCommits)return ed[e];return ed[0]}function ew(e){return el.find(t=>t.id===e)??el[0]}function ev({open:e,onClose:a,config:o}){let s,i,n,[l,c]=(0,r.useState)("workflow"),[d,m]=(0,r.useState)(null);if(!e)return null;let p=`name: Evolve Cyber Creature

on:
  schedule:
    # Runs daily at 00:00 UTC
    - cron: "0 0 * * *"
  workflow_dispatch:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  evolve:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Update Cyber Creature SVG & README Markers
        env:
          GITHUB_TOKEN: $\{{ secrets.GITHUB_TOKEN }}
          GITHUB_USERNAME: $\{{ github.repository_owner }}
          CREATURE_WINDOW: "${o.windowMode}" # annual | rolling
          CREATURE_VIEW: "${o.view}" # side | dive | top
        run: node scripts/evolve-creature.mjs

      - name: Commit README.md marker updates (if present on main)
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          if [ -f README.md ] && ! git diff --quiet README.md; then
            git add README.md
            git commit -m "chore: sync dynamic README creature telemetry"
            git push
          fi

      - name: Publish creature.svg to orphan output branch
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          mkdir -p /tmp/creature-out
          cp creature.svg /tmp/creature-out/
          [ -f share-card.svg ] && cp share-card.svg /tmp/creature-out/ || true
          if git ls-remote --exit-code --heads origin output >/dev/null 2>&1; then
            git fetch origin output
            git checkout -B output origin/output
          else
            git checkout --orphan output
            git rm -rf . >/dev/null 2>&1 || true
          fi
          cp /tmp/creature-out/* .
          git add creature.svg share-card.svg 2>/dev/null || git add creature.svg
          if ! git diff --cached --quiet; then
            git commit -m "chore: evolve cyber creature SVG"
            git push -u origin output
          else
            echo "No SVG telemetry changes detected."
          fi
`,h=(s=ew(o.creature),i=o.colors.energy,n=o.customTitle.trim(),`import fs from "node:fs";
import path from "node:path";

const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_ACTOR;
const TOKEN = process.env.GITHUB_TOKEN;
const WINDOW_MODE = process.env.CREATURE_WINDOW || ${JSON.stringify(o.windowMode)};
const VIEW_MODE = process.env.CREATURE_VIEW || ${JSON.stringify(o.view)};
const SVG_PATH = path.resolve("creature.svg");
const README_PATH = path.resolve("README.md");

const CREATURE_NAME = ${JSON.stringify(s.name.toUpperCase())};
const CREATURE_DISPLAY = ${JSON.stringify(s.name)};
const CUSTOM_TITLE = ${JSON.stringify(n)};
const ENERGY_COLOR = ${JSON.stringify(i)};

const STAGES = [
  { stage: 1, rank: "PROTOTYPE", min: 0 },
  { stage: 2, rank: "RECON", min: 150 },
  { stage: 3, rank: "ARMORED", min: 500 },
  { stage: 4, rank: "APEX", min: 1200 },
  { stage: 5, rank: "ASCENDED", min: 2500 },
];

function getEvolutionStage(commits) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (commits >= STAGES[i].min) return STAGES[i];
  }
  return STAGES[0];
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchContributions(username, token, windowMode) {
  if (!username || !token) {
    throw new Error("Missing GITHUB_USERNAME or GITHUB_TOKEN");
  }

  const now = new Date();
  const fromDate =
    windowMode === "annual"
      ? new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString()
      : new Date(now.getTime() - 365 * 86400 * 1000).toISOString();

  const query = \`
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  \`;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: \`Bearer $\{token}\`,
      "Content-Type": "application/json",
      "User-Agent": "dynamic-readme-creature",
    },
    body: JSON.stringify({
      query,
      variables: { login: username, from: fromDate, to: now.toISOString() },
    }),
  });

  if (!response.ok) {
    throw new Error(\`GitHub GraphQL error: $\{response.status}\`);
  }

  const payload = await response.json();
  const total =
    payload?.data?.user?.contributionsCollection?.contributionCalendar
      ?.totalContributions;

  if (typeof total !== "number") {
    throw new Error("Unable to read totalContributions from GitHub API");
  }

  return total;
}

function updateReadmeMarkers(username, stage, rank, commits) {
  if (!fs.existsSync(README_PATH)) return;
  const startMarker = "<!-- CYBER-CREATURE:START -->";
  const endMarker = "<!-- CYBER-CREATURE:END -->";
  const raw = fs.readFileSync(README_PATH, "utf8");
  const startIdx = raw.indexOf(startMarker);
  const endIdx = raw.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return;
  }

  const formattedCommits = commits.toLocaleString("en-US");
  const imgUrl = \`https://raw.githubusercontent.com/$\{username}/$\{username}/output/creature.svg\`;
  const replacement = [
    startMarker,
    \`<p align="center">\`,
    \`  <a href="https://github.com/PathumSandeepa/dynamic-readme-creature">\`,
    \`    <img src="$\{imgUrl}" width="760" alt="$\{CREATURE_DISPLAY} - Stage $\{stage} $\{rank}" />\`,
    \`  </a>\`,
    \`</p>\`,
    \`\`,
    \`<p align="center"><sub>Live <code>dynamic-readme-creature</code> for <strong>@$\{username}</strong> — <strong>Stage $\{stage}: $\{rank} $\{CREATURE_DISPLAY}</strong> \xb7 <code>$\{formattedCommits} commits</code> \xb7 View: <code>$\{VIEW_MODE}</code></sub></p>\`,
    endMarker,
  ].join("\\n");

  const updated =
    raw.slice(0, startIdx) + replacement + raw.slice(endIdx + endMarker.length);
  fs.writeFileSync(README_PATH, updated, "utf8");
  console.log("Updated README.md between CYBER-CREATURE markers.");
}

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(
      "creature.svg not found in repository root. Download it from the studio first."
    );
  }

  const commits = await fetchContributions(USERNAME, TOKEN, WINDOW_MODE);
  const { stage, rank } = getEvolutionStage(commits);
  const title = CUSTOM_TITLE
    ? CUSTOM_TITLE.toUpperCase()
    : \`$\{rank} $\{CREATURE_NAME}\`;
  const hudLabel = \`STAGE $\{stage}: $\{title} // COMMITS: $\{commits.toLocaleString("en-US")}\`;

  let svg = fs.readFileSync(SVG_PATH, "utf8");

  svg = svg.replace(
    /(<text id="cc-hud-label"[^>]*>)([\\s\\S]*?)(<\\/text>)/,
    \`$1$\{escapeXml(hudLabel)}$3\`
  );

  for (let i = 1; i <= 5; i++) {
    const fill = i === stage ? ENERGY_COLOR : i < stage ? "#C9D1D9" : "#484F58";
    const weight = i === stage ? "700" : "500";
    const railRegex = new RegExp(
      \`(<text id="cc-stage-pip-$\{i}"[^>]*fill=")[^"]*("[^>]*font-weight=")[^"]*(")\`
    );
    svg = svg.replace(railRegex, \`$1$\{fill}$2$\{weight}$3\`);
  }

  fs.writeFileSync(SVG_PATH, svg, "utf8");
  console.log(\`Updated creature.svg -> $\{hudLabel}\`);

  updateReadmeMarkers(USERNAME, stage, rank, commits);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
`),g="workflow"===l?p:h;async function u(e){let t="workflow"===e?p:h;await navigator.clipboard.writeText(t),m(e),setTimeout(()=>m(null),2e3)}return(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm",role:"dialog","aria-modal":"true","aria-labelledby":"auto-evolve-title",children:(0,t.jsxs)("div",{className:"flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-5 py-4",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{className:"flex h-9 w-9 items-center justify-center rounded-lg border border-[#00E676]/40 bg-[#00E676]/10 text-[#00E676]",children:(0,t.jsx)(y,{className:"h-5 w-5"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{id:"auto-evolve-title",className:"text-base font-semibold text-[#e6edf3]",children:"Auto-Evolve GitHub Action (Orphan Output Branch)"}),(0,t.jsxs)("p",{className:"text-xs text-[#8b949e]",children:["Publishes updated ",(0,t.jsx)("code",{className:"text-[#c9d1d9]",children:"creature.svg"})," to an orphan"," ",(0,t.jsx)("code",{className:"text-[#c9d1d9]",children:"output"})," branch so daily updates never bloat"," ",(0,t.jsx)("code",{className:"text-[#c9d1d9]",children:"main"}),"."]})]})]}),(0,t.jsx)("button",{type:"button",onClick:a,"aria-label":"Close modal",className:"rounded-lg p-1.5 text-[#8b949e] transition hover:bg-[#30363d]/60 hover:text-white",children:(0,t.jsx)(en,{className:"h-5 w-5"})})]}),(0,t.jsx)("div",{className:"border-b border-[#30363d] bg-[#0d1117] px-5 py-3 text-xs text-[#8b949e]",children:(0,t.jsxs)("ol",{className:"grid gap-1.5 sm:grid-cols-3",children:[(0,t.jsxs)("li",{className:"rounded-md border border-[#30363d]/70 bg-[#161b22]/60 px-3 py-2",children:[(0,t.jsx)("span",{className:"font-mono font-semibold text-[#FF6B00]",children:"01."})," ","Save ",(0,t.jsx)("code",{className:"text-[#e6edf3]",children:"creature.svg"})," (with HUD enabled) to your profile repo root."]}),(0,t.jsxs)("li",{className:"rounded-md border border-[#30363d]/70 bg-[#161b22]/60 px-3 py-2",children:[(0,t.jsx)("span",{className:"font-mono font-semibold text-[#FF6B00]",children:"02."})," ","Add"," ",(0,t.jsx)("code",{className:"text-[#e6edf3]",children:".github/workflows/evolve-creature.yml"})," ","and"," ",(0,t.jsx)("code",{className:"text-[#e6edf3]",children:"scripts/evolve-creature.mjs"}),"."]}),(0,t.jsxs)("li",{className:"rounded-md border border-[#30363d]/70 bg-[#161b22]/60 px-3 py-2",children:[(0,t.jsx)("span",{className:"font-mono font-semibold text-[#FF6B00]",children:"03."})," ","Embed from ",(0,t.jsx)("code",{className:"text-[#e6edf3]",children:"raw.githubusercontent.com/.../output/creature.svg"}),"."]})]})}),(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-[#30363d] bg-[#161b22]/60 px-5 pt-2",children:[(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsxs)("button",{type:"button",onClick:()=>c("workflow"),className:`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium transition ${"workflow"===l?"border-[#FF6B00] text-[#e6edf3]":"border-transparent text-[#8b949e] hover:text-[#e6edf3]"}`,children:[(0,t.jsx)(es,{className:"h-3.5 w-3.5"}),".github/workflows/evolve-creature.yml"]}),(0,t.jsxs)("button",{type:"button",onClick:()=>c("script"),className:`flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium transition ${"script"===l?"border-[#00E676] text-[#e6edf3]":"border-transparent text-[#8b949e] hover:text-[#e6edf3]"}`,children:[(0,t.jsx)(ea,{className:"h-3.5 w-3.5"}),"scripts/evolve-creature.mjs"]})]}),(0,t.jsx)("button",{type:"button",onClick:()=>u(l),className:"mb-1.5 inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#e6edf3] transition hover:border-[#8b949e] hover:bg-[#30363d]",children:d===l?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-3.5 w-3.5 text-[#00E676]"}),"Copied!"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(f,{className:"h-3.5 w-3.5"}),"Copy File"]})})]}),(0,t.jsx)("div",{className:"flex-1 overflow-auto bg-[#090c10] p-5",children:(0,t.jsx)("pre",{className:"font-mono text-xs leading-relaxed text-[#c9d1d9]",children:(0,t.jsx)("code",{children:g})})}),(0,t.jsxs)("div",{className:"flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-5 py-3 text-xs text-[#8b949e]",children:[(0,t.jsx)("span",{children:"Stages: 1 (0–149) • 2 (150–499) • 3 (500–1,199) • 4 (1,200–2,499) • 5 (2,500+)"}),(0,t.jsx)("button",{type:"button",onClick:a,className:"rounded-lg bg-[#21262d] px-4 py-1.5 font-medium text-[#e6edf3] transition hover:bg-[#30363d]",children:"Done"})]})]})})}let ej={name:"arrow-left-right",size:24,node:[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]]};ej.node;let eC=n(ej);function e$(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function eN(e,t,r){let{x:a,y:o,length:s,width:i,angle:n,curve:l=12,orangeTip:c=!0,orangeFull:d=!1,greenTip:m=!1,far:p=!1,animClass:x="cc-f1"}=e,h=d?t.accentMain:p?t.armorShadow:`url(#${r}-armor-v)`,g=d?t.accentDeep:p?t.armorFar:t.armorMid,u=t.seamStroke,f=.52*i,b=.48*i,y=`M 0 ${(-(.45*f)).toFixed(1)} C ${(.25*s).toFixed(1)} ${(-(1.05*f)+.1*l).toFixed(1)}, ${(.68*s).toFixed(1)} ${(-(.62*f)+.55*l).toFixed(1)}, ${s.toFixed(1)} ${l.toFixed(1)} C ${(.65*s).toFixed(1)} ${(.45*l+.08*f).toFixed(1)}, ${(.28*s).toFixed(1)} ${(.14*f).toFixed(1)}, 0 ${(.1*f).toFixed(1)} Z`,k=`M 0 ${(.08*f).toFixed(1)} C ${(.3*s).toFixed(1)} ${(.14*f).toFixed(1)}, ${(.65*s).toFixed(1)} ${(.48*l).toFixed(1)}, ${s.toFixed(1)} ${l.toFixed(1)} C ${(.62*s).toFixed(1)} ${(.85*b+.65*l).toFixed(1)}, ${(.24*s).toFixed(1)} ${(.92*b+.18*l).toFixed(1)}, 0 ${(.45*b).toFixed(1)} Z`,w=.74*s,v=.56*l-.34*f,j=.79*s,C=.7*l+.32*b,$=c&&!d?`<path d="M ${w.toFixed(1)} ${v.toFixed(1)} Q ${(.88*s).toFixed(1)} ${(.8*l-.15*f).toFixed(1)}, ${s.toFixed(1)} ${l.toFixed(1)} Q ${(.89*s).toFixed(1)} ${(.86*l+.16*b).toFixed(1)}, ${j.toFixed(1)} ${C.toFixed(1)} Z" fill="${p?t.accentDeep:t.accentMain}" stroke="${u}" stroke-width="0.9" stroke-linejoin="round" />`:"",N=p?"":`<path d="M 8 ${(-(.38*f)).toFixed(1)} Q ${(.4*s).toFixed(1)} ${(-(.76*f)+.2*l).toFixed(1)}, ${(.72*s).toFixed(1)} ${(-(.32*f)+.56*l).toFixed(1)}" fill="none" stroke="${t.armorHighlight}" stroke-width="1.3" stroke-linecap="round" opacity="0.7" />`,M=m?`<path class="cc-pulse" d="M ${(.88*s).toFixed(1)} ${(.84*l).toFixed(1)} L ${(s+14).toFixed(1)} ${(l+3).toFixed(1)}" stroke="${t.energyMain}" stroke-width="1.8" stroke-linecap="round" /><circle class="cc-pulse" cx="${(s+14).toFixed(1)}" cy="${(l+3).toFixed(1)}" r="2" fill="${t.energyBright}" />`:"";return`
    <g transform="translate(${a.toFixed(1)}, ${o.toFixed(1)}) rotate(${n.toFixed(1)})">
      <g class="${x}" style="transform-origin: 0px 0px;">
        <path d="${k}" fill="${g}" stroke="${u}" stroke-width="1.05" stroke-linejoin="round" />
        <path d="${y}" fill="${h}" stroke="${u}" stroke-width="1.15" stroke-linejoin="round" />
        ${$}
        ${N}
        <path d="M 5 0 Q ${(.45*s).toFixed(1)} ${(.36*l).toFixed(1)}, ${(.84*s).toFixed(1)} ${(.8*l).toFixed(1)}" fill="none" stroke="${u}" stroke-width="0.9" opacity="0.55" />
        ${M}
        <circle cx="4" cy="0" r="3.4" fill="${t.frameMain}" stroke="${u}" stroke-width="1" />
        <circle cx="4" cy="0" r="1.3" fill="${p?t.armorShadow:t.armorMid}" />
      </g>
    </g>`}function eM(e,t){let{d:r,tipX:a,tipY:o,tipAngle:s=0,variant:i,width:n=3.2,tipColor:l="orange",animClass:c,originX:d,originY:m}=e,p="";p="ceramic"===i?`
      <path d="${r}" fill="none" stroke="${t.seamStroke}" stroke-width="${n+1.8}" stroke-linecap="round" />
      <path d="${r}" fill="none" stroke="${t.armorMid}" stroke-width="${n}" stroke-linecap="round" />
      <path d="${r}" fill="none" stroke="${t.armorHighlight}" stroke-width="${Math.max(1,.38*n)}" stroke-linecap="round" opacity="0.85" />
    `:"armored"===i?`
      <path d="${r}" fill="none" stroke="${t.frameDark}" stroke-width="${n+1.8}" stroke-linecap="round" />
      <path d="${r}" fill="none" stroke="${t.frameMain}" stroke-width="${n}" stroke-linecap="round" />
      <path d="${r}" fill="none" stroke="${t.frameLight}" stroke-width="${Math.max(1,.35*n)}" stroke-linecap="round" opacity="0.85" />
    `:`
      <path d="${r}" fill="none" stroke="${t.frameDark}" stroke-width="${n+1.4}" stroke-linecap="round" />
      <path d="${r}" fill="none" stroke="${t.armorShadow}" stroke-width="${Math.max(1.2,n-.5)}" stroke-linecap="round" />
      <path class="cc-pulse" d="${r}" fill="none" stroke="${t.energyMain}" stroke-width="1.1" stroke-opacity="0.78" stroke-linecap="round" />
    `;let x="";return"orange"===l?x=`
      <g transform="translate(${a}, ${o}) rotate(${s})">
        <path d="M -8 -2.8 L 10 0 L -8 2.8 L -4 0 Z" fill="${t.accentMain}" stroke="${t.seamStroke}" stroke-width="0.9" stroke-linejoin="round" />
        <circle cx="-6" cy="0" r="2" fill="${t.frameMain}" />
      </g>
    `:"green"===l&&(x=`
      <g transform="translate(${a}, ${o}) rotate(${s})">
        <circle class="cc-pulse" cx="2" cy="0" r="${1.5*n}" fill="${t.energyMain}" fill-opacity="0.28" />
        <path class="cc-pulse" d="M -7 -2.4 L 11 0 L -7 2.4 L -3 0 Z" fill="${t.energyBright}" stroke="${t.energyMain}" stroke-width="0.8" stroke-linejoin="round" />
      </g>
    `),`
    <g class="${c}" style="transform-origin: ${d}px ${m}px;">
      ${p}
      ${x}
    </g>`}function eS(e){let t=Math.max(.5,Math.min(2.5,e||1)),r=e=>`${(e/t).toFixed(2)}s`;return`
    .cc-float {
      transform-box: fill-box;
      transform-origin: center;
      animation: ccFloat ${r(5.2)} ease-in-out infinite;
    }
    .cc-tail-swim {
      transform-box: fill-box;
      animation: ccTailSwim ${r(4.2)} ease-in-out infinite;
    }
    .cc-fluke-wave {
      transform-box: fill-box;
      animation: ccFlukeWave ${r(4.2)} ease-in-out 0.45s infinite;
    }
    .cc-wing-near {
      transform-box: fill-box;
      animation: ccWingNear ${r(4)} ease-in-out infinite;
    }
    .cc-wing-far {
      transform-box: fill-box;
      animation: ccWingFar ${r(4)} ease-in-out infinite;
    }
    .cc-f1, .cc-f2, .cc-f3, .cc-f4, .cc-f5, .cc-f6 {
      transform-box: fill-box;
    }
    .cc-f1 { animation: ccFeatherA ${r(3.1)} ease-in-out infinite; }
    .cc-f2 { animation: ccFeatherB ${r(3.3)} ease-in-out 0.25s infinite; }
    .cc-f3 { animation: ccFeatherA ${r(3.5)} ease-in-out 0.55s infinite; }
    .cc-f4 { animation: ccFeatherB ${r(3.2)} ease-in-out 0.8s infinite; }
    .cc-f5 { animation: ccFeatherA ${r(3.4)} ease-in-out 1.1s infinite; }
    .cc-f6 { animation: ccFeatherB ${r(3)} ease-in-out 1.35s infinite; }
    .cc-c1, .cc-c2, .cc-c3, .cc-c4, .cc-c5 {
      transform-box: fill-box;
    }
    .cc-c1 { animation: ccCableA ${r(4.4)} ease-in-out infinite; }
    .cc-c2 { animation: ccCableB ${r(4.8)} ease-in-out 0.35s infinite; }
    .cc-c3 { animation: ccCableA ${r(4.6)} ease-in-out 0.75s infinite; }
    .cc-c4 { animation: ccCableB ${r(5.1)} ease-in-out 1.15s infinite; }
    .cc-c5 { animation: ccCableA ${r(4.2)} ease-in-out 0.55s infinite; }
    .cc-pulse {
      animation: ccPulse ${r(2.2)} ease-in-out infinite;
    }
    .cc-hud-blink {
      animation: ccHudBlink ${r(1.7)} ease-in-out infinite;
    }
    @keyframes ccFloat {
      0%, 100% { transform: translateY(-9px) rotate(-1.3deg); }
      50% { transform: translateY(9px) rotate(1.3deg); }
    }
    @keyframes ccTailSwim {
      0%, 100% { transform: rotate(-4.5deg) translateY(-2px); }
      50% { transform: rotate(5.2deg) translateY(3px); }
    }
    @keyframes ccFlukeWave {
      0%, 100% { transform: rotate(5deg); }
      50% { transform: rotate(-6deg); }
    }
    @keyframes ccWingNear {
      0%, 100% { transform: rotate(-6.2deg) translateY(-3px); }
      50% { transform: rotate(7.2deg) translateY(4px); }
    }
    @keyframes ccWingFar {
      0%, 100% { transform: rotate(5.5deg) translateY(2px); }
      50% { transform: rotate(-6deg) translateY(-3px); }
    }
    @keyframes ccFeatherA {
      0%, 100% { transform: rotate(-5.2deg); }
      50% { transform: rotate(6deg); }
    }
    @keyframes ccFeatherB {
      0%, 100% { transform: rotate(4.8deg); }
      50% { transform: rotate(-5.5deg); }
    }
    @keyframes ccCableA {
      0%, 100% { transform: rotate(-5.5deg) translateY(-3px); }
      50% { transform: rotate(6deg) translateY(3.5px); }
    }
    @keyframes ccCableB {
      0%, 100% { transform: rotate(5deg) translateY(3px); }
      50% { transform: rotate(-5.5deg) translateY(-3px); }
    }
    @keyframes ccPulse {
      0%, 100% { opacity: 0.48; }
      50% { opacity: 1; }
    }
    @keyframes ccHudBlink {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `}function eE(e,t){return`
    <defs>
      <linearGradient id="${t}-armor-v" x1="0%" y1="0%" x2="10%" y2="100%">
        <stop offset="0%" stop-color="${e.armorHighlight}" />
        <stop offset="42%" stop-color="${e.armorMain}" />
        <stop offset="100%" stop-color="${e.armorMid}" />
      </linearGradient>
      <linearGradient id="${t}-armor-d" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${e.armorHighlight}" />
        <stop offset="35%" stop-color="${e.armorMain}" />
        <stop offset="78%" stop-color="${e.armorMid}" />
        <stop offset="100%" stop-color="${e.armorShadow}" />
      </linearGradient>
      <linearGradient id="${t}-head-vol" x1="20%" y1="5%" x2="65%" y2="95%">
        <stop offset="0%" stop-color="${e.armorHighlight}" />
        <stop offset="38%" stop-color="${e.armorMain}" />
        <stop offset="78%" stop-color="${e.armorMid}" />
        <stop offset="100%" stop-color="${e.armorShadow}" />
      </linearGradient>
      <linearGradient id="${t}-frame-v" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${e.frameLight}" />
        <stop offset="50%" stop-color="${e.frameMain}" />
        <stop offset="100%" stop-color="${e.frameDark}" />
      </linearGradient>
      <linearGradient id="${t}-accent-v" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${e.accentMain}" />
        <stop offset="100%" stop-color="${e.accentDeep}" />
      </linearGradient>
      <radialGradient id="${t}-energy-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${e.energyBright}" stop-opacity="0.98" />
        <stop offset="45%" stop-color="${e.energyMain}" stop-opacity="0.58" />
        <stop offset="100%" stop-color="${e.energyMain}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="${t}-hud-bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0D1117" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#161B22" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#0D1117" stop-opacity="0.95" />
      </linearGradient>
    </defs>
  `}function eF(e){let t={1:.74,2:.82,3:.9,4:.97,5:1.01}[e]??1;return 1===t?"":`translate(460, 205) scale(${t}) translate(-460, -205)`}function eL(e,t,r){let a=[{d:"M 648 158 C 722 146, 782 118, 846 130",tipX:846,tipY:130,tipAngle:10,variant:"fiber",width:2.3,tipColor:"green",animClass:"cc-c1",originX:648,originY:158},{d:"M 642 166 C 722 184, 786 196, 868 158",tipX:868,tipY:158,tipAngle:-16,variant:"ceramic",width:3.8,tipColor:"orange",animClass:"cc-c2",originX:642,originY:166},{d:"M 634 174 C 708 214, 784 222, 858 190",tipX:858,tipY:190,tipAngle:-12,variant:"armored",width:4.2,tipColor:"orange",animClass:"cc-c3",originX:634,originY:174},{d:"M 624 180 C 692 246, 774 256, 848 224",tipX:848,tipY:224,tipAngle:-10,variant:"ceramic",width:3.6,tipColor:"green",animClass:"cc-c4",originX:624,originY:180},{d:"M 612 186 C 676 276, 762 292, 836 258",tipX:836,tipY:258,tipAngle:-14,variant:"armored",width:4,tipColor:"orange",animClass:"cc-c5",originX:612,originY:186},{d:"M 598 190 C 656 302, 742 322, 814 292",tipX:814,tipY:292,tipAngle:-12,variant:"ceramic",width:3.4,tipColor:"green",animClass:"cc-c1",originX:598,originY:190},{d:"M 584 194 C 638 318, 718 342, 786 320",tipX:786,tipY:320,tipAngle:-8,variant:"fiber",width:2.4,tipColor:"orange",animClass:"cc-c2",originX:584,originY:194}].slice(0,1===r?2:2===r?4:3===r?5:7),o=r>=2?[{d:"M 248 78 C 296 54, 348 48, 398 58",tipX:398,tipY:58,tipAngle:8,variant:"fiber",width:2,tipColor:"orange",animClass:"cc-c1",originX:248,originY:78},{d:"M 256 82 C 308 66, 366 60, 424 50",tipX:424,tipY:50,tipAngle:-8,variant:"ceramic",width:2.4,tipColor:"green",animClass:"cc-c2",originX:256,originY:82},...r>=4?[{d:"M 262 88 C 316 80, 370 84, 412 76",tipX:412,tipY:76,tipAngle:-6,variant:"fiber",width:1.8,tipColor:"orange",animClass:"cc-c3",originX:262,originY:88},{d:"M 266 94 C 314 96, 358 102, 396 94",tipX:396,tipY:94,tipAngle:-8,variant:"fiber",width:1.7,tipColor:"green",animClass:"cc-c4",originX:266,originY:94}]:[]]:[],s=[{x:224,y:238,length:92,width:24,angle:112,curve:-8,far:!0,orangeTip:!0,animClass:"cc-f5"},{x:234,y:248,length:106,width:26,angle:98,curve:-6,far:!0,orangeTip:!0,animClass:"cc-f4"},{x:244,y:258,length:118,width:26,angle:86,curve:4,far:!0,orangeTip:!0,greenTip:r>=4,animClass:"cc-f3"},{x:254,y:266,length:112,width:24,angle:74,curve:8,far:!0,orangeTip:!0,animClass:"cc-f2"},{x:262,y:274,length:96,width:22,angle:64,curve:10,far:!0,orangeTip:!1,animClass:"cc-f1"}].slice(0,r<=2?3:5),i=r>=3?[{x:432,y:122,length:82,width:22,angle:-46,curve:-8,orangeTip:!0,animClass:"cc-f1"},{x:446,y:128,length:92,width:24,angle:-34,curve:-7,orangeTip:!0,greenTip:r>=4,animClass:"cc-f2"},{x:460,y:134,length:88,width:22,angle:-22,curve:-5,orangeTip:!1,animClass:"cc-f3"},...r>=4?[{x:474,y:140,length:78,width:20,angle:-12,curve:-4,orangeTip:!0,animClass:"cc-f4"},{x:488,y:146,length:66,width:18,angle:-4,curve:-3,orangeTip:!1,animClass:"cc-f5"}]:[]]:[],n=[{x:334,y:226,length:116,width:25,angle:56,curve:10,orangeTip:!0,animClass:"cc-f6"},{x:350,y:240,length:132,width:27,angle:49,curve:11,orangeTip:!0,greenTip:r>=3,animClass:"cc-f5"},{x:368,y:254,length:148,width:29,angle:42,curve:12,orangeTip:!0,animClass:"cc-f4"},{x:386,y:268,length:162,width:30,angle:36,curve:13,orangeTip:!0,greenTip:r>=4,animClass:"cc-f3"},{x:406,y:282,length:168,width:30,angle:30,curve:13,orangeTip:!0,animClass:"cc-f2"},{x:426,y:296,length:162,width:28,angle:24,curve:12,orangeTip:!0,greenTip:r>=5,animClass:"cc-f1"},{x:446,y:310,length:146,width:26,angle:18,curve:10,orangeTip:!0,animClass:"cc-f2"},{x:464,y:322,length:122,width:23,angle:12,curve:8,orangeTip:!0,animClass:"cc-f3"}].slice(0,1===r?4:2===r?5:3===r?6:8),l=5===r?`
      <g>
        ${eN({x:204,y:74,length:72,width:18,angle:-24,curve:-8,orangeTip:!0,greenTip:!0,animClass:"cc-f2"},e,t)}
        ${eN({x:222,y:70,length:82,width:20,angle:-18,curve:-8,orangeFull:!0,greenTip:!0,animClass:"cc-f3"},e,t)}
        <path class="cc-pulse" d="M 118 118 L 166 106 L 154 128 L 210 116" fill="none" stroke="${e.energyBright}" stroke-width="2" stroke-linecap="round" />
      </g>`:"",c=r>=3?`
      <g>
        ${eN({x:474,y:206,length:78,width:22,angle:46,curve:8,far:!0,orangeTip:!0,animClass:"cc-f4"},e,t)}
        ${eN({x:486,y:202,length:64,width:19,angle:36,curve:6,far:!0,orangeTip:!1,greenTip:r>=5,animClass:"cc-f5"},e,t)}
      </g>`:"";return`
    <g transform="${eF(r)}">
      <g class="cc-float">
        <!-- Head Dorsal Neural Whips -->
        <g>${o.map(t=>eM(t,e)).join("")}</g>

        <!-- Far Pectoral Wing-Fin -->
        <g class="cc-wing-far" style="transform-origin: 235px 226px;">
          ${s.map(r=>eN(r,e,t)).join("")}
          <path d="M 222 216 L 246 274 L 266 322 L 246 328 L 214 248 Z" fill="${e.armorShadow}" stroke="${e.seamStroke}" stroke-width="1.3" stroke-linejoin="round" />
          <circle cx="228" cy="230" r="14" fill="${e.frameDark}" stroke="${e.seamStroke}" stroke-width="1.3" />
          <circle cx="228" cy="230" r="7.5" fill="${e.accentDeep}" />
        </g>

        <!-- Animated Tail Peduncle + Fluke + Trailing Cables -->
        <g class="cc-tail-swim" style="transform-origin: 430px 168px;">
          ${c}
          <g>${a.map(t=>eM(t,e)).join("")}</g>
          <g>${i.map(r=>eN(r,e,t)).join("")}</g>

          <!-- Sculpted Tapered Mechanical Tail Under-Frame -->
          <path d="M 418 134 C 498 130, 578 142, 650 156 L 646 184 C 574 196, 496 212, 412 224 Z" fill="url(#${t}-frame-v)" stroke="${e.seamStroke}" stroke-width="1.4" />

          <!-- Continuous Contoured Interlocking Tail Armor Plates (No Boxy Rects!) -->
          <path d="M 416 122 C 496 126, 576 138, 646 152 L 642 180 C 572 192, 492 204, 412 214 C 402 184, 404 150, 416 122 Z" fill="url(#${t}-armor-d)" stroke="${e.seamStroke}" stroke-width="1.45" stroke-linejoin="round" />
          <!-- Curved Anatomical Segment Seams & Orange Trim Ticks -->
          <path d="M 454 125 C 446 154, 444 184, 452 209" fill="none" stroke="${e.seamStroke}" stroke-width="1.25" />
          <path d="M 494 129 C 486 156, 484 182, 492 203" fill="none" stroke="${e.seamStroke}" stroke-width="1.25" />
          <path d="M 532 134 C 525 157, 524 179, 530 197" fill="none" stroke="${e.seamStroke}" stroke-width="1.25" />
          <path d="M 568 139 C 562 158, 561 176, 566 192" fill="none" stroke="${e.seamStroke}" stroke-width="1.25" />
          <path d="M 604 144 C 599 160, 598 174, 602 186" fill="none" stroke="${e.seamStroke}" stroke-width="1.2" />
          <!-- Dorsal Ridge Highlight Ribbon -->
          <path d="M 424 129 C 498 134, 572 145, 636 157" fill="none" stroke="${e.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />
          <!-- Subtle Energy & Accent Micro-Ports along Tail -->
          ${r>=3?`<rect x="466" y="164" width="12" height="5" rx="1.5" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.7" />`:""}
          ${r>=3?`<rect x="542" y="162" width="10" height="5" rx="1.5" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.7" />`:""}
          <circle class="cc-pulse" cx="512" cy="166" r="2.6" fill="${e.energyMain}" />
          <circle class="cc-pulse" cx="585" cy="165" r="2.4" fill="${e.energyMain}" />

          <!-- Rear Tail Stabilizer Fluke -->
          <g class="cc-fluke-wave" style="transform-origin: 642px 164px;">
            <path d="M 636 156 L 732 130 L 762 140 L 704 166 L 638 174 Z" fill="url(#${t}-armor-v)" stroke="${e.seamStroke}" stroke-width="1.4" stroke-linejoin="round" />
            <path d="M 708 136 L 732 130 L 762 140 L 736 150 Z" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="1" />
            <circle cx="644" cy="165" r="6" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.1" />
            <circle class="cc-pulse" cx="644" cy="165" r="2.4" fill="${e.energyBright}" />
          </g>
        </g>

        <!-- Mid-Torso Sculpted Under-Frame & Hydraulic Belly Ribs -->
        <path d="M 278 124 C 338 112, 390 116, 424 126 L 418 220 C 374 234, 326 244, 286 248 Z" fill="url(#${t}-frame-v)" stroke="${e.seamStroke}" stroke-width="1.5" />
        ${r>=2?`<path class="cc-pulse" d="M 326 232 C 378 226, 422 214, 466 202" fill="none" stroke="${e.energyMain}" stroke-width="2" stroke-opacity="0.8" />`:""}
        <path d="M 340 236 L 352 212 M 362 232 L 374 206 M 384 226 L 395 201" stroke="${e.frameLight}" stroke-width="2.2" stroke-linecap="round" />

        <!-- Mid-Torso Modular Armor Carapace -->
        <path d="M 284 90 C 344 96, 396 110, 428 126 C 416 158, 412 188, 418 216 C 374 230, 324 240, 288 240 Z" fill="url(#${t}-armor-v)" stroke="${e.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 326 102 C 332 144, 338 186, 346 226 M 374 114 C 378 150, 382 184, 388 214" fill="none" stroke="${e.seamStroke}" stroke-width="1.2" opacity="0.82" />
        <rect x="336" y="138" width="24" height="9" rx="2.5" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="0.9" />
        <rect class="cc-pulse" x="340" y="140.5" width="16" height="4" rx="1" fill="${e.energyMain}" />

        <!-- Massive Volumetric Cyber-Tulkun Head -->
        <g>
          <!-- Recessed Mechanical Mouth Line & Precision Baleen Louvers -->
          <path d="M 74 148 C 142 157, 224 162, 306 154 L 310 168 C 222 174, 140 169, 74 161 Z" fill="${e.frameDark}" stroke="${e.seamStroke}" stroke-width="1.2" />
          <path d="M 96 153 L 98 162 M 114 155 L 116 164 M 132 157 L 134 166 M 150 158 L 152 167 M 168 159 L 170 168 M 186 160 L 188 168" stroke="${e.frameLight}" stroke-width="1.2" opacity="0.85" />

          <!-- Sculpted Lower Jaw Modular Plates -->
          <path d="M 76 161 C 102 226, 198 265, 322 250 L 332 198 C 258 187, 165 172, 76 161 Z" fill="url(#${t}-head-vol)" stroke="${e.seamStroke}" stroke-width="1.55" stroke-linejoin="round" />
          <path d="M 88 180 C 148 212, 232 230, 314 230" fill="none" stroke="${e.seamStroke}" stroke-width="1.15" />
          <path d="M 106 200 C 166 230, 240 244, 318 242" fill="none" stroke="${e.seamStroke}" stroke-width="1.15" />
          ${r>=2?`<path class="cc-pulse" d="M 102 192 C 160 220, 228 236, 294 236" fill="none" stroke="${e.energyMain}" stroke-width="1.6" stroke-dasharray="18 8 4 8" />`:""}
          <circle cx="116" cy="174" r="6" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.1" />
          <circle class="cc-pulse" cx="116" cy="174" r="2.8" fill="${e.energyBright}" />

          <!-- Upper Cranium Dome -->
          <path d="M 70 149 C 66 82, 152 58, 258 74 L 328 102 L 308 159 C 224 165, 138 157, 70 149 Z" fill="url(#${t}-head-vol)" stroke="${e.seamStroke}" stroke-width="1.65" stroke-linejoin="round" />
          <path d="M 84 114 C 144 92, 230 94, 316 116" fill="none" stroke="${e.seamStroke}" stroke-width="1.15" />
          <path d="M 118 76 C 122 104, 128 130, 136 154" fill="none" stroke="${e.seamStroke}" stroke-width="1.1" />
          <path d="M 192 68 C 194 98, 198 128, 206 158" fill="none" stroke="${e.seamStroke}" stroke-width="1.15" />
          <path d="M 262 76 L 248 156" fill="none" stroke="${e.seamStroke}" stroke-width="1.15" />
          <path d="M 92 103 C 144 74, 214 70, 268 84" fill="none" stroke="${e.armorHighlight}" stroke-width="3.8" stroke-linecap="round" opacity="0.85" />

          <!-- Precision Circuit Trace Decals (Refined, Non-Boxy) -->
          ${r>=3?`<g opacity="0.9">
                  <path class="cc-pulse" d="M 150 100 L 184 100 L 192 108 L 236 108" fill="none" stroke="${e.energyMain}" stroke-width="1.4" stroke-linecap="round" />
                  <path d="M 154 110 L 178 110 L 184 116 L 222 116" fill="none" stroke="${e.energyMain}" stroke-width="1" stroke-opacity="0.65" />
                  <rect x="172" y="130" width="18" height="6" rx="1.5" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.8" />
                  <rect class="cc-pulse" x="200" y="134" width="20" height="4" rx="1.2" fill="${e.energyMain}" />
                </g>`:""}

          ${l}

          <!-- Primary Brow Sensor Eye -->
          <g>
            <circle cx="144" cy="143" r="8.5" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.2" />
            <circle cx="144" cy="143" r="12" fill="url(#${t}-energy-glow)" class="cc-pulse" />
            <circle cx="144" cy="143" r="4.4" fill="${e.energyMain}" stroke="${e.frameDark}" stroke-width="1" />
            <circle cx="142.5" cy="141.5" r="1.5" fill="${e.energyBright}" />
          </g>

          <!-- Circular Cheek Gyro / Optic Ear Assembly -->
          <g transform="translate(268, 174)">
            <circle cx="0" cy="0" r="${r>=4?27:22}" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.5" />
            ${r>=4?`<circle cx="0" cy="0" r="21" fill="none" stroke="${e.energyMain}" stroke-width="1.5" stroke-dasharray="12 6" class="cc-pulse" />`:""}
            <circle cx="0" cy="0" r="15.5" fill="${e.frameDark}" stroke="${e.accentMain}" stroke-width="3" />
            <circle cx="0" cy="0" r="10" fill="url(#${t}-energy-glow)" class="cc-pulse" />
            <circle cx="0" cy="0" r="5" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.9" />
            <circle cx="0" cy="0" r="2.1" fill="${e.energyBright}" />
          </g>

          <!-- Crown Tendril Socket -->
          <circle cx="248" cy="78" r="10" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.2" />
          <circle cx="248" cy="78" r="5" fill="${e.accentMain}" />
        </g>

        <!-- Hero Near Pectoral Wing-Fin (Broad Overlapping Feathered Wing) -->
        <g class="cc-wing-near" style="transform-origin: 330px 212px;">
          <!-- Broad Fanned Mechanical Feathers -->
          ${n.map(r=>eN(r,e,t)).join("")}

          <!-- Shoulder Ball Joint -->
          <circle cx="330" cy="212" r="25" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.6" />
          <circle cx="330" cy="212" r="17" fill="${e.frameDark}" stroke="${e.armorMid}" stroke-width="2" stroke-dasharray="16 6" />
          <circle cx="330" cy="212" r="8.5" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="1.1" />
          <circle class="cc-pulse" cx="330" cy="212" r="3.8" fill="${e.energyBright}" />

          <!-- Sculpted Robotic Pectoral Arm Strut -->
          <path d="M 326 212 L 408 266 L 484 328 L 460 344 L 384 284 L 314 232 Z" fill="url(#${t}-armor-v)" stroke="${e.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 340 226 L 466 326" fill="none" stroke="${e.armorHighlight}" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
          <path d="M 380 260 L 398 248 L 406 258 L 388 272 Z" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="1" />
          <path class="cc-pulse" d="M 406 278 L 454 316" stroke="${e.energyMain}" stroke-width="3" stroke-linecap="round" />
          <circle cx="468" cy="331" r="6" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.1" />
          <circle class="cc-pulse" cx="468" cy="331" r="2.5" fill="${e.energyBright}" />
          ${r>=3?`<path class="cc-pulse" d="M 480 338 L 522 365" stroke="${e.energyMain}" stroke-width="2.2" stroke-linecap="round" />`:""}
        </g>
      </g>
    </g>
  `}function eT(e,t,r){let a=[{x:268,y:205,length:196,width:28,angle:-154,curve:-24,orangeTip:!0,greenTip:r>=3,animClass:"cc-c1"},{x:274,y:220,length:215,width:30,angle:-170,curve:-20,orangeTip:!0,animClass:"cc-c2"},{x:278,y:234,length:185,width:26,angle:168,curve:-16,orangeTip:!0,greenTip:r>=4,animClass:"cc-c3"},{x:266,y:246,length:165,width:24,angle:152,curve:-14,orangeTip:!1,animClass:"cc-c4"}].slice(0,1===r?2:2===r?3:4),o=[{d:"M 290 236 C 210 310, 128 332, 68 292",tipX:68,tipY:292,tipAngle:-145,variant:"armored",width:3.8,tipColor:"orange",animClass:"cc-c1",originX:290,originY:236},{d:"M 305 242 C 232 332, 148 358, 86 336",tipX:86,tipY:336,tipAngle:-165,variant:"ceramic",width:3.4,tipColor:"green",animClass:"cc-c2",originX:305,originY:242},{d:"M 322 246 C 254 342, 185 366, 122 362",tipX:122,tipY:362,tipAngle:175,variant:"fiber",width:2.3,tipColor:"green",animClass:"cc-c3",originX:322,originY:246},{d:"M 272 200 C 202 146, 146 95, 92 78",tipX:92,tipY:78,tipAngle:-155,variant:"fiber",width:2.1,tipColor:"orange",animClass:"cc-c4",originX:272,originY:200}].slice(0,1===r?1:2===r?2:4),s=r>=2?[{x:342,y:188,length:92,width:22,angle:-145,curve:-12,orangeTip:!0,animClass:"cc-f1"},{x:378,y:172,length:108,width:24,angle:-140,curve:-14,orangeTip:!0,greenTip:r>=4,animClass:"cc-f2"},{x:418,y:154,length:118,width:26,angle:-136,curve:-14,orangeTip:!0,animClass:"cc-f3"},{x:458,y:138,length:114,width:25,angle:-134,curve:-12,orangeTip:!0,greenTip:r>=4,animClass:"cc-f4"},{x:498,y:126,length:102,width:23,angle:-138,curve:-10,orangeTip:!0,animClass:"cc-f5"},{x:540,y:118,length:88,width:21,angle:-144,curve:-8,orangeTip:!1,animClass:"cc-f6"},{x:582,y:116,length:74,width:19,angle:-150,curve:-6,orangeTip:!0,animClass:"cc-f1"}].slice(0,2===r?3:3===r?5:7):[],i=[{x:650,y:245,length:84,width:22,angle:112,curve:10,far:!0,orangeTip:!1,animClass:"cc-f3"},{x:640,y:256,length:96,width:24,angle:122,curve:12,far:!0,orangeFull:!0,animClass:"cc-f4"},{x:628,y:268,length:102,width:24,angle:132,curve:12,far:!0,orangeTip:!0,animClass:"cc-f5"},{x:616,y:278,length:90,width:22,angle:142,curve:10,far:!0,orangeTip:!1,animClass:"cc-f6"}].slice(0,r<=2?2:4),n=[{x:564,y:196,length:108,width:24,angle:152,curve:10,orangeTip:!1,animClass:"cc-f1"},{x:552,y:210,length:128,width:26,angle:144,curve:12,orangeFull:!0,animClass:"cc-f2"},{x:540,y:224,length:146,width:28,angle:136,curve:12,orangeTip:!0,greenTip:r>=4,animClass:"cc-f3"},{x:526,y:238,length:158,width:28,angle:128,curve:12,orangeFull:!0,animClass:"cc-f4"},{x:512,y:252,length:146,width:26,angle:120,curve:10,orangeTip:!0,animClass:"cc-f5"},{x:498,y:266,length:124,width:24,angle:112,curve:8,orangeTip:!0,greenTip:r>=5,animClass:"cc-f6"}].slice(0,1===r?3:2===r?4:6);return`
    <g transform="${eF(r)}">
      <g class="cc-float">
        <g class="cc-tail-swim" style="transform-origin: 480px 180px;">
          <g>${o.map(t=>eM(t,e)).join("")}</g>
          <g>${a.map(r=>eN(r,e,t)).join("")}</g>
        </g>

        <g class="cc-wing-far" style="transform-origin: 672px 214px;">
          <path d="M 672 208 L 656 266 L 622 300 L 636 308 L 682 232 Z" fill="${e.armorShadow}" stroke="${e.seamStroke}" stroke-width="1.3" />
          ${i.map(r=>eN(r,e,t)).join("")}
        </g>

        <path d="M 272 222 C 340 202, 415 152, 520 144 C 598 138, 665 152, 718 164 L 712 198 C 655 206, 595 208, 515 206 C 425 204, 345 236, 274 238 Z" fill="url(#${t}-frame-v)" stroke="${e.seamStroke}" stroke-width="1.5" />
        <path class="cc-pulse" d="M 300 222 C 378 192, 462 162, 565 164 C 625 165, 668 174, 704 180" fill="none" stroke="${e.energyMain}" stroke-width="2.2" />

        <g>${s.map(r=>eN(r,e,t)).join("")}</g>

        <!-- Continuous Sculpted S-Curve Carapace Body -->
        <path d="M 278 214 C 344 182, 434 128, 558 118 C 624 114, 676 126, 714 146 L 704 198 C 652 204, 592 206, 514 202 C 424 198, 344 228, 282 232 Z" fill="url(#${t}-armor-d)" stroke="${e.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 342 184 C 344 198, 346 212, 348 224 M 396 160 C 398 178, 400 196, 404 210 M 456 138 C 458 162, 462 184, 466 202 M 520 124 C 522 152, 526 178, 530 202 M 586 120 C 588 148, 592 174, 596 200 M 648 124 C 650 150, 654 174, 656 198" fill="none" stroke="${e.seamStroke}" stroke-width="1.2" />
        <path d="M 312 204 C 388 170, 474 134, 578 128 C 628 126, 668 134, 698 146" fill="none" stroke="${e.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />
        ${r>=3?`<rect x="480" y="164" width="16" height="6" rx="2" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.8" />`:""}
        <circle class="cc-pulse" cx="428" cy="176" r="2.8" fill="${e.energyMain}" />
        <circle class="cc-pulse" cx="556" cy="164" r="3" fill="${e.energyMain}" />

        <g>
          <path d="M 678 148 C 702 144, 722 146, 738 152" fill="none" stroke="${e.frameLight}" stroke-width="6" stroke-linecap="round" />
          <path d="M 678 178 C 704 182, 726 184, 742 180" fill="none" stroke="${e.frameDark}" stroke-width="5" stroke-linecap="round" />

          ${r>=2?eN({x:724,y:128,length:68,width:18,angle:-152,curve:-6,orangeTip:!0,animClass:"cc-f2"},e,t):""}
          ${r>=4?eN({x:738,y:122,length:58,width:17,angle:-144,curve:-5,orangeTip:!1,greenTip:!0,animClass:"cc-f3"},e,t):""}
          ${5===r?eN({x:752,y:116,length:52,width:16,angle:-136,curve:-4,orangeFull:!0,greenTip:!0,animClass:"cc-f1"},e,t):""}

          <path d="M 738 172 L 828 166 L 838 178 C 810 198, 765 204, 732 192 Z" fill="url(#${t}-head-vol)" stroke="${e.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 762 182 L 814 178" stroke="${e.seamStroke}" stroke-width="1.1" />

          <path d="M 716 144 C 736 106, 804 106, 846 146 L 854 162 C 824 170, 774 174, 724 168 Z" fill="url(#${t}-head-vol)" stroke="${e.seamStroke}" stroke-width="1.65" stroke-linejoin="round" />
          <path d="M 744 126 C 778 118, 814 126, 840 144" fill="none" stroke="${e.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.8" />
          <path d="M 762 118 L 758 168 M 802 122 L 798 166" stroke="${e.seamStroke}" stroke-width="1.1" />

          <path d="M 796 148 L 844 146 L 848 156 L 802 158 Z" fill="${e.frameDark}" stroke="${e.seamStroke}" stroke-width="1.1" />
          <circle cx="826" cy="152" r="11" fill="url(#${t}-energy-glow)" class="cc-pulse" />
          <circle cx="826" cy="152" r="4.8" fill="${e.energyMain}" />
          <circle cx="825" cy="151" r="1.8" fill="${e.energyBright}" />
          <rect x="770" y="142" width="16" height="5" rx="1.5" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.8" />

          <g transform="translate(734, 162)">
            <circle cx="0" cy="0" r="22" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.5" />
            <circle cx="0" cy="0" r="15" fill="${e.frameDark}" stroke="${e.accentMain}" stroke-width="2.8" />
            <circle cx="0" cy="0" r="7" fill="${e.armorMid}" stroke="${e.seamStroke}" stroke-width="1" />
            <circle class="cc-pulse" cx="0" cy="0" r="3" fill="${e.energyMain}" />
          </g>
        </g>

        <g class="cc-wing-near" style="transform-origin: 598px 176px;">
          ${n.map(r=>eN(r,e,t)).join("")}
          <circle cx="598" cy="176" r="22" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.5" />
          <circle cx="598" cy="176" r="14" fill="${e.frameDark}" stroke="${e.accentMain}" stroke-width="2.4" />
          <circle class="cc-pulse" cx="598" cy="176" r="5" fill="${e.energyMain}" />
          <path d="M 596 178 L 542 238 L 494 294 L 512 308 L 568 248 L 614 194 Z" fill="url(#${t}-armor-v)" stroke="${e.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path class="cc-pulse" d="M 556 226 L 512 276" stroke="${e.energyMain}" stroke-width="3" stroke-linecap="round" />
          <rect x="558" y="210" width="16" height="8" rx="2" transform="rotate(-46 566 214)" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="1" />
        </g>
      </g>
    </g>
  `}function eA(e,t,r){let a=[{d:"M 516 208 C 608 182, 702 152, 822 178",tipX:822,tipY:178,tipAngle:12,variant:"ceramic",width:3.4,tipColor:"orange",animClass:"cc-c1",originX:516,originY:208},{d:"M 508 228 C 618 242, 718 232, 856 202",tipX:856,tipY:202,tipAngle:-10,variant:"armored",width:4,tipColor:"green",animClass:"cc-c2",originX:508,originY:228},{d:"M 496 244 C 594 278, 694 316, 816 286",tipX:816,tipY:286,tipAngle:-14,variant:"fiber",width:2.6,tipColor:"green",animClass:"cc-c3",originX:496,originY:244},{d:"M 482 252 C 562 308, 658 346, 772 336",tipX:772,tipY:336,tipAngle:-4,variant:"ceramic",width:3,tipColor:"orange",animClass:"cc-c4",originX:482,originY:252}].slice(0,1===r?2:2===r?3:4),o=[{x:422,y:128,length:94,width:22,angle:-24,curve:-6,far:!0,orangeTip:!0,animClass:"cc-f1"},{x:454,y:108,length:106,width:24,angle:-18,curve:-8,far:!0,orangeTip:!0,greenTip:r>=4,animClass:"cc-f2"},{x:486,y:92,length:112,width:24,angle:-12,curve:-8,far:!0,orangeTip:!0,animClass:"cc-f3"},{x:518,y:78,length:102,width:22,angle:-6,curve:-6,far:!0,orangeTip:!1,animClass:"cc-f4"},{x:550,y:68,length:88,width:20,angle:0,curve:-4,far:!0,orangeTip:!0,animClass:"cc-f5"}].slice(0,r<=2?3:5),s=[{x:356,y:268,length:108,width:24,angle:34,curve:10,orangeTip:!0,animClass:"cc-f1"},{x:382,y:284,length:124,width:26,angle:28,curve:12,orangeTip:!0,greenTip:r>=3,animClass:"cc-f2"},{x:410,y:300,length:138,width:28,angle:22,curve:12,orangeTip:!0,animClass:"cc-f3"},{x:440,y:316,length:146,width:28,angle:16,curve:12,orangeTip:!0,greenTip:r>=4,animClass:"cc-f4"},{x:470,y:332,length:136,width:26,angle:11,curve:10,orangeTip:!0,animClass:"cc-f5"},{x:500,y:346,length:116,width:24,angle:7,curve:8,orangeTip:!0,animClass:"cc-f6"},{x:530,y:358,length:92,width:20,angle:3,curve:6,orangeTip:!1,animClass:"cc-f1"}].slice(0,1===r?3:2===r?5:7);return`
    <g transform="${eF(r)}">
      <g class="cc-float">
        <g>${a.map(t=>eM(t,e)).join("")}</g>

        <g class="cc-wing-far" style="transform-origin: 336px 176px;">
          ${o.map(r=>eN(r,e,t)).join("")}
          <path d="M 288 182 C 354 118, 456 66, 588 46 L 548 86 C 468 112, 396 150, 336 196 Z" fill="${e.armorShadow}" stroke="${e.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M 326 164 L 548 64" stroke="${e.seamStroke}" stroke-width="1.1" opacity="0.7" />
          <path d="M 526 62 L 588 46 L 564 74 L 516 84 Z" fill="${e.accentDeep}" stroke="${e.seamStroke}" stroke-width="1" />
        </g>

        <g>
          <path d="M 192 214 C 266 254, 380 264, 512 238 L 496 202 C 386 194, 276 192, 192 214 Z" fill="url(#${t}-frame-v)" stroke="${e.seamStroke}" stroke-width="1.5" />
          <g class="cc-pulse">
            <path d="M 272 224 L 288 240 M 292 226 L 308 242 M 312 228 L 328 244 M 332 228 L 348 244" stroke="${e.energyMain}" stroke-width="2.4" stroke-linecap="round" />
          </g>

          <path d="M 204 186 C 166 170, 128 164, 102 172 C 128 186, 162 198, 198 202 Z" fill="${e.armorMid}" stroke="${e.seamStroke}" stroke-width="1.3" />
          <path d="M 102 172 L 130 172 L 124 180 Z" fill="${e.accentDeep}" />

          <path d="M 178 202 C 216 154, 326 150, 446 186 L 522 214 L 468 238 C 362 246, 250 232, 178 202 Z" fill="url(#${t}-head-vol)" stroke="${e.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 232 176 L 268 224 M 302 166 L 336 234 M 378 172 L 404 238" stroke="${e.seamStroke}" stroke-width="1.15" opacity="0.8" />
          <path d="M 218 190 C 292 178, 376 192, 466 218" fill="none" stroke="${e.armorHighlight}" stroke-width="3" stroke-linecap="round" opacity="0.75" />

          <g transform="translate(342, 198)">
            <polygon points="0,-12 24,0 0,12 -24,0" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.2" />
            <polygon class="cc-pulse" points="0,-7 15,0 0,7 -15,0" fill="${e.energyMain}" />
            <circle cx="0" cy="0" r="14" fill="url(#${t}-energy-glow)" class="cc-pulse" />
          </g>

          <path d="M 216 210 C 168 214, 118 208, 86 226 C 122 238, 172 238, 224 228 Z" fill="url(#${t}-armor-v)" stroke="${e.seamStroke}" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M 86 226 L 118 220 L 114 232 Z" fill="${e.accentMain}" stroke="${e.seamStroke}" stroke-width="0.9" />
          <path class="cc-pulse" d="M 124 224 L 196 220" stroke="${e.energyMain}" stroke-width="2" stroke-linecap="round" />

          <g>
            <path d="M 196 196 L 236 194 L 228 204 L 192 204 Z" fill="${e.frameDark}" stroke="${e.seamStroke}" stroke-width="1.1" />
            <circle cx="212" cy="199" r="9" fill="url(#${t}-energy-glow)" class="cc-pulse" />
            <circle cx="212" cy="199" r="3.6" fill="${e.energyBright}" />
          </g>
        </g>

        <g class="cc-wing-near" style="transform-origin: 318px 226px;">
          ${s.map(r=>eN(r,e,t)).join("")}
          <path d="M 278 224 C 362 232, 476 286, 616 378 L 538 366 C 436 334, 338 286, 266 240 Z" fill="url(#${t}-armor-v)" stroke="${e.seamStroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 328 242 L 368 294 M 398 268 L 438 326 M 468 302 L 504 352" stroke="${e.seamStroke}" stroke-width="1.15" opacity="0.8" />
          <path class="cc-pulse" d="M 304 238 C 392 266, 480 310, 566 360" fill="none" stroke="${e.energyMain}" stroke-width="2.2" />
          <circle cx="318" cy="238" r="16" fill="${e.frameMain}" stroke="${e.seamStroke}" stroke-width="1.3" />
          <circle cx="318" cy="238" r="9" fill="${e.frameDark}" stroke="${e.accentMain}" stroke-width="2.4" />
          <circle class="cc-pulse" cx="318" cy="238" r="3.5" fill="${e.energyBright}" />
          <path d="M 548 342 L 616 378 L 574 374 L 532 354 Z" fill="url(#${t}-accent-v)" stroke="${e.seamStroke}" stroke-width="1.1" />
        </g>
      </g>
    </g>
  `}function eR(e,t="cc"){let r=ey(e),{stage:a}=ek(e.commits);if("tulkun"===e.creature){if("dive"===e.view)return`
    <g transform="translate(460, 188) rotate(-14) scale(0.84) translate(-460, -205)">
      ${eL(r,t,a)}
    </g>
  `;if("top"===e.view){let e,o,s;return e=[{x:350,y:158,length:124,width:24,angle:-138,curve:-12,orangeTip:!0,animClass:"cc-f1"},{x:370,y:154,length:142,width:26,angle:-132,curve:-12,orangeTip:!0,greenTip:a>=4,animClass:"cc-f2"},{x:392,y:154,length:154,width:26,angle:-124,curve:-12,orangeTip:!0,animClass:"cc-f3"},{x:414,y:158,length:142,width:24,angle:-116,curve:-10,orangeTip:!0,animClass:"cc-f4"},{x:436,y:164,length:120,width:22,angle:-108,curve:-8,orangeTip:!0,greenTip:a>=5,animClass:"cc-f5"}].slice(0,a<=2?3:5),o=[{x:350,y:254,length:124,width:24,angle:138,curve:12,orangeTip:!0,animClass:"cc-f2"},{x:370,y:258,length:142,width:26,angle:132,curve:12,orangeTip:!0,greenTip:a>=4,animClass:"cc-f3"},{x:392,y:258,length:154,width:26,angle:124,curve:12,orangeTip:!0,animClass:"cc-f4"},{x:414,y:254,length:142,width:24,angle:116,curve:10,orangeTip:!0,animClass:"cc-f5"},{x:436,y:248,length:120,width:22,angle:108,curve:8,orangeTip:!0,greenTip:a>=5,animClass:"cc-f6"}].slice(0,a<=2?3:5),s=[{d:"M 642 194 C 710 176, 778 148, 856 164",tipX:856,tipY:164,tipAngle:12,variant:"ceramic",width:3.4,tipColor:"orange",animClass:"cc-c1",originX:642,originY:194},{d:"M 646 202 C 722 198, 788 188, 868 194",tipX:868,tipY:194,tipAngle:4,variant:"fiber",width:2.3,tipColor:"green",animClass:"cc-c2",originX:646,originY:202},{d:"M 646 210 C 722 214, 788 224, 868 218",tipX:868,tipY:218,tipAngle:-4,variant:"armored",width:3.6,tipColor:"green",animClass:"cc-c3",originX:646,originY:210},{d:"M 642 218 C 710 236, 778 264, 856 248",tipX:856,tipY:248,tipAngle:-12,variant:"ceramic",width:3.4,tipColor:"orange",animClass:"cc-c4",originX:642,originY:218}].slice(0,1===a?2:4),`
    <g transform="${eF(a)}">
      <g class="cc-float">
        <g class="cc-tail-swim" style="transform-origin: 430px 206px;">
          <g>${s.map(e=>eM(e,r)).join("")}</g>

          ${a>=3?`<g>
                  <path d="M 526 178 L 566 138 L 584 148 L 548 184 Z" fill="url(#${t}-armor-d)" stroke="${r.seamStroke}" stroke-width="1.2" />
                  <path d="M 526 234 L 566 274 L 584 264 L 548 228 Z" fill="url(#${t}-armor-d)" stroke="${r.seamStroke}" stroke-width="1.2" />
                </g>`:""}

          <g class="cc-fluke-wave" style="transform-origin: 632px 206px;">
            <path d="M 624 198 L 716 142 L 736 160 L 664 206 L 736 252 L 716 270 L 624 214 Z" fill="url(#${t}-armor-d)" stroke="${r.seamStroke}" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M 692 156 L 716 142 L 736 160 L 710 172 Z" fill="${r.accentMain}" stroke="${r.seamStroke}" stroke-width="1" />
            <path d="M 692 256 L 716 270 L 736 252 L 710 240 Z" fill="${r.accentMain}" stroke="${r.seamStroke}" stroke-width="1" />
          </g>

          <path d="M 332 172 L 642 192 L 642 220 L 332 240 Z" fill="url(#${t}-frame-v)" stroke="${r.seamStroke}" stroke-width="1.4" />

          <!-- Continuous Sculpted Dorsal Spine Armor -->
          <path d="M 336 160 C 446 164, 548 176, 636 192 L 636 220 C 548 236, 446 248, 336 252 Z" fill="url(#${t}-armor-d)" stroke="${r.seamStroke}" stroke-width="1.4" />
          <path d="M 392 163 L 392 249 M 446 167 L 446 245 M 498 172 L 498 240 M 548 178 L 548 234 M 594 184 L 594 228" stroke="${r.seamStroke}" stroke-width="1.2" />
          <circle class="cc-pulse" cx="420" cy="206" r="3" fill="${r.energyMain}" />
          <circle class="cc-pulse" cx="472" cy="206" r="3" fill="${r.energyMain}" />
          <circle class="cc-pulse" cx="524" cy="206" r="2.8" fill="${r.energyMain}" />
          <circle class="cc-pulse" cx="572" cy="206" r="2.5" fill="${r.energyMain}" />
        </g>

        <g class="cc-wing-far" style="transform-origin: 344px 170px;">
          ${e.map(e=>eN(e,r,t)).join("")}
          <path d="M 308 176 L 352 102 L 420 56 L 444 74 L 382 140 L 348 182 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.6" />
          <path class="cc-pulse" d="M 338 154 L 408 82" stroke="${r.energyMain}" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 384 82 L 420 56 L 434 68 L 402 94 Z" fill="${r.accentMain}" stroke="${r.seamStroke}" stroke-width="1" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 344px 242px;">
          ${o.map(e=>eN(e,r,t)).join("")}
          <path d="M 308 236 L 352 310 L 420 356 L 444 338 L 382 272 L 348 230 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.6" />
          <path class="cc-pulse" d="M 338 258 L 408 330" stroke="${r.energyMain}" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 384 330 L 420 356 L 434 344 L 402 318 Z" fill="${r.accentMain}" stroke="${r.seamStroke}" stroke-width="1" />
        </g>

        <path d="M 88 206 C 88 148, 178 134, 316 150 L 352 174 L 352 238 L 316 262 C 178 278, 88 264, 88 206 Z" fill="url(#${t}-head-vol)" stroke="${r.seamStroke}" stroke-width="1.7" />
        <path d="M 106 206 L 348 206" stroke="${r.seamStroke}" stroke-width="1.3" />
        <path d="M 164 152 C 168 186, 168 226, 164 260" fill="none" stroke="${r.seamStroke}" stroke-width="1.2" />
        <path d="M 244 146 C 248 186, 248 226, 244 266" fill="none" stroke="${r.seamStroke}" stroke-width="1.2" />

        <circle cx="148" cy="176" r="7.5" fill="${r.frameMain}" stroke="${r.seamStroke}" stroke-width="1.2" />
        <circle class="cc-pulse" cx="148" cy="176" r="3.6" fill="${r.energyBright}" />
        <circle cx="148" cy="236" r="7.5" fill="${r.frameMain}" stroke="${r.seamStroke}" stroke-width="1.2" />
        <circle class="cc-pulse" cx="148" cy="236" r="3.6" fill="${r.energyBright}" />

        <circle cx="282" cy="206" r="14" fill="${r.frameMain}" stroke="${r.seamStroke}" stroke-width="1.5" />
        <circle cx="282" cy="206" r="9" fill="${r.frameDark}" stroke="${r.accentMain}" stroke-width="2.5" />
        <circle class="cc-pulse" cx="282" cy="206" r="4" fill="${r.energyBright}" />
      </g>
    </g>
  `}return eL(r,t,a)}if("serpent"===e.creature)return"dive"===e.view?`
    <g transform="translate(460, 198) rotate(14) scale(0.88) translate(-460, -210)">
      ${eT(r,t,a)}
    </g>
  `:"top"===e.view?`
    <g transform="${eF(a)}">
      <g class="cc-float">
        ${eN({x:256,y:196,length:178,width:26,angle:-162,curve:-18,orangeTip:!0,greenTip:a>=4,animClass:"cc-c1"},r,t)}
        ${eN({x:256,y:216,length:178,width:26,angle:162,curve:18,orangeTip:!0,greenTip:a>=4,animClass:"cc-c2"},r,t)}
        ${eM({d:"M 264 206 C 190 194, 130 218, 68 206",tipX:68,tipY:206,tipAngle:180,variant:"ceramic",width:3.4,tipColor:"green",animClass:"cc-c3",originX:264,originY:206},r)}

        <g class="cc-wing-far" style="transform-origin: 580px 180px;">
          ${[0,1,2,3].slice(0,a<=2?2:4).map(e=>eN({x:560-16*e,y:170-16*e,length:118-10*e,width:24,angle:-145+6*e,curve:-10,orangeFull:1===e,orangeTip:!0,animClass:`cc-f${e+1}`},r,t)).join("")}
          <path d="M 596 184 L 542 108 L 474 62 L 456 80 L 520 132 L 566 192 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.5" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 580px 232px;">
          ${[0,1,2,3].slice(0,a<=2?2:4).map(e=>eN({x:560-16*e,y:242+16*e,length:118-10*e,width:24,angle:145-6*e,curve:10,orangeFull:1===e,orangeTip:!0,animClass:`cc-f${e+2}`},r,t)).join("")}
          <path d="M 596 228 L 542 304 L 474 350 L 456 332 L 520 280 L 566 220 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.5" />
        </g>

        <!-- Continuous Undulating Spine Carapace -->
        <path d="M 262 184 C 340 144, 440 226, 536 184 C 608 156, 668 182, 720 184 L 720 228 C 668 226, 608 200, 536 228 C 440 270, 340 188, 262 228 Z" fill="url(#${t}-armor-d)" stroke="${r.seamStroke}" stroke-width="1.5" />
        ${[0,1,2,3,4,5,6].map(e=>{let t=206+16*Math.sin(.9*e);return`<circle cx="${316+56*e}" cy="${t}" r="3.2" fill="${r.energyMain}" class="cc-pulse" />`}).join("")}

        <path d="M 702 182 C 744 166, 816 174, 854 206 C 816 238, 744 246, 702 230 Z" fill="url(#${t}-head-vol)" stroke="${r.seamStroke}" stroke-width="1.65" />
        <path d="M 720 206 L 844 206" stroke="${r.seamStroke}" stroke-width="1.2" />
        <circle cx="808" cy="192" r="5" fill="${r.energyMain}" class="cc-pulse" />
        <circle cx="808" cy="220" r="5" fill="${r.energyMain}" class="cc-pulse" />
      </g>
    </g>
  `:eT(r,t,a);return"dive"===e.view?`
    <g transform="translate(460, 198) rotate(-14) scale(0.88) translate(-460, -210)">
      ${eA(r,t,a)}
    </g>
  `:"top"===e.view?`
    <g transform="${eF(a)}">
      <g class="cc-float">
        ${eM({d:"M 510 198 C 620 184, 730 162, 856 176",tipX:856,tipY:176,tipAngle:8,variant:"ceramic",width:3.2,tipColor:"orange",animClass:"cc-c1",originX:510,originY:198},r)}
        ${eM({d:"M 510 214 C 620 228, 730 250, 856 236",tipX:856,tipY:236,tipAngle:-8,variant:"armored",width:3.4,tipColor:"green",animClass:"cc-c2",originX:510,originY:214},r)}

        <g class="cc-wing-far" style="transform-origin: 310px 180px;">
          ${[0,1,2,3].slice(0,a<=2?2:4).map(e=>eN({x:332+36*e,y:152-24*e,length:102,width:22,angle:-24+5*e,curve:-8,orangeTip:!0,greenTip:2===e,animClass:`cc-f${e+1}`},r,t)).join("")}
          <path d="M 220 184 C 280 120, 390 66, 512 44 L 460 126 L 348 184 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.6" />
          <path d="M 456 62 L 512 44 L 494 74 L 444 86 Z" fill="${r.accentMain}" stroke="${r.seamStroke}" stroke-width="1.1" />
        </g>

        <g class="cc-wing-near" style="transform-origin: 310px 232px;">
          ${[0,1,2,3].slice(0,a<=2?2:4).map(e=>eN({x:332+36*e,y:260+24*e,length:102,width:22,angle:24-5*e,curve:8,orangeTip:!0,greenTip:2===e,animClass:`cc-f${e+2}`},r,t)).join("")}
          <path d="M 220 228 C 280 292, 390 346, 512 368 L 460 286 L 348 228 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.6" />
          <path d="M 456 350 L 512 368 L 494 338 L 444 326 Z" fill="${r.accentMain}" stroke="${r.seamStroke}" stroke-width="1.1" />
        </g>

        <path d="M 140 206 L 236 160 L 512 192 L 512 220 L 236 252 Z" fill="url(#${t}-head-vol)" stroke="${r.seamStroke}" stroke-width="1.6" />
        <path d="M 184 182 L 96 168 L 128 194 L 194 196 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.3" />
        <path d="M 184 230 L 96 244 L 128 218 L 194 216 Z" fill="url(#${t}-armor-v)" stroke="${r.seamStroke}" stroke-width="1.3" />
        <polygon class="cc-pulse" points="296,194 330,206 296,218 262,206" fill="${r.energyMain}" stroke="${r.seamStroke}" stroke-width="1.2" />
      </g>
    </g>
  `:eA(r,t,a)}function eD(e,t="cc"){let r=ey(e),a=eS(e.animationSpeed),o=eE(r,t),s="transparent"!==r.background?`<rect x="0" y="0" width="920" height="460" fill="${e$(r.background)}" />`:"",i=eR(e,t),n=e.showHud?-8:12,l=function(e,t,r){if(!e.showHud)return"";let a=e$(function(e){let{stage:t,rank:r}=ek(e.commits),a=ew(e.creature),o=e.customTitle.trim()?e.customTitle.trim().toUpperCase():`${r} ${a.name.toUpperCase()}`,s=Math.max(0,Math.floor(e.commits||0)).toLocaleString("en-US");return`STAGE ${t}: ${o} // COMMITS: ${s}`}(e)),{stage:o}=ek(e.commits),s=ew(e.creature),i=`${e.animationSpeed.toFixed(1)}X`,n=e.view.toUpperCase(),l=(e.languages??[]).slice(0,3).map((e,t)=>{let r=62+124*t,a=e$(e.name.toUpperCase().slice(0,11)),o=e$(e.color);return`
        <rect x="${r}" y="432.5" width="7.5" height="7.5" rx="1.5" fill="${o}" />
        <text x="${r+12}" y="440" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" font-weight="600">${a}</text>
      `}).join(""),c=[{num:1,code:"1.PRTO"},{num:2,code:"2.RCON"},{num:3,code:"3.ARMR"},{num:4,code:"4.APEX"},{num:5,code:"5.ASCD"}].map((e,a)=>{let s=e.num===o,i=e.num<=o;return`<text id="${r}-stage-pip-${e.num}" x="${576+62*a}" y="440" fill="${s?t.energyBright:i?"#C9D1D9":"#484F58"}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" font-weight="${s?"700":"500"}">${e.code}</text>`}).join("");return`
    <g>
      <rect x="20" y="406" width="880" height="46" rx="8" fill="url(#${r}-hud-bg)" stroke="#30363D" stroke-width="1.2" />
      <path d="M 24 406 L 20 410 L 20 448 L 24 452 L 28 452 L 28 406 Z" fill="${t.accentMain}" />
      <circle class="cc-hud-blink" cx="44" cy="422" r="4.2" fill="${t.energyMain}" />
      <text id="${r}-hud-label" x="58" y="426" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5" font-weight="700" letter-spacing="0.6">${a}</text>
      <text x="884" y="426" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10.5" font-weight="600" text-anchor="end">${e$(s.designation)} // ${n} // ${i}</text>
      ${l}
      ${c}
    </g>
  `}(e,r,t);return`
    <style>${a}</style>
    ${o}
    ${s}
    <g transform="translate(0, ${n})">
      ${i}
    </g>
    ${l}
  `.trim()}function eB({config:e,className:a=""}){let o=(0,r.useId)(),s=(0,r.useMemo)(()=>`cc-${o.replace(/[^a-zA-Z0-9_-]/g,"")}`,[o]),i=(0,r.useMemo)(()=>eD(e,s),[e,s]),n=ew(e.creature);return(0,t.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 920 460",role:"img","aria-label":`${n.name} (${n.subtitle})`,className:a,dangerouslySetInnerHTML:{__html:i}})}let eU={TypeScript:"#3178C6",JavaScript:"#F1E05A",Python:"#3572A5",Rust:"#DEA584",Go:"#00ADD8",Java:"#B07219","C++":"#F34B7D",C:"#555555","C#":"#178600",PHP:"#4F5D95",Ruby:"#701516",Swift:"#F05138",Kotlin:"#A97BFF",Dart:"#00B4AB",HTML:"#E34C26",CSS:"#563D7C",SCSS:"#C6538C",Shell:"#89E051",Vue:"#41B883",Svelte:"#FF3E00",Lua:"#000080",Scala:"#C22D40",Elixir:"#6E4A7E",Haskell:"#5E5086",Solidity:"#AA6746",Astro:"#FF5A03"};async function eO(e){let t=e.trim().replace(/^@/,"");if(!t)throw Error("Please enter a valid GitHub username.");let r={Accept:"application/vnd.github+json"},[a,o]=await Promise.all([fetch(`https://api.github.com/users/${encodeURIComponent(t)}`,{headers:r}),fetch(`https://api.github.com/users/${encodeURIComponent(t)}/repos?per_page=100&sort=updated`,{headers:r})]);if(404===a.status)throw Error(`GitHub user "@${t}" was not found.`);if(403===a.status)throw Error("GitHub API rate limit reached. Try again in a minute.");if(!a.ok)throw Error(`Failed to fetch GitHub profile (${a.status}).`);let s=await a.json(),i=o.ok?await o.json():[],n=new Map,l=0;for(let e of i){if(l+=e.stargazers_count??0,!e.language)continue;let t=e.fork?1:Math.max(2,Math.min(20,Math.round((e.size??10)/100)+2));n.set(e.language,(n.get(e.language)??0)+t)}let c=Array.from(n.values()).reduce((e,t)=>e+t,0),d=Array.from(n.entries()).sort((e,t)=>t[1]-e[1]).slice(0,3).map(([e,t])=>({name:e,color:eU[e]??"#8B949E",share:c>0?Math.max(1,Math.round(t/c*100)):33})),m=Math.max(40,42*s.public_repos+15*l),p="Estimated from public repositories & stars";try{let e=await fetch(`https://api.github.com/search/commits?q=author:${encodeURIComponent(s.login)}&per_page=1`,{headers:r});if(e.ok){let t=await e.json();"number"==typeof t.total_count&&t.total_count>0&&(m=t.total_count,p="Public commit count via GitHub Search API")}}catch{}return{username:s.login,displayName:s.name||s.login,avatarUrl:s.avatar_url,bio:s.bio||"Open-source builder & cybernetic creature keeper.",publicRepos:s.public_repos,followers:s.followers,totalStars:l,estimatedCommits:m,languages:d.length>0?d:[{name:"Markdown",color:"#083FA1",share:100}],sourceNote:p}}function eP(e,t){let r=t.snapshot?.languages??e.languages,a=t.commitsOverride,o=t.snapshot?.username??t.inputUsername,s={...e,creature:t.creature,commits:a,username:o,languages:r,customTitle:""};return t.useLanguageColors?eb(s,r):s}function eI({baseConfig:e}){let[a,o]=(0,r.useState)({inputUsername:e.username||"PathumSandeepa",creature:e.creature,useLanguageColors:!0,loading:!1,error:null,snapshot:null,commitsOverride:1680}),[s,i]=(0,r.useState)({inputUsername:"octocat",creature:"serpent",useLanguageColors:!0,loading:!1,error:null,snapshot:null,commitsOverride:640});async function n(e){let t="left"===e?a:s,r="left"===e?o:i;r(e=>({...e,loading:!0,error:null}));try{let e=await eO(t.inputUsername);r(t=>({...t,loading:!1,snapshot:e,commitsOverride:e.estimatedCommits}))}catch(e){r(t=>({...t,loading:!1,error:e instanceof Error?e.message:"Failed to fetch profile."}))}}let l=eP(ep,a),c=eP(ep,s),d=ek(a.commitsOverride),m=ek(s.commitsOverride);function p(e,r,a,o){let s=ek(r.commitsOverride);return(0,t.jsxs)("div",{className:"flex flex-col rounded-xl border border-[#30363d] bg-[#0d1117] p-4 shadow-xl",children:[(0,t.jsxs)("form",{onSubmit:t=>{t.preventDefault(),n(e)},className:"flex gap-2",children:[(0,t.jsx)("input",{type:"text",value:r.inputUsername,onChange:e=>a(t=>({...t,inputUsername:e.target.value})),placeholder:"GitHub username",className:"flex-1 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 font-mono text-xs text-white placeholder-[#6e7681] focus:border-[#FF6B00] focus:outline-none"}),(0,t.jsxs)("button",{type:"submit",disabled:r.loading,className:"inline-flex items-center gap-1.5 rounded-lg bg-[#21262d] px-3.5 py-2 text-xs font-semibold text-[#e6edf3] transition hover:bg-[#30363d] disabled:opacity-50",children:[r.loading?(0,t.jsx)(D,{className:"h-3.5 w-3.5 animate-spin"}):(0,t.jsx)(P,{className:"h-3.5 w-3.5"}),"Sync"]})]}),r.error&&(0,t.jsx)("p",{className:"mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300",children:r.error}),(0,t.jsxs)("div",{className:"mt-3 flex flex-wrap items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex gap-1.5",children:el.map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>a(t=>({...t,creature:e.id})),className:`rounded-md border px-2 py-1 text-[11px] font-medium transition ${r.creature===e.id?"border-[#FF6B00] bg-[#FF6B00]/15 text-white":"border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white"}`,children:e.name.replace("Cyber-","")},e.id))}),(0,t.jsxs)("button",{type:"button",onClick:()=>a(e=>({...e,useLanguageColors:!e.useLanguageColors})),className:`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${r.useLanguageColors?"border-[#00E676]/60 bg-[#00E676]/15 text-[#00E676]":"border-[#30363d] bg-[#161b22] text-[#8b949e]"}`,children:[(0,t.jsx)(U,{className:"h-3 w-3"}),r.useLanguageColors?"Lang Palette":"Canonical"]})]}),(0,t.jsx)("div",{className:"mt-3 overflow-hidden rounded-lg border border-[#21262d] bg-[#07090d] p-2",children:(0,t.jsx)(eB,{config:o,className:"mx-auto block h-auto w-full"})}),(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-3 gap-2 rounded-lg border border-[#21262d] bg-[#161b22]/60 p-3 text-center",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"text-[10px] uppercase text-[#8b949e]",children:"Stage"}),(0,t.jsxs)("div",{className:"mt-0.5 font-mono text-xs font-bold text-[#00E676]",children:[s.stage," · ",s.rank]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"text-[10px] uppercase text-[#8b949e]",children:"Commits"}),(0,t.jsx)("input",{type:"number",min:0,value:r.commitsOverride,onChange:e=>a(t=>({...t,commitsOverride:Math.max(0,parseInt(e.target.value||"0",10))})),"aria-label":"Simulated commits",className:"mt-0.5 w-full rounded border border-[#30363d] bg-[#0d1117] px-1.5 py-0.5 text-center font-mono text-xs font-bold text-white focus:border-[#00E676] focus:outline-none"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"text-[10px] uppercase text-[#8b949e]",children:"Repos"}),(0,t.jsx)("div",{className:"mt-0.5 font-mono text-xs font-bold text-[#e6edf3]",children:r.snapshot?r.snapshot.publicRepos:"—"})]})]}),(0,t.jsx)("div",{className:"mt-3 flex flex-wrap items-center gap-2",children:o.languages.map(e=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1.5 rounded-full border border-[#30363d] bg-[#161b22] px-2.5 py-0.5 font-mono text-[11px] text-[#c9d1d9]",children:[(0,t.jsx)("span",{className:"h-2.5 w-2.5 rounded-full",style:{backgroundColor:e.color}}),e.name]},e.name))})]})}return(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#21262d] bg-[#161b22]/75 p-5",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E676]/40 bg-[#00E676]/10 text-[#00E676]",children:(0,t.jsx)(Q,{className:"h-5 w-5"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"text-base font-bold text-white",children:"Side-by-Side GitHub Creature Comparator"}),(0,t.jsx)("p",{className:"text-xs text-[#8b949e]",children:"Fetch two GitHub developers via public API to compare evolution stages, top language palettes, and chassis specs."})]})]}),(0,t.jsxs)("button",{type:"button",onClick:()=>{n("left"),n("right")},className:"inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff7f24]",children:[(0,t.jsx)(eC,{className:"h-3.5 w-3.5"}),"Sync Both Profiles"]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 items-center gap-3 rounded-xl border border-[#21262d] bg-[#0d1117] px-5 py-3.5 sm:grid-cols-3",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 font-mono text-xs",children:[(0,t.jsx)(_,{className:"h-4 w-4 text-[#FF6B00]"}),(0,t.jsxs)("span",{className:"font-bold text-white",children:["@",l.username]}),(0,t.jsxs)("span",{className:"text-[#00E676]",children:["(Stage ",d.stage," ",d.rank,")"]})]}),(0,t.jsxs)("div",{className:"text-center font-mono text-[11px] text-[#8b949e]",children:[(0,t.jsx)(E,{className:"mr-1 inline h-3.5 w-3.5"}),"DELTA:"," ",Math.abs(a.commitsOverride-s.commitsOverride).toLocaleString("en-US")," ","COMMITS"]}),(0,t.jsxs)("div",{className:"flex items-center justify-end gap-2 font-mono text-xs",children:[(0,t.jsxs)("span",{className:"text-[#00E676]",children:["(Stage ",m.stage," ",m.rank,")"]}),(0,t.jsxs)("span",{className:"font-bold text-white",children:["@",c.username]})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 gap-6 lg:grid-cols-2",children:[p("left",a,o,l),p("right",s,i,c)]})]})}function eG({config:e,onSelectCommits:r,onSelectView:a}){let o=ek(e.commits),s=ew(e.creature);return(0,t.jsxs)("div",{className:"space-y-8",children:[(0,t.jsxs)("section",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/70 p-5",children:[(0,t.jsxs)("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-2",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("h2",{className:"flex items-center gap-2 text-base font-bold text-white",children:[(0,t.jsx)(m,{className:"h-4 w-4 text-[#FF6B00]"}),"Camera Perspectives (",s.name,")"]}),(0,t.jsx)("p",{className:"text-xs text-[#8b949e]",children:"Click any perspective to apply it to your live Studio export."})]}),(0,t.jsxs)("span",{className:"rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 font-mono text-[11px] text-[#00E676]",children:["ACTIVE: ",e.view.toUpperCase()]})]}),(0,t.jsx)("div",{className:"grid grid-cols-1 gap-4 md:grid-cols-3",children:ec.map(r=>{let o=e.view===r.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>a(r.id),className:`flex flex-col rounded-xl border p-3.5 text-left transition ${o?"border-[#FF6B00] bg-[#FF6B00]/10":"border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"}`,children:[(0,t.jsxs)("div",{className:"mb-2 flex w-full items-center justify-between",children:[(0,t.jsxs)("span",{className:"font-mono text-xs font-bold text-white",children:["view: ",r.id]}),(0,t.jsx)("span",{className:"text-[11px] text-[#8b949e]",children:r.name})]}),(0,t.jsx)("div",{className:"w-full overflow-hidden rounded-lg border border-[#21262d] bg-[#07090d] p-1",children:(0,t.jsx)(eB,{config:{...e,view:r.id,showHud:!1},className:"h-auto w-full"})}),(0,t.jsx)("p",{className:"mt-2.5 text-xs leading-relaxed text-[#8b949e]",children:r.description})]},r.id)})})]}),(0,t.jsxs)("section",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/70 p-5",children:[(0,t.jsxs)("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-2",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("h2",{className:"flex items-center gap-2 text-base font-bold text-white",children:[(0,t.jsx)(A,{className:"h-4 w-4 text-[#00E676]"}),"Evolution Stages (0 → 2,500+ Contributions)"]}),(0,t.jsx)("p",{className:"text-xs text-[#8b949e]",children:"Your cybernetic creature physically scales in wingspan, feather count, armor plating, and tail cables as your commits grow."})]}),(0,t.jsxs)("span",{className:"rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 font-mono text-[11px] text-[#FF6B00]",children:["CURRENT: STAGE ",o.stage," (",o.rank,")"]})]}),(0,t.jsx)("div",{className:"grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",children:ed.map(a=>{let s=o.stage===a.stage;return(0,t.jsxs)("button",{type:"button",onClick:()=>r(a.sampleCommits),className:`flex flex-col rounded-xl border p-3.5 text-left transition ${s?"border-[#00E676] bg-[#00E676]/10":"border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"}`,children:[(0,t.jsxs)("div",{className:"mb-2 flex w-full items-center justify-between",children:[(0,t.jsxs)("span",{className:"font-mono text-xs font-bold text-white",children:["Stage ",a.stage,": ",a.rank]}),(0,t.jsxs)("span",{className:"rounded border border-[#30363d] bg-[#161b22] px-2 py-0.5 font-mono text-[10px] text-[#8b949e]",children:[a.rangeLabel," commits"]})]}),(0,t.jsx)("div",{className:"w-full overflow-hidden rounded-lg border border-[#21262d] bg-[#07090d] p-1",children:(0,t.jsx)(eB,{config:{...e,commits:a.sampleCommits,customTitle:"",showHud:!0},className:"h-auto w-full"})}),(0,t.jsx)("p",{className:"mt-2.5 text-xs leading-relaxed text-[#8b949e]",children:a.unlocks})]},a.stage)})})]})]})}let eH={name:"book-open",size:24,node:[["path",{d:"M12 5v16",key:"1f6ucr"}],["path",{d:"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",key:"1fyvmf"}]]};eH.node;let ez=n(eH),eY={name:"building-complex",size:24,node:[["path",{d:"M10 12h4",key:"a56b0p"}],["path",{d:"M10 8h4",key:"1sr2af"}],["path",{d:"M14 21v-3a2 2 0 0 0-4 0v3",key:"1rgiei"}],["path",{d:"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",key:"secmi2"}],["path",{d:"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",key:"16ra0t"}]],aliases:["building-2"]};eY.node;let eX=n(eY),eZ={name:"external-link",size:24,node:[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]};eZ.node;let e_=n(eZ),eV={name:"link-2",size:24,node:[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]};eV.node;let eW=n(eV),eq={name:"map-pin",size:24,node:[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]};eq.node;let eK=n(eq);function eJ(e,t="sc"){let r=ey(e),a=eS(e.animationSpeed),o=eE(r,t),s=ek(e.commits),i=ew(e.creature),n=eR(e,t),l=e$(e.username.trim()||"PathumSandeepa"),c=e.customTitle.trim()?e$(e.customTitle.trim().toUpperCase()):e$(`${s.rank} ${i.name.toUpperCase()}`),d=Math.max(0,Math.floor(e.commits||0)).toLocaleString("en-US"),m="annual"===e.windowMode?"ANNUAL":"365D ROLLING",p=(e.languages??[]).slice(0,3).map((e,t)=>{let r=44+146*t;return`
        <rect x="${r}" y="592" width="10" height="10" rx="2" fill="${e$(e.color)}" />
        <text x="${r+16}" y="601" fill="#C9D1D9" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="13" font-weight="600">${e$(e.name.toUpperCase().slice(0,12))}</text>
      `}).join(""),x=ed.map((e,t)=>{let a=768+96*t,o=e.stage===s.stage,i=e.stage<=s.stage;return`
      <rect x="${a}" y="576" width="84" height="28" rx="6" fill="${o?r.accentMain:i?"#1F2937":"#0D1117"}" fill-opacity="${o?"0.22":"0.9"}" stroke="${o?r.accentMain:i?r.energyMain:"#30363D"}" stroke-width="${o?"1.6":"1"}" />
      <text x="${a+42}" y="594" fill="${o?"#FFFFFF":i?r.energyBright:"#6E7681"}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="${o?"700":"600"}" text-anchor="middle">${e.shortCode}</text>
    `}).join("");return`
    <style>${a}</style>
    ${o}
    <!-- Canvas Backdrop -->
    <rect x="0" y="0" width="1280" height="640" fill="#070B12" />
    <!-- Subtle Blueprint Grid -->
    <g stroke="#162032" stroke-width="1" opacity="0.55">
      <line x1="0" y1="160" x2="1280" y2="160" />
      <line x1="0" y1="320" x2="1280" y2="320" />
      <line x1="0" y1="480" x2="1280" y2="480" />
      <line x1="320" y1="0" x2="320" y2="640" />
      <line x1="640" y1="0" x2="640" y2="640" />
      <line x1="960" y1="0" x2="960" y2="640" />
    </g>

    <!-- Outer Telemetry Frame -->
    <rect x="20" y="20" width="1240" height="600" rx="14" fill="none" stroke="#1F6FEB" stroke-opacity="0.7" stroke-width="2" />
    <rect x="26" y="26" width="1228" height="588" rx="10" fill="none" stroke="#30363D" stroke-width="1" />

    <!-- Top Header Strip -->
    <rect x="28" y="28" width="1224" height="48" rx="8" fill="#0D1117" fill-opacity="0.92" />
    <line x1="28" y1="76" x2="1252" y2="76" stroke="#21262D" stroke-width="1.5" />
    <circle class="cc-hud-blink" cx="50" cy="52" r="5" fill="${r.energyMain}" />
    <text x="66" y="57" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" letter-spacing="1.2">DYNAMIC-README-CREATURE // @${l}</text>
    <text x="1232" y="57" fill="${r.accentMain}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700" text-anchor="end">STAGE ${s.stage}: ${c}</text>

    <!-- Centered Creature Showcase -->
    <g transform="translate(150, 72) scale(1.06)">
      ${n}
    </g>

    <!-- Bottom Telemetry Panel -->
    <rect x="28" y="514" width="1224" height="98" rx="8" fill="#0D1117" fill-opacity="0.92" />
    <line x1="28" y1="514" x2="1252" y2="514" stroke="#21262D" stroke-width="1.5" />
    <rect x="44" y="534" width="10" height="10" rx="2" fill="${r.energyMain}" />
    <text x="62" y="544" fill="#E6EDF3" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="15" font-weight="700">STAGE ${s.stage}: ${c}</text>
    <text x="44" y="570" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="14" font-weight="600">CONTRIBUTIONS (${m}): <tspan fill="#FFFFFF">${d}</tspan>  •  VIEW: ${e.view.toUpperCase()}</text>
    ${p}

    <!-- Evolution Stage Rail -->
    <text x="768" y="556" fill="#8B949E" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="600" letter-spacing="0.8">EVOLUTION PROGRESSION (0 → 2,500+)</text>
    ${x}
  `.trim()}function eQ({config:e,className:a=""}){let o=(0,r.useId)(),s=(0,r.useMemo)(()=>`sc-${o.replace(/[^a-zA-Z0-9_-]/g,"")}`,[o]),i=(0,r.useMemo)(()=>eJ(e,s),[e,s]),n=ew(e.creature);return(0,t.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 1280 640",role:"img","aria-label":`${n.name} Social Share Card`,className:a,dangerouslySetInnerHTML:{__html:i}})}let e0=[{id:"cyber-guardian",name:"Full Developer Profile",description:"Title + specialty tags + bio + multi-row badges + CTA links + animated creature"},{id:"minimal-header",name:"Minimalist Header",description:"Clean centered creature banner with headline & tagline"},{id:"auto-evolve-block",name:"Auto-Evolve Marker Block",description:"Drop-in START/END marker block updated daily by GitHub Actions"},{id:"telemetry-stats",name:"Telemetry & Share Card",description:"Creature + live evolution telemetry table + 1280x640 social card"}],e1=[{token:"{{USERNAME}}",description:"GitHub handle"},{token:"{{CREATURE}}",description:"Creature name"},{token:"{{STAGE}}",description:"Evolution stage (1-5)"},{token:"{{RANK}}",description:"Stage rank"},{token:"{{COMMITS}}",description:"Formatted commit count"},{token:"{{VIEW}}",description:"Camera view"},{token:"{{LANGUAGES}}",description:"Top languages"}],e2=new Set(["figma","react","nextjs","tailwindcss","nodejs","html5","css3","typescript","javascript","python","rust","postgres","docker","actions","vscode"]),e6={templateId:"cyber-guardian",headline:"Pathum Sandeepa | Creative Builder",subtitleTags:["FULL-STACK PLATFORMS","CREATIVE CODING","SCALABLE SYSTEMS","UI/UX DESIGN"],bio:"I'm @{{USERNAME}}, a software engineer and creative builder sitting at the intersection of systems engineering and visual craft. You'll usually find me shipping open-source developer tools, generative SVG engines, and high-performance full-stack applications.",ctaLine:"Curious to see what I've been up to? Check out my featured projects & live cybernetic guardian below 👇",align:"left",imageWidth:760,useOutputBranchUrl:!1,includeMarkers:!0,includeTelemetryCaption:!0,includeShareCard:!1,includeStatsTable:!1,includeProjects:!0,customFooterMarkdown:"",badges:[{id:"figma",label:"Figma",color:"F24E1E",logo:"figma",logoColor:"white",category:"design"},{id:"photoshop",label:"Photoshop",color:"31A8FF",logo:"adobephotoshop",logoColor:"white",category:"design"},{id:"illustrator",label:"Illustrator",color:"FF9A00",logo:"adobeillustrator",logoColor:"white",category:"design"},{id:"aftereffects",label:"After Effects",color:"9999FF",logo:"adobeaftereffects",logoColor:"white",category:"design"},{id:"blender",label:"Blender",color:"F5792A",logo:"blender",logoColor:"white",category:"design"},{id:"react",label:"React",color:"20232A",logo:"react",logoColor:"61DAFB",category:"frontend"},{id:"nextjs",label:"Next.js",color:"000000",logo:"nextdotjs",logoColor:"white",category:"frontend"},{id:"tailwindcss",label:"Tailwind CSS",color:"06B6D4",logo:"tailwindcss",logoColor:"white",category:"frontend"},{id:"nodejs",label:"Node.js",color:"339933",logo:"nodedotjs",logoColor:"white",category:"frontend"},{id:"vue",label:"Vue.js",color:"4FC08D",logo:"vuedotjs",logoColor:"white",category:"frontend"},{id:"svelte",label:"Svelte",color:"FF3E00",logo:"svelte",logoColor:"white",category:"frontend"},{id:"html5",label:"HTML5",color:"E34F26",logo:"html5",logoColor:"white",category:"frontend"},{id:"css3",label:"CSS3",color:"1572B6",logo:"css3",logoColor:"white",category:"frontend"},{id:"typescript",label:"TypeScript",color:"3178C6",logo:"typescript",logoColor:"white",category:"languages"},{id:"javascript",label:"JavaScript",color:"323330",logo:"javascript",logoColor:"F7DF1E",category:"languages"},{id:"python",label:"Python",color:"3776AB",logo:"python",logoColor:"white",category:"languages"},{id:"rust",label:"Rust",color:"000000",logo:"rust",logoColor:"white",category:"languages"},{id:"go",label:"Go",color:"00ADD8",logo:"go",logoColor:"white",category:"languages"},{id:"java",label:"Java",color:"ED8B00",logo:"openjdk",logoColor:"white",category:"languages"},{id:"kotlin",label:"Kotlin",color:"7F52FF",logo:"kotlin",logoColor:"white",category:"languages"},{id:"csharp",label:"C#",color:"239120",logo:"sharp",logoColor:"white",category:"languages"},{id:"cpp",label:"C++",color:"00599C",logo:"cplusplus",logoColor:"white",category:"languages"},{id:"shell",label:"Shell Script",color:"121011",logo:"gnubash",logoColor:"white",category:"languages"},{id:"postgres",label:"PostgreSQL",color:"316192",logo:"postgresql",logoColor:"white",category:"backend"},{id:"mongodb",label:"MongoDB",color:"47A248",logo:"mongodb",logoColor:"white",category:"backend"},{id:"redis",label:"Redis",color:"DC382D",logo:"redis",logoColor:"white",category:"backend"},{id:"prisma",label:"Prisma",color:"2D3748",logo:"prisma",logoColor:"white",category:"backend"},{id:"graphql",label:"GraphQL",color:"E10098",logo:"graphql",logoColor:"white",category:"backend"},{id:"docker",label:"Docker",color:"2496ED",logo:"docker",logoColor:"white",category:"devops"},{id:"git",label:"Git",color:"F05032",logo:"git",logoColor:"white",category:"devops"},{id:"actions",label:"GitHub Actions",color:"2088FF",logo:"githubactions",logoColor:"white",category:"devops"},{id:"vscode",label:"VS Code",color:"007ACC",logo:"visualstudiocode",logoColor:"white",category:"devops"},{id:"pnpm",label:"pnpm",color:"F69220",logo:"pnpm",logoColor:"white",category:"devops"},{id:"linux",label:"Linux",color:"FCC624",logo:"linux",logoColor:"black",category:"devops"}].map(e=>({...e,enabled:e2.has(e.id)})),actionLinks:[{id:"github",label:"GITHUB",valueText:"@PathumSandeepa",url:"https://github.com/PathumSandeepa",color:"181717",logo:"github",enabled:!0},{id:"studio",label:"STUDIO",valueText:"CREATURE GENERATOR",url:"https://pathumsandeepa.github.io/dynamic-readme-creature/",color:"FF6B00",logo:"vercel",enabled:!0},{id:"sponsor",label:"SUPPORT",valueText:"STAR THIS PROJECT",url:"https://github.com/PathumSandeepa/dynamic-readme-creature",color:"00E676",logo:"githubsponsors",enabled:!0}],projects:[{id:"proj-1",name:"dynamic-readme-creature",description:"Procedural pure-CSS animated cybernetic creatures & customizable GitHub profile README studio.",url:"https://github.com/PathumSandeepa/dynamic-readme-creature",language:"TypeScript",enabled:!0}],profileDisplayName:"Pathum Sandeepa",profileLocation:"Sri Lanka",profileCompany:"Open Source Builder",profileWebsite:"https://pathumsandeepa.github.io/dynamic-readme-creature/",rawOverride:null};function e4(e,t){let r=t.username.trim()||"PathumSandeepa",a=ew(t.creature),o=ek(t.commits),s=Math.max(0,Math.floor(t.commits||0)).toLocaleString("en-US"),i=t.languages.map(e=>e.name).join(" · ");return e.replaceAll("{{USERNAME}}",r).replaceAll("{{CREATURE}}",a.name).replaceAll("{{STAGE}}",String(o.stage)).replaceAll("{{RANK}}",o.rank).replaceAll("{{COMMITS}}",s).replaceAll("{{VIEW}}",t.view.toUpperCase()).replaceAll("{{LANGUAGES}}",i)}function e3(e,t,r="creature.svg"){let a=e.username.trim()||"PathumSandeepa";return t.useOutputBranchUrl?`https://raw.githubusercontent.com/${a}/${a}/output/${r}`:`./${r}`}function e5(e,t){let r=e.username.trim()||"PathumSandeepa",a=ew(e.creature),o=ek(e.commits),s=Math.max(0,Math.floor(e.commits||0)).toLocaleString("en-US"),i=e3(e,t,"creature.svg"),n=[];return t.includeMarkers&&n.push("<!-- CYBER-CREATURE:START -->"),n.push('<p align="center">'),n.push('  <a href="https://github.com/PathumSandeepa/dynamic-readme-creature">'),n.push(`    <img src="${i}" width="${t.imageWidth}" alt="${a.name} - Stage ${o.stage} ${o.rank}" />`),n.push("  </a>"),n.push("</p>"),t.includeTelemetryCaption&&(n.push(""),n.push(`<p align="center"><sub>Live <code>dynamic-readme-creature</code> for <strong>@${r}</strong> — <strong>Stage ${o.stage}: ${o.rank} ${a.name}</strong> \xb7 <code>${s} commits</code> \xb7 View: <code>${e.view}</code></sub></p>`)),t.includeMarkers&&n.push("<!-- CYBER-CREATURE:END -->"),n.join("\n")}function e8(e,t){let r=e.username.trim()||"PathumSandeepa",a=ew(e.creature),o=ek(e.commits),s=Math.max(0,Math.floor(e.commits||0)).toLocaleString("en-US"),i=e5(e,t);if("auto-evolve-block"===t.templateId)return i;let n=[],l=e4(t.headline,e).trim(),c=e4(t.bio,e).trim(),d=e4(t.ctaLine,e).trim();if(l&&n.push(`## ${l}`),t.subtitleTags.length>0&&"minimal-header"!==t.templateId){let e=t.subtitleTags.map(e=>e.trim().toUpperCase()).filter(Boolean).join(" | ");e&&n.push(`**${e}**`)}c&&n.push(c),d&&"minimal-header"!==t.templateId&&n.push(d);let m=t.badges.filter(e=>e.enabled&&e.label.trim());if(m.length>0&&"minimal-header"!==t.templateId){let e=m.map(e=>{let t,r,a;return`  <img src="${t=encodeURIComponent(e.label.trim().replace(/-/g,"--")),r=e.color.replace("#","")||"1F242D",a=new URLSearchParams({style:"for-the-badge"}),e.logo&&a.set("logo",e.logo),e.logoColor&&a.set("logoColor",e.logoColor),`https://img.shields.io/badge/${t}-${r}?${a.toString()}`}" alt="${e.label.trim()}" />`}).join("\n");n.push(`<p align="${t.align}">
${e}
</p>`)}let p=t.actionLinks.filter(e=>e.enabled&&e.label.trim());if(p.length>0&&"minimal-header"!==t.templateId){let r=p.map(t=>{let r,a,o,s,i=e4(t.url,e);return`  <a href="${i}"><img src="${r=encodeURIComponent(t.label.trim().replace(/-/g,"--")||"LINK"),a=encodeURIComponent(t.valueText.trim().replace(/-/g,"--")||"OPEN"),o=t.color.replace("#","")||"FF6B00",s=new URLSearchParams({style:"for-the-badge",labelColor:"1F242D"}),t.logo&&s.set("logo",t.logo),s.set("logoColor","white"),`https://img.shields.io/badge/${r}-${a}-${o}?${s.toString()}`}" alt="${t.label}" /></a>`}).join("\n");n.push(`<p align="${t.align}">
${r}
</p>`)}if(n.push(i),t.includeStatsTable&&"minimal-header"!==t.templateId){let t=e.languages.map(e=>`\`${e.name}\``).join(" · ");n.push(`### Cybernetic Telemetry

| Metric | Active Value |
| --- | --- |
| **Guardian Chassis** | ${a.name} (\`${a.designation}\`) |
| **Evolution Stage** | Stage ${o.stage} / 5 — **${o.rank}** |
| **Contributions (${e.windowMode})** | \`${s}\` commits |
| **Camera Angle** | \`${e.view}\` |
| **Top Languages** | ${t} |`)}if(t.includeProjects&&"minimal-header"!==t.templateId){let r=t.projects.filter(e=>e.enabled&&e.name.trim());if(r.length>0){let t=r.map(t=>`| **[${t.name}](${e4(t.url,e)})** | ${e4(t.description,e)} | \`${t.language}\` |`).join("\n");n.push(["### Featured Projects\n\n| Project | Description | Stack |\n| --- | --- | --- |",t].join("\n"))}}if(t.includeShareCard){let a=e3(e,t,"share-card.svg");n.push(`### Annual Share Card

<p align="center">
  <img src="${a}" width="${t.imageWidth}" alt="@${r} Cyber Creature Share Card" />
</p>`)}return t.customFooterMarkdown.trim()&&n.push(e4(t.customFooterMarkdown.trim(),e)),n.join("\n\n")}function e7(e,t){return null!==t.rawOverride?e4(t.rawOverride,e):e8(e,t)}function e9({creatureConfig:e,readmeConfig:r,ghSnapshot:a,showProfileSidebar:o=!0,showGridBackdrop:s=!1,onEditClick:i}){let n=e.username.trim()||"PathumSandeepa",l=ew(e.creature),c=ek(e.commits),d=e4(r.headline,e),m=e4(r.bio,e),p=e4(r.ctaLine,e),x=e4(r.customFooterMarkdown,e),h=a?.displayName||r.profileDisplayName||n,g=a?.avatarUrl,u=(0,t.jsxs)("div",{className:"overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-4 py-2 text-xs",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 font-mono",children:[(0,t.jsx)(ez,{className:"h-3.5 w-3.5 text-[#8b949e]"}),(0,t.jsx)("span",{className:"font-semibold text-[#e6edf3]",children:n}),(0,t.jsx)("span",{className:"text-[#8b949e]",children:"/"}),(0,t.jsx)("span",{className:"font-semibold text-[#e6edf3]",children:"README.md"})]}),i&&(0,t.jsxs)("button",{type:"button",onClick:i,className:"inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] font-medium text-[#8b949e] transition hover:border-[#00E676] hover:text-[#00E676]",children:[(0,t.jsx)(j,{className:"h-3 w-3"}),"Customize README"]})]}),(0,t.jsxs)("div",{className:"space-y-4 p-5 sm:p-6",children:["auto-evolve-block"!==r.templateId&&(0,t.jsxs)(t.Fragment,{children:[d&&(0,t.jsx)("h2",{className:"border-b border-[#21262d] pb-2 text-xl font-bold text-[#e6edf3]",children:d}),r.subtitleTags.length>0&&"minimal-header"!==r.templateId&&(0,t.jsx)("p",{className:"font-mono text-[11px] font-bold tracking-wider text-[#c9d1d9]",children:r.subtitleTags.map(e=>e.trim().toUpperCase()).filter(Boolean).join(" | ")}),m&&(0,t.jsx)("p",{className:"text-sm leading-relaxed text-[#c9d1d9]",children:m}),p&&"minimal-header"!==r.templateId&&(0,t.jsx)("p",{className:"text-sm text-[#c9d1d9]",children:p}),"minimal-header"!==r.templateId&&r.badges.some(e=>e.enabled)&&(0,t.jsx)("div",{className:`flex flex-wrap gap-1.5 pt-1 ${"center"===r.align?"justify-center":"justify-start"}`,children:r.badges.filter(e=>e.enabled).map(e=>(0,t.jsx)("span",{className:"inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",style:{backgroundColor:`#${e.color.replace("#","")}`,color:"FCC624"===e.color.toUpperCase()?"#111111":"#FFFFFF"},children:e.label},e.id))}),"minimal-header"!==r.templateId&&r.actionLinks.some(e=>e.enabled)&&(0,t.jsx)("div",{className:`flex flex-wrap gap-2 pt-1 ${"center"===r.align?"justify-center":"justify-start"}`,children:r.actionLinks.filter(e=>e.enabled).map(r=>(0,t.jsxs)("a",{href:e4(r.url,e),target:"_blank",rel:"noreferrer",className:"inline-flex overflow-hidden rounded-[3px] border border-[#30363d]/60 font-mono text-[10px] font-bold uppercase tracking-wider transition hover:opacity-90",children:[(0,t.jsx)("span",{className:"bg-[#1F242D] px-2.5 py-1 text-[#e6edf3]",children:r.label}),(0,t.jsx)("span",{className:"px-2.5 py-1 text-white",style:{backgroundColor:`#${r.color.replace("#","")}`},children:r.valueText})]},r.id))})]}),(0,t.jsx)("div",{className:`relative overflow-hidden rounded-lg border border-[#21262d] p-2 sm:p-3 ${s?"transparency-grid":"bg-[#0d1117]"}`,children:(0,t.jsx)("div",{className:"mx-auto",style:{maxWidth:`${r.imageWidth}px`},children:(0,t.jsx)(eB,{config:e,className:"block h-auto w-full"})})}),r.includeTelemetryCaption&&(0,t.jsxs)("p",{className:"text-center text-xs italic text-[#8b949e]",children:["Live"," ",(0,t.jsx)("code",{className:"rounded bg-[#161b22] px-1.5 py-0.5 not-italic text-[#c9d1d9]",children:"dynamic-readme-creature"})," ","for"," ",(0,t.jsxs)("span",{className:"not-italic text-[#58a6ff]",children:["@",n]})," —"," ",(0,t.jsxs)("strong",{className:"not-italic text-[#e6edf3]",children:["Stage ",c.stage,": ",c.rank," ",l.name]})," ","·"," ",(0,t.jsxs)("code",{className:"not-italic",children:[e.commits.toLocaleString("en-US")," commits"]})," ","· View: ",(0,t.jsx)("code",{className:"not-italic",children:e.view})]}),r.includeStatsTable&&"minimal-header"!==r.templateId&&"auto-evolve-block"!==r.templateId&&(0,t.jsx)("div",{className:"overflow-hidden rounded-lg border border-[#30363d] text-xs",children:(0,t.jsxs)("table",{className:"w-full text-left",children:[(0,t.jsx)("thead",{className:"border-b border-[#30363d] bg-[#161b22] text-[#8b949e]",children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{className:"px-3 py-2 font-medium",children:"Metric"}),(0,t.jsx)("th",{className:"px-3 py-2 font-medium",children:"Active Value"})]})}),(0,t.jsxs)("tbody",{className:"divide-y divide-[#21262d]",children:[(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"px-3 py-2 font-medium text-[#c9d1d9]",children:"Guardian Chassis"}),(0,t.jsxs)("td",{className:"px-3 py-2 font-mono text-[#e6edf3]",children:[l.name," (",l.designation,")"]})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"px-3 py-2 font-medium text-[#c9d1d9]",children:"Evolution Stage"}),(0,t.jsxs)("td",{className:"px-3 py-2 font-mono text-[#00E676]",children:["Stage ",c.stage," / 5 — ",c.rank]})]}),(0,t.jsxs)("tr",{children:[(0,t.jsxs)("td",{className:"px-3 py-2 font-medium text-[#c9d1d9]",children:["Contributions (",e.windowMode,")"]}),(0,t.jsxs)("td",{className:"px-3 py-2 font-mono text-[#e6edf3]",children:[e.commits.toLocaleString("en-US")," commits"]})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"px-3 py-2 font-medium text-[#c9d1d9]",children:"Top Languages"}),(0,t.jsx)("td",{className:"px-3 py-2 font-mono text-[#e6edf3]",children:e.languages.map(e=>e.name).join(" · ")})]})]})]})}),r.includeProjects&&"minimal-header"!==r.templateId&&"auto-evolve-block"!==r.templateId&&r.projects.some(e=>e.enabled&&e.name.trim())&&(0,t.jsxs)("div",{className:"space-y-2 border-t border-[#21262d] pt-4",children:[(0,t.jsx)("h3",{className:"text-sm font-semibold text-[#e6edf3]",children:"Featured Projects"}),(0,t.jsx)("div",{className:"grid grid-cols-1 gap-2.5 sm:grid-cols-2",children:r.projects.filter(e=>e.enabled&&e.name.trim()).map(r=>(0,t.jsxs)("a",{href:e4(r.url,e),target:"_blank",rel:"noreferrer",className:"flex flex-col justify-between rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3 transition hover:border-[#58a6ff]",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2",children:[(0,t.jsx)("span",{className:"font-mono text-xs font-semibold text-[#58a6ff]",children:r.name}),(0,t.jsx)(e_,{className:"h-3 w-3 text-[#8b949e]"})]}),(0,t.jsx)("p",{className:"mt-1 text-[11px] leading-relaxed text-[#8b949e]",children:e4(r.description,e)})]}),(0,t.jsxs)("div",{className:"mt-2 font-mono text-[10px] text-[#00E676]",children:["● ",r.language]})]},r.id))})]}),r.includeShareCard&&(0,t.jsx)("div",{className:"rounded-lg border border-[#21262d] bg-[#070b12] p-2",children:(0,t.jsx)(eQ,{config:e,className:"mx-auto block h-auto w-full"})}),x&&(0,t.jsx)("pre",{className:"whitespace-pre-wrap rounded-lg border border-[#21262d] bg-[#161b22]/50 p-3 font-mono text-xs text-[#c9d1d9]",children:x})]})]});return o?(0,t.jsxs)("div",{className:"grid grid-cols-1 gap-5 rounded-xl border border-[#21262d] bg-[#010409] p-4 md:grid-cols-12",children:[(0,t.jsxs)("aside",{className:"space-y-3 md:col-span-4 xl:col-span-3",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3 md:flex-col md:items-start",children:[g?(0,t.jsx)("img",{src:g,alt:h,className:"h-16 w-16 rounded-full border-2 border-[#30363d] object-cover md:h-28 md:w-28"}):(0,t.jsx)("div",{className:"flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] font-mono text-xl font-bold text-[#FF6B00] md:h-28 md:w-28 md:text-3xl",children:n.slice(0,2).toUpperCase()}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"text-base font-bold text-white",children:h}),(0,t.jsxs)("div",{className:"font-mono text-xs text-[#8b949e]",children:["@",n]})]})]}),(0,t.jsx)("div",{className:"rounded-md border border-[#30363d] bg-[#21262d] py-1.5 text-center text-xs font-medium text-[#c9d1d9]",children:"Edit profile"}),(0,t.jsx)("p",{className:"text-xs leading-relaxed text-[#c9d1d9]",children:a?.bio||"Systems & creative developer building animated README ecosystems."}),(0,t.jsxs)("div",{className:"space-y-1.5 text-[11px] text-[#8b949e]",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(Q,{className:"h-3.5 w-3.5"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("strong",{className:"text-[#e6edf3]",children:a?.followers??42})," ","followers ·"," ",(0,t.jsx)("strong",{className:"text-[#e6edf3]",children:a?.publicRepos??24})," ","repos"]})]}),r.profileCompany&&(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(eX,{className:"h-3.5 w-3.5"}),(0,t.jsx)("span",{children:r.profileCompany})]}),r.profileLocation&&(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)(eK,{className:"h-3.5 w-3.5"}),(0,t.jsx)("span",{children:r.profileLocation})]}),r.profileWebsite&&(0,t.jsxs)("div",{className:"flex items-center gap-1.5 truncate",children:[(0,t.jsx)(eW,{className:"h-3.5 w-3.5 shrink-0"}),(0,t.jsx)("span",{className:"truncate text-[#58a6ff]",children:r.profileWebsite})]})]})]}),(0,t.jsx)("div",{className:"md:col-span-8 xl:col-span-9",children:u})]}):u}let te={name:"folder-git-2",size:24,node:[["path",{d:"M18 19a5 5 0 0 1-5-5v8",key:"sz5oeg"}],["path",{d:"M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5",key:"1w6njk"}],["circle",{cx:"13",cy:"12",r:"2",key:"1j92g6"}],["circle",{cx:"20",cy:"19",r:"2",key:"1obnsp"}]]};te.node;let tt=n(te),tr={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};tr.node;let ta=n(tr),to={name:"tag",size:24,node:[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]};to.node;let ts=n(to),ti={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};ti.node;let tn=n(ti),tl={name:"circle-user-round",size:24,node:[["path",{d:"M17.925 20.056a6 6 0 0 0-11.851.001",key:"z69sun"}],["circle",{cx:"12",cy:"11",r:"4",key:"1gt34v"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],aliases:["user-circle-2"]};tl.node;let tc=n(tl);function td({creatureConfig:e,readmeConfig:a,onChange:o}){let[s,i]=(0,r.useState)("identity"),[n,l]=(0,r.useState)("all"),[c,d]=(0,r.useState)(""),[m,p]=(0,r.useState)(""),[h,u]=(0,r.useState)("#00E676"),[b,y]=(0,r.useState)(""),[k,v]=(0,r.useState)(""),[j,C]=(0,r.useState)("https://"),[$,N]=(0,r.useState)("#FF6B00"),[S,E]=(0,r.useState)(""),[F,L]=(0,r.useState)(""),[T,A]=(0,r.useState)("TypeScript"),[R,D]=(0,r.useState)(null),B=e.username.trim()||"PathumSandeepa",U=e8(e,a),O=null!==a.rawOverride?a.rawOverride:U,I=e7(e,a);function G(e,t){o({...a,[e]:t,rawOverride:null})}async function H(t){let r="full"===t?I:e5(e,a);await navigator.clipboard.writeText(r),D(t),setTimeout(()=>D(null),2e3)}let z=a.badges.filter(e=>"all"===n||e.category===n);return(0,t.jsxs)("div",{className:"space-y-4 p-4 sm:p-5",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3.5 py-2.5",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(M,{className:"h-4 w-4 text-[#00E676]"}),(0,t.jsx)("span",{className:"text-xs font-semibold text-white",children:"Customizable GitHub Profile README.md Builder"}),null!==a.rawOverride&&(0,t.jsx)("span",{className:"rounded-full border border-[#FF6B00]/50 bg-[#FF6B00]/15 px-2 py-0.5 font-mono text-[10px] text-[#FF6B00]",children:"CUSTOM RAW MODE"})]}),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("button",{type:"button",onClick:()=>void H("marker"),className:"inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-[11px] font-medium text-[#e6edf3] transition hover:border-[#8b949e]",children:"marker"===R?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-3 w-3 text-[#00E676]"}),"Copied Marker Block"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(g,{className:"h-3 w-3 text-[#FF6B00]"}),"Copy Marker Block"]})}),(0,t.jsx)("button",{type:"button",onClick:()=>void H("full"),className:"inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#30363d]",children:"full"===R?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-3 w-3 text-[#00E676]"}),"Copied README.md"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(f,{className:"h-3 w-3"}),"Copy README.md"]})}),(0,t.jsxs)("button",{type:"button",onClick:function(){let e=new Blob([I],{type:"text/markdown;charset=utf-8"}),t=URL.createObjectURL(e),r=document.createElement("a");r.href=t,r.download="README.md",document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(t)},className:"inline-flex items-center gap-1.5 rounded-md bg-[#FF6B00] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#ff7f24]",children:[(0,t.jsx)(w,{className:"h-3 w-3"}),"Download README.md"]}),(0,t.jsxs)("a",{href:`https://github.com/${encodeURIComponent(B)}/${encodeURIComponent(B)}/edit/main/README.md`,target:"_blank",rel:"noreferrer",className:"inline-flex items-center gap-1 rounded-md border border-[#00E676]/40 bg-[#00E676]/10 px-2.5 py-1.5 text-[11px] font-medium text-[#00E676] transition hover:bg-[#00E676]/20",children:["Open on GitHub",(0,t.jsx)(e_,{className:"h-3 w-3"})]})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 gap-4 xl:grid-cols-12",children:[(0,t.jsxs)("div",{className:"space-y-3 xl:col-span-6",children:[(0,t.jsx)("div",{className:"grid grid-cols-4 gap-1 rounded-lg border border-[#30363d] bg-[#0d1117] p-1 text-[11px]",children:[{id:"identity",label:"Identity",icon:tc},{id:"badges",label:"Tech Stack",icon:ts},{id:"links",label:"Links & Repos",icon:eW},{id:"layout",label:"Layout",icon:tt}].map(e=>{let r=e.icon,a=s===e.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>i(e.id),className:`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 font-medium transition ${a?"bg-[#21262d] text-white":"text-[#8b949e] hover:text-white"}`,children:[(0,t.jsx)(r,{className:"h-3 w-3 text-[#FF6B00]"}),(0,t.jsx)("span",{children:e.label})]},e.id)})}),"identity"===s&&(0,t.jsxs)("div",{className:"space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3",children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-medium text-[#c9d1d9]",children:"Display Name (Sidebar)"}),(0,t.jsx)("input",{type:"text",value:a.profileDisplayName,onChange:e=>G("profileDisplayName",e.target.value),className:"w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-medium text-[#c9d1d9]",children:"Location"}),(0,t.jsx)("input",{type:"text",value:a.profileLocation,onChange:e=>G("profileLocation",e.target.value),className:"w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-medium text-[#c9d1d9]",children:"README Main Headline"}),(0,t.jsx)("input",{type:"text",value:a.headline,onChange:e=>G("headline",e.target.value),className:"w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#00E676] focus:outline-none"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-medium text-[#c9d1d9]",children:"Specialty Tagline Chips (Pipe-separated)"}),(0,t.jsx)("div",{className:"mb-2 flex flex-wrap gap-1.5",children:a.subtitleTags.map((e,r)=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 font-mono text-[10px] text-[#e6edf3]",children:[e,(0,t.jsx)("button",{type:"button",onClick:()=>{G("subtitleTags",a.subtitleTags.filter((e,t)=>t!==r))},className:"text-[#8b949e] hover:text-red-400",children:"×"})]},`${e}-${r}`))}),(0,t.jsxs)("form",{onSubmit:function(e){e.preventDefault();let t=c.trim().toUpperCase();t&&(G("subtitleTags",[...a.subtitleTags,t]),d(""))},className:"flex gap-1.5",children:[(0,t.jsx)("input",{type:"text",value:c,onChange:e=>d(e.target.value),placeholder:"Add specialty (e.g. AI SYSTEMS)",className:"flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"}),(0,t.jsx)("button",{type:"submit",className:"rounded-md bg-[#21262d] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#30363d]",children:"Add"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-medium text-[#c9d1d9]",children:"Bio / Story Paragraph"}),(0,t.jsx)("textarea",{rows:3,value:a.bio,onChange:e=>G("bio",e.target.value),className:"w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-medium text-[#c9d1d9]",children:"Call-To-Action Line"}),(0,t.jsx)("input",{type:"text",value:a.ctaLine,onChange:e=>G("ctaLine",e.target.value),className:"w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-white focus:border-[#00E676] focus:outline-none"})]})]}),"badges"===s&&(0,t.jsxs)("div",{className:"space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex flex-wrap gap-1",children:["all","languages","frontend","backend","devops","design"].map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>l(e),className:`rounded px-2 py-0.5 text-[10px] font-semibold uppercase transition ${n===e?"bg-[#FF6B00] text-white":"bg-[#0d1117] text-[#8b949e] hover:text-white"}`,children:e},e))}),(0,t.jsx)("button",{type:"button",onClick:function(){let t=new Set(e.languages.map(e=>e.name.toLowerCase()));G("badges",a.badges.map(e=>t.has(e.label.toLowerCase())?{...e,enabled:!0}:e))},className:"font-mono text-[10px] font-semibold text-[#00E676] hover:underline",children:"Enable GitHub Top Langs"})]}),(0,t.jsx)("div",{className:"flex max-h-52 flex-wrap gap-1.5 overflow-y-auto pr-1",children:z.map(e=>(0,t.jsxs)("div",{className:`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition ${e.enabled?"border-[#00E676]/50 bg-[#0d1117] text-white":"border-[#21262d] bg-[#0d1117]/40 text-[#6e7681]"}`,children:[(0,t.jsxs)("button",{type:"button",onClick:()=>{var t;return t=e.id,void G("badges",a.badges.map(e=>e.id===t?{...e,enabled:!e.enabled}:e))},className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"h-2.5 w-2.5 rounded-full",style:{backgroundColor:`#${e.color}`}}),(0,t.jsx)("span",{children:e.label})]}),e.id.startsWith("custom-")&&(0,t.jsx)("button",{type:"button",onClick:()=>{var t;return t=e.id,void G("badges",a.badges.filter(e=>e.id!==t))},className:"text-[#8b949e] hover:text-red-400",children:(0,t.jsx)(tn,{className:"h-3 w-3"})})]},e.id))}),(0,t.jsxs)("form",{onSubmit:function(e){e.preventDefault();let t=m.trim();t&&(G("badges",[...a.badges,{id:`custom-${Date.now()}`,label:t,color:h.replace("#",""),category:"devops",enabled:!0}]),p(""))},className:"flex gap-2 pt-1",children:[(0,t.jsx)("input",{type:"text",value:m,onChange:e=>p(e.target.value),placeholder:"Custom tech badge (e.g. GraphQL)",className:"flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"}),(0,t.jsx)("input",{type:"color",value:h,onChange:e=>u(e.target.value),"aria-label":"Custom badge color",className:"h-7 w-9 cursor-pointer rounded border border-[#30363d] bg-transparent"}),(0,t.jsxs)("button",{type:"submit",className:"inline-flex items-center gap-1 rounded-md bg-[#21262d] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#30363d]",children:[(0,t.jsx)(ta,{className:"h-3.5 w-3.5"}),"Add"]})]})]}),"links"===s&&(0,t.jsxs)("div",{className:"space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]",children:"CTA & Social Pills (Above Creature)"}),(0,t.jsx)("div",{className:"space-y-1.5",children:a.actionLinks.map(e=>(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2 rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs",children:[(0,t.jsxs)("label",{className:"flex cursor-pointer items-center gap-2 truncate",children:[(0,t.jsx)("input",{type:"checkbox",checked:e.enabled,onChange:()=>G("actionLinks",a.actionLinks.map(t=>t.id===e.id?{...t,enabled:!t.enabled}:t)),className:"accent-[#00E676]"}),(0,t.jsx)("span",{className:"font-mono font-bold text-[#e6edf3]",children:e.label}),(0,t.jsx)("span",{className:"truncate text-[11px] text-[#8b949e]",children:e.valueText})]}),(0,t.jsx)("button",{type:"button",onClick:()=>G("actionLinks",a.actionLinks.filter(t=>t.id!==e.id)),className:"text-[#8b949e] hover:text-red-400",children:(0,t.jsx)(tn,{className:"h-3.5 w-3.5"})})]},e.id))}),(0,t.jsxs)("form",{onSubmit:function(e){e.preventDefault(),b.trim()&&j.trim()&&(G("actionLinks",[...a.actionLinks,{id:`link-${Date.now()}`,label:b.trim().toUpperCase(),valueText:(k.trim()||"OPEN").toUpperCase(),url:j.trim(),color:$.replace("#",""),enabled:!0}]),y(""),v(""),C("https://"))},className:"mt-2 grid grid-cols-2 gap-1.5",children:[(0,t.jsx)("input",{type:"text",value:b,onChange:e=>y(e.target.value),placeholder:"Label (PORTFOLIO)",className:"rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"}),(0,t.jsx)("input",{type:"text",value:k,onChange:e=>v(e.target.value),placeholder:"Display text (VISIT)",className:"rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"}),(0,t.jsx)("input",{type:"url",value:j,onChange:e=>C(e.target.value),placeholder:"https://...",className:"rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"}),(0,t.jsxs)("div",{className:"flex gap-1.5",children:[(0,t.jsx)("input",{type:"color",value:$,onChange:e=>N(e.target.value),className:"h-7 w-9 rounded border border-[#30363d] bg-transparent"}),(0,t.jsx)("button",{type:"submit",className:"flex-1 rounded bg-[#21262d] px-2 py-1 text-xs font-medium text-white hover:bg-[#30363d]",children:"+ Add Link"})]})]})]}),(0,t.jsxs)("div",{className:"border-t border-[#21262d] pt-3",children:[(0,t.jsx)("div",{className:"mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]",children:"Featured Projects"}),(0,t.jsx)("div",{className:"space-y-1.5",children:a.projects.map(e=>(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2 rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs",children:[(0,t.jsxs)("label",{className:"flex cursor-pointer items-center gap-2 truncate",children:[(0,t.jsx)("input",{type:"checkbox",checked:e.enabled,onChange:()=>G("projects",a.projects.map(t=>t.id===e.id?{...t,enabled:!t.enabled}:t)),className:"accent-[#00E676]"}),(0,t.jsx)("span",{className:"font-mono font-semibold text-[#58a6ff]",children:e.name}),(0,t.jsxs)("span",{className:"text-[10px] text-[#8b949e]",children:["(",e.language,")"]})]}),(0,t.jsx)("button",{type:"button",onClick:()=>G("projects",a.projects.filter(t=>t.id!==e.id)),className:"text-[#8b949e] hover:text-red-400",children:(0,t.jsx)(tn,{className:"h-3.5 w-3.5"})})]},e.id))}),(0,t.jsxs)("form",{onSubmit:function(e){e.preventDefault(),S.trim()&&(G("projects",[...a.projects,{id:`proj-${Date.now()}`,name:S.trim(),description:F.trim()||"Open-source project built with clean craft.",url:`https://github.com/${B}/${S.trim()}`,language:T.trim()||"TypeScript",enabled:!0}]),E(""),L(""))},className:"mt-2 grid grid-cols-3 gap-1.5",children:[(0,t.jsx)("input",{type:"text",value:S,onChange:e=>E(e.target.value),placeholder:"Repo name",className:"rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"}),(0,t.jsx)("input",{type:"text",value:F,onChange:e=>L(e.target.value),placeholder:"Short description",className:"rounded border border-[#30363d] bg-[#0d1117] px-2 py-1 text-xs text-white"}),(0,t.jsxs)("div",{className:"flex gap-1",children:[(0,t.jsx)("input",{type:"text",value:T,onChange:e=>A(e.target.value),placeholder:"Stack",className:"w-16 rounded border border-[#30363d] bg-[#0d1117] px-1.5 py-1 text-xs text-white"}),(0,t.jsx)("button",{type:"submit",className:"flex-1 rounded bg-[#21262d] px-2 py-1 text-xs font-medium text-white hover:bg-[#30363d]",children:"+"})]})]})]})]}),"layout"===s&&(0,t.jsxs)("div",{className:"space-y-3 rounded-lg border border-[#30363d] bg-[#161b22]/50 p-3",children:[(0,t.jsx)("div",{className:"grid grid-cols-2 gap-2",children:e0.map(e=>{let r=a.templateId===e.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>G("templateId",e.id),className:`rounded-md border p-2 text-left transition ${r?"border-[#FF6B00] bg-[#FF6B00]/10":"border-[#30363d] bg-[#0d1117] hover:border-[#484f58]"}`,children:[(0,t.jsx)("div",{className:"text-xs font-semibold text-white",children:e.name}),(0,t.jsx)("div",{className:"mt-0.5 text-[10px] text-[#8b949e]",children:e.description})]},e.id)})}),(0,t.jsxs)("div",{className:"flex items-center justify-between gap-3",children:[(0,t.jsxs)("span",{className:"text-xs font-medium text-[#e6edf3]",children:["Creature Width (",a.imageWidth,"px)"]}),(0,t.jsx)("input",{type:"range",min:480,max:920,step:20,value:a.imageWidth,onChange:e=>G("imageWidth",parseInt(e.target.value,10)),className:"w-40 cursor-pointer accent-[#FF6B00]"})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2 text-xs",children:[(0,t.jsxs)("button",{type:"button",onClick:()=>G("align","center"===a.align?"left":"center"),className:"rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-left text-[#c9d1d9]",children:["Badges Align:"," ",(0,t.jsx)("span",{className:"font-mono font-semibold text-[#FF6B00]",children:a.align})]}),(0,t.jsxs)("button",{type:"button",onClick:()=>G("useOutputBranchUrl",!a.useOutputBranchUrl),className:"rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-left text-[#c9d1d9]",children:["Src:"," ",(0,t.jsx)("span",{className:"font-mono font-semibold text-[#00E676]",children:a.useOutputBranchUrl?"output branch":"./creature.svg"})]})]}),(0,t.jsx)("div",{className:"grid grid-cols-2 gap-2 text-[11px]",children:[{key:"includeMarkers",label:"Auto-Update Markers"},{key:"includeTelemetryCaption",label:"Telemetry Caption"},{key:"includeStatsTable",label:"Stats Table"},{key:"includeProjects",label:"Featured Projects"},{key:"includeShareCard",label:"Include Share Card"}].map(e=>(0,t.jsxs)("label",{className:"flex cursor-pointer items-center gap-2 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-[#c9d1d9]",children:[(0,t.jsx)("input",{type:"checkbox",checked:a[e.key],onChange:t=>G(e.key,t.target.checked),className:"accent-[#00E676]"}),(0,t.jsx)("span",{children:e.label})]},e.key))}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"mb-1 block text-xs font-medium text-[#e6edf3]",children:"Custom Footer Markdown (Optional)"}),(0,t.jsx)("textarea",{rows:2,value:a.customFooterMarkdown,onChange:e=>G("customFooterMarkdown",e.target.value),placeholder:"Add custom sections or contact links...",className:"w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 font-mono text-xs text-white placeholder-[#6e7681]"})]})]})]}),(0,t.jsxs)("div",{className:"flex flex-col rounded-lg border border-[#30363d] bg-[#090c10] xl:col-span-6",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b border-[#21262d] bg-[#161b22] px-3 py-2",children:[(0,t.jsx)("span",{className:"font-mono text-[11px] font-semibold text-[#e6edf3]",children:"README.md (Dynamic Tokens + Live Markdown)"}),null!==a.rawOverride&&(0,t.jsxs)("button",{type:"button",onClick:()=>o({...a,rawOverride:null}),className:"inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 text-[10px] font-medium text-[#00E676] hover:border-[#00E676]",children:[(0,t.jsx)(P,{className:"h-3 w-3"}),"Resync from Form"]})]}),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-1.5 border-b border-[#21262d] bg-[#0d1117] px-3 py-2",children:[(0,t.jsx)("span",{className:"text-[10px] font-semibold uppercase text-[#8b949e]",children:"Insert token:"}),e1.map(e=>(0,t.jsx)("button",{type:"button",title:e.description,onClick:()=>{var t;let r;return t=e.token,r=null!==a.rawOverride?a.rawOverride:U,void o({...a,rawOverride:`${r}
${t}`})},className:"rounded border border-[#30363d] bg-[#161b22] px-1.5 py-0.5 font-mono text-[10px] text-[#79c0ff] transition hover:border-[#58a6ff]",children:e.token},e.token))]}),(0,t.jsx)("textarea",{value:O,onChange:e=>o({...a,rawOverride:e.target.value}),"aria-label":"Raw README Markdown editor",spellCheck:!1,className:"min-h-[380px] flex-1 resize-y bg-[#090c10] p-3 font-mono text-xs leading-relaxed text-[#c9d1d9] focus:outline-none"})]})]})]})}function tm({label:e,sublabel:r,value:a,onChange:o}){return(0,t.jsxs)("div",{className:"flex items-center justify-between gap-3 rounded-lg border border-[#30363d]/80 bg-[#0d1117] px-3 py-2",children:[(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("div",{className:"text-xs font-medium text-[#e6edf3]",children:e}),(0,t.jsx)("div",{className:"truncate text-[11px] text-[#8b949e]",children:r})]}),(0,t.jsxs)("div",{className:"flex shrink-0 items-center gap-2",children:[(0,t.jsx)("span",{className:"font-mono text-[11px] uppercase text-[#8b949e]",children:a}),(0,t.jsx)("label",{className:"relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[#30363d] shadow-inner",children:(0,t.jsx)("input",{type:"color",value:eh(a),onChange:e=>o(e.target.value.toUpperCase()),"aria-label":e,className:"absolute -inset-2 h-12 w-12 cursor-pointer border-0 bg-transparent p-0"})})]})]})}function tp(e,t,r="image/svg+xml;charset=utf-8"){let a=new Blob([t],{type:r}),o=URL.createObjectURL(a),s=document.createElement("a");s.href=o,s.download=e,document.body.appendChild(s),s.click(),s.remove(),URL.revokeObjectURL(o)}e.s(["CreatureStudio",0,function(){let[e,a]=(0,r.useState)("studio"),[o,s]=(0,r.useState)(ep),[i,n]=(0,r.useState)(e6),[l,d]=(0,r.useState)("#0B1020"),[p,h]=(0,r.useState)(null),[u,b]=(0,r.useState)("preview"),[k,v]=(0,r.useState)(!0),[C,N]=(0,r.useState)(!1),[S,F]=(0,r.useState)(!1),[T,R]=(0,r.useState)(ep.username),[B,O]=(0,r.useState)(!1),[I,H]=(0,r.useState)(null),[Y,Z]=(0,r.useState)(null),V=ew(o.creature),q=ek(o.commits),J=o.username.trim()||"PathumSandeepa",ee="![Cyber Creature](./creature.svg)",er=(0,r.useMemo)(()=>e5(o,i),[o,i]),ea=(0,r.useMemo)(()=>e7(o,i),[o,i]),eo=(0,r.useMemo)(()=>{let e,t,r;return e=ew(o.creature),t=eD(o,"cc"),r=e$(`${e.name} - ${e.subtitle}`),`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 460" width="920" height="460" role="img" aria-label="${r}">
  <title>${r}</title>
  ${t}
</svg>`},[o]);async function es(e){e&&e.preventDefault(),O(!0),H(null);try{let e=await eO(T);Z(e),s(t=>{let r={...t,username:e.username,commits:e.estimatedCommits,languages:e.languages};return"languages"===t.colorMode?eb(r,e.languages):r}),n(t=>({...t,profileDisplayName:e.displayName}))}catch(e){H(e instanceof Error?e.message:"Failed to load GitHub data.")}finally{O(!1)}}function ei(e){s(t=>({...t,view:e}))}function en(e,t){s(r=>({...r,colorMode:"custom",themeId:"custom",colors:{...r.colors,[e]:t.toUpperCase()}}))}async function eh(e){let t="md"===e?ee:"html"===e?er:"readme"===e?ea:eo;await navigator.clipboard.writeText(t),h(e),setTimeout(()=>h(null),2e3)}return(0,t.jsxs)("div",{className:"min-h-screen bg-[#07090d] text-[#e6edf3]",children:[(0,t.jsx)("header",{className:"sticky top-0 z-30 border-b border-[#21262d] bg-[#0d1117]/92 backdrop-blur-md",children:(0,t.jsxs)("div",{className:"mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF6B00]/40 bg-gradient-to-br from-[#FF6B00]/20 to-[#00E676]/10",children:(0,t.jsx)(y,{className:"h-5 w-5 text-[#FF6B00]"})}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("h1",{className:"text-base font-bold tracking-tight text-white sm:text-lg",children:"dynamic-readme-creature"}),(0,t.jsx)("span",{className:"hidden rounded-full border border-[#00E676]/40 bg-[#00E676]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00E676] sm:inline-block",children:"PURE CSS SVG"})]}),(0,t.jsxs)("p",{className:"text-xs text-[#8b949e]",children:["Cybernetic creature generator & profile README studio ·"," ",(0,t.jsx)("span",{className:"font-mono text-[#c9d1d9]",children:"@PathumSandeepa"})]})]})]}),(0,t.jsx)("nav",{"aria-label":"Studio workspace views",className:"flex flex-wrap items-center gap-1 rounded-xl border border-[#21262d] bg-[#07090d] p-1",children:[{id:"studio",label:"Studio",icon:X},{id:"readme-editor",label:"Profile README",icon:M},{id:"share-card",label:"Social Card",icon:z},{id:"comparator",label:"Compare Users",icon:Q},{id:"evolution",label:"Stages & Views",icon:A}].map(r=>{let o=r.icon,s=e===r.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>a(r.id),className:`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${s?"bg-[#21262d] text-white shadow-sm":"text-[#8b949e] hover:text-[#e6edf3]"}`,children:[(0,t.jsx)(o,{className:"h-3.5 w-3.5 text-[#FF6B00]"}),(0,t.jsx)("span",{children:r.label})]},r.id)})}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)("button",{type:"button",onClick:function(){s(ep),n(e6),R(ep.username),Z(null),H(null),d("#0B1020")},className:"inline-flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#c9d1d9] transition hover:border-[#8b949e] hover:text-white",children:[(0,t.jsx)(G,{className:"h-3.5 w-3.5"}),"Reset"]}),(0,t.jsxs)("button",{type:"button",onClick:()=>tp("creature.svg",eo),className:"inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#ff7f24]",children:[(0,t.jsx)(w,{className:"h-3.5 w-3.5"}),"Export SVG"]})]})]})}),(0,t.jsxs)("main",{className:"mx-auto max-w-[1440px] px-4 py-6 sm:px-6",children:["comparator"===e&&(0,t.jsx)(eI,{baseConfig:o}),"evolution"===e&&(0,t.jsx)(eG,{config:o,onSelectCommits:e=>{s(t=>({...t,commits:e})),a("studio")},onSelectView:e=>{ei(e),a("studio")}}),"readme-editor"===e&&(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsx)("div",{className:"overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]",children:(0,t.jsx)(td,{creatureConfig:o,readmeConfig:i,onChange:n})}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("span",{className:"font-mono text-xs font-semibold text-[#e6edf3]",children:["Live GitHub Profile Page Preview (@",J,")"]}),(0,t.jsxs)("button",{type:"button",onClick:()=>tp("README.md",ea,"text/markdown;charset=utf-8"),className:"inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#ff7f24]",children:[(0,t.jsx)(w,{className:"h-3.5 w-3.5"}),"Download README.md"]})]}),(0,t.jsx)(e9,{creatureConfig:o,readmeConfig:i,ghSnapshot:Y,showProfileSidebar:!0,showGridBackdrop:C})]})]}),"share-card"===e&&(0,t.jsxs)("div",{className:"space-y-5",children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#21262d] bg-[#161b22]/75 p-5",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F6FEB]/50 bg-[#1F6FEB]/15 text-[#58a6ff]",children:(0,t.jsx)(L,{className:"h-5 w-5"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"text-base font-bold text-white",children:"Shareable Telemetry Card (1280×640)"}),(0,t.jsx)("p",{className:"text-xs text-[#8b949e]",children:"Ready to post on X, LinkedIn, Discord, or embed in your GitHub Profile README."})]})]}),(0,t.jsxs)("button",{type:"button",onClick:()=>{let e,t,r;return tp("share-card.svg",(e=ew(o.creature),t=eJ(o,"sc"),r=e$(`${e.name} Share Card - @${o.username||"PathumSandeepa"}`),`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" width="1280" height="640" role="img" aria-label="${r}">
  <title>${r}</title>
  ${t}
</svg>`))},className:"inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#ff7f24]",children:[(0,t.jsx)(w,{className:"h-4 w-4"}),"Download share-card.svg"]})]}),(0,t.jsx)("div",{className:"overflow-hidden rounded-xl border border-[#30363d] bg-[#070b12] p-4 shadow-2xl",children:(0,t.jsx)(eQ,{config:o,className:"mx-auto block h-auto w-full max-w-[1100px]"})})]}),"studio"===e&&(0,t.jsxs)("div",{className:"grid grid-cols-1 gap-6 lg:grid-cols-12",children:[(0,t.jsxs)("aside",{className:"space-y-4 lg:col-span-4 xl:col-span-4",children:[(0,t.jsxs)("section",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4",children:[(0,t.jsxs)("div",{className:"mb-2.5 flex items-center justify-between",children:[(0,t.jsxs)("h2",{className:"flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]",children:[(0,t.jsx)(W,{className:"h-4 w-4 text-[#00E676]"}),"GitHub Profile Sync"]}),(0,t.jsx)("div",{className:"flex rounded-md border border-[#30363d] bg-[#0d1117] p-0.5 text-[10px]",children:["annual","rolling"].map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>{s(t=>({...t,windowMode:e}))},className:`rounded px-2 py-0.5 font-mono uppercase transition ${o.windowMode===e?"bg-[#21262d] text-white":"text-[#8b949e]"}`,children:e},e))})]}),(0,t.jsxs)("form",{onSubmit:es,className:"flex gap-2",children:[(0,t.jsx)("input",{type:"text",value:T,onChange:e=>{R(e.target.value),s(t=>({...t,username:e.target.value}))},placeholder:"GitHub username (e.g. PathumSandeepa)","aria-label":"GitHub username",className:"flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-xs text-white placeholder-[#6e7681] focus:border-[#00E676] focus:outline-none"}),(0,t.jsxs)("button",{type:"submit",disabled:B,className:"inline-flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2 text-xs font-semibold text-[#e6edf3] transition hover:border-[#00E676] hover:text-white disabled:opacity-50",children:[B?(0,t.jsx)(D,{className:"h-3.5 w-3.5 animate-spin"}):(0,t.jsx)(P,{className:"h-3.5 w-3.5"}),"Sync"]})]}),I&&(0,t.jsx)("p",{className:"mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-300",children:I}),(0,t.jsxs)("div",{className:"mt-2.5 flex flex-wrap items-center justify-between gap-2",children:[(0,t.jsx)("div",{className:"flex flex-wrap gap-1.5",children:o.languages.map(e=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 font-mono text-[10px] text-[#c9d1d9]",children:[(0,t.jsx)("span",{className:"h-2 w-2 rounded-full",style:{backgroundColor:e.color}}),e.name]},e.name))}),(0,t.jsx)("button",{type:"button",onClick:function(){s(e=>eb(e,e.languages))},className:"font-mono text-[10px] font-semibold text-[#58a6ff] hover:underline",children:"Apply Lang Colors"})]}),Y&&(0,t.jsxs)("p",{className:"mt-2 text-[10px] text-[#8b949e]",children:["Synced @",Y.username,": ",Y.publicRepos," ","repos · ",Y.totalStars," stars ·"," ",Y.sourceNote]})]}),(0,t.jsxs)("section",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4",children:[(0,t.jsxs)("div",{className:"mb-3 flex items-center justify-between",children:[(0,t.jsxs)("h2",{className:"flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]",children:[(0,t.jsx)(_,{className:"h-4 w-4 text-[#FF6B00]"}),"1. Chassis & Perspective"]}),(0,t.jsx)("span",{className:"font-mono text-[11px] text-[#8b949e]",children:V.designation})]}),(0,t.jsx)("div",{className:"grid grid-cols-1 gap-2",children:el.map(e=>{let r=o.creature===e.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>{var t;return t=e.id,void s(e=>({...e,creature:t}))},className:`group flex flex-col items-start rounded-lg border p-2.5 text-left transition ${r?"border-[#FF6B00] bg-[#FF6B00]/10 shadow-[0_0_0_1px_rgba(255,107,0,0.3)]":"border-[#30363d]/80 bg-[#0d1117] hover:border-[#484f58]"}`,children:[(0,t.jsxs)("div",{className:"flex w-full items-center justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-xs font-semibold text-white",children:e.name}),(0,t.jsxs)("span",{className:"ml-1.5 text-[11px] text-[#8b949e]",children:["· ",e.subtitle]})]}),(0,t.jsx)("span",{className:`h-2 w-2 rounded-full transition ${r?"bg-[#00E676] shadow-[0_0_8px_#00E676]":"bg-[#30363d] group-hover:bg-[#484f58]"}`})]}),(0,t.jsx)("p",{className:"mt-1 text-[11px] leading-snug text-[#8b949e]",children:e.description})]},e.id)})}),(0,t.jsxs)("div",{className:"mt-3 border-t border-[#21262d] pt-3",children:[(0,t.jsxs)("div",{className:"mb-2 flex items-center justify-between",children:[(0,t.jsxs)("span",{className:"flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]",children:[(0,t.jsx)(m,{className:"h-3.5 w-3.5 text-[#00E676]"}),"Camera Angle (",(0,t.jsx)("code",{className:"text-[#FF6B00]",children:"view"}),")"]}),(0,t.jsx)("span",{className:"font-mono text-[10px] uppercase text-[#8b949e]",children:o.view})]}),(0,t.jsx)("div",{className:"grid grid-cols-3 gap-1.5",children:ec.map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>ei(e.id),className:`rounded-md border px-2 py-1.5 text-xs font-medium transition ${o.view===e.id?"border-[#00E676] bg-[#00E676]/15 text-white":"border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-white"}`,children:e.shortLabel},e.id))})]})]}),(0,t.jsxs)("section",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4",children:[(0,t.jsxs)("div",{className:"mb-3 flex items-center justify-between",children:[(0,t.jsxs)("h2",{className:"flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]",children:[(0,t.jsx)(U,{className:"h-4 w-4 text-[#00E676]"}),"2. Armor & Energy Palette"]}),(0,t.jsx)("span",{className:"font-mono text-[10px] uppercase text-[#00E676]",children:o.colorMode})]}),(0,t.jsx)("div",{className:"mb-3 grid grid-cols-2 gap-2",children:em.map(e=>{let r="canonical"===o.colorMode&&o.themeId===e.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>{var t;let r;return t=e.id,void((r=em.find(e=>e.id===t))&&s(e=>({...e,colorMode:"canonical",themeId:r.id,colors:{...r.colors,background:e.colors.background}})))},className:`flex flex-col rounded-lg border p-2 text-left transition ${r?"border-[#00E676] bg-[#00E676]/10":"border-[#30363d]/80 bg-[#0d1117] hover:border-[#484f58]"}`,children:[(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("span",{className:"h-3 w-3 rounded-full border border-white/20",style:{backgroundColor:e.colors.primary}}),(0,t.jsx)("span",{className:"h-3 w-3 rounded-full border border-white/20",style:{backgroundColor:e.colors.accent}}),(0,t.jsx)("span",{className:"h-3 w-3 rounded-full border border-white/20",style:{backgroundColor:e.colors.energy}})]}),(0,t.jsx)("div",{className:"mt-1 text-[11px] font-semibold text-[#e6edf3]",children:e.name})]},e.id)})}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(tm,{label:"Primary Armor (75%)",sublabel:"Modular carapace & feather blades",value:o.colors.primary,onChange:e=>en("primary",e)}),(0,t.jsx)(tm,{label:"Accent 1 (Secondary)",sublabel:"Wing tips, rings & hazard stripes",value:o.colors.accent,onChange:e=>en("accent",e)}),(0,t.jsx)(tm,{label:"Energy Glow Core",sublabel:"Optic sensors, circuitry & cable tips",value:o.colors.energy,onChange:e=>en("energy",e)})]}),(0,t.jsxs)("div",{className:"mt-3 rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-2.5",children:[(0,t.jsxs)("div",{className:"mb-1.5 flex items-center justify-between",children:[(0,t.jsx)("span",{className:"text-xs font-medium text-[#e6edf3]",children:"SVG Canvas Background"}),(0,t.jsx)("span",{className:"font-mono text-[10px] text-[#8b949e]",children:o.colors.background})]}),(0,t.jsx)("div",{className:"grid grid-cols-4 gap-1.5",children:[{id:"transparent",label:"Transparent"},{id:"black",label:"Black"},{id:"github-dark",label:"GH Dark"},{id:"custom",label:"Custom"}].map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>{var t;return t=e.id,void s(e=>({...e,backgroundMode:t,colors:{...e.colors,background:ex(t,l)}}))},className:`rounded-md border px-1.5 py-1 text-[11px] font-medium transition ${o.backgroundMode===e.id?"border-[#FF6B00] bg-[#FF6B00]/15 text-white":"border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3]"}`,children:e.label},e.id))}),"custom"===o.backgroundMode&&(0,t.jsxs)("div",{className:"mt-2 flex items-center justify-between border-t border-[#21262d] pt-2",children:[(0,t.jsx)("span",{className:"text-[11px] text-[#8b949e]",children:"Custom background hex"}),(0,t.jsx)("input",{type:"color",value:l,onChange:e=>{let t;d(t=e.target.value.toUpperCase()),s(e=>({...e,backgroundMode:"custom",colors:{...e.colors,background:t}}))},"aria-label":"Custom SVG background color",className:"h-7 w-12 cursor-pointer rounded border border-[#30363d] bg-transparent"})]})]})]}),(0,t.jsxs)("section",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4",children:[(0,t.jsxs)("div",{className:"mb-3 flex items-center justify-between",children:[(0,t.jsxs)("h2",{className:"flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6edf3]",children:[(0,t.jsx)(X,{className:"h-4 w-4 text-[#FF6B00]"}),"3. Evolution, Motion & HUD"]}),(0,t.jsxs)("span",{className:"font-mono text-[11px] text-[#00E676]",children:["STAGE ",q.stage,"/5"]})]}),(0,t.jsxs)("div",{className:"mb-3 rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-2.5",children:[(0,t.jsxs)("div",{className:"mb-1.5 flex items-center justify-between text-xs",children:[(0,t.jsx)("span",{className:"font-medium text-[#e6edf3]",children:"Evolution Stage"}),(0,t.jsxs)("span",{className:"font-mono text-[10px] text-[#FF6B00]",children:[q.rank," (",q.rangeLabel,")"]})]}),(0,t.jsx)("div",{className:"grid grid-cols-5 gap-1",children:ed.map(e=>(0,t.jsxs)("button",{type:"button",onClick:()=>s(t=>({...t,commits:e.sampleCommits})),className:`rounded border py-1 font-mono text-[10px] font-semibold transition ${q.stage===e.stage?"border-[#00E676] bg-[#00E676]/20 text-[#00E676]":"border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white"}`,children:["S",e.stage]},e.stage))})]}),(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsxs)("div",{className:"rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-3",children:[(0,t.jsxs)("div",{className:"mb-1.5 flex items-center justify-between",children:[(0,t.jsxs)("label",{htmlFor:"speed-slider",className:"flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]",children:[(0,t.jsx)(c,{className:"h-3.5 w-3.5 text-[#00E676]"}),"Animation Speed"]}),(0,t.jsxs)("span",{className:"rounded bg-[#161b22] px-2 py-0.5 font-mono text-xs font-semibold text-[#FF6B00]",children:[o.animationSpeed.toFixed(1),"x"]})]}),(0,t.jsx)("input",{id:"speed-slider",type:"range",min:.5,max:2.5,step:.1,value:o.animationSpeed,onChange:e=>s(t=>({...t,animationSpeed:parseFloat(e.target.value)})),className:"w-full cursor-pointer accent-[#FF6B00]"})]}),(0,t.jsxs)("div",{className:"flex items-center justify-between rounded-lg border border-[#30363d]/80 bg-[#0d1117] px-3 py-2.5",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"text-xs font-medium text-[#e6edf3]",children:"Bottom HUD Telemetry Bar"}),(0,t.jsx)("div",{className:"text-[11px] text-[#8b949e]",children:"Show stage, languages & commit readout"})]}),(0,t.jsx)("button",{type:"button",role:"switch","aria-checked":o.showHud,onClick:()=>s(e=>({...e,showHud:!e.showHud})),className:`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition ${o.showHud?"border-[#00E676] bg-[#00E676]/25":"border-[#30363d] bg-[#21262d]"}`,children:(0,t.jsx)("span",{className:`inline-block h-4 w-4 transform rounded-full transition ${o.showHud?"translate-x-5.5 bg-[#00E676]":"translate-x-1 bg-[#8b949e]"}`})})]}),(0,t.jsxs)("div",{className:"space-y-2.5 rounded-lg border border-[#30363d]/80 bg-[#0d1117] p-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{htmlFor:"custom-title",className:"mb-1 block text-xs font-medium text-[#e6edf3]",children:"Custom Title / Tag"}),(0,t.jsx)("input",{id:"custom-title",type:"text",maxLength:42,placeholder:`${q.rank} ${V.name.toUpperCase()}`,value:o.customTitle,onChange:e=>s(t=>({...t,customTitle:e.target.value})),className:"w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-[#FF6B00] focus:outline-none"})]}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"mb-1 flex items-center justify-between",children:[(0,t.jsxs)("label",{htmlFor:"commits-input",className:"flex items-center gap-1.5 text-xs font-medium text-[#e6edf3]",children:[(0,t.jsx)(E,{className:"h-3.5 w-3.5 text-[#00E676]"}),"Simulated Commits"]}),(0,t.jsxs)("span",{className:"font-mono text-[10px] text-[#8b949e]",children:[q.rank," (S",q.stage,")"]})]}),(0,t.jsx)("input",{id:"commits-input",type:"number",min:0,max:999999,value:o.commits,onChange:e=>s(t=>({...t,commits:Math.max(0,parseInt(e.target.value||"0",10))})),className:"w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-xs text-[#e6edf3] focus:border-[#00E676] focus:outline-none"})]})]})]})]})]}),(0,t.jsxs)("section",{className:"flex flex-col gap-5 lg:col-span-8 xl:col-span-8",children:[(0,t.jsxs)("div",{className:"grid grid-cols-1 gap-3 sm:grid-cols-3",children:[(0,t.jsxs)("button",{type:"button",onClick:()=>tp("creature.svg",eo),className:"flex items-center justify-center gap-2 rounded-xl border border-[#FF6B00]/60 bg-[#FF6B00] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6B00]/15 transition hover:bg-[#ff7f24]",children:[(0,t.jsx)(w,{className:"h-4 w-4"}),"Download Animated SVG"]}),(0,t.jsx)("button",{type:"button",onClick:()=>void eh("readme"),className:"flex items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-3 text-sm font-semibold text-[#e6edf3] transition hover:border-[#8b949e] hover:bg-[#21262d]",children:"readme"===p?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-4 w-4 text-[#00E676]"}),"Copied Full README.md!"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(M,{className:"h-4 w-4 text-[#8b949e]"}),"Copy Full README.md"]})}),(0,t.jsxs)("button",{type:"button",onClick:()=>F(!0),className:"flex items-center justify-center gap-2 rounded-xl border border-[#00E676]/40 bg-[#00E676]/10 px-4 py-3 text-sm font-semibold text-[#00E676] transition hover:border-[#00E676] hover:bg-[#00E676]/20",children:[(0,t.jsx)(et,{className:"h-4 w-4"}),"Copy Auto-Evolve Action"]})]}),(0,t.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-2.5",children:[(0,t.jsxs)("div",{className:"flex overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117] text-xs",children:[(0,t.jsx)("button",{type:"button",onClick:()=>b("preview"),className:`px-3 py-1 font-medium transition ${"preview"===u?"bg-[#21262d] text-white":"text-[#8b949e] hover:text-white"}`,children:"GitHub Preview"}),(0,t.jsxs)("button",{type:"button",onClick:()=>b("edit"),className:`inline-flex items-center gap-1 border-l border-[#30363d] px-3 py-1 font-medium transition ${"edit"===u?"bg-[#21262d] text-[#00E676]":"text-[#8b949e] hover:text-white"}`,children:[(0,t.jsx)(j,{className:"h-3 w-3"}),"Edit Profile README"]}),(0,t.jsx)("button",{type:"button",onClick:()=>b("code"),className:`border-l border-[#30363d] px-3 py-1 font-medium transition ${"code"===u?"bg-[#21262d] text-white":"text-[#8b949e] hover:text-white"}`,children:"SVG XML"})]}),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsxs)("button",{type:"button",onClick:()=>v(e=>!e),className:`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${k?"border-[#00E676]/50 bg-[#00E676]/10 text-[#00E676]":"border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-white"}`,children:[(0,t.jsx)(K,{className:"h-3 w-3"}),k?"Full Profile":"README Only"]}),(0,t.jsxs)("button",{type:"button",onClick:()=>N(e=>!e),className:`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${C?"border-[#FF6B00]/60 bg-[#FF6B00]/15 text-[#FF6B00]":"border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3]"}`,children:[(0,t.jsx)($,{className:"h-3 w-3"}),C?"Alpha Grid":"#0d1117"]}),(0,t.jsxs)("button",{type:"button",onClick:()=>a("share-card"),className:"inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] font-medium text-[#58a6ff] transition hover:border-[#58a6ff]",children:[(0,t.jsx)(z,{className:"h-3 w-3"}),"1280×640 Card"]})]})]}),"preview"===u&&(0,t.jsx)(e9,{creatureConfig:o,readmeConfig:i,ghSnapshot:Y,showProfileSidebar:k,showGridBackdrop:C,onEditClick:()=>b("edit")}),"edit"===u&&(0,t.jsx)("div",{className:"overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl",children:(0,t.jsx)(td,{creatureConfig:o,readmeConfig:i,onChange:n})}),"code"===u&&(0,t.jsxs)("div",{className:"overflow-hidden rounded-xl border border-[#30363d] bg-[#090c10] shadow-2xl",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-4 py-2 text-xs",children:[(0,t.jsxs)("span",{className:"font-mono text-[#8b949e]",children:["creature.svg (",eo.length.toLocaleString()," bytes)"]}),(0,t.jsx)("button",{type:"button",onClick:()=>void eh("svg"),className:"inline-flex items-center gap-1 rounded border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] text-white hover:bg-[#21262d]",children:"svg"===p?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-3 w-3 text-[#00E676]"}),"Copied SVG"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(f,{className:"h-3 w-3"}),"Copy XML"]})})]}),(0,t.jsx)("div",{className:"max-h-[540px] overflow-auto p-4",children:(0,t.jsx)("pre",{className:"font-mono text-[11px] leading-relaxed text-[#79c0ff]",children:(0,t.jsx)("code",{children:eo})})})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 gap-4 xl:grid-cols-2",children:[(0,t.jsxs)("div",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4",children:[(0,t.jsxs)("div",{className:"mb-2 flex items-center justify-between",children:[(0,t.jsxs)("span",{className:"flex items-center gap-2 text-xs font-semibold text-[#e6edf3]",children:[(0,t.jsx)(g,{className:"h-4 w-4 text-[#00E676]"}),"Simple Markdown Embed"]}),(0,t.jsx)("button",{type:"button",onClick:()=>void eh("md"),className:"inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-[#e6edf3] hover:bg-[#30363d]",children:"md"===p?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-3 w-3 text-[#00E676]"}),"Copied"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(f,{className:"h-3 w-3"}),"Copy"]})})]}),(0,t.jsx)("code",{className:"block overflow-x-auto rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 font-mono text-xs text-[#79c0ff]",children:ee})]}),(0,t.jsxs)("div",{className:"rounded-xl border border-[#21262d] bg-[#161b22]/75 p-4",children:[(0,t.jsxs)("div",{className:"mb-2 flex items-center justify-between",children:[(0,t.jsxs)("span",{className:"flex items-center gap-2 text-xs font-semibold text-[#e6edf3]",children:[(0,t.jsx)(W,{className:"h-4 w-4 text-[#FF6B00]"}),"Auto-Update Marker Block"]}),(0,t.jsx)("button",{type:"button",onClick:()=>void eh("html"),className:"inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-[#e6edf3] hover:bg-[#30363d]",children:"html"===p?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{className:"h-3 w-3 text-[#00E676]"}),"Copied"]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(f,{className:"h-3 w-3"}),"Copy Block"]})})]}),(0,t.jsx)("pre",{className:"max-h-24 overflow-auto rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#79c0ff]",children:(0,t.jsx)("code",{children:er})})]})]})]})]})]}),(0,t.jsx)(ev,{open:S,onClose:()=>F(!1),config:o})]})}],42751)}]);