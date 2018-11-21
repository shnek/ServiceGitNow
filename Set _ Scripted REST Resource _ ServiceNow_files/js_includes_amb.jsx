/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/amb-client-js.bundle.js */
!function(e, n) {
"object" == typeof exports && "object" == typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define([], n) : "object" == typeof exports ? exports.ambClientJs = n() : e.ambClientJs = n()
}(this, function() {
return function(e) {
function n(i) {
if (t[i]) return t[i].exports;
var r = t[i] = {i: i, l: !1, exports: {}};
return e[i].call(r.exports, r, r.exports, n), r.l = !0, r.exports
}
var t = {};
return n.m = e, n.c = t, n.d = function(e, t, i) {
n.o(e, t) || Object.defineProperty(e, t, {configurable: !1, enumerable: !0, get: i})
}, n.n = function(e) {
var t = e && e.__esModule ? function() {
return e.default
} : function() {
return e
};
return n.d(t, "a", t), t
}, n.o = function(e, n) {
return Object.prototype.hasOwnProperty.call(e, n)
}, n.p = "", n(n.s = 8)
}([function(e, n, t) {
"use strict";
Object.defineProperty(n, "__esModule", {value: !0});
var i = t(1), r = function(e) {
return e && e.__esModule ? e : {default: e}
}(i), o = function(e) {
function n(n) {
window.console && console.log(e + " " + n)
}
var t = "debug" == r.default.logLevel;
return {
debug: function(e) {
t && n("[DEBUG] " + e)
}, addInfoMessage: function(e) {
n("[INFO] " + e)
}, addErrorMessage: function(e) {
n("[ERROR] " + e)
}
}
};
n.default = o
}, function(e, n, t) {
"use strict";
Object.defineProperty(n, "__esModule", {value: !0});
var i = {servletURI: "amb/", logLevel: "info", loginWindow: "true"};
n.default = i
}, function(e, n, t) {
"use strict";
Object.defineProperty(n, "__esModule", {value: !0});
var i = function(e) {
var n = [], t = 0;
return {
subscribe: function(e, i) {
var r = t++;
return n.push({event: e, callback: i, id: r}), r
}, unsubscribe: function(e) {
for (var t = 0; t < n.length; t++) e === n[t].id && n.splice(t, 1)
}, publish: function(e, n) {
for (var t = this._getSubscriptions(e), i = 0; i < t.length; i++) t[i].callback.apply(null, n)
}, getEvents: function() {
return e
}, _getSubscriptions: function(e) {
for (var t = [], i = 0; i < n.length; i++) n[i].event === e && t.push(n[i]);
return t
}
}
};
n.default = i
}, function(e, n, t) {
"use strict";
Object.defineProperty(n, "__esModule", {value: !0});
var i = t(0), r = function(e) {
return e && e.__esModule ? e : {default: e}
}(i), o = function(e, n, t, i) {
var o = void 0, s = void 0, u = new r.default("amb.ChannelListener"), a = null, c = void 0, l = e;
return {
getCallback: function() {
return s
}, getSubscriptionCallback: function() {
return i
}, getID: function() {
return o
}, subscribe: function(e) {
return s = e, t && (a = t.subscribeToEvent(t.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this))), c = n.subscribeToEvent(n.getEvents().CONNECTION_OPENED, this._subscribeWhenReady.bind(this)), this
}, resubscribe: function() {
return this.subscribe(s)
}, _switchToChannel: function(e, n) {
e && n && e.getName() === l.getName() && (this.unsubscribe(), l = n, this.subscribe(s))
}, _subscribeWhenReady: function() {
u.debug("Subscribing to '" + l.getName() + "'..."), o = l.subscribe(this)
}, unsubscribe: function() {
return t && t.unsubscribeToEvent(a), l.unsubscribe(this), n.unsubscribeFromEvent(c), u.debug("Unsubscribed from channel: " + l.getName()), this
}, publish: function(e) {
l.publish(e)
}, getName: function() {
return l.getName()
}
}
};
n.default = o
}, function(e, n, t) {
"use strict";
function i(e) {
return e && e.__esModule ? e : {default: e}
}
Object.defineProperty(n, "__esModule", {value: !0});
var r = t(2), o = i(r), s = t(0), u = i(s), a = t(1), c = i(a), l = function(e) {
function n(e) {
setTimeout(function() {
e.successful && r()
}, 0)
}
function t(n) {
n.ext && (!1 === n.ext["glide.amb.active"] && I.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (amb.properties.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(amb.properties.logLevel)))
}
function i(e) {
if (t(e), m) return void setTimeout(function() {
v = !1, a()
}, 0);
var n = e.error;
n && (x = n), d(e);
var i = v;
v = !0 === e.successful, !i && v ? s() : i && !v && l()
}
function r() {
T.debug("Connection initialized"), C = "initialized", b(_.getEvents().CONNECTION_INITIALIZED)
}
function s() {
T.debug("Connection opened"), C = "opened", b(_.getEvents().CONNECTION_OPENED)
}
function a() {
T.debug("Connection closed"), C = "closed", b(_.getEvents().CONNECTION_CLOSED)
}
function l() {
T.addErrorMessage("Connection broken"), C = "broken", b(_.getEvents().CONNECTION_BROKEN)
}
function d(e) {
var n = e.ext;
if (n) {
var t = n["glide.session.status"];
switch (S = !0 === n["glide.amb.login.window.override"], T.debug("session.status - " + t), t) {
case"session.logged.out":
y && g();
break;
case"session.logged.in":
y || f();
break;
case"session.invalidated":
case null:
y && h();
break;
default:
T.debug("unknown session status - " + t)
}
}
}
function f() {
y = !0, T.debug("LOGGED_IN event fire!"), b(_.getEvents().SESSION_LOGGED_IN), I.loginHide()
}
function g() {
y = !1, T.debug("LOGGED_OUT event fire!"), b(_.getEvents().SESSION_LOGGED_OUT), I.loginShow()
}
function h() {
y = !1, T.debug("INVALIDATED event fire!"), b(_.getEvents().SESSION_INVALIDATED)
}
function b(e) {
try {
_.publish(e)
} catch (n) {
T.addErrorMessage("error publishing '" + e + "' - " + n)
}
}
function p(e) {
for (var n = "", t = 0; t < window.location.pathname.match(/\//g).length - 1; t++) n = "../" + n;
return n + e
}
var v = !1, m = !1, _ = new o.default({
CONNECTION_INITIALIZED: "connection.initialized",
CONNECTION_OPENED: "connection.opened",
CONNECTION_CLOSED: "connection.closed",
CONNECTION_BROKEN: "connection.broken",
SESSION_LOGGED_IN: "session.logged.in",
SESSION_LOGGED_OUT: "session.logged.out",
SESSION_INVALIDATED: "session.invalidated"
}), C = "closed", T = new u.default("amb.ServerConnection");
!function() {
e.addListener("/meta/handshake", this, n), e.addListener("/meta/connect", this, i)
}();
var y = !0, E = null, w = "true" === c.default.loginWindow, x = null,
k = {UNKNOWN_CLIENT: "402::Unknown client"}, S = !1, I = {};
return I.connect = function() {
if (v) return void console.log(">>> connection exists, request satisfied");
T.debug("Connecting to glide amb server -> " + c.default.servletURI), e.configure({
url: p(c.default.servletURI),
logLevel: c.default.logLevel
}), e.handshake()
}, I.reload = function() {
e.reload()
}, I.abort = function() {
e.getTransport().abort()
}, I.disconnect = function() {
T.debug("Disconnecting from glide amb server.."), m = !0, e.disconnect()
}, I.getEvents = function() {
return _.getEvents()
}, I.getConnectionState = function() {
return C
}, I.getLastError = function() {
return x
}, I.setLastError = function(e) {
x = e
}, I.getErrorMessages = function() {
return k
}, I.isLoggedIn = function() {
return y
}, I.loginShow = function() {
var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
if (T.debug("Show login window"), w && !S) try {
var n = new GlideModal("amb_disconnect_modal");
n.renderWithContent ? (n.template = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">  <div class="modal-dialog small-modal" style="width:450px">     <div class="modal-content">        <header class="modal-header">           <h4 id="small_modal1_title" class="modal-title">Login</h4>        </header>        <div class="modal-body">        </div>     </div>  </div></div>', n.renderWithContent(e)) : (n.setBody(e), n.render()), E = n
} catch (e) {
T.debug(e)
}
}, I.loginHide = function() {
E && (E.destroy(), E = null)
}, I.loginComplete = function() {
f()
}, I.subscribeToEvent = function(e, n) {
return _.getEvents().CONNECTION_OPENED === e && v && n(), _.subscribe(e, n)
}, I.unsubscribeFromEvent = function(e) {
_.unsubscribe(e)
}, I.isLoginWindowEnabled = function() {
return w
}, I.isLoginWindowOverride = function() {
return S
}, I._metaConnect = i, I._metaHandshake = n, I
};
n.default = l
}, function(e, n, t) {
"use strict";
function i(e) {
return e && e.__esModule ? e : {default: e}
}
Object.defineProperty(n, "__esModule", {value: !0});
var r = t(0), o = i(r), s = t(2), u = i(s), a = t(3), c = i(a), l = function(e, n, t) {
var i = !1, r = e, s = new u.default({CHANNEL_REDIRECT: "channel.redirect"}),
a = new o.default("amb.ChannelRedirect");
return {
subscribeToEvent: function(e, n) {
return s.subscribe(e, n)
}, unsubscribeToEvent: function(e) {
s.unsubscribe(e)
}, getEvents: function() {
return s.getEvents()
}, initialize: function() {
if (!i) {
var e = "/sn/meta/channel_redirect/" + r.getClientId(), o = t(e);
new c.default(o, n, null).subscribe(this._onAdvice), a.debug("ChannelRedirect initialized: " + e), i = !0
}
}, _onAdvice: function(e) {
a.debug("_onAdvice:" + e.data.clientId);
var n = t(e.data.fromChannel), i = t(e.data.toChannel);
s.publish(s.getEvents().CHANNEL_REDIRECT, [n, i]), a.debug("published channel switch event, fromChannel:" + n.getName() + ", toChannel:" + i.getName())
}
}
};
n.default = l
}, function(e, n, t) {
"use strict";
Object.defineProperty(n, "__esModule", {value: !0});
var i = t(0), r = function(e) {
return e && e.__esModule ? e : {default: e}
}(i), o = function(e, n, t) {
function i() {
var n = e.getStatus();
return "disconnecting" === n || "disconnected" === n
}
var o = null, s = null, u = [], a = [], c = new r.default("amb.Channel"), l = 0, d = t;
return {
subscribe: function(e) {
if (i()) return void c.addErrorMessage("Illegal state: already disconnected");
if (!e.getCallback()) return void c.addErrorMessage("Cannot subscribe to channel: " + n + ", callback not provided");
if (!o && d) try {
this.subscribeToCometD()
} catch (e) {
return void c.addErrorMessage(e)
}
for (var t = 0; t < u.length; t++) if (u[t] === e) return c.debug("Channel listener already in the list"), e.getID();
u.push(e);
var r = e.getSubscriptionCallback();
return r && (s ? r(s) : a.push(r)), ++l
}, resubscribe: function() {
o = null;
for (var e = 0; e < u.length; e++) u[e].resubscribe()
}, subscribeOnInitCompletion: function() {
d = !0, o = null;
for (var e = 0; e < u.length; e++) u[e].resubscribe(), c.debug("On init completion successfully subscribed to channel: " + n)
}, _handleResponse: function(e) {
for (var n = 0; n < u.length; n++) u[n].getCallback()(e)
}, unsubscribe: function(e) {
if (!e) return void c.addErrorMessage("Cannot unsubscribe from channel: " + n + ", listener argument does not exist");
for (var t = 0; t < u.length; t++) if (u[t].getID() === e.getID()) {
u.splice(t, 1);
break
}
u.length < 1 && o && !i() && this.unsubscribeFromCometD()
}, publish: function(t) {
e.publish(n, t)
}, subscribeToCometD: function() {
o = e.subscribe(n, this._handleResponse.bind(this), this.subscriptionCallback), c.debug("Successfully subscribed to channel: " + n)
}, subscriptionCallback: function(e) {
c.debug("Cometd subscription callback completed for channel: " + n), c.debug("Listener callback queue size: " + a.length), s = e, a.map(function(e) {
e(s)
}), a = []
}, unsubscribeFromCometD: function() {
null !== o && (e.unsubscribe(o), o = null, s = null, c.debug("Successfully unsubscribed from channel: " + n))
}, resubscribeToCometD: function() {
c.debug("Resubscribe to " + n), this.subscribeToCometD()
}, getName: function() {
return n
}, getChannelListeners: function() {
return u
}, getListenerCallbackQueue: function() {
return a
}, setSubscriptionCallbackResponse: function(e) {
s = e
}
}
};
n.default = o
}, function(e, n, t) {
"use strict";
function i(e) {
return e && e.__esModule ? e : {default: e}
}
Object.defineProperty(n, "__esModule", {value: !0});
var r = t(9), o = i(r), s = t(4), u = i(s), a = t(0), c = i(a), l = t(5), d = i(l), f = t(3), g = i(f),
h = t(6), b = i(h), p = t(10), v = i(p), m = function() {
function e() {
_.debug("connection broken!"), w = !0
}
function n() {
y = !0, s(), C.initialize(), _.debug("Connection initialized. Initializing " + E.length + " channels.");
for (var e = 0; e < E.length; e++) E[e].subscribeOnInitCompletion();
E = []
}
function t() {
if (w) {
if (_.debug("connection opened!"), p.getLastError() !== p.getErrorMessages().UNKNOWN_CLIENT) return;
p.setLastError(null), _.debug("channel resubscribe!");
var e = new XMLHttpRequest;
e.open("GET", "/amb_session_setup.do", !0), e.setRequestHeader("Content-type", "application/json;charset=UTF-8"), e.setRequestHeader("X-UserToken", window.g_ck), e.send(), e.onload = function() {
200 === this.status && (r(), w = !1)
}
}
}
function i() {
_.debug("Unsubscribing from all!");
for (var e in m) {
var n = m[e];
n && n.unsubscribeFromCometD()
}
}
function r() {
_.debug("Resubscribing to all!");
for (var e in m) {
var n = m[e];
n && n.resubscribeToCometD()
}
}
function s() {
C || (C = new d.default(f, p, a))
}
function a(e) {
if (e in m) return m[e];
var n = new b.default(f, e, y);
return m[e] = n, y || E.push(n), n
}
var l = new o.default, f = new l.CometD;
f.registerTransport("long-polling", new l.LongPollingTransport), f.unregisterTransport("websocket"), f.unregisterTransport("callback-polling");
var h = new v.default;
f.registerExtension("graphQLSubscription", h);
var p = new u.default(f), m = {}, _ = new c.default("amb.MessageClient"), C = null, T = !1, y = !1, E = [];
p.subscribeToEvent(p.getEvents().CONNECTION_BROKEN, e), p.subscribeToEvent(p.getEvents().CONNECTION_OPENED, t), p.subscribeToEvent(p.getEvents().CONNECTION_INITIALIZED, n), p.subscribeToEvent(p.getEvents().SESSION_LOGGED_OUT, i), p.subscribeToEvent(p.getEvents().SESSION_INVALIDATED, i), p.subscribeToEvent(p.getEvents().SESSION_LOGGED_IN, r);
var w = !1;
return {
getServerConnection: function() {
return p
},
isLoggedIn: function() {
return p.isLoggedIn()
},
loginComplete: function() {
p.loginComplete()
},
connect: function() {
if (T) return void _.addInfoMessage(">>> connection exists, request satisfied");
T = !0, p.connect()
},
reload: function() {
T = !1, p.reload()
},
abort: function() {
T = !1, p.abort()
},
disconnect: function() {
T = !1, p.disconnect()
},
isConnected: function() {
return T
},
getConnectionEvents: function() {
return p.getEvents()
},
subscribeToEvent: function(e, n) {
return p.subscribeToEvent(e, n)
},
unsubscribeFromEvent: function(e) {
p.unsubscribeFromEvent(e)
},
getConnectionState: function() {
return p.getConnectionState()
},
getClientId: function() {
return f.getClientId()
},
getChannel: function(e, n) {
var t = n || {}, i = t.subscriptionCallback, r = t.serializedGraphQLSubscription;
s();
var o = a(e);
return h.isGraphQLChannel(e) && (r ? h.addGraphQLChannel(e, r) : _.addErrorMessage("Serialized subscription not present for GraphQL channel " + e)), new g.default(o, p, C, i)
},
removeChannel: function(e) {
delete m[e], h.isGraphQLChannel(e) && h.removeGraphQLChannel(e)
},
getChannels: function() {
return m
},
registerExtension: function(e, n) {
f.registerExtension(e, n)
},
unregisterExtension: function(e) {
f.unregisterExtension(e)
},
batch: function(e) {
f.batch(e)
},
_connectionInitialized: n,
_connectionOpened: t,
_connectionBroken: e,
_unsubscribeAll: i,
_resubscribeAll: r,
_isConnectionBroken: function() {
return w
}
}
};
n.default = m
}, function(e, n, t) {
"use strict";
function i(e) {
return e && e.__esModule ? e : {default: e}
}
Object.defineProperty(n, "__esModule", {value: !0});
var r = t(1), o = i(r), s = t(0), u = i(s), a = t(2), c = i(a), l = t(4), d = i(l), f = t(5), g = i(f),
h = t(3), b = i(h), p = t(6), v = i(p), m = t(7), _ = i(m), C = t(11), T = i(C), y = {
properties: o.default,
Logger: u.default,
EventManager: c.default,
ServerConnection: d.default,
ChannelRedirect: g.default,
ChannelListener: b.default,
Channel: v.default,
MessageClient: _.default,
getClient: T.default
};
n.default = y
}, function(e, n, t) {
"use strict";
function i() {
var e = {
isString: function(e) {
return void 0 !== e && null !== e && ("string" == typeof e || e instanceof String)
}, isArray: function(e) {
return void 0 !== e && null !== e && e instanceof Array
}, inArray: function(e, n) {
for (var t = 0; t < n.length; ++t) if (e === n[t]) return t;
return -1
}, setTimeout: function(e, n, t) {
return window.setTimeout(function() {
try {
n()
} catch (t) {
e._debug("Exception invoking timed function", n, t)
}
}, t)
}, clearTimeout: function(e) {
window.clearTimeout(e)
}
}, n = function() {
var e = [], n = {};
this.getTransportTypes = function() {
return e.slice(0)
}, this.findTransportTypes = function(t, i, r) {
for (var o = [], s = 0; s < e.length; ++s) {
var u = e[s];
!0 === n[u].accept(t, i, r) && o.push(u)
}
return o
}, this.negotiateTransport = function(t, i, r, o) {
for (var s = 0; s < e.length; ++s) for (var u = e[s], a = 0; a < t.length; ++a) if (u === t[a]) {
var c = n[u];
if (!0 === c.accept(i, r, o)) return c
}
return null
}, this.add = function(t, i, r) {
for (var o = !1, s = 0; s < e.length; ++s) if (e[s] === t) {
o = !0;
break
}
return o || ("number" != typeof r ? e.push(t) : e.splice(r, 0, t), n[t] = i), !o
}, this.find = function(t) {
for (var i = 0; i < e.length; ++i) if (e[i] === t) return n[t];
return null
}, this.remove = function(t) {
for (var i = 0; i < e.length; ++i) if (e[i] === t) {
e.splice(i, 1);
var r = n[t];
return delete n[t], r
}
return null
}, this.clear = function() {
e = [], n = {}
}, this.reset = function() {
for (var t = 0; t < e.length; ++t) n[e[t]].reset()
}
}, t = function() {
var n, t;
this.registered = function(e, i) {
n = e, t = i
}, this.unregistered = function() {
n = null, t = null
}, this._debug = function() {
t._debug.apply(t, arguments)
}, this._mixin = function() {
return t._mixin.apply(t, arguments)
}, this.getConfiguration = function() {
return t.getConfiguration()
}, this.getAdvice = function() {
return t.getAdvice()
}, this.setTimeout = function(n, i) {
return e.setTimeout(t, n, i)
}, this.clearTimeout = function(n) {
e.clearTimeout(n)
}, this.convertToMessages = function(n) {
if (e.isString(n)) try {
return JSON.parse(n)
} catch (e) {
throw this._debug("Could not convert to JSON the following string", '"' + n + '"'), e
}
if (e.isArray(n)) return n;
if (void 0 === n || null === n) return [];
if (n instanceof Object) return [n];
throw"Conversion Error " + n + ", typeof " + (void 0 === n ? "undefined" : r(n))
}, this.accept = function(e, n, t) {
throw"Abstract"
}, this.getType = function() {
return n
}, this.send = function(e, n) {
throw"Abstract"
}, this.reset = function() {
this._debug("Transport", n, "reset")
}, this.abort = function() {
this._debug("Transport", n, "aborted")
}, this.toString = function() {
return this.getType()
}
};
t.derive = function(e) {
function n() {
}
return n.prototype = e, new n
};
var i = function() {
function n(e) {
for (; g.length > 0;) {
var n = g[0], t = n[0], i = n[1];
if (t.url !== e.url || t.sync !== e.sync) break;
g.shift(), e.messages = e.messages.concat(t.messages), this._debug("Coalesced", t.messages.length, "messages from request", i.id)
}
}
function i(e, n) {
if (this.transportSend(e, n), n.expired = !1, !e.sync) {
var t = this.getConfiguration().maxNetworkDelay, i = t;
!0 === n.metaConnect && (i += this.getAdvice().timeout), this._debug("Transport", this.getType(), "waiting at most", i, "ms for the response, maxNetworkDelay", t);
var r = this;
n.timeout = this.setTimeout(function() {
n.expired = !0;
var t = "Request " + n.id + " of transport " + r.getType() + " exceeded " + i + " ms max network delay",
o = {reason: t}, s = n.xhr;
o.httpCode = r.xhrStatus(s), r.abortXHR(s), r._debug(t), r.complete(n, !1, n.metaConnect), e.onFailure(s, e.messages, o)
}, i)
}
}
function r(e) {
var n = ++l, t = {id: n, metaConnect: !1};
f.length < this.getConfiguration().maxConnections - 1 ? (f.push(t), i.call(this, e, t)) : (this._debug("Transport", this.getType(), "queueing request", n, "envelope", e), g.push([e, t]))
}
function o(e) {
var n = e.id;
if (this._debug("Transport", this.getType(), "metaConnect complete, request", n), null !== d && d.id !== n) throw"Longpoll request mismatch, completing request " + n;
d = null
}
function s(t, i) {
var o = e.inArray(t, f);
if (o >= 0 && f.splice(o, 1), g.length > 0) {
var s = g.shift(), u = s[0], a = s[1];
if (this._debug("Transport dequeued request", a.id), i) this.getConfiguration().autoBatch && n.call(this, u), r.call(this, u), this._debug("Transport completed request", t.id, u); else {
var c = this;
this.setTimeout(function() {
c.complete(a, !1, a.metaConnect);
var e = {reason: "Previous request failed"}, n = a.xhr;
e.httpCode = c.xhrStatus(n), u.onFailure(n, u.messages, e)
}, 0)
}
}
}
function u(e) {
if (null !== d) throw"Concurrent metaConnect requests not allowed, request id=" + d.id + " not yet completed";
var n = ++l;
this._debug("Transport", this.getType(), "metaConnect send, request", n, "envelope", e);
var t = {id: n, metaConnect: !0};
i.call(this, e, t), d = t
}
var a = new t, c = t.derive(a), l = 0, d = null, f = [], g = [];
return c.complete = function(e, n, t) {
t ? o.call(this, e) : s.call(this, e, n)
}, c.transportSend = function(e, n) {
throw"Abstract"
}, c.transportSuccess = function(e, n, t) {
n.expired || (this.clearTimeout(n.timeout), this.complete(n, !0, n.metaConnect), t && t.length > 0 ? e.onSuccess(t) : e.onFailure(n.xhr, e.messages, {httpCode: 204}))
}, c.transportFailure = function(e, n, t) {
n.expired || (this.clearTimeout(n.timeout), this.complete(n, !1, n.metaConnect), e.onFailure(n.xhr, e.messages, t))
}, c.send = function(e, n) {
n ? u.call(this, e) : r.call(this, e)
}, c.abort = function() {
a.abort();
for (var e = 0; e < f.length; ++e) {
var n = f[e];
this._debug("Aborting request", n), this.abortXHR(n.xhr)
}
d && (this._debug("Aborting metaConnect request", d), this.abortXHR(d.xhr)), this.reset()
}, c.reset = function() {
a.reset(), d = null, f = [], g = []
}, c.abortXHR = function(e) {
if (e) try {
e.abort()
} catch (e) {
this._debug(e)
}
}, c.xhrStatus = function(e) {
if (e) try {
return e.status
} catch (e) {
this._debug(e)
}
return -1
}, c
}, o = function() {
var e = new i, n = t.derive(e), r = !0;
return n.accept = function(e, n, t) {
return r || !n
}, n._setHeaders = function(e, n) {
if (n) for (var t in n) "content-type" !== t.toLowerCase() && e.setRequestHeader(t, n[t])
}, n.xhrSend = function(e) {
var t = new XMLHttpRequest;
return t.open("POST", e.url, !0), n._setHeaders(t, e.headers), t.setRequestHeader("Content-type", "application/json;charset=UTF-8"), t.xhrFields = {withCredentials: !0}, t.onload = function() {
var n = this.status;
n >= 200 && n < 400 ? e.onSuccess(this.response) : e.onError(n, this.statusText)
}, t.send(e.body), t
}, n.transportSend = function(e, n) {
this._debug("Transport", this.getType(), "sending request", n.id, "envelope", e);
var t = this;
try {
var i = !0;
n.xhr = this.xhrSend({
transport: this,
url: e.url,
sync: e.sync,
headers: this.getConfiguration().requestHeaders,
body: JSON.stringify(e.messages),
onSuccess: function(i) {
t._debug("Transport", t.getType(), "received response", i);
var o = !1;
try {
var s = t.convertToMessages(i);
0 === s.length ? (r = !1, t.transportFailure(e, n, {httpCode: 204})) : (o = !0, t.transportSuccess(e, n, s))
} catch (i) {
if (t._debug(i), !o) {
r = !1;
var u = {exception: i};
u.httpCode = t.xhrStatus(n.xhr), t.transportFailure(e, n, u)
}
}
},
onError: function(o, s) {
r = !1;
var u = {reason: o, exception: s};
u.httpCode = t.xhrStatus(n.xhr), i ? t.setTimeout(function() {
t.transportFailure(e, n, u)
}, 0) : t.transportFailure(e, n, u)
}
}), i = !1
} catch (i) {
r = !1, this.setTimeout(function() {
t.transportFailure(e, n, {exception: i})
}, 0)
}
}, n.reset = function() {
e.reset(), r = !0
}, n
}, s = function() {
var e = new i, n = t.derive(e);
return n.accept = function(e, n, t) {
return !0
}, n.jsonpSend = function(e) {
throw"Abstract"
}, n.transportSend = function(e, n) {
for (var t = this, i = 0, r = e.messages.length, o = []; r > 0;) {
var s = JSON.stringify(e.messages.slice(i, i + r));
if (e.url.length + encodeURI(s).length > 2e3) {
if (1 === r) return void this.setTimeout(function() {
t.transportFailure(e, n, {reason: "Bayeux message too big, max is 2000"})
}, 0);
--r
} else o.push(r), i += r, r = e.messages.length - i
}
var u = e;
if (o.length > 1) {
var a = 0, c = o[0];
this._debug("Transport", this.getType(), "split", e.messages.length, "messages into", o.join(" + ")), u = this._mixin(!1, {}, e), u.messages = e.messages.slice(a, c), u.onSuccess = e.onSuccess, u.onFailure = e.onFailure;
for (var l = 1; l < o.length; ++l) {
var d = this._mixin(!1, {}, e);
a = c, c += o[l], d.messages = e.messages.slice(a, c), d.onSuccess = e.onSuccess, d.onFailure = e.onFailure, this.send(d, n.metaConnect)
}
}
this._debug("Transport", this.getType(), "sending request", n.id, "envelope", u);
try {
var f = !0;
this.jsonpSend({
transport: this,
url: u.url,
sync: u.sync,
headers: this.getConfiguration().requestHeaders,
body: JSON.stringify(u.messages),
onSuccess: function(e) {
var i = !1;
try {
var r = t.convertToMessages(e);
0 === r.length ? t.transportFailure(u, n, {httpCode: 204}) : (i = !0, t.transportSuccess(u, n, r))
} catch (e) {
t._debug(e), i || t.transportFailure(u, n, {exception: e})
}
},
onError: function(e, i) {
var r = {reason: e, exception: i};
f ? t.setTimeout(function() {
t.transportFailure(u, n, r)
}, 0) : t.transportFailure(u, n, r)
}
}), f = !1
} catch (e) {
this.setTimeout(function() {
t.transportFailure(u, n, {exception: e})
}, 0)
}
}, n
}, u = function() {
function n() {
if (!g) {
g = !0;
var e = o.getURL().replace(/^http/, "ws");
this._debug("Transport", this.getType(), "connecting to URL", e);
try {
var n = o.getConfiguration().protocol, t = n ? new WebSocket(e, n) : new WebSocket(e)
} catch (e) {
throw a = !1, this._debug("Exception while creating WebSocket object", e), e
}
l = !1 !== o.getConfiguration().stickyReconnect;
var i = this, r = null, s = o.getConfiguration().connectTimeout;
s > 0 && (r = this.setTimeout(function() {
r = null, i._debug("Transport", i.getType(), "timed out while connecting to URL", e, ":", s, "ms");
var n = {code: 1e3, reason: "Connect Timeout"};
i.webSocketClose(t, n.code, n.reason), i.onClose(t, n)
}, s));
var u = function() {
i._debug("WebSocket opened", t), g = !1, r && (i.clearTimeout(r), r = null), h ? (o._warn("Closing Extra WebSocket Connections", t, h), i.webSocketClose(t, 1e3, "Extra Connection")) : i.onOpen(t)
}, c = function(e) {
e = e || {code: 1e3}, i._debug("WebSocket closing", t, e), g = !1, r && (i.clearTimeout(r), r = null), null !== h && t !== h ? i._debug("Closed Extra WebSocket Connection", t) : i.onClose(t, e)
}, d = function(e) {
i._debug("WebSocket message", e, t), t !== h && o._warn("Extra WebSocket Connections", t, h), i.onMessage(t, e)
};
t.onopen = u, t.onclose = c, t.onerror = function() {
c({code: 1002, reason: "Error"})
}, t.onmessage = d, this._debug("Transport", this.getType(), "configured callbacks on", t)
}
}
function i(e, n, t) {
var i = JSON.stringify(n.messages);
e.send(i), this._debug("Transport", this.getType(), "sent", n, "metaConnect =", t);
var r = this.getConfiguration().maxNetworkDelay, o = r;
t && (o += this.getAdvice().timeout, b = !0);
for (var s = this, u = [], a = 0; a < n.messages.length; ++a) !function() {
var t = n.messages[a];
t.id && (u.push(t.id), f[t.id] = this.setTimeout(function() {
s._debug("Transport", s.getType(), "timing out message", t.id, "after", o, "on", e);
var n = {code: 1e3, reason: "Message Timeout"};
s.webSocketClose(e, n.code, n.reason), s.onClose(e, n)
}, o))
}();
this._debug("Transport", this.getType(), "waiting at most", o, "ms for messages", u, "maxNetworkDelay", r, ", timeouts:", f)
}
function r(e, t, r) {
try {
null === e ? n.call(this) : i.call(this, e, t, r)
} catch (n) {
this.setTimeout(function() {
t.onFailure(e, t.messages, {exception: n})
}, 0)
}
}
var o, s = new t, u = t.derive(s), a = !0, c = !1, l = !0, d = {}, f = {}, g = !1, h = null, b = !1,
p = null;
return u.reset = function() {
s.reset(), a = !0, c = !1, l = !0, d = {}, f = {}, g = !1, h = null, b = !1, p = null
}, u.onOpen = function(e) {
this._debug("Transport", this.getType(), "opened", e), h = e, c = !0, this._debug("Sending pending messages", d);
for (var n in d) {
var t = d[n], r = t[0], o = t[1];
p = r.onSuccess, i.call(this, e, r, o)
}
}, u.onMessage = function(n, t) {
this._debug("Transport", this.getType(), "received websocket message", t, n);
for (var i = !1, r = this.convertToMessages(t.data), o = [], s = 0; s < r.length; ++s) {
var u = r[s];
if ((/^\/meta\//.test(u.channel) || void 0 !== u.successful) && u.id) {
o.push(u.id);
var a = f[u.id];
a && (this.clearTimeout(a), delete f[u.id], this._debug("Transport", this.getType(), "removed timeout for message", u.id, ", timeouts", f))
}
"/meta/connect" === u.channel && (b = !1), "/meta/disconnect" !== u.channel || b || (i = !0)
}
for (var c = !1, l = 0; l < o.length; ++l) {
var g = o[l];
for (var h in d) {
var v = h.split(","), m = e.inArray(g, v);
if (m >= 0) {
c = !0, v.splice(m, 1);
var _ = d[h][0], C = d[h][1];
delete d[h], v.length > 0 && (d[v.join(",")] = [_, C]);
break
}
}
}
c && this._debug("Transport", this.getType(), "removed envelope, envelopes", d), p.call(this, r), i && this.webSocketClose(n, 1e3, "Disconnect")
}, u.onClose = function(e, n) {
this._debug("Transport", this.getType(), "closed", e, n), a = l && c;
for (var t in f) this.clearTimeout(f[t]);
f = {};
for (var i in d) {
var r = d[i][0];
d[i][1] && (b = !1), r.onFailure(e, r.messages, {websocketCode: n.code, reason: n.reason})
}
d = {}, h = null
}, u.registered = function(e, n) {
s.registered(e, n), o = n
}, u.accept = function(e, n, t) {
return a && !!org.cometd.WebSocket && !1 !== o.websocketEnabled
}, u.send = function(e, n) {
this._debug("Transport", this.getType(), "sending", e, "metaConnect =", n);
for (var t = [], i = 0; i < e.messages.length; ++i) {
var o = e.messages[i];
o.id && t.push(o.id)
}
d[t.join(",")] = [e, n], this._debug("Transport", this.getType(), "stored envelope, envelopes", d), r.call(this, h, e, n)
}, u.webSocketClose = function(e, n, t) {
try {
e.close(n, t)
} catch (e) {
this._debug(e)
}
}, u.abort = function() {
if (s.abort(), h) {
var e = {code: 1001, reason: "Abort"};
this.webSocketClose(h, e.code, e.reason), this.onClose(h, e)
}
this.reset()
}, u
};
return {
CometD: function(t) {
function i(e, n) {
try {
return e[n]
} catch (e) {
return
}
}
function o(n) {
return e.isString(n)
}
function s(e) {
return void 0 !== e && null !== e && "function" == typeof e
}
function u(e, n) {
if (window.console) {
var t = window.console[e];
s(t) && t.apply(window.console, n)
}
}
function a(e) {
ae._debug("Configuring cometd object with", e), o(e) && (e = {url: e}), e || (e = {}), ke = ae._mixin(!1, ke, e);
var n = ae.getURL();
if (!n) throw"Missing required configuration parameter 'url' specifying the Bayeux server URL";
var t = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(n),
i = t[2], r = t[8], s = t[9];
if (le = ae._isCrossDomain(i), ke.appendMessageTypeToURL) if (void 0 !== s && s.length > 0) ae._info("Appending message type to URI " + r + s + " is not supported, disabling 'appendMessageTypeToURL' configuration"), ke.appendMessageTypeToURL = !1; else {
var u = r.split("/"), a = u.length - 1;
r.match(/\/$/) && (a -= 1), u[a].indexOf(".") >= 0 && (ae._info("Appending message type to URI " + r + " is not supported, disabling 'appendMessageTypeToURL' configuration"), ke.appendMessageTypeToURL = !1)
}
}
function c(e) {
if (e) {
var n = me[e.channel];
n && n[e.id] && (delete n[e.id], ae._debug("Removed", e.listener ? "listener" : "subscription", e))
}
}
function l(e) {
e && !e.listener && c(e)
}
function d() {
for (var e in me) {
var n = me[e];
if (n) for (var t = 0; t < n.length; ++t) l(n[t])
}
}
function f(e) {
fe !== e && (ae._debug("Status", fe, "->", e), fe = e)
}
function g() {
return "disconnecting" === fe || "disconnected" === fe
}
function h() {
return ++ge
}
function b(e, n, t, i, r) {
try {
return n.call(e, i)
} catch (e) {
ae._debug("Exception during execution of extension", t, e);
var o = ae.onExtensionException;
if (s(o)) {
ae._debug("Invoking extension exception callback", t, e);
try {
o.call(ae, e, t, r, i)
} catch (e) {
ae._info("Exception during execution of exception callback in extension", t, e)
}
}
return i
}
}
function p(e) {
for (var n = 0; n < Te.length && (void 0 !== e && null !== e); ++n) {
var t = ke.reverseIncomingExtensions ? Te.length - 1 - n : n, i = Te[t],
r = i.extension.incoming;
if (s(r)) {
var o = b(i.extension, r, i.name, e, !1);
e = void 0 === o ? e : o
}
}
return e
}
function v(e) {
for (var n = 0; n < Te.length && (void 0 !== e && null !== e); ++n) {
var t = Te[n], i = t.extension.outgoing;
if (s(i)) {
var r = b(t.extension, i, t.name, e, !0);
e = void 0 === r ? e : r
}
}
return e
}
function m(e, n) {
var t = me[e];
if (t && t.length > 0) for (var i = 0; i < t.length; ++i) {
var r = t[i];
if (r) try {
r.callback.call(r.scope, n)
} catch (e) {
ae._debug("Exception during notification", r, n, e);
var o = ae.onListenerException;
if (s(o)) {
ae._debug("Invoking listener exception callback", r, e);
try {
o.call(ae, e, r, r.listener, n)
} catch (e) {
ae._info("Exception during execution of listener callback", r, e)
}
}
}
}
}
function _(e, n) {
m(e, n);
for (var t = e.split("/"), i = t.length - 1, r = i; r > 0; --r) {
var o = t.slice(0, r).join("/") + "/*";
r === i && m(o, n), o += "*", m(o, n)
}
}
function C() {
null !== Ce && e.clearTimeout(Ce), Ce = null
}
function T(n) {
C();
var t = ye.interval + _e;
ae._debug("Function scheduled in", t, "ms, interval =", ye.interval, "backoff =", _e, n), Ce = e.setTimeout(ae, n, t)
}
function y(e, n, t, i) {
for (var r = 0; r < n.length; ++r) {
var o = n[r], u = "" + h();
o.id = u, he && (o.clientId = he);
var a = void 0;
s(o._callback) && (a = o._callback, delete o._callback), o = v(o), void 0 !== o && null !== o ? (o.id = u, n[r] = o, a && (Ee[u] = a)) : n.splice(r--, 1)
}
if (0 !== n.length) {
var c = ae.getURL();
ke.appendMessageTypeToURL && (c.match(/\/$/) || (c += "/"), i && (c += i));
var l = {
url: c, sync: e, messages: n, onSuccess: function(e) {
try {
Se.call(ae, e)
} catch (e) {
ae._debug("Exception during handling of messages", e)
}
}, onFailure: function(e, n, t) {
try {
t.connectionType = ae.getTransport().getType(), Ie.call(ae, e, n, t)
} catch (e) {
ae._debug("Exception during handling of failure", e)
}
}
};
ae._debug("Send", l), oe.send(l, t)
}
}
function E(e) {
be > 0 || !0 === ve ? pe.push(e) : y(!1, [e], !1)
}
function w() {
_e = 0
}
function x() {
_e < ke.maxBackoff && (_e += ke.backoffIncrement)
}
function k() {
++be
}
function S() {
var e = pe;
pe = [], e.length > 0 && y(!1, e, !1)
}
function I() {
if (--be < 0) throw"Calls to startBatch() and endBatch() are not paired";
0 !== be || g() || ve || S()
}
function L() {
if (!g()) {
var e = {channel: "/meta/connect", connectionType: oe.getType()};
xe || (e.advice = {timeout: 0}), f("connecting"), ae._debug("Connect sent", e), y(!1, [e], !0, "connect"), f("connected")
}
}
function N() {
f("connecting"), T(function() {
L()
})
}
function O(e) {
e && (ye = ae._mixin(!1, {}, ke.advice, e), ae._debug("New advice", ye))
}
function R(e) {
C(), e && oe.abort(), he = null, f("disconnected"), be = 0, w(), oe = null, pe.length > 0 && (Ie.call(ae, void 0, pe, {reason: "Disconnected"}), pe = [])
}
function M(e, n, t) {
var i = ae.onTransportFailure;
if (s(i)) {
ae._debug("Invoking transport failure callback", e, n, t);
try {
i.call(ae, e, n, t)
} catch (e) {
ae._info("Exception during execution of transport failure callback", e)
}
}
}
function D(e, n) {
s(e) && (n = e, e = void 0), he = null, d(), g() ? (de.reset(), O(ke.advice)) : O(ae._mixin(!1, ye, {reconnect: "retry"})), be = 0, ve = !0, se = e, ue = n;
var t = ae.getURL(), i = de.findTransportTypes("1.0", le, t), r = {
version: "1.0",
minimumVersion: "1.0",
channel: "/meta/handshake",
supportedConnectionTypes: i,
_callback: n,
advice: {timeout: ye.timeout, interval: ye.interval}
}, o = ae._mixin(!1, {}, se, r);
if (!oe && !(oe = de.negotiateTransport(i, "1.0", le, t))) {
var u = "Could not find initial transport among: " + de.getTransportTypes();
throw ae._warn(u), u
}
ae._debug("Initial transport is", oe.getType()), f("handshaking"), ae._debug("Handshake sent", o), y(!1, [o], !1, "handshake")
}
function U() {
f("handshaking"), ve = !0, T(function() {
D(se, ue)
})
}
function A(e) {
var n = Ee[e.id];
s(n) && (delete Ee[e.id], n.call(ae, e))
}
function F(e) {
A(e), _("/meta/handshake", e), _("/meta/unsuccessful", e), g() || "none" === ye.reconnect ? R(!1) : (x(), U())
}
function q(e) {
if (e.successful) {
he = e.clientId;
var n = ae.getURL(),
t = de.negotiateTransport(e.supportedConnectionTypes, e.version, le, n);
if (null === t) {
var i = "Could not negotiate transport with server; client=[" + de.findTransportTypes(e.version, le, n) + "], server=[" + e.supportedConnectionTypes + "]",
r = ae.getTransport();
return M(r.getType(), null, {
reason: i,
connectionType: r.getType(),
transport: r
}), ae._warn(i), oe.reset(), void F(e)
}
oe !== t && (ae._debug("Transport", oe.getType(), "->", t.getType()), oe = t), ve = !1, S(), e.reestablish = we, we = !0, A(e), _("/meta/handshake", e);
var o = g() ? "none" : ye.reconnect;
switch (o) {
case"retry":
w(), N();
break;
case"none":
R(!1);
break;
default:
throw"Unrecognized advice action " + o
}
} else F(e)
}
function G(e) {
var n = ae.getURL(), t = ae.getTransport(), i = de.findTransportTypes("1.0", le, n),
r = de.negotiateTransport(i, "1.0", le, n);
r ? (ae._debug("Transport", t.getType(), "->", r.getType()), M(t.getType(), r.getType(), e.failure), F(e), oe = r) : (M(t.getType(), null, e.failure), ae._warn("Could not negotiate transport; client=[" + i + "]"), oe.reset(), F(e))
}
function j(e) {
_("/meta/connect", e), _("/meta/unsuccessful", e);
var n = g() ? "none" : ye.reconnect;
switch (n) {
case"retry":
N(), x();
break;
case"handshake":
de.reset(), w(), U();
break;
case"none":
R(!1);
break;
default:
throw"Unrecognized advice action" + n
}
}
function P(e) {
if (xe = e.successful) {
_("/meta/connect", e);
var n = g() ? "none" : ye.reconnect;
switch (n) {
case"retry":
w(), N();
break;
case"none":
R(!1);
break;
default:
throw"Unrecognized advice action " + n
}
} else j(e)
}
function B(e) {
xe = !1, j(e)
}
function W(e) {
R(!0), A(e), _("/meta/disconnect", e), _("/meta/unsuccessful", e)
}
function H(e) {
e.successful ? (R(!1), A(e), _("/meta/disconnect", e)) : W(e)
}
function z(e) {
W(e)
}
function Q(e) {
var n = me[e.subscription];
if (n) for (var t = n.length - 1; t >= 0; --t) {
var i = n[t];
if (i && !i.listener) {
delete n[t], ae._debug("Removed failed subscription", i);
break
}
}
A(e), _("/meta/subscribe", e), _("/meta/unsuccessful", e)
}
function J(e) {
e.successful ? (A(e), _("/meta/subscribe", e)) : Q(e)
}
function X(e) {
Q(e)
}
function K(e) {
A(e), _("/meta/unsubscribe", e), _("/meta/unsuccessful", e)
}
function V(e) {
e.successful ? (A(e), _("/meta/unsubscribe", e)) : K(e)
}
function Z(e) {
K(e)
}
function $(e) {
A(e), _("/meta/publish", e), _("/meta/unsuccessful", e)
}
function Y(e) {
void 0 === e.successful ? void 0 !== e.data ? _(e.channel, e) : ae._warn("Unknown Bayeux Message", e) : e.successful ? (A(e), _("/meta/publish", e)) : $(e)
}
function ee(e) {
$(e)
}
function ne(e) {
if (void 0 !== (e = p(e)) && null !== e) {
O(e.advice);
switch (e.channel) {
case"/meta/handshake":
q(e);
break;
case"/meta/connect":
P(e);
break;
case"/meta/disconnect":
H(e);
break;
case"/meta/subscribe":
J(e);
break;
case"/meta/unsubscribe":
V(e);
break;
default:
Y(e)
}
}
}
function te(e) {
var n = me[e];
if (n) for (var t = 0; t < n.length; ++t) if (n[t]) return !0;
return !1
}
function ie(e, n) {
var t = {scope: e, method: n};
if (s(e)) t.scope = void 0, t.method = e; else if (o(n)) {
if (!e) throw"Invalid scope " + e;
if (t.method = e[n], !s(t.method)) throw"Invalid callback " + n + " for scope " + e
} else if (!s(n)) throw"Invalid callback " + n;
return t
}
function re(e, n, t, i) {
var r = ie(n, t);
ae._debug("Adding", i ? "listener" : "subscription", "on", e, "with scope", r.scope, "and callback", r.method);
var o = {channel: e, scope: r.scope, callback: r.method, listener: i}, s = me[e];
return s || (s = [], me[e] = s), o.id = s.push(o) - 1, ae._debug("Added", i ? "listener" : "subscription", o), o[0] = e, o[1] = o.id, o
}
var oe, se, ue, ae = this, ce = t || "default", le = !1, de = new n, fe = "disconnected", ge = 0,
he = null, be = 0, pe = [], ve = !1, me = {}, _e = 0, Ce = null, Te = [], ye = {}, Ee = {},
we = !1, xe = !1, ke = {
protocol: null,
stickyReconnect: !0,
connectTimeout: 0,
maxConnections: 2,
backoffIncrement: 1e3,
maxBackoff: 6e4,
logLevel: "info",
reverseIncomingExtensions: !0,
maxNetworkDelay: 1e4,
requestHeaders: {},
appendMessageTypeToURL: !0,
autoBatch: !1,
advice: {timeout: 6e4, interval: 0, reconnect: "retry"}
};
this._mixin = function(e, n, t) {
for (var o = n || {}, s = 2; s < arguments.length; ++s) {
var u = arguments[s];
if (void 0 !== u && null !== u) for (var a in u) {
var c = i(u, a), l = i(o, a);
if (c !== n && void 0 !== c) if (e && "object" === (void 0 === c ? "undefined" : r(c)) && null !== c) if (c instanceof Array) o[a] = this._mixin(e, l instanceof Array ? l : [], c); else {
var d = "object" !== (void 0 === l ? "undefined" : r(l)) || l instanceof Array ? {} : l;
o[a] = this._mixin(e, d, c)
} else o[a] = c
}
}
return o
}, this._warn = function() {
u("warn", arguments)
}, this._info = function() {
"warn" !== ke.logLevel && u("info", arguments)
}, this._debug = function() {
"debug" === ke.logLevel && u("debug", arguments)
}, this._isCrossDomain = function(e) {
return e && e !== window.location.host
};
var Se, Ie;
this.send = E, this.receive = ne, Se = function(e) {
ae._debug("Received", e);
for (var n = 0; n < e.length; ++n) {
ne(e[n])
}
}, Ie = function(e, n, t) {
ae._debug("handleFailure", e, n, t), t.transport = e;
for (var i = 0; i < n.length; ++i) {
var r = n[i], o = {id: r.id, successful: !1, channel: r.channel, failure: t};
switch (t.message = r, r.channel) {
case"/meta/handshake":
G(o);
break;
case"/meta/connect":
B(o);
break;
case"/meta/disconnect":
z(o);
break;
case"/meta/subscribe":
o.subscription = r.subscription, X(o);
break;
case"/meta/unsubscribe":
o.subscription = r.subscription, Z(o);
break;
default:
ee(o)
}
}
}, this.registerTransport = function(e, n, t) {
var i = de.add(e, n, t);
return i && (this._debug("Registered transport", e), s(n.registered) && n.registered(e, this)), i
}, this.getTransportTypes = function() {
return de.getTransportTypes()
}, this.unregisterTransport = function(e) {
var n = de.remove(e);
return null !== n && (this._debug("Unregistered transport", e), s(n.unregistered) && n.unregistered()), n
}, this.unregisterTransports = function() {
de.clear()
}, this.findTransport = function(e) {
return de.find(e)
}, this.configure = function(e) {
a.call(this, e)
}, this.init = function(e, n) {
this.configure(e), this.handshake(n)
}, this.handshake = function(e, n) {
f("disconnected"), we = !1, D(e, n)
}, this.disconnect = function(e, n, t) {
if (!g()) {
"boolean" != typeof e && (t = n, n = e, e = !1), s(n) && (t = n, n = void 0);
var i = {channel: "/meta/disconnect", _callback: t}, r = this._mixin(!1, {}, n, i);
f("disconnecting"), y(!0 === e, [r], !1, "disconnect")
}
}, this.startBatch = function() {
k()
I()
}, this.batch = function(e, n) {
var t = ie(e, n);
this.startBatch();
try {
t.method.call(t.scope), this.endBatch()
} catch (e) {
throw this._info("Exception during execution of batch", e), this.endBatch(), e
}
}, this.addListener = function(e, n, t) {
if (arguments.length < 2) throw"Illegal arguments number: required 2, got " + arguments.length;
if (!o(e)) throw"Illegal argument type: channel must be a string";
return re(e, n, t, !0)
}, this.removeListener = function(e) {
if (!(e && e.channel && "id" in e)) throw"Invalid argument: expected subscription, not " + e;
c(e)
}, this.clearListeners = function() {
me = {}
}, this.subscribe = function(e, n, t, i, r) {
if (arguments.length < 2) throw"Illegal arguments number: required 2, got " + arguments.length;
if (!o(e)) throw"Illegal argument type: channel must be a string";
if (g()) throw"Illegal state: already disconnected";
s(n) && (r = i, i = t, t = n, n = void 0), s(i) && (r = i, i = void 0);
var u = !te(e), a = re(e, n, t, !1);
if (u) {
var c = {channel: "/meta/subscribe", subscription: e, _callback: r};
E(this._mixin(!1, {}, i, c))
}
return a
}, this.unsubscribe = function(e, n, t) {
if (arguments.length < 1) throw"Illegal arguments number: required 1, got " + arguments.length;
if (g()) throw"Illegal state: already disconnected";
s(n) && (t = n, n = void 0), this.removeListener(e);
var i = e.channel;
if (!te(i)) {
var r = {channel: "/meta/unsubscribe", subscription: i, _callback: t};
E(this._mixin(!1, {}, n, r))
}
}, this.resubscribe = function(e, n) {
if (l(e), e) return this.subscribe(e.channel, e.scope, e.callback, n)
}, this.clearSubscriptions = function() {
d()
}, this.publish = function(e, n, t, i) {
if (arguments.length < 1) throw"Illegal arguments number: required 1, got " + arguments.length;
if (!o(e)) throw"Illegal argument type: channel must be a string";
if (/^\/meta\//.test(e)) throw"Illegal argument: cannot publish to meta channels";
if (g()) throw"Illegal state: already disconnected";
s(n) ? (i = n, n = t = {}) : s(t) && (i = t, t = {});
var r = {channel: e, data: n, _callback: i};
E(this._mixin(!1, {}, t, r))
}, this.getStatus = function() {
return fe
}, this.isDisconnected = g, this.setBackoffIncrement = function(e) {
ke.backoffIncrement = e
}, this.getBackoffIncrement = function() {
return ke.backoffIncrement
}, this.getBackoffPeriod = function() {
return _e
}, this.setLogLevel = function(e) {
ke.logLevel = e
}, this.registerExtension = function(e, n) {
if (arguments.length < 2) throw"Illegal arguments number: required 2, got " + arguments.length;
if (!o(e)) throw"Illegal argument type: extension name must be a string";
for (var t = !1, i = 0; i < Te.length; ++i) {
if (Te[i].name === e) {
t = !0;
break
}
}
return t ? (this._info("Could not register extension with name", e, "since another extension with the same name already exists"), !1) : (Te.push({
name: e,
extension: n
}), this._debug("Registered extension", e), s(n.registered) && n.registered(e, this), !0)
}, this.unregisterExtension = function(e) {
if (!o(e)) throw"Illegal argument type: extension name must be a string";
for (var n = !1, t = 0; t < Te.length; ++t) {
var i = Te[t];
if (i.name === e) {
Te.splice(t, 1), n = !0, this._debug("Unregistered extension", e);
var r = i.extension;
s(r.unregistered) && r.unregistered();
break
}
}
return n
}, this.getExtension = function(e) {
for (var n = 0; n < Te.length; ++n) {
var t = Te[n];
if (t.name === e) return t.extension
}
return null
}, this.getName = function() {
return ce
}, this.getClientId = function() {
return he
}, this.getURL = function() {
if (oe && "object" === r(ke.urls)) {
var e = ke.urls[oe.getType()];
if (e) return e
}
return ke.url
}, this.getTransport = function() {
return oe
}, this.getConfiguration = function() {
return this._mixin(!0, {}, ke)
}, this.getAdvice = function() {
return this._mixin(!0, {}, ye)
}
},
Transport: t,
RequestTransport: i,
LongPollingTransport: o,
CallbackPollingTransport: s,
WebSocketTransport: u,
Utils: e
}
}
Object.defineProperty(n, "__esModule", {value: !0});
var r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
return typeof e
} : function(e) {
return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
};
n.default = i
}, function(e, n, t) {
"use strict";
Object.defineProperty(n, "__esModule", {value: !0});
var i = t(0), r = function(e) {
return e && e.__esModule ? e : {default: e}
}(i), o = function() {
var e = new r.default("amb.GraphQLSubscriptionExtension"), n = {};
this.isGraphQLChannel = function(e) {
return e && e.startsWith("/rw/graphql")
}, this.addGraphQLChannel = function(e, t) {
n[e] = t
}, this.removeGraphQLChannel = function(e) {
delete n[e]
}, this.getGraphQLSubscriptions = function() {
return n
}, this.outgoing = function(t) {
return "/meta/subscribe" === t.channel && this.isGraphQLChannel(t.subscription) && (t.ext || (t.ext = {}), n[t.subscription] && (e.debug("Subscribing with GraphQL subscription:" + n[t.subscription]), t.ext.serializedGraphQLSubscription = n[t.subscription])), t
}
};
n.default = o
}, function(e, n, t) {
"use strict";
function i(e) {
try {
if (!e.MSInputMethodContext || !e.document.documentMode) for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
if (e.g_ambClient) return e.g_ambClient
} catch (e) {
console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
}
return null
}
function r(e, n) {
if (void 0 !== e.getClientWindow) {
if (e.getClientWindow() === n) return e
}
var t = o({}, e);
return t.getChannel = function(t, i, r) {
return e.getChannel(t, i, r || n)
}, t.subscribeToEvent = function(t, i, r) {
return e.subscribeToEvent(t, i, r || n)
}, t.unsubscribeFromEvent = function(t, i) {
return e.unsubscribeFromEvent(t, i || n)
}, t.getClientWindow = function() {
return n
}, t
}
function o(e, n) {
for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
return e
}
function s(e) {
function n() {
i || (i = !0, t.g_ambClient.connect())
}
var t = window.self;
t.g_ambClient = e, t.addEventListener("unload", function() {
t.g_ambClient.disconnect()
}), "complete" === (t.document ? t.document.readyState : null) ? n() : t.addEventListener("load", n), setTimeout(n, 1e4);
var i = !1
}
function u() {
function e() {
function e(e, r, o, s) {
if (e && o && s) {
n(e, r, o);
var u = t(e);
u || (u = i(e)), u.unloading || u.subscriptions.push({id: r, callback: o, unsubscribe: s})
}
}
function n(e, n, i) {
if (e && i) {
var r = t(e);
if (r) for (var o = r.subscriptions, s = o.length - 1; s >= 0; s--) o[s].id === n && o[s].callback === i && o.splice(s, 1)
}
}
function t(e) {
for (var n = 0, t = o.length; n < t; n++) if (o[n].window === e) return o[n];
return null
}
function i(e) {
var n = {
window: e, onUnload: function() {
n.unloading = !0;
for (var e = n.subscriptions, t = void 0; t = e.pop();) t.unsubscribe();
r(n)
}, unloading: !1, subscriptions: []
};
return e.addEventListener("unload", n.onUnload), o.push(n), n
}
function r(e) {
for (var n = 0, t = o.length; n < t; n++) if (o[n].window === e.window) {
o.splice(n, 1);
break
}
e.subscriptions = [], e.window.removeEventListener("unload", e.onUnload), e.onUnload = null, e.window = null
}
var o = [];
return {add: e, remove: n}
}
return function() {
var n = new c.default, t = e();
return {
getServerConnection: function() {
return n.getServerConnection()
}, connect: function() {
n.connect()
}, abort: function() {
n.abort()
}, disconnect: function() {
n.disconnect()
}, getConnectionState: function() {
return n.getConnectionState()
}, getState: function() {
return n.getConnectionState()
}, getClientId: function() {
return n.getClientId()
}, getChannel: function(e, i, r) {
var o = n.getChannel(e, i), s = o.subscribe, u = o.unsubscribe;
return r = r || window, o.subscribe = function(i) {
return t.add(r, o, i, function() {
o.unsubscribe(i)
}), r.addEventListener("unload", function() {
n.removeChannel(e)
}), s.call(o, i), o
}, o.unsubscribe = function(e) {
return t.remove(r, o, e), u.call(o, e)
}, o
}, getChannel0: function(e, t) {
return n.getChannel(e, t)
}, registerExtension: function(e, t) {
n.registerExtension(e, t)
}, unregisterExtension: function(e) {
n.unregisterExtension(e)
}, batch: function(e) {
n.batch(e)
}, subscribeToEvent: function(e, i, r) {
r = r || window;
var o = n.subscribeToEvent(e, i);
return t.add(r, o, !0, function() {
n.unsubscribeFromEvent(o)
}), o
}, unsubscribeFromEvent: function(e, i) {
i = i || window, t.remove(i, e, !0), n.unsubscribeFromEvent(e)
}, isLoggedIn: function() {
return n.isLoggedIn()
}, getConnectionEvents: function() {
return n.getConnectionEvents()
}, getEvents: function() {
return n.getConnectionEvents()
}, loginComplete: function() {
n.loginComplete()
}
}
}()
}
Object.defineProperty(n, "__esModule", {value: !0});
var a = t(7), c = function(e) {
return e && e.__esModule ? e : {default: e}
}(a), l = function() {
var e = i(window);
return e || (e = r(u(), window), s(e)), r(e, window)
};
n.default = l
}])
});
;
var amb = ambClientJs.default;
amb.getClient();
;
