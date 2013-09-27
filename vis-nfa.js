var q0 = new State(0, {}, false);
var q1 = new State(1, {}, true);
var q2 = new State(2, {}, false);

q0.transitions = { 0: [q1, q2] };
q1.transitions = { 0: [q2] };

a = new NFA([0], [q0, q1, q2], q0);

data = a.getD3();

a.generateSVG(data[0], data[1]);