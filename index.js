(function(){
var _xml, _json, _width, _height, _y,
  _ball, _dragCircle,
  _$highlight = document.getElementById('highlight');
  convert = function(html){
    return html
      .replace('stroke-miterlimit="10" ', '')
      .replace(' class="pointer"', '')
      .replace(/&/g, "&amp;").replace(/>/g, "&gt;")
      .replace(/</g, "&lt;").replace(/"/g, "&quot;")
      // .replace(/&gt;&lt;/g, "&gt;\n&lt;");
  },
  updateHighlighting = function(html){
    if(html){
      html = '<pre><code id="code" class="html">' + convert(html) + '</code></pre>';
      _$highlight.innerHTML = html;
      if(html) hljs.highlightBlock(document.getElementById('code'));
    }
    d3.select(_$highlight).classed('show', !!(html));
  },
  addShapeElementEvents = function(){
    var g = d3.select('svg').append('g').attr('class', 'info');
    over = function(el){
      var info = el.info, d = {};
      info.d_array.forEach(function(attr){ d[attr] = el.attr(attr);});
      out();
      info.guides.forEach(function(guide){
        var el = g.append(guide.shape)
          .attr('class', 'info-guide-' + guide.shape)
          .classed('guideline', guide.guideline);
        for(var id in guide.attr) el.attr(id, guide.attr[id](d));
        if(guide.shape === 'circle'){
          if(!guide.guideline){
            var x = parseInt(el.attr('cx')),
            y = parseInt(el.attr('cy'));
            g.append('text').attr('class', 'info-text')
              .text('(' + [x,y] + ')')
              .attr('transform','translate(' + [(x + 5),(y - 5)] + ')');
          }
        }
      });
      g.classed('show', true);
      updateHighlighting(el.node().outerHTML);
    }, 
    out = function(el){
      g.text('');
      g.classed('show', false);
      updateHighlighting();
    },
    addGuidesByPoints = function(el){
      var points = el.attr('points').split(' ');
      points.forEach(function(point){
        if(/,/.test(point)){
          var coords = point.split(',');
          el.info.guides.push({
            shape: 'circle',
            attr: {
              cx: function(d){ return coords[0]; },
              cy: function(d){ return coords[1]; },
              r: function(d){ return 3; }
            }
          });
        }
      });
    };
    _data.buttons.forEach(function(d){
      d3.selectAll(d.selector).each(function(){
        var el = d3.select(this);
        el.info = _.clone(d);
        el.info.guides = _.clone(d.guides);
        if(/polyline/.test(d.selector) || /polygon/.test(d.selector))
          addGuidesByPoints(el);
        el.classed('pointer', true);
        el.on('mouseover',function(){over(el)});
        el.on('mouseout',function(){out(el)});
      });
    });
  },
  adjustFonts = function(arr){
    arr.forEach(function(selector){
      d3.selectAll(selector).each(function(){
        var el = d3.select(this), family = el.attr('font-family');
        if(family) el.attr('class', family.replace(/'/g, ''));
      });
    });
  },
  update = function(){
    if(_width !== undefined && _height !== undefined && _y !== undefined && _ball){
      _ball.update(_width, _height, _y);
    }
  },
  onscroll = function(){
    _y = window.pageYOffset;
    update();
  },
  onresize = function(){
    _width = window.innerWidth;
    _height = window.innerHeight;
    update();
  },
  setup = function(){
    document.getElementById('container').appendChild(_xml.documentElement);
    adjustFonts(['tspan', 'text']);
    _ball = new Ball();
    _dragCircle = new Drag();
    addShapeElementEvents();
    onresize();
    onscroll();
    window.onresize = onresize;
    window.onscroll = onscroll;
  },
  init = function(){
    queue()
      .defer(d3.xml, 'svg copy.svg', 'image/svg+xml')
      // .defer(d3.json, 'data.json')
      // .await(function(error, xml, json){
      .await(function(error, xml){
        _xml = xml;
        // _json = json;
        setup();
    });
  };
init();
})();