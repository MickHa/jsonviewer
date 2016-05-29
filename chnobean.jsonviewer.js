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

    var defaultOptions = {
        // returns true if this node should start out collapsed
        shouldStartCollapsed: function (nodeInfo) {
            // hide every 3rd level
            return nodeInfo.level > 0 && (nodeInfo.level % 3 == 0);
        },
        // returns the text content that should be used for ellipsis (collapsed) element
        createEllipsis: function (nodeInfo) {
            var s = nodeInfo.openToken;
            var l = Math.min(40, nodeInfo.descendantsLength);
            while(l--) { s+= '.'; }
            s += nodeInfo.closeToken;
            return s;
        }
    };

    var options;

    // main public method
    function domify(json, customOptions) {
        options = {};
        mixin(options, defaultOptions);
        mixin(options, customOptions);
        var content = create(null, json, 0, false, null);
        var rootElement = div(content, 'jsonviewer');
        return {
            rootElement: rootElement
        };
    }

    // forward to the correct create function
    function create(key, obj, level, hasNext, parent) {
        var nodeInfo = {
            parent: parent,
            key: key,
            obj: obj,
            type: typeofEx(obj),
            level: level,
            descendantsLength: 0,
            hasNext: hasNext
        };
        // TODO: there should be a better way to count descendantsLength
        var ancestor = parent;
        while(ancestor) {
            ancestor.descendantsLength++;
            ancestor = ancestor.parent;
        }
        switch(nodeInfo.type) {
            case 'object':
                nodeInfo.openToken = '{';
                nodeInfo.closeToken = '}';
                nodeInfo.children = createObjectChildren(nodeInfo);
                break;
            case 'array':
                nodeInfo.openToken = '[';
                nodeInfo.closeToken = ']';
                nodeInfo.children = createArrayChildren(nodeInfo);
                break;
            case 'string':
                nodeInfo.simpleContent = '"' + obj + '"';
                break;
            // number, boolean, null, undefined
            default: 
                nodeInfo.simpleContent = '' + obj
                break;
        }
        if (nodeInfo.children) {
            return createNested(nodeInfo);
        } else {
            return createSimple(nodeInfo);
        }
    }

    function createArrayChildren(nodeInfo) {
        var childLevel = nodeInfo.level + 1;
        var arr = nodeInfo.obj;
        return arr.map(function(ao, i) {
            return create(null, ao, childLevel, i+1 < arr.length, nodeInfo);
        });
    }

    function createObjectChildren(nodeInfo) {
        var childLevel = nodeInfo.level + 1;
        var obj = nodeInfo.obj;
        var keys = Object.keys(obj);
        return keys.map(function(k, i) {
            return create(k, obj[k], childLevel, i+1 < keys.length, nodeInfo);
        }); 
    }

    function createSimple(nodeInfo) {
        var r = start(nodeInfo).concat([span(nodeInfo.simpleContent, nodeInfo.type)]);
        addComma(r, nodeInfo);
        return div(r, nodeInfo.level > 0 ? 'nested' : 'root');
    }

    // create nested content (includes an open and a collapsed version, one of which is hidden)
    function createNested(nodeInfo) {
        if (nodeInfo.children.length == 0) {
           return createNestedEmpty(nodeInfo);
        }
        var open = createNestedOpen(nodeInfo);
        var collapsed = createNestedCollapsed(nodeInfo);
        nodeInfo.element = open;
        nodeInfo.collapsedElement = collapsed;

        if (options.shouldStartCollapsed(nodeInfo)) {
            open.style.display = 'none';
        } else {
            collapsed.style.display = 'none';
        }
        return div([collapsed, open], nodeInfo.level > 0 ? 'nested' : 'root');
    }

    function createNestedEmpty(nodeInfo) {
        var r = start(nodeInfo).concat([span(nodeInfo.openToken + nodeInfo.closeToken, 'token ' + nodeInfo.type + '_token')]);
        addComma(r, nodeInfo);
        return div(r, 'nested');
    }

    function createNestedOpen(nodeInfo) {
        var r;

        r = start(nodeInfo);
        r.push(span(nodeInfo.openToken, 'token open_token ' + nodeInfo.type + '_token'));
        var header = div(r, 'header');
        header._nodeInfo = nodeInfo;
        header.addEventListener('click', onClickCollapse);

        r = [span(nodeInfo.closeToken, 'token close_token ' + nodeInfo.type + '_token')];
        addComma(r, nodeInfo);
        var footer = div(r, 'footer');
        footer._nodeInfo = nodeInfo;
        footer.addEventListener('click', onClickCollapse);

        return div([header, nodeInfo.children, footer], 'open');
    }

    function createNestedCollapsed(nodeInfo) {
        var r = start(nodeInfo);
        var ellipsis = options.createEllipsis(nodeInfo);
        r.push(span(ellipsis, 'ellipsis ' + nodeInfo.type +'_ellipsis'));
        addComma(r, nodeInfo);
        var el = div(r, 'collapsed');
        el._nodeInfo = nodeInfo;
        el.addEventListener('click', onClickOpen);
        return el;
    }

    // creates the "key" part of sub-elements
    function start(nodeInfo) {
        var key = nodeInfo.key;
        return key ? [span('"', 'token'), span(key, 'key'), span('": ', 'token')] : [];
    }

    function addComma(r, nodeInfo) {
        if (nodeInfo.hasNext) r.push(span(',', 'token comma'));
    }

    function onClickCollapse(event) {
        var nodeInfo = this._nodeInfo;
        nodeInfo.element.style.display = 'none';
        nodeInfo.collapsedElement.style.display = '';
        event.stopPropagation();
    }

    function onClickOpen(event) {
        var nodeInfo = this._nodeInfo;
        nodeInfo.element.style.display = '';
        nodeInfo.collapsedElement.style.display = 'none';
        event.stopPropagation();
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

    // appends given content to existing content of the element
    // content can be a empty, string or a node. Or array of any combinatin of those, including of another such array.
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

    function mixin(to, from) {
        if (from) {
            Object.keys(from).forEach(function(key) {to[key] = from[key]});
        }
    }

    // the public interface
    return {
        domify: domify
    };
});