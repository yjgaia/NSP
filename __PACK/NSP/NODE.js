NSP.Bridge=METHOD(e=>{let t=require("path"),n=(e,t,n,r,o,i,s,u,a)=>{e({statusCode:500,content:'<!doctype html><html><head><meta charset="UTF-8"><title>'+t+"</title></head><body>"+NSP.GenerateErrorDisplay({path:n,startIndex:u,endIndex:a,startLine:r,startColumn:o,endLine:i,endColumn:s,error:t})+"</body></html>",contentType:"text/html"})},r=e=>{e({statusCode:404,content:'<!doctype html><html><head><meta charset="UTF-8"><title>Page not found.</title></head><body><p><b>Page not found.</b></p></body></html>',contentType:"text/html"})};return{run:e=>{let o=e.rootPath,i=e.restURI,s=e.isNotUsingDCBN,u=e.preprocessor,a=e.templateEngine,_=(e,_,c,p)=>{let f,l,d=e.uri,h="",m=()=>{NSP.Load({requestInfo:e,path:f,self:{headers:e.headers,method:e.method,params:e.params,data:e.data,ip:e.ip,subURI:h,fileDataSet:_},isNotUsingDCBN:s,preprocessor:u},{notExists:()=>{r(c)},error:(e,t,r,o,i,s,u,a)=>{n(c,e,t,r,o,i,s,u,a)},success:e=>{c(void 0!==e.redirectURL?{statusCode:302,cookies:e.cookies,headers:{Location:e.redirectURL}}:{cookies:e.cookies,content:void 0===a?e.html:a(e.html),contentType:"text/html"})}})};NEXT([e=>{""===d?CHECK_FILE_EXISTS(o+"/index.nsp",t=>{d=t===!0?"index.nsp":"index.html",e()}):e()},()=>{return()=>{f=o+"/"+d,l=t.extname(d).toLowerCase(),".nsp"===l?m():""===l?NEXT([e=>{CHECK_FILE_EXISTS(f+".nsp",t=>{t===!0?CHECK_IS_FOLDER(f+".nsp",t=>{t===!0?e():(f+=".nsp",m())}):e()})},e=>{return()=>{void 0!==i?(CHECK_IS_ARRAY(i)===!0?CHECK_IS_IN({array:i,value:d})===!0?d=i+".nsp":EACH(i,e=>{if(e+"/"===d.substring(0,e.length+1))return h=d.substring(e.length+1),d=e+".nsp",!1}):i===d?d=i+".nsp":i+"/"===d.substring(0,i.length+1)&&(h=d.substring(i.length+1),d=i+".nsp"),CHECK_FILE_EXISTS(o+"/"+d,t=>{t===!0?(f=o+"/"+d,m()):e()})):e()}},()=>{return()=>{CHECK_FILE_EXISTS(f,e=>{e===!0?CHECK_IS_FOLDER(f,e=>{e===!0?(f+="/index.nsp",m()):p()}):p()})}}]):p()}}])};return{uploadOverFileSize:(e,t,n,r)=>{_(n,void 0,r,()=>{})},uploadSuccess:(e,t,n,r)=>{_(n,t,r,()=>{})},notExistsHandler:(e,t,n)=>{r(n)},requestListener:(e,t,n,r)=>{return _(e,void 0,t,r),!1}}}}}),NSP.Compile=METHOD(e=>{let t=require("path"),n={};e.getSavedCodes=(()=>{return n});return e.require=require,{run:e=>{let r,o,i,s,u,a,_,c,p,f=e.path,l=e.code,d=e.isNotUsingDCBN,h=e.preprocessor,m="",C=0,E=0,T=1,I=1,S=0,g=0,N=[0],x=!1,H=!1,L=!1,P=!1,b=!1,U=!1,v=!1,y=!1,R=!1,D=()=>{return x===!0||L===!0||P===!0||b===!0},F=()=>{return U===!0||v===!0||y===!0||R===!0},k=()=>{N[N.length-1]+=1,m+="__pauseCount += 1;",m+="__store.resume = resume = () => { __pauseCount -= 1; if (__pauseCount === 0 && __store.doneResumeIndexes["+C+"] !== true) { __store.doneResumeIndexes["+C+"] = true;"},q=e=>{m+="let __pauseCount = 0;",m+="let __lastCondition;",m+="let __store = { doneResumeIndexes: {} };",m+="let resume;",m+=`let pause = () => {
\t\t\t\t\t
\t\t\t\t\t__pauseCount += 1;
\t\t\t\t\t
\t\t\t\t};`,m+=`let include = (path) => {
\t\t\t\t\t
\t\t\t\t\tNSP.Load({
\t\t\t\t\t\trequestInfo : __requestInfo,
\t\t\t\t\t\tpath : __basePath + '/' + path,
\t\t\t\t\t\tself : self
\t\t\t\t\t}, {
\t\t\t\t\t\tnotExists : () => {
\t\t\t\t\t\t\tprint(path + ': File not exists.');
\t\t\t\t\t\t\tresume();
\t\t\t\t\t\t},
\t\t\t\t\t\terror : (error, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) => {
\t\t\t\t\t\t\t
\t\t\t\t\t\t\tprint(NSP.GenerateErrorDisplay({
\t\t\t\t\t\t\t\tpath : path,
\t\t\t\t\t\t\t\tstartIndex : startIndex,
\t\t\t\t\t\t\t\tendIndex : endIndex,
\t\t\t\t\t\t\t\tstartLine : startLine,
\t\t\t\t\t\t\t\tstartColumn : startColumn,
\t\t\t\t\t\t\t\tendLine : endLine,
\t\t\t\t\t\t\t\tendColumn : endColumn,
\t\t\t\t\t\t\t\terror : error
\t\t\t\t\t\t\t}));
\t\t\t\t\t\t},
\t\t\t\t\t\tsuccess : (result) => {
\t\t\t\t\t\t\tprint(result.html);
\t\t\t\t\t\t\t
\t\t\t\t\t\t\tEXTEND({
\t\t\t\t\t\t\t\torigin : __newCookieInfo,
\t\t\t\t\t\t\t\textend : result.cookies
\t\t\t\t\t\t\t});
\t\t\t\t\t\t\t
\t\t\t\t\t\t\tEXTEND({
\t\t\t\t\t\t\t\torigin : __cookieInfo,
\t\t\t\t\t\t\t\textend : result.cookies
\t\t\t\t\t\t\t});
\t\t\t\t\t\t\t
\t\t\t\t\t\t\tresume();
\t\t\t\t\t\t}
\t\t\t\t\t});
\t\t\t\t\t
\t\t\t\t\tpause();
\t\t\t\t\t
\t\t\t\t};`,e===!0?m+="__store.resume = resume = () => { __pauseCount -= 1; };":k()};for(n[f]=l,m+="let __html = '';",m+="let __redirectURL;",m+="let __cookieInfo = __requestInfo.cookies;",m+="let __newCookieInfo = {};",m+="let __basePath = '"+t.dirname(f)+"';",m+=`let print = (content) => {
\t\t\t\t
\t\t\t\tif (content !== undefined) {
\t\t\t\t\tif (typeof content === 'string') {
\t\t\t\t\t\t__html += content;
\t\t\t\t\t} else {
\t\t\t\t\t\t__html += JSON.stringify(content);
\t\t\t\t\t}
\t\t\t\t}
\t\t\t\t
\t\t\t};`,m+=`let cookie = (name, value, expireSeconds, path, domain) => {
\t\t\t\t
\t\t\t\tif (value === undefined) {
\t\t\t\t\tvalue = __cookieInfo[name];
\t\t\t\t\t
\t\t\t\t\tif (CHECK_IS_DATA(value) === true) {
\t\t\t\t\t\treturn value.value;
\t\t\t\t\t} else {
\t\t\t\t\t\treturn value;
\t\t\t\t\t}
\t\t\t\t}
\t\t\t\t
\t\t\t\telse {
\t\t\t\t\t
\t\t\t\t\t__newCookieInfo[name] = __cookieInfo[name] = {
\t\t\t\t\t\tvalue : value,
\t\t\t\t\t\texpireSeconds : expireSeconds,
\t\t\t\t\t\tpath : path,
\t\t\t\t\t\tdomain : domain
\t\t\t\t\t};
\t\t\t\t\t
\t\t\t\t\treturn value;
\t\t\t\t}
\t\t\t\t
\t\t\t};`,m+=`let redirect = (url) => {
\t\t\t\t
\t\t\t\t__redirectURL = url;
\t\t\t\t
\t\t\t\t__handler({
\t\t\t\t\tcookies : __newCookieInfo,
\t\t\t\t\tredirectURL : __redirectURL
\t\t\t\t});
\t\t\t\t
\t\t\t};`,m+=`let __each = (target, func) => {
\t\t\t\t
\t\t\t\tif (isNaN(target) === true) {
\t\t\t\t\tEACH(target, (value, name) => {
\t\t\t\t\t\tfunc(name, value);
\t\t\t\t\t});
\t\t\t\t} else {
\t\t\t\t\tREPEAT(target, (i) => {
\t\t\t\t\t\tfunc(undefined, i);
\t\t\t\t\t});
\t\t\t\t}
\t\t\t\t
\t\t\t};`,q(!0),m+="print('";C<l.length;C+=1)if(S+=1,s=l[C],u=s+l[C+1],"<%"!==u||D()===!0)if("%>"!==u||F()===!0||x!==!0)if("<?"!==u||D()===!0)if("<~"!==u||D()===!0)if("->"!==u||F()===!0||P!==!0)if(":"!==s||F()===!0||P!==!0)if("el"!==u||"s"!==l[C+2]||"e"!==l[C+3]||" "!==l[C+4]&&"\t"!==l[C+4]&&">"!==l[C+4]&&"\r"!==l[C+4]&&"\n"!==l[C+4]||F()===!0||L!==!0){if(">"===s&&F()!==!0){if(L===!0){L=!1,N.push(0),m+=") === true) { ((__parentPause, __parentStore) => {",q(),m+="print('";continue}if(P===!0){P=!1,N.push(0),r===-1&&(m+=", (__name, __value"),m+=") => { ((__parentPause, __parentStore) => {",q(),m+="print('";continue}}if("</"===u&&">"===l[C+3]&&D()!==!0){if("?"===l[C+2]){m+="');",REPEAT(N[N.length-1],e=>{0===e&&(m+="__parentStore.resume();"),m+="} }; resume();"}),N.pop(),m+="__parentPause(); } )(pause, __store); } } catch(e) { __errorHandler(e, __path, "+I+", "+g+", "+T+", "+(S+3)+", "+E+", "+(C+4)+"); }",k(),m+="print('",C+=3,S+=3;continue}if("~"===l[C+2]){m+="');",REPEAT(N[N.length-1],e=>{0===e&&(m+="__parentStore.resume();"),m+="} }; resume();"}),N.pop(),m+="__parentPause(); } )(pause, __store); } ); } catch(e) { __errorHandler(e, __path, "+I+", "+g+", "+T+", "+(S+3)+", "+E+", "+(C+4)+"); }",k(),m+="print('",C+=3,S+=3;continue}}if(d===!0||"{{"!==u||D()===!0)if(d===!0||"}}"!==u||F()===!0||b!==!0){if("'"===s){if(D()!==!0){m+="\\'";continue}if(F()!==!0){U=!0,m+="'";continue}if(U===!0){U=!1,m+="'";continue}}if('"'===s&&D()===!0){if(F()!==!0){v=!0,m+='"';continue}if(v===!0){v=!1,m+='"';continue}}if("//"!==u||D()!==!0||F()===!0)if("/*"!==u||D()!==!0||F()===!0)if("*/"!==u||D()!==!0||R!==!0){if("\n"===s){if(T+=1,S=0,D()===!0&&y===!0){y=!1,m+="\n";continue}if(D()!==!0){m+="\\n";continue}}"\\"!==s||D()===!0?"\r"!==s&&(m+=s):m+="\\\\"}else R=!1,m+="*/",C+=1,S+=1;else R=!0,m+="/*",C+=1,S+=1;else y=!0,m+="//",C+=1,S+=1}else b=!1,m+="); } catch(e) { __errorHandler(e, __path, "+I+", "+g+", "+T+", "+(S+1)+", "+E+", "+(C+2)+"); }",k(),m+="print('",C+=1,S+=1;else b=!0,m+="'); try { print(",I=T,g=S,E=C,C+=1,S+=1}else m+="__lastCondition !== true",C+=3,S+=3;else m+=", ";else for(m+=", (",C+=1,S+=1,r=C+1;r<l.length;r+=1){if(">"===l[r]){m+="__name, ";break}if(":"===l[r])break}else P=!0,m+="'); try { __each(",I=T,g=S,E=C,C+=1,r=-1,S+=1;else L=!0,m+="'); try { if (__lastCondition = (",I=T,g=S,E=C,C+=1,S+=1;else x=!1,H===!0&&(H=!1,m+=");"),void 0===i?(i=C+2,_=T,p=S+1):m+="} catch(e) { __errorHandler(e, __path, "+I+", "+g+", "+T+", "+(S+1)+", "+E+", "+(C+2)+"); }",k(),m+="print('",C+=1,S+=1;else x=!0,I=T,g=S,E=C,void 0===o?(o=C,a=T,c=S,m+="');"):m+="'); try {","="===l[C+2]?(H=!0,m+="print(",C+=2,S+=2):(C+=1,S+=1);return m+="'); __handler({ html: __html, cookies: __newCookieInfo });",REPEAT(N[0],()=>{m+="} }; resume();"}),void 0!==h&&(m=h(m)),void 0!==o&&(m="try {"+m+"} catch(e) { __errorHandler(e, __path, "+a+", "+c+", "+_+", "+p+", "+o+", "+i+"); }"),m="let __path = '"+f+"';"+m,m="let require = NSP.Compile.require;"+m}}}),NSP.GenerateErrorDisplay=METHOD({run:e=>{let t="";return t+="<p><b>"+e.error+"</b></p>",t+="<p><b>path: </b>"+e.path+" ("+e.startLine+":"+e.startColumn+"~"+e.endLine+":"+e.endColumn+")</p>",t+="<pre>"+NSP.Compile.getSavedCodes()[e.path].substring(e.startIndex,e.endIndex)+"</pre>"}}),NSP.Load=METHOD(e=>{let t={};return{run:(e,n)=>{let r=e.requestInfo,o=e.path,i=e.self,s=e.isNotUsingDCBN,u=e.preprocessor,a=n.notExists,_=n.error,c=n.success;GET_FILE_INFO(o,{notExists:a,success:e=>{let n=t[o];void 0!==n&&(void 0!==e.lastUpdateTime&&n.lastUpdateTime.getTime()===e.lastUpdateTime.getTime()||void 0!==e.createTime&&n.lastUpdateTime.getTime()===e.createTime.getTime())?n.run(r,i,_,c):READ_FILE(o,{notExists:a,error:_,success:n=>{let a=new Function("__requestInfo","self","__errorHandler","__handler",NSP.Compile({path:o,code:n.toString(),isNotUsingDCBN:s,preprocessor:u}));t[o]={lastUpdateTime:void 0===e.lastUpdateTime?e.createTime:e.lastUpdateTime,run:a},a(r,i,_,c)}})}})}}});