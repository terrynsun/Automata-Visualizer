NFA.prototype = new DFA();

function NFA(lang, states, initial) {
  this.lang = lang;
  this.states = states;
  this.initial = initial;
  this.current = [initial];
}

NFA.prototype.readSingleLetter = function(letter) {
  var new_currents = [];
  for(var k = 0; k < this.current.length; k++) {
    var state = this.current[k];
    var next = state.getNext(letter);
    if(next) {
      for(var j = 0; j < next.length; j++)
        new_currents.push(next[j]);
    }
  }
  for(var k = 0; k < new_currents.length; k++) {
    var state = new_currents[k];
    if(state.getNext('\0')) {
      var nexts = state.getNext('\0');
      for(var j = 0; j < nexts.length; j++)
        new_currents.push(nexts[j]);
    }
  }
  this.current = new_currents;
};

NFA.prototype.animate = function(s) {
  for (var k = 0; k < this.current.length; k++)
    this.select([this.current[k].i], 0);

  var delay = 1;

  this.store_string(s);
  var len = s.length;
  for(var j = 0; j < len; j++) {
    this.next();
    var currIndices = [];
    for (var k = 0; k < this.current.length; k++)
      currIndices.push(this.current[k].i);
    
    this.select(currIndices, delay);
    delay++;
  }
}

NFA.prototype.getD3 = function() {
  var nodes = [];
  var links = [];
  for(var j = 0; j < this.states.length; j++) {
    current_state = this.states[j];
    var new_node = {};
    new_node["name"] = j;
    console.log('j' + j);
    new_node["index"] = j;
    new_node["accept"] = current_state.accept;
    new_node["initial"] = j == 0;
    nodes.push(new_node);

    var delta = current_state.transitions;
    var alphabet = Object.keys(delta);

    for (var i = 0; i < alphabet.length; i++){
      var letter = alphabet[i];
      var lst = delta[letter];

      for(var k = 0; k < lst.length; k++) {
        var new_link = {};
        var next = lst[k];
        new_link["source"] = current_state.i;
        new_link["target"] = next.i;
        new_link["letter"] = letter;
        links.push(new_link);
      }
    }
  }
  return [nodes, links];
};
