var q0 = new State(0, {}, false);
var q1 = new State(1, {}, true);
//var q2 = new State(2, {}, false);

q0.transitions = { 4: [q1] };
//q1.transitions = { '\0': [q2], 1: [q0] };

//a = new NFA([0,1,2,3,4,5], [q0, q1, q2], q0);
a = new NFA([0,1,2,3,4,5], [q0, q1], q0);

a.generateSVG();
