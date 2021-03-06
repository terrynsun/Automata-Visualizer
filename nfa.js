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
  this.current = new_currents;
  this.followEpsilons();
};

NFA.prototype.reset = function() {
  this.current = [this.initial];
};

/* Check if there are any epsilon transitions. Currently unused. */
NFA.prototype.hasEpsilonTransitions = function() {
  for(var k = 0; k < this.current.length; k++) {
    var state = this.current[k];
    if(state.transitions['\0']) 
      return true;
  }
};

/* Follow all epsilon transitions leading from current states. */
NFA.prototype.followEpsilons = function() {
  for(var a = 0; a < this.current.length; a++) {
    var new_state = this.current[a];
    if(new_state.getNext('\0')) {
      var nexts = new_state.getNext('\0');
      for(var b = 0; b < nexts.length; b++)
        this.current.push(nexts[b]);
    }
  }
};

/* 
 * Modified version of animation function taking into account multiple current
 * states.
 */
NFA.prototype.animate = function(s) {
  this.followEpsilons();
  console.log(this.current);

  var currIndices = [];
  for (var k = 0; k < this.current.length; k++) {
    currIndices.push(this.current[k].i);
  }
  this.select(currIndices, 0);

  var delay = 1;

  this.store_string(s);
  var len = s.length;
  for(var j = 0; j < len; j++) {
    this.next();
    currIndices = [];
    for (k = 0; k < this.current.length; k++)
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

/*****************************************************************************
 *
 * Functions on N/DFAs
 *
 ****************************************************************************/

/* Join two arrays of states, renumbering each state sequentially.. */
function joinTwoStates(a, b) {
  var c = a.concat([]);
  for(var k = 0; k < b.length; k++) {
    var state = b[k];
    state.i = k + a.length;
    if(state.name == k) state.name = b.i;
    c.push(state);
  }
  return c;
}

/* Join two arrays of states. */
function joinStates(lst) {
  var joined = lst[0].concat([]);
  for(k = 1; k < lst.length; k++) {
    joined = joinTwoStates(joined, lst[k]);
  }
  return joined;
}

/* Join two arrays. */
function join(a, b) {
  var c = a.concat([]);
  for(var k = 0; k < b.length; k++) {
    if(c.indexOf(b[k]) == -1)
      c.push(b[k]);
  }
  return c;
}

var concat = function(a, b) {
  var accepts = a.getAcceptStates(),
      init = b.initial,
      lang = join(a.lang, b.lang),
      states = joinStates([a.states, b.states]);
  var c = new NFA(lang, states, a.initial);
  for (var k = 0; k < accepts.length; k++){
    accepts[k].transitions['\0'] = [init];
    accepts[k].accept = false;
  }
  return c;
};

var union = function(a, b) {
  var lang = join(a.lang, b.lang),
      new_init = new State(0, {}, true);
      new_init.transitions = { '\0' : [a.initial, b.initial]};
      allStates = joinStates([ [new_init], a.states, b.states]);
  var result = new NFA(lang, allStates, new_init);
  return result;
};

/*****************************************************************************
 *
 * Regular expressions constructions
 *
 ****************************************************************************/

// ?
// +
// *
