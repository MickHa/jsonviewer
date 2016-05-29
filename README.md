jsonviewer - show JSON in pretty HTML
=====================================

```html
<link type="text/css" rel="stylesheet" href="chnobean.jsonviewer.css" />
<script type="text/javascript" src="chnobean.jsonviewer.js"></script>   

<div id="container"></div>

<script>
    var jsonViewerData = chnobean.jsonviewer.domify(sampleJson);
    document.getElementById('container').appendChild(jsonViewerData.rootElement);
</script>
```

Customize
---------

```javascript
var jsonViewerData = chnobean.jsonviewer.domify(sampleJson, {
    shouldStartCollapsed: function (nodeInfo) {
        // only 3rd level objects should start out collapsed
        // do not collapse items with 1 element
        return nodeInfo.level == 3 && nodeInfo.children && nodeInfo.children.length > 1;
    }
});
```