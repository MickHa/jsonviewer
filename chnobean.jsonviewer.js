/*
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 Mick Hakobyan
 * https://github.com/MickHa/jsonviewer/blob/master/LICENSE
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

(function (global, exporter) {

    // exports pubic interface
    // <script />
    (global.chnobean = global.chnobean || {}).jsonviewer = exporter();

})(this, function () {
    "use strict";

    var collapseLevel = 3;

    // main public method
    function createRootElement(json) {
        var content = create(null, json, 0);
        return div(content, 'jsonviewer');
    }

    // forward to the correct create function
    function create(key, o, level, hasNext) {
        var type = typeofEx(o);
        return createByType[type](key, o, level, hasNext);
    }

    // each type has it's own creator
    var createByType = {
        
        'string': function(key, o, level, hasNext) {
            return createSimple(key, '"' + o + '"', 'string', hasNext);
        },

        'number': function(key, o, level, hasNext) {
            return createSimple(key, o, 'number', hasNext);
        },

        'boolean': function(key, o, level, hasNext) {
            return createSimple(key, o, 'boolean', hasNext);
        },

        'null': function(key, o, level, hasNext) {
            return createSimple(key, 'null', 'null', hasNext);
        },

        'undefined': function(key, o, level, hasNext) {
            return createSimple(key, 'undefined', 'undefined', hasNext);
        },

        'array': function(key, o, level, hasNext) {
            var childLevel = level + 1;
            var children = o.map(function(ao, i) {
                return create(null, ao, childLevel, i+1 < o.length);
            });
            return createNested(key, children, '[', ']', 'array', level, hasNext);
        },

        'object': function(key, o, level, hasNext) {
            var childLevel = level + 1;
            var keys = Object.keys(o);
            var children = keys.map(function(k, i) {
                return create(k, o[k], childLevel, i+1 < keys.length);
            });
            return createNested(key, children, '{', '}', 'object', level, hasNext);
        }

    };

    function createSimple(key, stringableValue, className, hasNext) {
        var r = start(key).concat([span('' + stringableValue, className)]);
        if (hasNext) r.push(comma());
        return div(r);
    }

    function createNested(key, children, openToken, closeToken, classPrefix, level, hasNext) {
        if (children.length == 0) {    
            return createSimple(key, openToken + closeToken, 'token ' + classPrefix + '_token', hasNext);
        }
        var open = createNestedOpen(key, children, openToken, closeToken, classPrefix, level, hasNext);
        var collapsed = createNestedCollapsed(key, children, openToken, closeToken, classPrefix, level, hasNext);
        open._toggleWith = collapsed;
        open.addEventListener('click', collapseToggleOnClick);
        collapsed._toggleWith = open;
        collapsed.addEventListener('click', collapseToggleOnClick);
        if (level >= collapseLevel) {
            open.style.display = 'none';
        } else {
            collapsed.style.display = 'none';
        }
        return [collapsed, open];
    }

    function createNestedOpen(key, children, openToken, closeToken, classPrefix, level, hasNext) {
        var r = start(key);
        var openToken = span(openToken, 'token open_token ' + classPrefix + '_token');
        r.push(openToken);
        r.push(children);
        r.push(span(closeToken, 'token ' + classPrefix + '_token'));
        if (hasNext) r.push(comma());
        return div(r, 'open');
    }

    function createNestedCollapsed(key, children, openToken, closeToken, classPrefix, level, hasNext) {
        var r = start(key);
        var collapsed = span(openToken + ellipsis(children.length) + closeToken, 'ellipsis ' + classPrefix +'_ellipsis');
        r.push(collapsed);
        if (hasNext) r.push(comma());
        return div(r, 'collapsed');
    }

    function collapseToggleOnClick(event) {
        this.style.display = 'none';
        this._toggleWith.style.display = '';
        event.stopPropagation();
    }

    // creates the "key" part of sub-elements
    function start(key) {
        return key ? [span('"', 'token'), span(key, 'key'), span('": ', 'token')] : [];
    }

    // expanded version of typeof, which also supports null and an array
    function typeofEx(o) {
        if (o === null) {
            return 'null';
        } else if (Array.isArray(o)) {
            return 'array';
        } else {
            return typeof o;
        }
    }

    function comma() {
        return span(',', 'token comma');
    }

    function ellipsis(length) {
        var l = Math.min(20, length);
        var s = '';
        while(l--) { 
            s+= '.';
        }
        return s;
    }

    function span(content, className) {
        return createHTMLElement('span', content, className);
    }

    function div(content, className) {
        return createHTMLElement('div', content, className);
    }

    function createHTMLElement(tag, content, className) {
        var el = document.createElement(tag);
        if (className) { 
            el.className = className;
        }
        appendContent(el, content);
        return el;
    }

    function appendContent(el, content) {
        if (content) {
            if (content.nodeType > 0) {
                el.appendChild(content)
            } else if (Array.isArray(content)) {
                content.forEach(function(c){appendContent(el, c)});
            } else {
                el.appendChild(document.createTextNode(content));
            }
        }
    }

    // the public interface
    return {
        createRootElement: createRootElement,
        setCollapseLevel: function (level) {
            collapseLevel = level;
        }
    };
});