(function(){extend(qbaka,{report:reportAny,reportException:reportAny});
if(!qbaka.options){qbaka.options={}
}qbaka.custom=qbaka.custom||{};
var LIB_NODE_ID="qbaka";
var REPORTING_URL=!qbaka.options.reportingUrl?("https:"==document.location.protocol?"https:":"http:")+"//report.qbaka.net/":qbaka.options.reportingUrl;
var KEY_PARAM_NAME="key";
var VERSION=5;
var MAX_STACKTRACE_LENGTH=2000;
var MAX_CONTENT_LENGTH=128;
var MAX_STACKTRACE_LINES=64;
var MAX_STACKTRACE_URL_LENGTH=128;
var READY_STATES={uninitialized:1,loading:1,interactive:2,complete:3};
READY_STATES[null]=null;
var _lastEvent=null;
var _eventsQueue=[];
var EVENTS_QUEUE_SIZE=5;
var functionNameRegexp=/function ([\w\d\-_]+)\s*\(/;
var XMLHTTPREQUEST_CALLBACKS_NAMES=["onreadystatechange","onerror","onload","onprogress","ontimeout"];
var NATIVE_JSON_SUPPORT=window.JSON&&isNative(JSON.stringify);
var lastExceptionSent={at:0};
if(window.onerror&&!window.onerror.qbaka){window.__qbaka_eh=window.onerror
}window.onerror=onError;
if(qbaka.options.trackEvents){registerListener(window,"click",trackEvent);
registerListener(window,"submit",trackEvent)
}if(qbaka.options.autoTryCatch||qbaka.options.autoStacktrace){wrapAllWithTryCatch()
}handleData([]);
registerListener(window,"load",onLoad);
if(!qbaka.key){var libNode=document.getElementById(LIB_NODE_ID);
if(!libNode){return
}var keyIndex=libNode.src.indexOf(KEY_PARAM_NAME+"=");
qbaka.key=libNode.src.substr(keyIndex+KEY_PARAM_NAME.length+1)
}var pingImage=window.Image?new Image():document.createElement("img");
pingImage.src=REPORTING_URL+qbaka.key+"/ping";
var userAgent=navigator.userAgent.toLowerCase();
if(window.__qbaka_reports&&__qbaka_reports.length>0){var result=[];
for(var i=0;
i<__qbaka_reports.length;
i++){var report=__qbaka_reports[i];
if(report.splice){reportString(report[0][0],report[1])
}else{result.push(buildOnErrorReport(report[0],report[1],report[2]))
}}sendReports(result)
}var ie=/msie/i.test(userAgent);
var chrome=/chrome/i.test(userAgent);
var firefox=/firefox/i.test(userAgent);
var mobile=/(android|ios|mobi|symbian|midp)/i.test(userAgent);
var checkAdBlock=false;
var adBlock=null;
if(checkAdBlock){detectAdBlock();
document.addEventListener("DOMContentLoaded",function(){if(!adBlock){setTimeout(function(){detectAdBlock()
},100)
}},false)
}function safe(f,c){try{if(!f||typeof(f)=="undefined"){return f
}if(typeof(f)=="string"){f=new Function(f)
}if(!isFunction(f)){return f
}if(f.$afe){return f.$afe
}var $safeFunc=function $safeFunc(){try{return f.apply(this,arguments)
}catch(e){if(c){try{c.apply(this,arguments)
}catch(ignored){}}if(isString(e)){e={message:e}
}else{if(e instanceof Error){if(reportException(e)){logException(e)
}}else{log("Unknown exception type thrown by user code: "+e)
}}log("Rethrowing exception, following exception IS NOT QBAKA ERROR");
throw e
}};
f.$afe=$safeFunc;
return $safeFunc
}catch(e){return f
}}function logException(e){log("Exception in callback occurred, sent to qbaka servers");
var stack=e.stack;
if(!stack||!/Error: /.test(stack.split("\n")[0])){log(e.message)
}if(stack){log(stack)
}}function wrapMethod(obj,name){obj[name]=safe(obj[name])
}function eventOfException(event){trackEvent(event);
if(_eventsQueue.length>0){_eventsQueue[_eventsQueue.length-1].reason=true
}}function wrapEventRegisteringFunction(obj){var oldRegister=obj.addEventListener;
var oldUnregister=obj.removeEventListener;
if(qbaka.options.trackEvents){obj.addEventListener=function(a,b,c){oldUnregister.apply(this,arguments);
return oldRegister.call(this,a,safe(b,eventOfException),c)
}
}else{obj.addEventListener=function(a,b,c){oldUnregister.apply(this,arguments);
return oldRegister.call(this,a,safe(b),c)
}
}obj.removeEventListener=function(a,b,c){oldUnregister.apply(this,arguments);
return oldUnregister.call(this,a,safe(b),c)
}
}function wrapXMLHttpRequest(){var proto=XMLHttpRequest.prototype;
var _send=proto.send;
if(proto.addEventListener){wrapEventRegisteringFunction(proto)
}proto.send=function(){var _this=this;
function wrapCallbacks(){try{for(var i=0;
i<XMLHTTPREQUEST_CALLBACKS_NAMES.length;
i++){wrapMethod(_this,XMLHTTPREQUEST_CALLBACKS_NAMES[i])
}}catch(ignored){}}wrapCallbacks();
setTimeout(wrapCallbacks,1);
return _send.apply(this,arguments)
}
}function wrapTimer(){var _setTimeout=window.setTimeout;
window.setTimeout=function(a,b){return _setTimeout(safe(a),b)
};
var _setInterval=window.setInterval;
window.setInterval=function(a,b){return _setInterval(safe(a),b)
}
}function wrapReplace(){var _replace=String.prototype.replace;
String.prototype.replace=function wrappedReplace(what,newValue){if(isFunction(newValue)){return _replace.call(this,what,safe(newValue))
}else{return _replace.apply(this,arguments)
}}
}function exceptionHasStack(){return typeof(new Error().stack)=="string"
}function wrapAllWithTryCatch(){if(!exceptionHasStack()){return
}wrapTimer();
if(document.addEventListener){wrapEventRegisteringFunction(document);
wrapEventRegisteringFunction(window);
wrapEventRegisteringFunction(Element.prototype);
if(isNative(HTMLButtonElement.prototype.addEventListener)){var ELEMENT_NAMES=["HTMLAnchorElement","HTMLAppletElement","HTMLAreaElement","HTMLBaseElement","HTMLBaseFontElement","HTMLBlockquoteElement","HTMLBodyElement","HTMLBRElement","HTMLButtonElement","HTMLDirectoryElement","HTMLDivElement","HTMLDListElement","HTMLFieldSetElement","HTMLFontElement","HTMLFormElement","HTMLFrameElement","HTMLFrameSetElement","HTMLHeadElement","HTMLHeadingElement","HTMLHRElement","HTMLHtmlElement","HTMLIFrameElement","HTMLImageElement","HTMLInputElement","HTMLIsIndexElement","HTMLLabelElement","HTMLLayerElement","HTMLLegendElement","HTMLLIElement","HTMLLinkElement","HTMLMapElement","HTMLMenuElement","HTMLMetaElement","HTMLModElement","HTMLObjectElement","HTMLOListElement","HTMLOptGroupElement","HTMLOptionElement","HTMLParagraphElement","HTMLParamElement","HTMLPreElement","HTMLQuoteElement","HTMLScriptElement","HTMLSelectElement","HTMLStyleElement","HTMLTableCaptionElement","HTMLTableCellElement","HTMLTableColElement","HTMLTableElement","HTMLTableRowElement","HTMLTableSectionElement","HTMLTextAreaElement","HTMLTitleElement","HTMLUListElement"];
for(var i=0;
i<ELEMENT_NAMES.length;
i++){var name=ELEMENT_NAMES[i];
if(window[name]){wrapEventRegisteringFunction(window[name].prototype)
}}}}if(typeof XMLHttpRequest!="undefined"){wrapXMLHttpRequest()
}}function shortenLink(link){var origin=document.location.origin;
if(link.indexOf(origin)==0){return link.substring(origin.length)
}return link
}function buildSelector(target){if(target==null){return null
}if(target==document){return""
}var result=target.tagName.toLowerCase();
if(target.id){result+="#"+target.id
}else{if(target.href){result+="[href="+shortenLink(target.href)+"]"
}else{if(target.src){result+="[src="+shortenLink(target.src)+"]"
}}}var className=target.className;
if(className){if(className.baseVal!=null){className=className.baseVal||""
}className=className.trim();
if(className.length>0){result+="."+className.trim().replace(/\s+/g,".")
}}return result
}function pushEvent(event){if(event===_lastEvent){return
}_lastEvent=event;
var target=event.target||event.srcElement;
var result={name:event.type,target:buildSelector(target),t:now()};
if(target.tagName){switch(target.tagName.toLowerCase()){case"button":result.content=target.innerText.substring(0,MAX_CONTENT_LENGTH);
break;
case"input":result.content=target.value.substring(0,MAX_CONTENT_LENGTH);
break
}}_eventsQueue.push(result);
if(_eventsQueue.length>EVENTS_QUEUE_SIZE){_eventsQueue.splice(0,1)
}}function trackEvent(event){try{pushEvent(event)
}catch(e){}}function canUseStorage(){return typeof(navigator.onLine)!="undefined"&&typeof(window.localStorage)!="undefined"
}function handleData(data){if(canUseStorage()){if(!navigator.onLine){storeData(data)
}else{try{var oldData=localStorage.getItem("qbaka_data");
var newData=data;
if(oldData){newData=parseJSON(oldData).concat(data);
localStorage.removeItem("qbaka_data")
}}catch(e){}sendData(newData)
}}else{sendData(data)
}}function sendData(data){if(data.length==0){return
}var iframe=document.createElement("iframe");
iframe.style.display="none";
document.lastChild.appendChild(iframe);
setIframeContent(iframe,"\n<form id='reporting' accept-charset='utf-8' method='POST' action='"+REPORTING_URL+"'><input type='hidden' id='data' name='data' value=''></form>\n");
var content=getIframeContent(iframe);
content.getElementById("data").value=encodeJSON(data);
content.getElementById("reporting").submit();
removeIframeAfterDelay(iframe)
}function storeData(data){var oldData=parseJSON(localStorage.getItem("qbaka_data")||"[]");
var newData=oldData.concat(data);
localStorage.setItem("qbaka_data",encodeJSON(newData))
}function removeIframeAfterDelay(iframe){setTimeout(function(){iframe.parentNode.removeChild(iframe);
iframe=null
},2000)
}function getIframeContent(iframe){iframe=iframe.contentWindow||iframe.contentDocument;
if(iframe.document){return iframe.document
}return iframe
}function setIframeContent(iframe,content){iframe=getIframeContent(iframe);
iframe.open();
iframe.write(content);
iframe.close()
}function onLoad(){if(window.onerror!==onError){window.__qbaka_eh=window.onerror;
window.onerror=onError
}}function onError(message,url,line){if(!message||(message=="Script error.")){return false
}if(now()-lastExceptionSent.at<1000&&endsWith(message,lastExceptionSent.message)){return false
}try{var report=buildOnErrorReport(message,url,line);
if(ie){var stack=[];
var caller=arguments.callee.caller;
var i=10;
while(caller&&i--){stack.push(getFunctionName(caller));
caller=caller.caller
}if(stack.length>0){report.stack=stack
}}sendReports([report])
}catch(e){}try{if(window.__qbaka_eh&&window.__qbaka_eh!=onError){window.__qbaka_eh.apply(window,arguments)
}}catch(e){}return false
}function buildOnErrorReport(message,url,line){return{msg:message,script:url,line:line}
}function reportString(obj,errorObject){report={};
var rawStack=errorObject&&errorObject.stack;
if(rawStack){var stack=rawStack.split("\n");
if(stack.length>1&&stack[0][0]!=" "&&stack[1][0]==" "){stack.splice(0,2)
}else{stack.splice(0,1)
}report.exception={message:obj,stack:stack.join("\n")}
}else{report.msg=obj
}sendReports([report])
}function reportAny(obj){try{if(obj instanceof Error){reportException(obj)
}else{if(isString(obj)){reportString(obj,new Error())
}else{log("Invalid parameter type to qbaka.report(): "+obj)
}}}catch(ignored){}}function reportException(e){if(lastExceptionSent&&lastExceptionSent.object===e){return false
}lastExceptionSent={at:now(),message:e.message,object:e};
var report={exception:{message:e.message,stack:cutStacktrace(e.stack),args:e.arguments,exname:getExceptionName(e),errnum:e.number,obj:e}};
sendReports([report]);
return true
}function cutStacktrace(trace){if(!trace||trace.length<MAX_STACKTRACE_LENGTH){return trace
}try{var urlCut=trace.replace(/((https|http|file)?:\/\/)([^:]*)(:\d+)/g,function(full,prefix,_1,url,suffix){try{if(full.length>MAX_STACKTRACE_URL_LENGTH){var i=url.indexOf("?");
if(i>0){url=url.substring(0,i)
}return prefix+url+suffix
}}catch(e){}return full
}).replace(/data:text\/javascript;base64,[A-Za-z0-9+/]*/g,function(url){try{return url.substring(0,Math.min(url.length,MAX_STACKTRACE_URL_LENGTH))
}catch(e){return url
}});
var lines=urlCut.split("\n");
if(lines.length<MAX_STACKTRACE_LINES){return urlCut
}lines.splice(MAX_STACKTRACE_LINES,lines.length-MAX_STACKTRACE_LINES)
}catch(e){return trace
}return lines.join("\n")
}function sendReports(reports){try{for(var i=0;
i<reports.length;
i++){prepareReport(reports[i])
}handleData(reports)
}catch(e){}}function prepareReport(report){if(!ie&&!mobile){extend(report,{plugins:getPluginsList()})
}extend(report,{key:qbaka.key,url:window.location.href,cD:qbaka.custom.data,tags:qbaka.custom.tags,user:qbaka.user,tzone:new Date().getTimezoneOffset(),rS:READY_STATES[document.readyState],v:VERSION,t:now()});
if(_eventsQueue.length>0){var result=[];
var base=now();
for(var i=0;
i<_eventsQueue.length;
i++){var e=_eventsQueue[i];
result.push({name:e.name,target:e.target,t:base-e.t,content:e.content})
}if(_eventsQueue[_eventsQueue.length-1].reason){result[result.length-1].t=0
}report.events=result
}}function getPluginsList(){var hash=[];
var plugins=[];
for(var i=0;
i<navigator.plugins.length;
i++){if(hash[navigator.plugins[i].name+navigator.plugins[i].description]===undefined){hash[navigator.plugins[i].name+navigator.plugins[i].description]=i;
var plugin={name:navigator.plugins[i].name.toLowerCase(),desc:navigator.plugins[i].description.toLowerCase()};
if(/flash|macromedia|banner|ad|block|anti/i.test(plugin.name)||/flash|macromedia|banner|ad|block|anti/i.test(plugin.desc)){plugins.push(plugin)
}}}return plugins
}function detectAdBlock(){if(chrome){adBlock=detectAdBlockChrome()
}else{if(firefox){adBlock=detectAdBlockFirefox()
}}}function detectAdBlockChrome(){var detect=function(node){var styles=node.getElementsByTagName("style");
var adBlockTest="/*This block of style rules is inserted by AdBlock";
for(var i=0;
i<styles.length;
i++){var style=styles[i];
if(style.innerHTML.slice(0,adBlockTest.length)==adBlockTest){return true
}}return false
};
return detect(document)
}function detectAdBlockFirefox(){return null
}function isString(value){return typeof value=="string"
}function isFunction(functionToCheck){return functionToCheck&&({}).toString.call(functionToCheck)=="[object Function]"
}if(typeof(/./)!=="function"){isFunction=function(obj){return typeof obj==="function"
}
}function isNative(f){return f&&/native code/.test(f.toString())
}function endsWith(s,suffix){return s.indexOf(suffix,s.length-suffix.length)!==-1
}function now(){return(new Date()).getTime()
}function registerListener(elem,evName,evHandler){if(elem.addEventListener){elem.addEventListener(evName,evHandler,false)
}else{if(elem.attachEvent){elem.attachEvent("on"+evName,evHandler)
}}}function getFunctionName(f){return f.name||(functionNameRegexp.test(f.toString())?RegExp.$1:"{anonymous}")
}function getExceptionName(e){if(!e||!e.constructor){return""
}if(typeof e.constructor.name!="undefined"){return e.constructor.name
}else{return getFunctionName(e.constructor)
}}function isDefined(value){return value!=null&&value!=undefined
}function extend(a,b){for(var i in b){a[i]=b[i]
}return a
}function log(){if(window.console&&console.log){console.log.apply(console,arguments)
}}function encodeJSON(o){if(NATIVE_JSON_SUPPORT){return JSON.stringify(o)
}return manualEncodeJson(o,0)
}function parseJSON(s){if(NATIVE_JSON_SUPPORT){return JSON.parse(s)
}return eval(s)
}function stringRepr(s){return'"'+s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r/g,"\\r").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f")+'"'
}function manualEncodeJson(o,level){var r;
level=(level||0)+1;
if(level>=10){return"null"
}if(o==undefined){return"null"
}if(o==null||typeof o=="number"||typeof o=="boolean"){return o+""
}if(typeof o=="string"){return stringRepr(o)
}if(o instanceof Array){if(!o.length){return"[]"
}r="[";
for(var i=0;
i<o.length;
i++){r+=manualEncodeJson(o[i],level);
r+=","
}return r.substring(0,r.length-1)+"]"
}r="{";
for(i in o){r+=stringRepr(i);
r+=":";
r+=manualEncodeJson(o[i],level);
r+=","
}return r.length>1?r.substring(0,r.length-1)+"}":"{}"
}})();