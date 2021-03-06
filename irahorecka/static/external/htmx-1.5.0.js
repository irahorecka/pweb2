// Ira Horecka: Made edits to conditional statement on line 878 for custom 'hx-trigger="intersect"' behavior.

! function(e, t) {
    "function" == typeof define && define.amd ? define([], t) : e.htmx = t()
}("undefined" != typeof self ? self : this, function() {
    return function() {
        "use strict";
        var htmx = {
                onLoad: onLoadHelper,
                process: processNode,
                on: addEventListenerImpl,
                off: removeEventListenerImpl,
                trigger: triggerEvent,
                ajax: ajaxHelper,
                find: find,
                findAll: findAll,
                closest: closest,
                values: function(e, t) {
                    return getInputValues(e, t || "post").values
                },
                remove: removeElement,
                addClass: addClassToElement,
                removeClass: removeClassFromElement,
                toggleClass: toggleClassOnElement,
                takeClass: takeClassForElement,
                defineExtension: defineExtension,
                removeExtension: removeExtension,
                logAll: logAll,
                logger: null,
                config: {
                    historyEnabled: !0,
                    historyCacheSize: 10,
                    refreshOnHistoryMiss: !1,
                    defaultSwapStyle: "innerHTML",
                    defaultSwapDelay: 0,
                    defaultSettleDelay: 20,
                    includeIndicatorStyles: !0,
                    indicatorClass: "htmx-indicator",
                    requestClass: "htmx-request",
                    settlingClass: "htmx-settling",
                    swappingClass: "htmx-swapping",
                    allowEval: !0,
                    attributesToSettle: ["class", "style", "width", "height"],
                    withCredentials: !1,
                    timeout: 0,
                    wsReconnectDelay: "full-jitter",
                    disableSelector: "[hx-disable], [data-hx-disable]",
                    useTemplateFragments: !1,
                    scrollBehavior: "smooth"
                },
                parseInterval: parseInterval,
                _: internalEval,
                createEventSource: function(e) {
                    return new EventSource(e, {
                        withCredentials: !0
                    })
                },
                createWebSocket: function(e) {
                    return new WebSocket(e, [])
                },
                version: "1.5.0"
            },
            VERBS = ["get", "post", "put", "delete", "patch"],
            VERB_SELECTOR = VERBS.map(function(e) {
                return "[hx-" + e + "], [data-hx-" + e + "]"
            }).join(", ");

        function parseInterval(e) {
            if (null != e) return "ms" == e.slice(-2) ? parseFloat(e.slice(0, -2)) || void 0 : "s" == e.slice(-1) ? 1e3 * parseFloat(e.slice(0, -1)) || void 0 : parseFloat(e) || void 0
        }

        function getRawAttribute(e, t) {
            return e.getAttribute && e.getAttribute(t)
        }

        function hasAttribute(e, t) {
            return e.hasAttribute && (e.hasAttribute(t) || e.hasAttribute("data-" + t))
        }

        function getAttributeValue(e, t) {
            return getRawAttribute(e, t) || getRawAttribute(e, "data-" + t)
        }

        function parentElt(e) {
            return e.parentElement
        }

        function getDocument() {
            return document
        }

        function getClosestMatch(e, t) {
            return t(e) ? e : parentElt(e) ? getClosestMatch(parentElt(e), t) : null
        }

        function getClosestAttributeValue(e, t) {
            var r = null;
            return getClosestMatch(e, function(e) {
                return r = getAttributeValue(e, t)
            }), r
        }

        function matches(e, t) {
            var r = e.matches || e.matchesSelector || e.msMatchesSelector || e.mozMatchesSelector || e.webkitMatchesSelector || e.oMatchesSelector;
            return r && r.call(e, t)
        }

        function getStartTag(e) {
            var t = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i.exec(e);
            return t ? t[1].toLowerCase() : ""
        }

        function parseHTML(e, t) {
            for (var r = (new DOMParser).parseFromString(e, "text/html").body; t > 0;) t--, r = r.firstChild;
            return null == r && (r = getDocument().createDocumentFragment()), r
        }

        function makeFragment(e) {
            if (htmx.config.useTemplateFragments) return parseHTML("<body><template>" + e + "</template></body>", 0).querySelector("template").content;
            switch (getStartTag(e)) {
                case "thead":
                case "tbody":
                case "tfoot":
                case "colgroup":
                case "caption":
                    return parseHTML("<table>" + e + "</table>", 1);
                case "col":
                    return parseHTML("<table><colgroup>" + e + "</colgroup></table>", 2);
                case "tr":
                    return parseHTML("<table><tbody>" + e + "</tbody></table>", 2);
                case "td":
                case "th":
                    return parseHTML("<table><tbody><tr>" + e + "</tr></tbody></table>", 3);
                case "script":
                    return parseHTML("<div>" + e + "</div>", 1);
                default:
                    return parseHTML(e, 0)
            }
        }

        function maybeCall(e) {
            e && e()
        }

        function isType(e, t) {
            return Object.prototype.toString.call(e) === "[object " + t + "]"
        }

        function isFunction(e) {
            return isType(e, "Function")
        }

        function isRawObject(e) {
            return isType(e, "Object")
        }

        function getInternalData(e) {
            var t = e["htmx-internal-data"];
            return t || (t = e["htmx-internal-data"] = {}), t
        }

        function toArray(e) {
            var t = [];
            if (e)
                for (var r = 0; r < e.length; r++) t.push(e[r]);
            return t
        }

        function forEach(e, t) {
            if (e)
                for (var r = 0; r < e.length; r++) t(e[r])
        }

        function isScrolledIntoView(e) {
            var t = e.getBoundingClientRect(),
                r = t.top,
                n = t.bottom;
            return r < window.innerHeight && n >= 0
        }

        function bodyContains(e) {
            return getDocument().body.contains(e)
        }

        function splitOnWhitespace(e) {
            return e.trim().split(/\s+/)
        }

        function mergeObjects(e, t) {
            for (var r in t) t.hasOwnProperty(r) && (e[r] = t[r]);
            return e
        }

        function parseJSON(e) {
            try {
                return JSON.parse(e)
            } catch (e) {
                return logError(e), null
            }
        }

        function internalEval(str) {
            return maybeEval(getDocument().body, function() {
                return eval(str)
            })
        }

        function onLoadHelper(e) {
            return htmx.on("htmx:load", function(t) {
                e(t.detail.elt)
            })
        }

        function logAll() {
            htmx.logger = function(e, t, r) {
                console && console.log(t, e, r)
            }
        }

        function find(e, t) {
            return t ? e.querySelector(t) : find(getDocument(), e)
        }

        function findAll(e, t) {
            return t ? e.querySelectorAll(t) : findAll(getDocument(), e)
        }

        function removeElement(e, t) {
            e = resolveTarget(e), t ? setTimeout(function() {
                removeElement(e)
            }, t) : e.parentElement.removeChild(e)
        }

        function addClassToElement(e, t, r) {
            e = resolveTarget(e), r ? setTimeout(function() {
                addClassToElement(e, t)
            }, r) : e.classList.add(t)
        }

        function removeClassFromElement(e, t, r) {
            e = resolveTarget(e), r ? setTimeout(function() {
                removeClassFromElement(e, t)
            }, r) : e.classList.remove(t)
        }

        function toggleClassOnElement(e, t) {
            (e = resolveTarget(e)).classList.toggle(t)
        }

        function takeClassForElement(e, t) {
            forEach((e = resolveTarget(e)).parentElement.children, function(e) {
                removeClassFromElement(e, t)
            }), addClassToElement(e, t)
        }

        function closest(e, t) {
            if ((e = resolveTarget(e)).closest) return e.closest(t);
            do {
                if (null == e || matches(e, t)) return e
            } while (e = e && parentElt(e))
        }

        function querySelectorAllExt(e, t) {
            return 0 === t.indexOf("closest ") ? [closest(e, t.substr(8))] : 0 === t.indexOf("find ") ? [find(e, t.substr(5))] : "document" === t ? [document] : getDocument().querySelectorAll(t)
        }

        function querySelectorExt(e, t) {
            return querySelectorAllExt(e, t)[0]
        }

        function resolveTarget(e) {
            return isType(e, "String") ? find(e) : e
        }

        function processEventArgs(e, t, r) {
            return isFunction(t) ? {
                target: getDocument().body,
                event: e,
                listener: t
            } : {
                target: resolveTarget(e),
                event: t,
                listener: r
            }
        }

        function addEventListenerImpl(e, t, r) {
            return ready(function() {
                var n = processEventArgs(e, t, r);
                n.target.addEventListener(n.event, n.listener)
            }), isFunction(t) ? t : r
        }

        function removeEventListenerImpl(e, t, r) {
            return ready(function() {
                var n = processEventArgs(e, t, r);
                n.target.removeEventListener(n.event, n.listener)
            }), isFunction(t) ? t : r
        }

        function getTarget(e) {
            var t = getClosestMatch(e, function(e) {
                return null !== getAttributeValue(e, "hx-target")
            });
            if (t) {
                var r = getAttributeValue(t, "hx-target");
                return "this" === r ? t : querySelectorExt(e, r)
            }
            return getInternalData(e).boosted ? getDocument().body : e
        }

        function shouldSettleAttribute(e) {
            for (var t = htmx.config.attributesToSettle, r = 0; r < t.length; r++)
                if (e === t[r]) return !0;
            return !1
        }

        function cloneAttributes(e, t) {
            forEach(e.attributes, function(r) {
                !t.hasAttribute(r.name) && shouldSettleAttribute(r.name) && e.removeAttribute(r.name)
            }), forEach(t.attributes, function(t) {
                shouldSettleAttribute(t.name) && e.setAttribute(t.name, t.value)
            })
        }

        function isInlineSwap(e, t) {
            for (var r = getExtensions(t), n = 0; n < r.length; n++) {
                var o = r[n];
                try {
                    if (o.isInlineSwap(e)) return !0
                } catch (e) {
                    logError(e)
                }
            }
            return "outerHTML" === e
        }

        function oobSwap(e, t, r) {
            var n = "#" + t.id,
                o = "outerHTML";
            "true" === e || (e.indexOf(":") > 0 ? (o = e.substr(0, e.indexOf(":")), n = e.substr(e.indexOf(":") + 1, e.length)) : o = e);
            var a, s = getDocument().querySelector(n);
            s ? ((a = getDocument().createDocumentFragment()).appendChild(t), isInlineSwap(o, s) || (a = t), swap(o, s, s, a, r)) : (t.parentNode.removeChild(t), triggerErrorEvent(getDocument().body, "htmx:oobErrorNoTarget", {
                content: t
            }));
            return e
        }

        function handleOutOfBandSwaps(e, t) {
            forEach(findAll(e, "[hx-swap-oob], [data-hx-swap-oob]"), function(e) {
                var r = getAttributeValue(e, "hx-swap-oob");
                null != r && oobSwap(r, e, t)
            })
        }

        function handlePreservedElements(e) {
            forEach(findAll(e, "[hx-preserve], [data-hx-preserve]"), function(e) {
                var t = getAttributeValue(e, "id"),
                    r = getDocument().getElementById(t);
                null != r && e.parentNode.replaceChild(r, e)
            })
        }

        function handleAttributes(e, t, r) {
            forEach(t.querySelectorAll("[id]"), function(t) {
                if (t.id && t.id.length > 0) {
                    var n = e.querySelector(t.tagName + "[id='" + t.id + "']");
                    if (n && n !== e) {
                        var o = t.cloneNode();
                        cloneAttributes(t, n), r.tasks.push(function() {
                            cloneAttributes(t, o)
                        })
                    }
                }
            })
        }

        function makeAjaxLoadTask(e) {
            return function() {
                processNode(e), processScripts(e), processFocus(e), triggerEvent(e, "htmx:load")
            }
        }

        function processFocus(e) {
            var t = matches(e, "[autofocus]") ? e : e.querySelector("[autofocus]");
            null != t && t.focus()
        }

        function insertNodesBefore(e, t, r, n) {
            for (handleAttributes(e, r, n); r.childNodes.length > 0;) {
                var o = r.firstChild;
                e.insertBefore(o, t), o.nodeType !== Node.TEXT_NODE && o.nodeType !== Node.COMMENT_NODE && n.tasks.push(makeAjaxLoadTask(o))
            }
        }

        function cleanUpElement(e) {
            var t = getInternalData(e);
            t.webSocket && t.webSocket.close(), t.sseEventSource && t.sseEventSource.close(), t.listenerInfos && forEach(t.listenerInfos, function(t) {
                e !== t.on && t.on.removeEventListener(t.trigger, t.listener)
            }), e.children && forEach(e.children, function(e) {
                cleanUpElement(e)
            })
        }

        function swapOuterHTML(e, t, r) {
            if ("BODY" === e.tagName) return swapInnerHTML(e, t, r);
            var n = e.previousSibling;
            if (insertNodesBefore(parentElt(e), e, t, r), null == n) var o = parentElt(e).firstChild;
            else o = n.nextSibling;
            for (getInternalData(e).replacedWith = o, r.elts = []; o && o !== e;) o.nodeType === Node.ELEMENT_NODE && r.elts.push(o), o = o.nextElementSibling;
            cleanUpElement(e), parentElt(e).removeChild(e)
        }

        function swapAfterBegin(e, t, r) {
            return insertNodesBefore(e, e.firstChild, t, r)
        }

        function swapBeforeBegin(e, t, r) {
            return insertNodesBefore(parentElt(e), e, t, r)
        }

        function swapBeforeEnd(e, t, r) {
            return insertNodesBefore(e, null, t, r)
        }

        function swapAfterEnd(e, t, r) {
            return insertNodesBefore(parentElt(e), e.nextSibling, t, r)
        }

        function swapInnerHTML(e, t, r) {
            var n = e.firstChild;
            if (insertNodesBefore(e, n, t, r), n) {
                for (; n.nextSibling;) cleanUpElement(n.nextSibling), e.removeChild(n.nextSibling);
                cleanUpElement(n), e.removeChild(n)
            }
        }

        function maybeSelectFromResponse(e, t) {
            var r = getClosestAttributeValue(e, "hx-select");
            if (r) {
                var n = getDocument().createDocumentFragment();
                forEach(t.querySelectorAll(r), function(e) {
                    n.appendChild(e)
                }), t = n
            }
            return t
        }

        function swap(e, t, r, n, o) {
            switch (e) {
                case "none":
                    return;
                case "outerHTML":
                    return void swapOuterHTML(r, n, o);
                case "afterbegin":
                    return void swapAfterBegin(r, n, o);
                case "beforebegin":
                    return void swapBeforeBegin(r, n, o);
                case "beforeend":
                    return void swapBeforeEnd(r, n, o);
                case "afterend":
                    return void swapAfterEnd(r, n, o);
                default:
                    for (var a = getExtensions(t), s = 0; s < a.length; s++) {
                        var i = a[s];
                        try {
                            var l = i.handleSwap(e, r, n, o);
                            if (l) {
                                if (void 0 !== l.length)
                                    for (var u = 0; u < l.length; u++) {
                                        var c = l[u];
                                        c.nodeType !== Node.TEXT_NODE && c.nodeType !== Node.COMMENT_NODE && o.tasks.push(makeAjaxLoadTask(c))
                                    }
                                return
                            }
                        } catch (e) {
                            logError(e)
                        }
                    }
                    swapInnerHTML(r, n, o)
            }
        }
        var TITLE_FINDER = /<title>([\s\S]+?)<\/title>/im;

        function findTitle(e) {
            if (e.indexOf("<title>") > -1 && (-1 == e.indexOf("<svg>") || e.indexOf("<title>") < e.indexOf("<svg>"))) {
                var t = TITLE_FINDER.exec(e);
                if (t) return t[1]
            }
        }

        function selectAndSwap(e, t, r, n, o) {
            var a = findTitle(n);
            if (a) {
                var s = find("title");
                s ? s.innerHTML = a : window.document.title = a
            }
            var i = makeFragment(n);
            if (i) return handleOutOfBandSwaps(i, o), handlePreservedElements(i = maybeSelectFromResponse(r, i)), swap(e, r, t, i, o)
        }

        function handleTrigger(e, t, r) {
            var n = e.getResponseHeader(t);
            if (0 === n.indexOf("{")) {
                var o = parseJSON(n);
                for (var a in o)
                    if (o.hasOwnProperty(a)) {
                        var s = o[a];
                        isRawObject(s) || (s = {
                            value: s
                        }), triggerEvent(r, a, s)
                    }
            } else triggerEvent(r, n, [])
        }
        var WHITESPACE = /\s/,
            WHITESPACE_OR_COMMA = /[\s,]/,
            SYMBOL_START = /[_$a-zA-Z]/,
            SYMBOL_CONT = /[_$a-zA-Z0-9]/,
            STRINGISH_START = ['"', "'", "/"],
            NOT_WHITESPACE = /[^\s]/;

        function tokenizeString(e) {
            for (var t = [], r = 0; r < e.length;) {
                if (SYMBOL_START.exec(e.charAt(r))) {
                    for (var n = r; SYMBOL_CONT.exec(e.charAt(r + 1));) r++;
                    t.push(e.substr(n, r - n + 1))
                } else if (-1 !== STRINGISH_START.indexOf(e.charAt(r))) {
                    var o = e.charAt(r);
                    n = r;
                    for (r++; r < e.length && e.charAt(r) !== o;) "\\" === e.charAt(r) && r++, r++;
                    t.push(e.substr(n, r - n + 1))
                } else {
                    var a = e.charAt(r);
                    t.push(a)
                }
                r++
            }
            return t
        }

        function isPossibleRelativeReference(e, t, r) {
            return SYMBOL_START.exec(e.charAt(0)) && "true" !== e && "false" !== e && "this" !== e && e !== r && "." !== t
        }

        function maybeGenerateConditional(e, t, r) {
            if ("[" === t[0]) {
                t.shift();
                for (var n = 1, o = " return (function(" + r + "){ return (", a = null; t.length > 0;) {
                    var s = t[0];
                    if ("]" === s) {
                        if (0 === --n) {
                            null === a && (o += "true"), t.shift(), o += ")})";
                            try {
                                var i = maybeEval(e, function() {
                                    return Function(o)()
                                }, function() {
                                    return !0
                                });
                                return i.source = o, i
                            } catch (e) {
                                return triggerErrorEvent(getDocument().body, "htmx:syntax:error", {
                                    error: e,
                                    source: o
                                }), null
                            }
                        }
                    } else "[" === s && n++;
                    isPossibleRelativeReference(s, a, r) ? o += "((" + r + "." + s + ") ? (" + r + "." + s + ") : (window." + s + "))" : o += s, a = t.shift()
                }
            }
        }

        function consumeUntil(e, t) {
            for (var r = ""; e.length > 0 && !e[0].match(t);) r += e.shift();
            return r
        }
        var INPUT_SELECTOR = "input, textarea, select";

        function getTriggerSpecs(e) {
            var t = getAttributeValue(e, "hx-trigger"),
                r = [];
            if (t) {
                var n = tokenizeString(t);
                do {
                    consumeUntil(n, NOT_WHITESPACE);
                    var o = n.length,
                        a = consumeUntil(n, /[,\[\s]/);
                    if ("" !== a)
                        if ("every" === a) {
                            var s = {
                                trigger: "every"
                            };
                            consumeUntil(n, NOT_WHITESPACE), s.pollInterval = parseInterval(consumeUntil(n, /[,\[\s]/)), consumeUntil(n, NOT_WHITESPACE), (i = maybeGenerateConditional(e, n, "event")) && (s.eventFilter = i), r.push(s)
                        } else if (0 === a.indexOf("sse:")) r.push({
                        trigger: "sse",
                        sseEvent: a.substr(4)
                    });
                    else {
                        var i, l = {
                            trigger: a
                        };
                        for ((i = maybeGenerateConditional(e, n, "event")) && (l.eventFilter = i); n.length > 0 && "," !== n[0];) {
                            consumeUntil(n, NOT_WHITESPACE);
                            var u = n.shift();
                            "changed" === u ? l.changed = !0 : "once" === u ? l.once = !0 : "consume" === u ? l.consume = !0 : "delay" === u && ":" === n[0] ? (n.shift(), l.delay = parseInterval(consumeUntil(n, WHITESPACE_OR_COMMA))) : "from" === u && ":" === n[0] ? (n.shift(), l.from = consumeUntil(n, WHITESPACE_OR_COMMA)) : "target" === u && ":" === n[0] ? (n.shift(), l.target = consumeUntil(n, WHITESPACE_OR_COMMA)) : "throttle" === u && ":" === n[0] ? (n.shift(), l.throttle = parseInterval(consumeUntil(n, WHITESPACE_OR_COMMA))) : "queue" === u && ":" === n[0] ? (n.shift(), l.queue = consumeUntil(n, WHITESPACE_OR_COMMA)) : "root" !== u && "threshold" !== u || ":" !== n[0] ? triggerErrorEvent(e, "htmx:syntax:error", {
                                token: n.shift()
                            }) : (n.shift(), l[u] = consumeUntil(n, WHITESPACE_OR_COMMA))
                        }
                        r.push(l)
                    }
                    n.length === o && triggerErrorEvent(e, "htmx:syntax:error", {
                        token: n.shift()
                    }), consumeUntil(n, NOT_WHITESPACE)
                } while ("," === n[0] && n.shift())
            }
            return r.length > 0 ? r : matches(e, "form") ? [{
                trigger: "submit"
            }] : matches(e, INPUT_SELECTOR) ? [{
                trigger: "change"
            }] : [{
                trigger: "click"
            }]
        }

        function cancelPolling(e) {
            getInternalData(e).cancelled = !0
        }

        function processPolling(e, t, r, n) {
            var o = getInternalData(e);
            o.timeout = setTimeout(function() {
                bodyContains(e) && !0 !== o.cancelled && (maybeFilterEvent(n, makeEvent("hx:poll:trigger", {
                    triggerSpec: n
                })) || issueAjaxRequest(t, r, e), processPolling(e, t, getAttributeValue(e, "hx-" + t), n))
            }, n.pollInterval)
        }

        function isLocalLink(e) {
            return location.hostname === e.hostname && getRawAttribute(e, "href") && 0 !== getRawAttribute(e, "href").indexOf("#")
        }

        function boostElement(e, t, r) {
            if ("A" === e.tagName && isLocalLink(e) || "FORM" === e.tagName) {
                var n, o;
                if (t.boosted = !0, "A" === e.tagName) n = "get", o = getRawAttribute(e, "href"), t.pushURL = !0;
                else {
                    var a = getRawAttribute(e, "method");
                    "get" === (n = a ? a.toLowerCase() : "get") && (t.pushURL = !0), o = getRawAttribute(e, "action")
                }
                r.forEach(function(r) {
                    addEventListener(e, n, o, t, r, !0)
                })
            }
        }

        function shouldCancel(e) {
            return "FORM" === e.tagName || matches(e, 'input[type="submit"], button') && null !== closest(e, "form") || "A" === e.tagName && e.href && ("#" === e.getAttribute("href") || 0 !== e.getAttribute("href").indexOf("#"))
        }

        function ignoreBoostedAnchorCtrlClick(e, t) {
            return getInternalData(e).boosted && "A" === e.tagName && "click" === t.type && (t.ctrlKey || t.metaKey)
        }

        function maybeFilterEvent(e, t) {
            var r = e.eventFilter;
            if (r) try {
                return !0 !== r(t)
            } catch (e) {
                return triggerErrorEvent(getDocument().body, "htmx:eventFilter:error", {
                    error: e,
                    source: r.source
                }), !0
            }
            return !1
        }

        function addEventListener(e, t, r, n, o, a) {
            forEach(o.from ? querySelectorAllExt(e, o.from) : [e], function(s) {
                var i = function(n) {
                    if (bodyContains(e)) {
                        if (!ignoreBoostedAnchorCtrlClick(e, n) && ((a || shouldCancel(e)) && n.preventDefault(), !maybeFilterEvent(o, n))) {
                            var l = getInternalData(n);
                            l.triggerSpec = o, null == l.handledFor && (l.handledFor = []);
                            var u = getInternalData(e);
                            if (l.handledFor.indexOf(e) < 0) {
                                if (l.handledFor.push(e), o.consume && n.stopPropagation(), o.target && n.target && !matches(n.target, o.target)) return;
                                if (o.once) {
                                    if (u.triggeredOnce) return;
                                    u.triggeredOnce = !0
                                }
                                if (o.changed) {
                                    if (u.lastValue === e.value) return;
                                    u.lastValue = e.value
                                }
                                if (u.delayed && clearTimeout(u.delayed), u.throttle) return;
                                o.throttle ? u.throttle || (issueAjaxRequest(t, r, e, n), u.throttle = setTimeout(function() {
                                    u.throttle = null
                                }, o.throttle)) : o.delay ? u.delayed = setTimeout(function() {
                                    issueAjaxRequest(t, r, e, n)
                                }, o.delay) : issueAjaxRequest(t, r, e, n)
                            }
                        }
                    } else s.removeEventListener(o.trigger, i)
                };
                null == n.listenerInfos && (n.listenerInfos = []), n.listenerInfos.push({
                    trigger: o.trigger,
                    listener: i,
                    on: s
                }), s.addEventListener(o.trigger, i)
            })
        }
        var windowIsScrolling = !1,
            scrollHandler = null;

        function initScrollHandler() {
            scrollHandler || (scrollHandler = function() {
                windowIsScrolling = !0
            }, window.addEventListener("scroll", scrollHandler), setInterval(function() {
                windowIsScrolling && (windowIsScrolling = !1, forEach(getDocument().querySelectorAll("[hx-trigger='revealed'],[data-hx-trigger='revealed']"), function(e) {
                    maybeReveal(e)
                }))
            }, 200))
        }

        function maybeReveal(e) {
            var t = getInternalData(e);
            !t.revealed && isScrolledIntoView(e) && (t.revealed = !0, t.initialized ? issueAjaxRequest(t.verb, t.path, e) : e.addEventListener("htmx:afterProcessNode", function() {
                issueAjaxRequest(t.verb, t.path, e)
            }, {
                once: !0
            }))
        }

        function processWebSocketInfo(e, t, r) {
            for (var n = splitOnWhitespace(r), o = 0; o < n.length; o++) {
                var a = n[o].split(/:(.+)/);
                "connect" === a[0] && ensureWebSocket(e, a[1], 0), "send" === a[0] && processWebSocketSend(e)
            }
        }

        function ensureWebSocket(e, t, r) {
            if (bodyContains(e)) {
                if (0 == t.indexOf("/")) {
                    var n = location.hostname + (location.port ? ":" + location.port : "");
                    "https:" == location.protocol ? t = "wss://" + n + t : "http:" == location.protocol && (t = "ws://" + n + t)
                }
                var o = htmx.createWebSocket(t);
                o.onerror = function(t) {
                    triggerErrorEvent(e, "htmx:wsError", {
                        error: t,
                        socket: o
                    }), maybeCloseWebSocketSource(e)
                }, o.onclose = function(n) {
                    if ([1006, 1012, 1013].indexOf(n.code) >= 0) {
                        var o = getWebSocketReconnectDelay(r);
                        setTimeout(function() {
                            ensureWebSocket(e, t, r + 1)
                        }, o)
                    }
                }, o.onopen = function(e) {
                    r = 0
                }, getInternalData(e).webSocket = o, o.addEventListener("message", function(t) {
                    if (!maybeCloseWebSocketSource(e)) {
                        var r = t.data;
                        withExtensions(e, function(t) {
                            r = t.transformResponse(r, null, e)
                        });
                        for (var n = makeSettleInfo(e), o = toArray(makeFragment(r).children), a = 0; a < o.length; a++) {
                            var s = o[a];
                            oobSwap(getAttributeValue(s, "hx-swap-oob") || "true", s, n)
                        }
                        settleImmediately(n.tasks)
                    }
                })
            }
        }

        function maybeCloseWebSocketSource(e) {
            if (!bodyContains(e)) return getInternalData(e).webSocket.close(), !0
        }

        function processWebSocketSend(e) {
            var t = getClosestMatch(e, function(e) {
                return null != getInternalData(e).webSocket
            });
            t ? e.addEventListener(getTriggerSpecs(e)[0].trigger, function(r) {
                var n = getInternalData(t).webSocket,
                    o = getHeaders(e, t),
                    a = getInputValues(e, "post"),
                    s = a.errors,
                    i = filterValues(mergeObjects(a.values, getExpressionVars(e)), e);
                i.HEADERS = o, s && s.length > 0 ? triggerEvent(e, "htmx:validation:halted", s) : (n.send(JSON.stringify(i)), shouldCancel(e) && r.preventDefault())
            }) : triggerErrorEvent(e, "htmx:noWebSocketSourceError")
        }

        function getWebSocketReconnectDelay(e) {
            var t = htmx.config.wsReconnectDelay;
            if ("function" == typeof t) return t(e);
            if ("full-jitter" === t) {
                var r = Math.min(e, 6);
                return 1e3 * Math.pow(2, r) * Math.random()
            }
            logError('htmx.config.wsReconnectDelay must either be a function or the string "full-jitter"')
        }

        function processSSEInfo(e, t, r) {
            for (var n = splitOnWhitespace(r), o = 0; o < n.length; o++) {
                var a = n[o].split(/:(.+)/);
                "connect" === a[0] && processSSESource(e, a[1]), "swap" === a[0] && processSSESwap(e, a[1])
            }
        }

        function processSSESource(e, t) {
            var r = htmx.createEventSource(t);
            r.onerror = function(t) {
                triggerErrorEvent(e, "htmx:sseError", {
                    error: t,
                    source: r
                }), maybeCloseSSESource(e)
            }, getInternalData(e).sseEventSource = r
        }

        function processSSESwap(e, t) {
            var r = getClosestMatch(e, hasEventSource);
            if (r) {
                var n = getInternalData(r).sseEventSource,
                    o = function(a) {
                        if (maybeCloseSSESource(r)) n.removeEventListener(t, o);
                        else {
                            var s = a.data;
                            withExtensions(e, function(t) {
                                s = t.transformResponse(s, null, e)
                            });
                            var i = getSwapSpecification(e),
                                l = getTarget(e),
                                u = makeSettleInfo(e);
                            selectAndSwap(i.swapStyle, e, l, s, u), settleImmediately(u.tasks), triggerEvent(e, "htmx:sseMessage", a)
                        }
                    };
                getInternalData(e).sseListener = o, n.addEventListener(t, o)
            } else triggerErrorEvent(e, "htmx:noSSESourceError")
        }

        function processSSETrigger(e, t, r, n) {
            var o = getClosestMatch(e, hasEventSource);
            if (o) {
                var a = getInternalData(o).sseEventSource,
                    s = function() {
                        maybeCloseSSESource(o) || (bodyContains(e) ? issueAjaxRequest(t, r, e) : a.removeEventListener(n, s))
                    };
                getInternalData(e).sseListener = s, a.addEventListener(n, s)
            } else triggerErrorEvent(e, "htmx:noSSESourceError")
        }

        function maybeCloseSSESource(e) {
            if (!bodyContains(e)) return getInternalData(e).sseEventSource.close(), !0
        }

        function hasEventSource(e) {
            return null != getInternalData(e).sseEventSource
        }

        function loadImmediately(e, t, r, n, o) {
            var a = function() {
                n.loaded || (n.loaded = !0, issueAjaxRequest(t, r, e))
            };
            o ? setTimeout(a, o) : a()
        }

        function processVerbs(e, t, r) {
            var n = !1;
            return forEach(VERBS, function(o) {
                if (hasAttribute(e, "hx-" + o)) {
                    var a = getAttributeValue(e, "hx-" + o);
                    n = !0, t.path = a, t.verb = o, r.forEach(function(r) {
                        if (r.sseEvent) processSSETrigger(e, o, a, r.sseEvent);
                        else if ("revealed" === r.trigger) initScrollHandler(), maybeReveal(e);
                        else if ("intersect" === r.trigger) {
                            var n = {};
                            r.root && (n.root = querySelectorExt(r.root)), r.threshold && (n.threshold = parseFloat(r.threshold)), new IntersectionObserver(function(t) {
                                for (var r = 0; r < t.length; r++) {
                                    if (t[r].isIntersecting) {
                                        // Custom event trigger for Ira H.
                                        maybeReveal(e);
                                        // Default event trigger
                                        // triggerEvent(e, "intersect");
                                        break
                                    }
                                }
                            }, n).observe(e), addEventListener(e, o, a, t, r)
                        } else "load" === r.trigger ? loadImmediately(e, o, a, t, r.delay) : r.pollInterval ? (t.polling = !0, processPolling(e, o, a, r)) : addEventListener(e, o, a, t, r)
                    })
                }
            }), n
        }

        function evalScript(e) {
            if ("text/javascript" === e.type || "" === e.type) try {
                maybeEval(e, function() {
                    (0, eval)(e.innerText)
                })
            } catch (e) {
                logError(e)
            }
        }

        function processScripts(e) {
            matches(e, "script") && evalScript(e), forEach(findAll(e, "script"), function(e) {
                evalScript(e)
            })
        }

        function isBoosted() {
            return document.querySelector("[hx-boost], [data-hx-boost]")
        }

        function findElementsToProcess(e) {
            if (e.querySelectorAll) {
                var t = isBoosted() ? ", a, form" : "";
                return e.querySelectorAll(VERB_SELECTOR + t + ", [hx-sse], [data-hx-sse], [hx-ws], [data-hx-ws]")
            }
            return []
        }

        function initButtonTracking(e) {
            var t = function(t) {
                matches(t.target, "button, input[type='submit']") && (getInternalData(e).lastButtonClicked = t.target)
            };
            e.addEventListener("click", t), e.addEventListener("focusin", t), e.addEventListener("focusout", function(t) {
                getInternalData(e).lastButtonClicked = null
            })
        }

        function initNode(e) {
            if (!e.closest || !e.closest(htmx.config.disableSelector)) {
                var t = getInternalData(e);
                if (!t.initialized) {
                    t.initialized = !0, triggerEvent(e, "htmx:beforeProcessNode"), e.value && (t.lastValue = e.value);
                    var r = getTriggerSpecs(e);
                    processVerbs(e, t, r) || "true" !== getClosestAttributeValue(e, "hx-boost") || boostElement(e, t, r), "FORM" === e.tagName && initButtonTracking(e);
                    var n = getAttributeValue(e, "hx-sse");
                    n && processSSEInfo(e, t, n);
                    var o = getAttributeValue(e, "hx-ws");
                    o && processWebSocketInfo(e, t, o), triggerEvent(e, "htmx:afterProcessNode")
                }
            }
        }

        function processNode(e) {
            initNode(e = resolveTarget(e)), forEach(findElementsToProcess(e), function(e) {
                initNode(e)
            })
        }

        function kebabEventName(e) {
            return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
        }

        function makeEvent(e, t) {
            var r;
            return window.CustomEvent && "function" == typeof window.CustomEvent ? r = new CustomEvent(e, {
                bubbles: !0,
                cancelable: !0,
                detail: t
            }) : (r = getDocument().createEvent("CustomEvent")).initCustomEvent(e, !0, !0, t), r
        }

        function triggerErrorEvent(e, t, r) {
            triggerEvent(e, t, mergeObjects({
                error: t
            }, r))
        }

        function ignoreEventForLogging(e) {
            return "htmx:afterProcessNode" === e
        }

        function withExtensions(e, t) {
            forEach(getExtensions(e), function(e) {
                try {
                    t(e)
                } catch (e) {
                    logError(e)
                }
            })
        }

        function logError(e) {
            console.error ? console.error(e) : console.log && console.log("ERROR: ", e)
        }

        function triggerEvent(e, t, r) {
            e = resolveTarget(e), null == r && (r = {}), r.elt = e;
            var n = makeEvent(t, r);
            htmx.logger && !ignoreEventForLogging(t) && htmx.logger(e, t, r), r.error && (logError(r.error), triggerEvent(e, "htmx:error", {
                errorInfo: r
            }));
            var o = e.dispatchEvent(n),
                a = kebabEventName(t);
            if (o && a !== t) {
                var s = makeEvent(a, n.detail);
                o = o && e.dispatchEvent(s)
            }
            return withExtensions(e, function(e) {
                o = o && !1 !== e.onEvent(t, n)
            }), o
        }
        var currentPathForHistory = null;

        function getHistoryElement() {
            return getDocument().querySelector("[hx-history-elt],[data-hx-history-elt]") || getDocument().body
        }

        function saveToHistoryCache(e, t, r, n) {
            for (var o = parseJSON(localStorage.getItem("htmx-history-cache")) || [], a = 0; a < o.length; a++)
                if (o[a].url === e) {
                    o.splice(a, 1);
                    break
                } for (o.push({
                    url: e,
                    content: t,
                    title: r,
                    scroll: n
                }); o.length > htmx.config.historyCacheSize;) o.shift();
            for (; o.length > 0;) try {
                localStorage.setItem("htmx-history-cache", JSON.stringify(o));
                break
            } catch (e) {
                triggerErrorEvent(getDocument().body, "htmx:historyCacheError", {
                    cause: e,
                    cache: o
                }), o.shift()
            }
        }

        function getCachedHistory(e) {
            for (var t = parseJSON(localStorage.getItem("htmx-history-cache")) || [], r = 0; r < t.length; r++)
                if (t[r].url === e) return t[r];
            return null
        }

        function cleanInnerHtmlForHistory(e) {
            var t = htmx.config.requestClass,
                r = e.cloneNode(!0);
            return forEach(findAll(r, "." + t), function(e) {
                removeClassFromElement(e, t)
            }), r.innerHTML
        }

        function saveHistory() {
            var e = getHistoryElement(),
                t = currentPathForHistory || location.pathname + location.search;
            triggerEvent(getDocument().body, "htmx:beforeHistorySave", {
                path: t,
                historyElt: e
            }), htmx.config.historyEnabled && history.replaceState({
                htmx: !0
            }, getDocument().title, window.location.href), saveToHistoryCache(t, cleanInnerHtmlForHistory(e), getDocument().title, window.scrollY)
        }

        function pushUrlIntoHistory(e) {
            htmx.config.historyEnabled && history.pushState({
                htmx: !0
            }, "", e), currentPathForHistory = e
        }

        function settleImmediately(e) {
            forEach(e, function(e) {
                e.call()
            })
        }

        function loadHistoryFromServer(e) {
            var t = new XMLHttpRequest,
                r = {
                    path: e,
                    xhr: t
                };
            triggerEvent(getDocument().body, "htmx:historyCacheMiss", r), t.open("GET", e, !0), t.setRequestHeader("HX-History-Restore-Request", "true"), t.onload = function() {
                if (this.status >= 200 && this.status < 400) {
                    triggerEvent(getDocument().body, "htmx:historyCacheMissLoad", r);
                    var t = makeFragment(this.response);
                    t = t.querySelector("[hx-history-elt],[data-hx-history-elt]") || t;
                    var n = getHistoryElement(),
                        o = makeSettleInfo(n);
                    swapInnerHTML(n, t, o), settleImmediately(o.tasks), currentPathForHistory = e, triggerEvent(getDocument().body, "htmx:historyRestore", {
                        path: e
                    })
                } else triggerErrorEvent(getDocument().body, "htmx:historyCacheMissLoadError", r)
            }, t.send()
        }

        function restoreHistory(e) {
            saveHistory();
            var t = getCachedHistory(e = e || location.pathname + location.search);
            if (t) {
                var r = makeFragment(t.content),
                    n = getHistoryElement(),
                    o = makeSettleInfo(n);
                swapInnerHTML(n, r, o), settleImmediately(o.tasks), document.title = t.title, window.scrollTo(0, t.scroll), currentPathForHistory = e, triggerEvent(getDocument().body, "htmx:historyRestore", {
                    path: e
                })
            } else htmx.config.refreshOnHistoryMiss ? window.location.reload(!0) : loadHistoryFromServer(e)
        }

        function shouldPush(e) {
            var t = getClosestAttributeValue(e, "hx-push-url");
            return t && "false" !== t || getInternalData(e).boosted && getInternalData(e).pushURL
        }

        function getPushUrl(e) {
            var t = getClosestAttributeValue(e, "hx-push-url");
            return "true" === t || "false" === t ? null : t
        }

        function addRequestIndicatorClasses(e) {
            var t = getClosestAttributeValue(e, "hx-indicator");
            if (t) var r = querySelectorAllExt(e, t);
            else r = [e];
            return forEach(r, function(e) {
                e.classList.add.call(e.classList, htmx.config.requestClass)
            }), r
        }

        function removeRequestIndicatorClasses(e) {
            forEach(e, function(e) {
                e.classList.remove.call(e.classList, htmx.config.requestClass)
            })
        }

        function haveSeenNode(e, t) {
            for (var r = 0; r < e.length; r++) {
                if (e[r].isSameNode(t)) return !0
            }
            return !1
        }

        function shouldInclude(e) {
            return "" !== e.name && null != e.name && !e.disabled && ("button" !== e.type && "submit" !== e.type && "image" !== e.tagName && "reset" !== e.tagName && "file" !== e.tagName && ("checkbox" !== e.type && "radio" !== e.type || e.checked))
        }

        function processInputValue(e, t, r, n, o) {
            if (null != n && !haveSeenNode(e, n)) {
                if (e.push(n), shouldInclude(n)) {
                    var a = getRawAttribute(n, "name"),
                        s = n.value;
                    if (n.multiple && (s = toArray(n.querySelectorAll("option:checked")).map(function(e) {
                            return e.value
                        })), n.files && (s = toArray(n.files)), null != a && null != s) {
                        var i = t[a];
                        i ? Array.isArray(i) ? Array.isArray(s) ? t[a] = i.concat(s) : i.push(s) : Array.isArray(s) ? t[a] = [i].concat(s) : t[a] = [i, s] : t[a] = s
                    }
                    o && validateElement(n, r)
                }
                if (matches(n, "form")) forEach(n.elements, function(n) {
                    processInputValue(e, t, r, n, o)
                })
            }
        }

        function validateElement(e, t) {
            e.willValidate && (triggerEvent(e, "htmx:validation:validate"), e.checkValidity() || (t.push({
                elt: e,
                message: e.validationMessage,
                validity: e.validity
            }), triggerEvent(e, "htmx:validation:failed", {
                message: e.validationMessage,
                validity: e.validity
            })))
        }

        function getInputValues(e, t) {
            var r = [],
                n = {},
                o = {},
                a = [],
                s = matches(e, "form") && !0 !== e.noValidate;
            "get" !== t && processInputValue(r, o, a, closest(e, "form"), s), processInputValue(r, n, a, e, s);
            var i = getInternalData(e);
            if (i.lastButtonClicked) {
                var l = getRawAttribute(i.lastButtonClicked, "name");
                l && (n[l] = i.lastButtonClicked.value)
            }
            var u = getClosestAttributeValue(e, "hx-include");
            u && forEach(querySelectorAllExt(e, u), function(e) {
                processInputValue(r, n, a, e, s), matches(e, "form") || forEach(e.querySelectorAll(INPUT_SELECTOR), function(e) {
                    processInputValue(r, n, a, e, s)
                })
            });
            return n = mergeObjects(n, o), {
                errors: a,
                values: n
            }
        }

        function appendParam(e, t, r) {
            return "" !== e && (e += "&"), e += encodeURIComponent(t) + "=" + encodeURIComponent(r)
        }

        function urlEncode(e) {
            var t = "";
            for (var r in e)
                if (e.hasOwnProperty(r)) {
                    var n = e[r];
                    Array.isArray(n) ? forEach(n, function(e) {
                        t = appendParam(t, r, e)
                    }) : t = appendParam(t, r, n)
                } return t
        }

        function makeFormData(e) {
            var t = new FormData;
            for (var r in e)
                if (e.hasOwnProperty(r)) {
                    var n = e[r];
                    Array.isArray(n) ? forEach(n, function(e) {
                        t.append(r, e)
                    }) : t.append(r, n)
                } return t
        }

        function getHeaders(e, t, r) {
            var n = {
                "HX-Request": "true",
                "HX-Trigger": getRawAttribute(e, "id"),
                "HX-Trigger-Name": getRawAttribute(e, "name"),
                "HX-Target": getAttributeValue(t, "id"),
                "HX-Current-URL": getDocument().location.href
            };
            return getValuesForElement(e, "hx-headers", !1, n), void 0 !== r && (n["HX-Prompt"] = r), n
        }

        function filterValues(e, t) {
            var r = getClosestAttributeValue(t, "hx-params");
            if (r) {
                if ("none" === r) return {};
                if ("*" === r) return e;
                if (0 === r.indexOf("not ")) return forEach(r.substr(4).split(","), function(t) {
                    t = t.trim(), delete e[t]
                }), e;
                var n = {};
                return forEach(r.split(","), function(t) {
                    t = t.trim(), n[t] = e[t]
                }), n
            }
            return e
        }

        function isAnchorLink(e) {
            return getRawAttribute(e, "href") && getRawAttribute(e, "href").indexOf("#") >= 0
        }

        function getSwapSpecification(e) {
            var t = getClosestAttributeValue(e, "hx-swap"),
                r = {
                    swapStyle: getInternalData(e).boosted ? "innerHTML" : htmx.config.defaultSwapStyle,
                    swapDelay: htmx.config.defaultSwapDelay,
                    settleDelay: htmx.config.defaultSettleDelay
                };
            if (getInternalData(e).boosted && !isAnchorLink(e) && (r.show = "top"), t) {
                var n = splitOnWhitespace(t);
                if (n.length > 0) {
                    r.swapStyle = n[0];
                    for (var o = 1; o < n.length; o++) {
                        var a = n[o];
                        if (0 === a.indexOf("swap:") && (r.swapDelay = parseInterval(a.substr(5))), 0 === a.indexOf("settle:") && (r.settleDelay = parseInterval(a.substr(7))), 0 === a.indexOf("scroll:")) {
                            var s = (l = a.substr(7).split(":")).pop(),
                                i = l.length > 0 ? l.join(":") : null;
                            r.scroll = s, r.scrollTarget = i
                        }
                        if (0 === a.indexOf("show:")) {
                            var l, u = (l = a.substr(5).split(":")).pop();
                            i = l.length > 0 ? l.join(":") : null;
                            r.show = u, r.showTarget = i
                        }
                    }
                }
            }
            return r
        }

        function encodeParamsForBody(e, t, r) {
            var n = null;
            return withExtensions(t, function(o) {
                null == n && (n = o.encodeParameters(e, r, t))
            }), null != n ? n : "multipart/form-data" === getClosestAttributeValue(t, "hx-encoding") ? makeFormData(r) : urlEncode(r)
        }

        function makeSettleInfo(e) {
            return {
                tasks: [],
                elts: [e]
            }
        }

        function updateScrollState(e, t) {
            var r = e[0],
                n = e[e.length - 1];
            if (t.scroll) {
                var o = null;
                t.scrollTarget && (o = querySelectorExt(r, t.scrollTarget)), "top" === t.scroll && (r || o) && ((o = o || r).scrollTop = 0), "bottom" === t.scroll && (n || o) && ((o = o || n).scrollTop = o.scrollHeight)
            }
            if (t.show) {
                o = null;
                if (t.showTarget) {
                    var a = t.showTarget;
                    "window" === t.showTarget && (a = "body"), o = querySelectorExt(r, a)
                }
                "top" === t.show && (r || o) && (o = o || r).scrollIntoView({
                    block: "start",
                    behavior: htmx.config.scrollBehavior
                }), "bottom" === t.show && (n || o) && (o = o || n).scrollIntoView({
                    block: "end",
                    behavior: htmx.config.scrollBehavior
                })
            }
        }

        function getValuesForElement(e, t, r, n) {
            if (null == n && (n = {}), null == e) return n;
            var o = getAttributeValue(e, t);
            if (o) {
                var a, s = o.trim(),
                    i = r;
                for (var l in 0 === s.indexOf("javascript:") ? (s = s.substr(11), i = !0) : 0 === s.indexOf("js:") && (s = s.substr(3), i = !0), 0 !== s.indexOf("{") && (s = "{" + s + "}"), a = i ? maybeEval(e, function() {
                        return Function("return (" + s + ")")()
                    }, {}) : parseJSON(s)) a.hasOwnProperty(l) && null == n[l] && (n[l] = a[l])
            }
            return getValuesForElement(parentElt(e), t, r, n)
        }

        function maybeEval(e, t, r) {
            return htmx.config.allowEval ? t() : (triggerErrorEvent(e, "htmx:evalDisallowedError"), r)
        }

        function getHXVarsForElement(e, t) {
            return getValuesForElement(e, "hx-vars", !0, t)
        }

        function getHXValsForElement(e, t) {
            return getValuesForElement(e, "hx-vals", !1, t)
        }

        function getExpressionVars(e) {
            return mergeObjects(getHXVarsForElement(e), getHXValsForElement(e))
        }

        function safelySetHeaderValue(e, t, r) {
            if (null !== r) try {
                e.setRequestHeader(t, r)
            } catch (n) {
                e.setRequestHeader(t, encodeURIComponent(r)), e.setRequestHeader(t + "-URI-AutoEncoded", "true")
            }
        }

        function getResponseURL(e) {
            if (e.responseURL && "undefined" != typeof URL) try {
                var t = new URL(e.responseURL);
                return t.pathname + t.search
            } catch (t) {
                triggerErrorEvent(getDocument().body, "htmx:badResponseUrl", {
                    url: e.responseURL
                })
            }
        }

        function hasHeader(e, t) {
            return e.getAllResponseHeaders().match(t)
        }

        function ajaxHelper(e, t, r) {
            return r ? r instanceof Element || isType(r, "String") ? issueAjaxRequest(e, t, null, null, {
                targetOverride: resolveTarget(r)
            }) : issueAjaxRequest(e, t, resolveTarget(r.source), r.event, {
                handler: r.handler,
                headers: r.headers,
                values: r.values,
                targetOverride: resolveTarget(r.target)
            }) : issueAjaxRequest(e, t)
        }

        function hierarchyForElt(e) {
            for (var t = []; e;) t.push(e), e = e.parentElement;
            return t
        }

        function issueAjaxRequest(e, t, r, n, o) {
            var a = null,
                s = null;
            if (o = null != o ? o : {}, "undefined" != typeof Promise) var i = new Promise(function(e, t) {
                a = e, s = t
            });
            null == r && (r = getDocument().body);
            var l = o.handler || handleAjaxResponse;
            if (bodyContains(r)) {
                var u = o.targetOverride || getTarget(r);
                if (null != u) {
                    var c = getInternalData(r);
                    if (c.requestInFlight) {
                        var f = "last";
                        if (n) {
                            var g = getInternalData(n);
                            g && g.triggerSpec && g.triggerSpec.queue && (f = g.triggerSpec.queue)
                        }
                        return null == c.queuedRequests && (c.queuedRequests = []), void("first" === f && 0 === c.queuedRequests.length ? c.queuedRequests.push(function() {
                            issueAjaxRequest(e, t, r, n)
                        }) : "all" === f ? c.queuedRequests.push(function() {
                            issueAjaxRequest(e, t, r, n)
                        }) : "last" === f && (c.queuedRequests = [], c.queuedRequests.push(function() {
                            issueAjaxRequest(e, t, r, n)
                        })))
                    }
                    c.requestInFlight = !0;
                    var d = function() {
                            (c.requestInFlight = !1, null != c.queuedRequests && c.queuedRequests.length > 0) && c.queuedRequests.shift()()
                        },
                        h = getClosestAttributeValue(r, "hx-prompt");
                    if (h) {
                        var m = prompt(h);
                        if (null === m || !triggerEvent(r, "htmx:prompt", {
                                prompt: m,
                                target: u
                            })) return maybeCall(a), d(), i
                    }
                    var v = getClosestAttributeValue(r, "hx-confirm");
                    if (v && !confirm(v)) return maybeCall(a), d(), i;
                    var p = new XMLHttpRequest,
                        E = getHeaders(r, u, m);
                    o.headers && (E = mergeObjects(E, o.headers));
                    var b = getInputValues(r, e),
                        y = b.errors,
                        S = b.values;
                    o.values && (S = mergeObjects(S, o.values));
                    var x = mergeObjects(S, getExpressionVars(r)),
                        w = filterValues(x, r);
                    "get" !== e && null == getClosestAttributeValue(r, "hx-encoding") && (E["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8"), null != t && "" !== t || (t = getDocument().location.href);
                    var C = getValuesForElement(r, "hx-request"),
                        A = {
                            parameters: w,
                            unfilteredParameters: x,
                            headers: E,
                            target: u,
                            verb: e,
                            errors: y,
                            withCredentials: o.credentials || C.credentials || htmx.config.withCredentials,
                            timeout: o.timeout || C.timeout || htmx.config.timeout,
                            path: t,
                            triggeringEvent: n
                        };
                    if (!triggerEvent(r, "htmx:configRequest", A)) return maybeCall(a), d(), i;
                    if (t = A.path, e = A.verb, E = A.headers, w = A.parameters, (y = A.errors) && y.length > 0) return triggerEvent(r, "htmx:validation:halted", A), maybeCall(a), d(), i;
                    var T = t.split("#"),
                        I = T[0],
                        R = T[1];
                    if ("get" === e) {
                        var H = I;
                        0 !== Object.keys(w).length && (H.indexOf("?") < 0 ? H += "?" : H += "&", H += urlEncode(w), R && (H += "#" + R)), p.open("GET", H, !0)
                    } else p.open(e.toUpperCase(), t, !0);
                    if (p.overrideMimeType("text/html"), p.withCredentials = A.withCredentials, p.timeout = A.timeout, C.noHeaders);
                    else
                        for (var O in E)
                            if (E.hasOwnProperty(O)) {
                                var L = E[O];
                                safelySetHeaderValue(p, O, L)
                            } var D = {
                        xhr: p,
                        target: u,
                        requestConfig: A,
                        pathInfo: {
                            path: t,
                            finalPath: H,
                            anchor: R
                        }
                    };
                    if (p.onload = function() {
                            try {
                                var e = hierarchyForElt(r);
                                if (l(r, D), removeRequestIndicatorClasses(q), triggerEvent(r, "htmx:afterRequest", D), triggerEvent(r, "htmx:afterOnLoad", D), !bodyContains(r)) {
                                    for (var t = null; e.length > 0 && null == t;) {
                                        var n = e.shift();
                                        bodyContains(n) && (t = n)
                                    }
                                    t && (triggerEvent(t, "htmx:afterRequest", D), triggerEvent(t, "htmx:afterOnLoad", D))
                                }
                                maybeCall(a), d()
                            } catch (e) {
                                throw triggerErrorEvent(r, "htmx:onLoadError", mergeObjects({
                                    error: e
                                }, D)), e
                            }
                        }, p.onerror = function() {
                            removeRequestIndicatorClasses(q), triggerErrorEvent(r, "htmx:afterRequest", D), triggerErrorEvent(r, "htmx:sendError", D), maybeCall(s), d()
                        }, p.onabort = function() {
                            removeRequestIndicatorClasses(q), triggerErrorEvent(r, "htmx:afterRequest", D), triggerErrorEvent(r, "htmx:sendAbort", D), maybeCall(s), d()
                        }, p.ontimeout = function() {
                            removeRequestIndicatorClasses(q), triggerErrorEvent(r, "htmx:afterRequest", D), triggerErrorEvent(r, "htmx:timeout", D), maybeCall(s), d()
                        }, !triggerEvent(r, "htmx:beforeRequest", D)) return maybeCall(a), d(), i;
                    var q = addRequestIndicatorClasses(r);
                    return forEach(["loadstart", "loadend", "progress", "abort"], function(e) {
                        forEach([p, p.upload], function(t) {
                            t.addEventListener(e, function(t) {
                                triggerEvent(r, "htmx:xhr:" + e, {
                                    lengthComputable: t.lengthComputable,
                                    loaded: t.loaded,
                                    total: t.total
                                })
                            })
                        })
                    }), triggerEvent(r, "htmx:beforeSend", D), p.send("get" === e ? null : encodeParamsForBody(p, r, w)), i
                }
                triggerErrorEvent(r, "htmx:targetError", {
                    target: getAttributeValue(r, "hx-target")
                })
            }
        }

        function handleAjaxResponse(e, t) {
            var r = t.xhr,
                n = t.target;
            if (triggerEvent(e, "htmx:beforeOnLoad", t)) {
                if (hasHeader(r, /HX-Trigger:/i) && handleTrigger(r, "HX-Trigger", e), hasHeader(r, /HX-Push:/i)) var o = r.getResponseHeader("HX-Push");
                if (hasHeader(r, /HX-Redirect:/i)) window.location.href = r.getResponseHeader("HX-Redirect");
                else if (hasHeader(r, /HX-Refresh:/i) && "true" === r.getResponseHeader("HX-Refresh")) location.reload();
                else {
                    var a = shouldPush(e) || o;
                    if (r.status >= 200 && r.status < 400) {
                        if (286 === r.status && cancelPolling(e), 204 !== r.status) {
                            if (!triggerEvent(n, "htmx:beforeSwap", t)) return;
                            var s = r.response;
                            withExtensions(e, function(t) {
                                s = t.transformResponse(s, r, e)
                            }), a && saveHistory();
                            var i = getSwapSpecification(e);
                            n.classList.add(htmx.config.swappingClass);
                            var l = function() {
                                try {
                                    var l = document.activeElement,
                                        u = {};
                                    try {
                                        u = {
                                            elt: l,
                                            start: l ? l.selectionStart : null,
                                            end: l ? l.selectionEnd : null
                                        }
                                    } catch (e) {}
                                    var c = makeSettleInfo(n);
                                    if (selectAndSwap(i.swapStyle, n, e, s, c), u.elt && !bodyContains(u.elt) && u.elt.id) {
                                        var f = document.getElementById(u.elt.id);
                                        f && (u.start && f.setSelectionRange && f.setSelectionRange(u.start, u.end), f.focus())
                                    }
                                    if (n.classList.remove(htmx.config.swappingClass), forEach(c.elts, function(e) {
                                            e.classList && e.classList.add(htmx.config.settlingClass), triggerEvent(e, "htmx:afterSwap", t)
                                        }), t.pathInfo.anchor && (location.hash = t.pathInfo.anchor), hasHeader(r, /HX-Trigger-After-Swap:/i)) {
                                        var g = e;
                                        bodyContains(e) || (g = getDocument().body), handleTrigger(r, "HX-Trigger-After-Swap", g)
                                    }
                                    var d = function() {
                                        if (forEach(c.tasks, function(e) {
                                                e.call()
                                            }), forEach(c.elts, function(e) {
                                                e.classList && e.classList.remove(htmx.config.settlingClass), triggerEvent(e, "htmx:afterSettle", t)
                                            }), a) {
                                            var n = o || getPushUrl(e) || getResponseURL(r) || t.pathInfo.finalPath || t.pathInfo.path;
                                            pushUrlIntoHistory(n), triggerEvent(getDocument().body, "htmx:pushedIntoHistory", {
                                                path: n
                                            })
                                        }
                                        if (updateScrollState(c.elts, i), hasHeader(r, /HX-Trigger-After-Settle:/i)) {
                                            var s = e;
                                            bodyContains(e) || (s = getDocument().body), handleTrigger(r, "HX-Trigger-After-Settle", s)
                                        }
                                    };
                                    i.settleDelay > 0 ? setTimeout(d, i.settleDelay) : d()
                                } catch (r) {
                                    throw triggerErrorEvent(e, "htmx:swapError", t), r
                                }
                            };
                            i.swapDelay > 0 ? setTimeout(l, i.swapDelay) : l()
                        }
                    } else triggerErrorEvent(e, "htmx:responseError", mergeObjects({
                        error: "Response Status Error Code " + r.status + " from " + t.pathInfo.path
                    }, t))
                }
            }
        }
        var extensions = {};

        function extensionBase() {
            return {
                onEvent: function(e, t) {
                    return !0
                },
                transformResponse: function(e, t, r) {
                    return e
                },
                isInlineSwap: function(e) {
                    return !1
                },
                handleSwap: function(e, t, r, n) {
                    return !1
                },
                encodeParameters: function(e, t, r) {
                    return null
                }
            }
        }

        function defineExtension(e, t) {
            extensions[e] = mergeObjects(extensionBase(), t)
        }

        function removeExtension(e) {
            delete extensions[e]
        }

        function getExtensions(e, t, r) {
            if (null == e) return t;
            null == t && (t = []), null == r && (r = []);
            var n = getAttributeValue(e, "hx-ext");
            return n && forEach(n.split(","), function(e) {
                if ("ignore:" != (e = e.replace(/ /g, "")).slice(0, 7)) {
                    if (r.indexOf(e) < 0) {
                        var n = extensions[e];
                        n && t.indexOf(n) < 0 && t.push(n)
                    }
                } else r.push(e.slice(7))
            }), getExtensions(parentElt(e), t, r)
        }

        function ready(e) {
            "loading" !== getDocument().readyState ? e() : getDocument().addEventListener("DOMContentLoaded", e)
        }

        function insertIndicatorStyles() {
            !1 !== htmx.config.includeIndicatorStyles && getDocument().head.insertAdjacentHTML("beforeend", "<style>                      ." + htmx.config.indicatorClass + "{opacity:0;transition: opacity 200ms ease-in;}                      ." + htmx.config.requestClass + " ." + htmx.config.indicatorClass + "{opacity:1}                      ." + htmx.config.requestClass + "." + htmx.config.indicatorClass + "{opacity:1}                    </style>")
        }

        function getMetaConfig() {
            var e = getDocument().querySelector('meta[name="htmx-config"]');
            return e ? parseJSON(e.content) : null
        }

        function mergeMetaConfig() {
            var e = getMetaConfig();
            e && (htmx.config = mergeObjects(htmx.config, e))
        }
        return ready(function() {
            mergeMetaConfig(), insertIndicatorStyles();
            var e = getDocument().body;
            processNode(e), window.onpopstate = function(e) {
                e.state && e.state.htmx && restoreHistory()
            }, setTimeout(function() {
                triggerEvent(e, "htmx:load", {})
            }, 0)
        }), htmx
    }()
});
