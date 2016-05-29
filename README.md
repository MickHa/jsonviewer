jsonviewer - show JSON in pretty HTML
=====================================

```html
<link type="text/css" rel="stylesheet" href="chnobean.jsonviewer.css" />
<script type="text/javascript" src="chnobean.jsonviewer.js"></script>   

<div id="container">

<script>
    var jsonViewerData = chnobean.jsonviewer.domify(sampleJson);
    document.getElementById('container').appendChild(jsonViewerData.rootElement);
</script>
```