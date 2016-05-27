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

    // guard against undefined being re-defined
    var undefined;

    var indent;

    // main public method
    function createRootElement(json) {
        indent = '';
        var r = document.createElement('pre');
        var content = createElement(null, json);;
        r.textContent = content;
        return r;
    }

    // forward to the correct create function
    function createElement(key, o) {
        var type = typeofEx(o);
        return createElementByType[type](key, o);
    }

    // each type has it's own creator
    var createElementByType = {
        'string': function(key, o) {
            return createKeyElement(key) + '"' + o + '"';
        },

        'number': function(key, o) {
            return createKeyElement(key) + o;
        },

        'null': function(key) {
            return createKeyElement(key) + 'null';
        },

        'undefined': function(key, o) {
            return createKeyElement(key) + 'undefined';
        },

        'array': function(key, o) {
            indent += '  ';
            var inner = o.map(function(ao){ 
                return createElement(null, ao);
            }).join(',\n');
            indent = indent.substring(2);
            return createKeyElement(key, '[\n') + inner + '\n' + indent + ']';
        },

        'object': function(key, o) {
            indent += '  ';
            var inner = Object.keys(o).map(function(k){ 
                return createElement(k, o[k]); 
            }).join(',\n');
            indent = indent.substring(2);
            return createKeyElement(key, '{\n') + inner + '\n' + indent + '}';
        }

    };

    // creates the "key" part of sub-elements
    function createKeyElement(key, openBracket) {
        return indent + 
            (key ? ('"' + key + '": ') : '' ) +
            (openBracket ? openBracket : '');
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

    // the public interface
    return {
        createRootElement: createRootElement
    };
});