/*****************************************************************************
 *
 * DFA Definition
 *
 * *************************************************************************/

/*
 * Definition of a state, simply a dict containing an index, transition
 * function, accept boolean, and name.
 */
State = function State (i, transitions, accept, name) {
  this.i = i;
  this.transitions = transitions;
  this.accept = accept;
  this.name = name;
};

State.prototype.getNext = function(letter) {
  return this.transitions[letter];
};

/*
 * DFA contains a language, list of states, and initial state.
 */
function DFA (lang, states, initial) {
  this.lang = lang;
  this.states = states;
  this.inital = initial;
  this.current = initial;
  this.prev = [];
}

/* 
 * Interacts with D3 to emphasize a certain node. Sets a delay so that many such
 * events are processed in sequence. 
 */
DFA.prototype.select = function(s, delay) {
  for(var k = 0; k < this.prev.length; k++){
    this.svg.select(".n" + this.prev[k])
      .transition()
      .delay(1000*delay-1)
      .duration(1000)
      .style("fill", "white");
  }

  for(var i = 0; i < s.length; i++) {
    this.svg.select(".n" + s[i])
      .transition()
      .delay(1000*delay)
      .duration(1000)
      .style("fill", "steelblue");
  }

  this.prev = s;
};

/* Read and animate a string. */
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
};

/* Returns list of all accept states. */
DFA.prototype.getAcceptStates = function() {
  var accepts = [];
  for(var k = 0; k < this.states.length; k++) {
    if(this.states[k].accept)
      accept.push(this.states[k]);
  }
};

/* Process the next single letter given as a parameter. */
DFA.prototype.readSingleLetter = function(letter) {
  if(this.current.getNext(letter))
    this.current = this.current.getNext(letter);
};

/* Read the next letter in the stored string. */
DFA.prototype.next = function() {
  if(this.str != [])
    this.readSingleLetter(this.str[0]);
  this.str.splice(0,1);
};

/* Gives the DFA a string to later process. */
DFA.prototype.store_string = function(s) {
  this.str = s;
};

/* Starts the DFA from the beginning. */
DFA.prototype.reset = function() {
  this.current = this.initial;
};

/* Returns any accept states. */
DFA.prototype.getAcceptStates = function() {
  var accepts = [];
  for(var k = 0; k < this.states.length; k++) {
    var state = this.states[k];
    if(state.accept)
      accepts.push(state);
  }
  return accepts;
};

/* Checks if there exists a path from a to b. */
function exists(a, b) {
  var transition = a.transitions;
  for(var key in transition) {
    var results = transition[key];
    if(results instanceof Array) {
      for(var k = 0; k < results.length; k++){
        if(results[k] == b)
          return true;
      }
    }
    else if (results == b) return true;
  }
  return false;
}

/*
 * Returns two objects in a list [nodes, links] that serve as input to D3
 */
DFA.prototype.getD3 = function() {
  var nodes = [];
  var links = [];
  for(var j = 0; j < this.states.length; j++) {
    current_state = this.states[j];
    var new_node = {};
    
    if(current_state.name)
      new_node.name = current_state.name;
    else
      new_node.name = j;
    new_node.index = current_state.i;
    new_node.accept = current_state.accept;
    new_node.initial = j === 0;
    nodes.push(new_node);

    alphabet = Object.keys(current_state.transitions);
    delta = current_state.transitions;
    for (var letter in alphabet){ //iterate through transition function
      var new_link = {};
      new_link.source = current_state.i;
      new_link.target = delta[letter].i;
      new_link.letter = letter;
      if(d.target == d.source)
        new_link.type = "self";
      else if(exists(d.target, d.source))
        new_link.type = "bi";
      else
        new_link.type = "single";
      links.push(new_link);
    }
  }
  return [nodes, links];
};

/* 
 * Generates and saves a D3 representation of the DFA. 
 */
DFA.prototype.generateSVG = function() {
  var d = this.getD3(),
      nodes = d[0],
      links = d[1];

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
                   .attr("class", "link");

  var ends = svg.append("g")
                 .attr("class", "ends")
               .selectAll("circle")
                 .data(links)
               .enter().append("circle")
                 .attr("r", 3)
                 .attr("class", "ends")
                 .attr("fill", "none")
                 .attr("stroke", "blue")
                 .attr("stroke-width", "2px")
               .call(force.drag);

  var node = svg.append("g")
                 .attr("class", "node")
               .selectAll("circle")
                 .data(nodes)
               .enter().append("circle")
                 .attr("r", 17)
                 .attr("class", function(d) { 
                    var label = "n" + d.index;
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

      if(d.type == "self")
        return "M" + d.source.x + "," + d.source.y + " A" + "500,500" + ",0,0,1," + (d.target.x + 50) + "," + (d.target.y + 20);
      else if(d.type == "single")
        return "M" + d.source.x + "," + d.source.y + " L" + d.target.x + "," + d.target.y;
      else
        return "M" + d.source.x + "," + d.source.y + " A" + dr + "," + dr + ",0,0,1," + d.target.x + "," + d.target.y;
    });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    ends.attr("cx", function(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          angle = Math.atan(dy/dx),
          r = 20;
          c = r*Math.cos(angle);

      if(d.source.x > d.target.x)
        return d.target.x + c;
      else
        return d.target.x - c;
      });

    ends.attr("cy", function(d) { 
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          angle = Math.atan(dy/dx),
          r = 20;
          c = r*Math.sin(angle);

      if(d.source.x > d.target.x)
        return d.target.y + c;
      else
        return d.target.y - c;
      });

    text_node.attr("x", function(d) { return d.x-5; })
            .attr("y", function(d) { return d.y+5; });

    text_links.attr("x", function(d) {
      var dir = (d.source.x > d.target.x) ? 10 : -10;
      return (d.source.x + d.target.x)/2 + dir; });
    text_links.attr("y", function(d) { return (d.source.y + d.target.y)/2; });
  }
  this.svg = svg;
};

/*****************************************************************************
 *
 * Functions on DFAs
 *
 ****************************************************************************/

var concatenate = function(a, b) {
  var accepts = a.getAcceptStates();
  for(var k = 0; k < accepts.length; k++) {
  }
};
