var q0 = new State(0, {}, false);
var q1 = new State(1, {}, true);
var q2 = new State(2, {}, false);

q0.transitions = { 1: [q1] };
q1.transitions = { 1: [q2] };

//a = new NFA([0,1,2,3,4,5], [q0, q1, q2], q0);
var a = new NFA([0,1], [q0, q1, q2], q0);

var p0 = new State(0, {}, false);
var p1 = new State(1, {}, true);

p0.transitions = { 0: [p1] };
p1.transitions = { };

//a = new NFA([0,1,2,3,4,5], [q0, q1, q2], q0);
var b = new NFA([0,1], [p0, p1], p0);

var nfa = union(a,b);

nfa.generateSVG();
