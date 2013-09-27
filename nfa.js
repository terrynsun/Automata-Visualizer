NFA.prototype = DFA;

function NFA(lang, states, initial) {
  var dfa = new DFA(lang, states, initial);
  this.current = [initial];
  // states for an NFA contain a list of target states.
  return dfa;
}

NFA.prototype.readSingleLetter = function(letter) {
  var new_currents = [];
  for(state in current) {
    if(state.getNext(letter))
      new_currents.push(state.getNext(letter));
  }
  this.current = new_currents;
};
