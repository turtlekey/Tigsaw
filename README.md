Just one simple library for jigsaw.

The idea is from **headbreaker** partially, the code depends on **Konva** heavily. Thanks all of them🙏☕.

---
### Usage
```html
<!DOCTYPE html>
...
<body>
    <div id='container'></div>
</body>
<script src='tigsaw.min.js'></script>
<script>
    let tig = new Tigsaw({
        container: '#container',    //the div to place your jigsaw
        rowCount: 2,    //how many pieces per row in your tigsaw
        columnCount: 2, //how many pieces per column in your tigsaw
        imageSrc: 'puzzle.jpg', //the image uri or url
        placeStyle: 'scattered',    //how to place the pieces(['scattered','gatheredCenter','gatheredTop','gatheredBottom','gatheredLeft','gatheredRight'])
    });
</script>
</html>
```
---
### Change Log
- 2022-10-09: for the place style 'gatheredCenter', exchange pieces to complete the puzzle other than usual connection method.
- 2022-10-19: recover the absolutePosition of the stage before creating one new puzzle.
---
### Todo
- add other shapes.
---
### Other Tips
- when it is used in one touch device, banning the functionality of scrolling down to refresh the browser is a common demand, we can do it with the code following.
```javascript
document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
    }, {passive: false},
);
```
