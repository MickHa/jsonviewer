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

    // main public method
    function createRootElement(json) {
        var content = create(null, json, '');
        return div(content, 'jsonviewer');
    }

    // forward to the correct create function
    function create(key, o, comma) {
        var type = typeofEx(o);
        return createByType[type](key, o, comma);
    }

    // each type has it's own creator
    var createByType = {
        
        'string': function(key, o) {
            return start(key).concat([span('"' + o + '"', 'string')]);
        },

        'number': function(key, o) {
            return start(key).concat([span(o, 'number')]);
        },

        'null': function(key, o) {
            return start(key).concat([span('null', 'null')]);
        },

        'undefined': function(key, o) {
            return start(key).concat([span('undefined', 'undefined')]);
        },

        'array': function(key, o) {
            var r = start(key);
            r.push(span('[', 'token array_token'));
            var length = o.length;
            var index = 0;
            o.forEach(function(ao){ 
                var child = create(null, ao);
                if ((++index) != length) {
                    // not last item, add comma
                    child = [child, comma()];
                }
                r.push(div(child));
            });
            r.push(span(']', 'token array_token'));
            return r;
        },

        'object': function(key, o) {
            var keys = Object.keys(o);
            var r = start(key);
            r.push(span('{', 'token object_token'));
            var length = o.length;
            var index = 0;
            keys.forEach(function(k){ 
                var child = create(k, o[k]);
                if ((++index) != length) {
                    // not last item, add comma
                    child = [child, comma()];
                }
                r.push(div(child));
            });
            r.push(span('}', 'token object_token'));
            return r;
        }

    };

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
        createRootElement: createRootElement
    };
});