NSP.Bridge=METHOD(e=>{let t=require("path"),n=(e,t,n,r,o,i,s,c,u)=>{e({statusCode:500,content:'<!doctype html><html><head><meta charset="UTF-8"><title>'+t+"</title></head><body>"+NSP.GenerateErrorDisplay({path:n,startIndex:c,endIndex:u,startLine:r,startColumn:o,endLine:i,endColumn:s,error:t})+"</body></html>",contentType:"text/html"})},r=e=>{e({statusCode:404,content:'<!doctype html><html><head><meta charset="UTF-8"><title>Page not found.</title></head><body><p><b>Page not found.</b></p></body></html>',contentType:"text/html"})};return{run:e=>{let o=e.rootPath,i=e.restURI,s=e.isNotUsingDCBN,c=e.preprocessor,u=e.templateEngine,a=(e,a,d,_)=>{let p,f,l=e.uri,h="",I=()=>{NSP.Load({requestInfo:e,path:p,self:{headers:e.headers,method:e.method,params:e.params,ip:e.ip,subURI:h,fileDataSet:a},isNotUsingDCBN:s,preprocessor:c},{notExists:()=>{r(d)},error:(e,t,r,o,i,s,c,u)=>{n(d,e,t,r,o,i,s,c,u)},success:e=>{d(void 0!==e.redirectURL?{statusCode:302,cookies:e.cookies,headers:{Location:e.redirectURL}}:{cookies:e.cookies,content:void 0===u?e.html:u(e.html),contentType:"text/html"})}})};NEXT([e=>{""===l?CHECK_FILE_EXISTS(o+"/index.nsp",t=>{l=t===!0?"index.nsp":"index.html",e()}):e()},()=>{return()=>{p=o+"/"+l,f=t.extname(l).toLowerCase(),".nsp"===f?I():""===f?NEXT([e=>{CHECK_FILE_EXISTS(p+".nsp",t=>{t===!0?CHECK_IS_FOLDER(p+".nsp",t=>{t===!0?e():(p+=".nsp",I())}):e()})},e=>{return()=>{void 0!==i?(CHECK_IS_ARRAY(i)===!0?CHECK_IS_IN({array:i,value:l})===!0?l=i+".nsp":EACH(i,e=>{if(e+"/"===l.substring(0,e.length+1))return h=l.substring(e.length+1),l=e+".nsp",!1}):i===l?l=i+".nsp":i+"/"===l.substring(0,i.length+1)&&(h=l.substring(i.length+1),l=i+".nsp"),CHECK_FILE_EXISTS(o+"/"+l,t=>{t===!0?(p=o+"/"+l,I()):e()})):e()}},()=>{return()=>{CHECK_FILE_EXISTS(p,e=>{e===!0?CHECK_IS_FOLDER(p,e=>{e===!0?(p+="/index.nsp",I()):_()}):_()})}}]):_()}}])};return{uploadOverFileSize:(e,t,n,r)=>{a(n,void 0,r,()=>{})},uploadSuccess:(e,t,n,r)=>{a(n,t,r,()=>{})},notExistsHandler:(e,t,n)=>{r(n)},requestListener:(e,t,n,r)=>{return a(e,void 0,t,r),!1}}}}}),NSP.Compile=METHOD(e=>{let t=require("path"),n={};e.getSavedCodes=(()=>{return n});return e.require=require,{run:e=>{let r,o,i,s,c,u,a,d,_,p=e.path,f=e.code,l=e.isNotUsingDCBN,h=e.preprocessor,I="",m=0,C=0,S=1,g=1,k=0,E=0,T=[0],N=!1,R=!1,b=!1,x=!1,H=!1,L=!1,P=!1,U=!1,v=!1,y=!1;for(checkIsInCode=(()=>{return N===!0||b===!0||x===!0||H===!0}),checkIsInString=(()=>{return L===!0||P===!0||U===!0||v===!0||y===!0}),addResumeStart=(()=>{T[T.length-1]+=1,I+="__pauseCount += 1;",I+="__store.resume = resume = () => { __pauseCount -= 1; if (__pauseCount === 0 && __store.doneResumeIndexes["+m+"] !== true) { __store.doneResumeIndexes["+m+"] = true;"}),addBlockStart=(e=>{I+="let __pauseCount = 0;",I+="let __lastCondition;",I+="let __store = { doneResumeIndexes: {} };",I+="let resume;",I+=`let pause = () => {
\t\t\t\t\t
\t\t\t\t\t__pauseCount += 1;
\t\t\t\t\t
\t\t\t\t};`,I+=`let include = (path) => {
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
\t\t\t\t\t\t\tresume();
\t\t\t\t\t\t}
\t\t\t\t\t});
\t\t\t\t\t
\t\t\t\t\tpause();
\t\t\t\t\t
\t\t\t\t};`,e===!0?I+="__store.resume = resume = () => { __pauseCount -= 1; };":addResumeStart()}),n[p]=f,I+="let __html = '';",I+="let __redirectURL;",I+="let __cookieInfo = __requestInfo.cookies;",I+="let __newCookieInfo = {};",I+="let __basePath = '"+t.dirname(p)+"';",I+=`let print = (content) => {
\t\t\t\t
\t\t\t\tif (content !== undefined) {
\t\t\t\t\tif (typeof content === 'string') {
\t\t\t\t\t\t__html += content;
\t\t\t\t\t} else {
\t\t\t\t\t\t__html += JSON.stringify(content);
\t\t\t\t\t}
\t\t\t\t}
\t\t\t\t
\t\t\t};`,I+=`let cookie = (name, value, expireSeconds, path, domain) => {
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
\t\t\t};`,I+=`let redirect = (url) => {
\t\t\t\t
\t\t\t\t__redirectURL = url;
\t\t\t\t
\t\t\t\t__handler({
\t\t\t\t\tcookies : __newCookieInfo,
\t\t\t\t\tredirectURL : __redirectURL
\t\t\t\t});
\t\t\t\t
\t\t\t};`,I+=`let __each = (target, func) => {
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
\t\t\t};`,addBlockStart(!0),I+="print('";m<f.length;m+=1)if(k+=1,s=f[m],c=s+f[m+1],"<%"!==c||checkIsInCode()===!0)if("%>"!==c||checkIsInString()===!0||N!==!0)if("<?"!==c||checkIsInCode()===!0)if("<~"!==c||checkIsInCode()===!0)if("->"!==c||checkIsInString()===!0||x!==!0)if(":"!==s||checkIsInString()===!0||x!==!0)if("el"!==c||"s"!==f[m+2]||"e"!==f[m+3]||" "!==f[m+4]&&"\t"!==f[m+4]&&">"!==f[m+4]&&"\r"!==f[m+4]&&"\n"!==f[m+4]||checkIsInString()===!0||b!==!0){if(">"===s&&checkIsInString()!==!0){if(b===!0){b=!1,T.push(0),I+=") === true) { ((__parentPause, __parentStore) => {",addBlockStart(),I+="print('";continue}if(x===!0){x=!1,T.push(0),r===-1&&(I+=", (__name, __value"),I+=") => { ((__parentPause, __parentStore) => {",addBlockStart(),I+="print('";continue}}if("</"===c&&">"===f[m+3]&&checkIsInCode()!==!0){if("?"===f[m+2]){I+="');",REPEAT(T[T.length-1],e=>{0===e&&(I+="__parentStore.resume();"),I+="} }; resume();"}),T.pop(),I+="__parentPause(); } )(pause, __store); } } catch(e) { __errorHandler(e, __path, "+g+", "+E+", "+S+", "+(k+3)+", "+C+", "+(m+4)+"); }",addResumeStart(),I+="print('",m+=3,k+=3;continue}if("~"===f[m+2]){I+="');",REPEAT(T[T.length-1],e=>{0===e&&(I+="__parentStore.resume();"),I+="} }; resume();"}),T.pop(),I+="__parentPause(); } )(pause, __store); } ); } catch(e) { __errorHandler(e, __path, "+g+", "+E+", "+S+", "+(k+3)+", "+C+", "+(m+4)+"); }",addResumeStart(),I+="print('",m+=3,k+=3;continue}}if(l===!0||"{{"!==c||checkIsInCode()===!0)if(l===!0||"}}"!==c||checkIsInString()===!0||H!==!0){if("'"===s){if(checkIsInCode()!==!0){I+="\\'";continue}if(checkIsInString()!==!0){L=!0,I+="'";continue}if(L===!0){L=!1,I+="'";continue}}if('"'===s&&checkIsInCode()===!0){if(checkIsInString()!==!0){P=!0,I+='"';continue}if(P===!0){P=!1,I+='"';continue}}if("//"!==c||checkIsInCode()!==!0||checkIsInString()===!0)if("/*"!==c||checkIsInCode()!==!0||checkIsInString()===!0)if("*/"!==c||checkIsInCode()!==!0||v!==!0){if("/"===s&&checkIsInCode()===!0){if(checkIsInString()!==!0){for(let e=m+1;e<f.length&&"\n"!==f[e];e+=1)if(e>m+1&&"/"===f[e]){y=!0;break}I+="/";continue}if(y===!0){y=!1,I+="/";continue}}if("\n"===s){if(S+=1,k=0,checkIsInCode()===!0&&U===!0){U=!1,I+="\n";continue}if(checkIsInCode()!==!0){I+="\\n";continue}}"\\"!==s||checkIsInCode()===!0?"\r"!==s&&(I+=s):I+="\\\\"}else v=!1,I+="*/",m+=1,k+=1;else v=!0,I+="/*",m+=1,k+=1;else U=!0,I+="//",m+=1,k+=1}else H=!1,I+="); } catch(e) { __errorHandler(e, __path, "+g+", "+E+", "+S+", "+(k+1)+", "+C+", "+(m+2)+"); }",addResumeStart(),I+="print('",m+=1,k+=1;else H=!0,I+="'); try { print(",g=S,E=k,C=m,m+=1,k+=1}else I+="__lastCondition !== true",m+=3,k+=3;else I+=", ";else for(I+=", (",m+=1,k+=1,r=m+1;r<f.length;r+=1){if(">"===f[r]){I+="__name, ";break}if(":"===f[r])break}else x=!0,I+="'); try { __each(",g=S,E=k,C=m,m+=1,r=-1,k+=1;else b=!0,I+="'); try { if (__lastCondition = (",g=S,E=k,C=m,m+=1,k+=1;else N=!1,R===!0&&(R=!1,I+=");"),void 0===i?(i=m+2,a=S,_=k+1):I+="} catch(e) { __errorHandler(e, __path, "+g+", "+E+", "+S+", "+(k+1)+", "+C+", "+(m+2)+"); }",addResumeStart(),I+="print('",m+=1,k+=1;else N=!0,g=S,E=k,C=m,void 0===o?(o=m,u=S,d=k,I+="');"):I+="'); try {","="===f[m+2]?(R=!0,I+="print(",m+=2,k+=2):(m+=1,k+=1);return I+="'); __handler({ html: __html, cookies: __newCookieInfo });",REPEAT(T[0],()=>{I+="} }; resume();"}),void 0!==h&&(I=h(I)),void 0!==o&&(I="try {"+I+"} catch(e) { __errorHandler(e, __path, "+u+", "+d+", "+a+", "+_+", "+o+", "+i+"); }"),I="let __path = '"+p+"';"+I,I="let require = NSP.Compile.require;"+I}}}),NSP.GenerateErrorDisplay=METHOD({run:e=>{let t="";return t+="<p><b>"+e.error+"</b></p>",t+="<p><b>path: </b>"+e.path+" ("+e.startLine+":"+e.startColumn+"~"+e.endLine+":"+e.endColumn+")</p>",t+="<pre>"+NSP.Compile.getSavedCodes()[e.path].substring(e.startIndex,e.endIndex)+"</pre>"}}),NSP.Load=METHOD(e=>{let t={};return{run:(e,n)=>{let r=e.requestInfo,o=e.path,i=e.self,s=e.isNotUsingDCBN,c=e.preprocessor,u=n.notExists,a=n.error,d=n.success;GET_FILE_INFO(o,{notExists:u,success:e=>{let n=t[o];void 0!==n&&(void 0!==e.lastUpdateTime&&n.lastUpdateTime.getTime()===e.lastUpdateTime.getTime()||void 0!==e.createTime&&n.lastUpdateTime.getTime()===e.createTime.getTime())?n.run(r,i,a,d):READ_FILE(o,{notExists:u,error:a,success:n=>{let u=new Function("__requestInfo","self","__errorHandler","__handler",NSP.Compile({path:o,code:n.toString(),isNotUsingDCBN:s,preprocessor:c}));t[o]={lastUpdateTime:void 0===e.lastUpdateTime?e.createTime:e.lastUpdateTime,run:u},u(r,i,a,d)}})}})}}});