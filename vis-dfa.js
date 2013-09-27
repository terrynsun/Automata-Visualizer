var q0 = new State(0, {}, false);
var q1 = new State(1, {}, true);
var q2 = new State(2, {}, false);

q0.transitions = { 0: q1 };
q1.transitions = { 0: q2 };
q2.transitions = { 0: q0, 1:q1 };

a = new DFA([0,1], [q0, q1, q2], q0);

j = a.getD3();

var prev = 0;
var delay = 0;

function animate_string(dfa, s) {
  dfa.store_string(s);
  for(j = 0; j < s.length; j++) {
    dfa.next();
    dfa.select(dfa.current.i);
  }
}

function process() { 
  select(1);
  console.log("Hello World!") 
};

a.generateSVG(j[0], j[1]);
