/*****************************************************************************
 *
 * NFA Definition
 *
 * **************************************************************************/

/*
 * NFAs contain language, states list, initial state. Similar to DFAs except
 * that current states is a list.
 */
function NFA(lang, states, initial) {
  this.lang = lang;
  this.states = states;
  this.initial = initial;
  this.current = [initial];
}

/* Inherits some DFA methods. */
NFA.prototype = new DFA();

/* 
 * Process the next letter given as a parameter. Modified to maintain list of
 * current states.
 */
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

/* Check if there are any epsilon transitions. Currently unused. */
NFA.prototype.hasEpsilonTransitions = function() {
  for(var k = 0; k < this.current.length; k++) {
    var state = this.current[k];
    if(state.transitions['\0']) 
      return true;
  }
};

/* 
 * Modified version of animation function taking into account multiple current
 * states.
 */
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
};

/* 
 * Modified version of converting native structure into D3-readable data that
 * forces transition functions to yield lists.
 */
NFA.prototype.getD3 = function() {
  var nodes = [];
  var links = [];
  for(var j = 0; j < this.states.length; j++) {
    current_state = this.states[j];
    var new_node = {};
    if(current_state.name)
      new_node.name = current_state.name;
    else
      new_node.name = j;
    new_node.index = j;
    new_node.accept = current_state.accept;
    new_node.initial = j === 0;
    nodes.push(new_node);

    var delta = current_state.transitions;
    var alphabet = Object.keys(delta);

    for (var i = 0; i < alphabet.length; i++){
      var letter = alphabet[i];
      var lst = delta[letter];

      for(var k = 0; k < lst.length; k++) {
        var new_link = {};
        var next = lst[k];
        new_link.source = current_state.i;
        new_link.target = next.i;
        new_link.letter = letter;
        if(next == current_state)
          new_link.type = "self";
        else if(exists(next, current_state))
          new_link.type = "bi";
        else
          new_link.type = "single";
       links.push(new_link);
      }
    }
  }
  return [nodes, links];
};
