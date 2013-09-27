/* 
 * API:
 *
 * DFA
 *   list lang
 *   list states
 *   State initial
 *   State current
 *
 * read_single_letter(letter)
 * next()
 * store_string(s)
 * reset()
 * getNodeLinks()
 *
 * State
 *  getNext(letter)
 */

function DFA (lang, states, initial) {
  this.lang = lang;
  this.states = states;
  this.inital = initial;
  this.current = initial;
  this.prev = [];
};

DFA.prototype.select = function(s, delay) {
  for(var k = 0; k < this.prev.length; k++){
    this.svg.select(".n" + this.prev[k])
      .transition()
      .delay(1000*delay-1)
      .duration(1000)
      .style("fill", "white");
  }

  for(var k = 0; k < s.length; k++) {
    this.svg.select(".n" + s[k])
      .transition()
      .delay(1000*delay)
      .duration(1000)
      .style("fill", "steelblue");
  }

  this.prev = s;
};

DFA.prototype.animate = function(s) {
  var delay = 1;

  this.select([this.current.i], 0);
  this.store_string(s);

  var len = s.length;
  for(j = 0; j < len; j++) {
    this.next();
    this.select([this.current.i], delay);
    delay++;
  }
}

DFA.prototype.readSingleLetter = function(letter) {
  if(this.current.getNext(letter))
    this.current = this.current.getNext(letter);
};

DFA.prototype.next = function() {
  if(this.str != [])
    this.readSingleLetter(this.str[0]);
  this.str.splice(0,1);
};

DFA.prototype.store_string = function(s) {
  this.str = s;
};

DFA.prototype.reset = function() {
  this.current = this.initial;
}

DFA.prototype.getD3 = function() {
  var nodes = [];
  var links = [];
  for(var j = 0; j < this.states.length; j++) {
    current_state = this.states[j];
    var new_node = {};
    new_node["name"] = JSON.stringify(current_state.i);
    new_node["index"] = current_state.i;
    new_node["accept"] = current_state.accept;
    new_node["initial"] = j == 0;
    nodes.push(new_node);

    alphabet = Object.keys(current_state.transitions);
    delta = current_state.transitions;
    for (letter in alphabet){ //iterate through transition function
      var new_link = {};
      new_link["source"] = current_state.i;
      new_link["target"] = delta[letter].i;
      new_link["letter"] = letter;
      links.push(new_link);
    }
  }
  return [nodes, links];
};

State = function State (i, transitions, accept) {
  this.i = i;
  this.transitions = transitions;
  this.accept = accept;
};

State.prototype.getNext = function(letter) {
  return this.transitions[letter];
}

DFA.prototype.generateSVG = function(nodes, links) {
  var width = 300,
      height = 300;

  var force = d3.layout.force()
      .size([width, height])
      .charge(-400)
      .nodes(nodes)
      .links(links)
      .linkDistance(100)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var paths = svg.append("g")
                 .attr("class", "paths")
                 .selectAll("path")
                   .data(force.links())
                 .enter().append("path")
                   .attr("class", function(d) { return "link"; });

  var node = svg.append("g")
                 .attr("class", "node")
               .selectAll("circle")
                 .data(nodes)
               .enter().append("circle")
                 .attr("r", 17)
                 .attr("class", function(d) { 
                    var label = "n" + d.index;;
                    if(d.accept)
                      label += " accept";
                    if(d.initial)
                      label += " initial";
                    return label;
                  })
                 .attr("fill", "white")
               .call(force.drag);

  var text_node = svg.append("g")
              .attr("class", "text_label")
          .selectAll("text")
              .data(nodes)
          .enter().append("text")
              .text(function(d) { return d.name; })
          .call(force.drag);

  var text_links = svg.append("g")
              .attr("class", "link_label")
          .selectAll("text")
              .data(links)
          .enter().append("text")
              .text(function(d) { if (d.letter == '\0') return 'ε'; return d.letter; })
          .call(force.drag);

  function tick() {
    // draw paths
    paths.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    text_node.attr("x", function(d) { return d.x-5; })
            .attr("y", function(d) { return d.y+5; });

    text_links.attr("x", function(d) {
      var dir = (d.source.x > d.target.x) ? 10 : -10;
      return (d.source.x + d.target.x)/2 + dir; 
    })
              .attr("y", function(d) { return (d.source.y + d.target.y)/2; })
  };
  
  this.svg = svg;
}
