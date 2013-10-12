/*****************************************************************************
 *
 * Regular Expression, Parsing
 *
 * **************************************************************************/

/* 
 * Splits a regular expression string into tokens.
 * [ ( { letters }, repetitions ) ]
 */
function tokenize(str) {
  if(!str.length) return [];
  var list = [];

  while(str.length > 0 && str[0] != '|' && str[0] != ')') {
    tuple = getNextToken(str);
    list.push(tuple[0]);
    str = tuple[1];
    console.log('tokenize: ' + str);
  }
  return list;
}

/* 
 * Returns a two-element list containing the next token in the string and the
 * remainder of the string. 
 * 
 * Tokens are a tuple (rep. by list) of a string or list of strings and how many
 * times they repeat.
 *
 * Token = ( [ String ], Times )
 *
 * */
function getNextToken(str) {
  var token = [],
      lead = str[0],
      times;
  console.log('getNextToken: ' + str);
  if(lead == '(') {
  }
  else if(isLetter(lead)) {
    var leadingLetters = getLeadingLetters(str);
    var nextString = leadingLetters[1];
    if(isQuantifier(nextString[0])) {
      times = nextString[0];  // the next char in next can't be a letter
      str = nextString.slice(1);
    }
    else {
      times = '1';
      str = nextString;
    }
    token = [ leadingLetters[0], times];
  }
  return [token, str];
}

/* Parses leading letter characters. */
function getLeadingLetters(str) {
  var chunk = '';
  /* Quantifier that only applies to the next character. */
  if(str.length > 1 && isQuantifier(str[1])) {
    chunk = str[0];
    str = str.slice(1);
  }
  /* Some other combination of characters. */
  else{
    while(str.length > 1 && isLetter(str[0]) && isLetter(str[1])) {
      chunk += str[0];
      str = str.slice(1);
    }
    /* Skip a single-letter bound to a quantifier. */
    if(str.length > 1 && isQuantifier(str[1])){
      return [chunk, str];
    }
    if(str.length > 1 && !isLetter(str[1])){
      chunk += str[0];
      str = str.slice(1);
      console.log('getLeadingLetters: ' + str);
    }
    /* Take the final letter without quantifier. */
    else if(str.length <= 1 && isLetter(str[0])) {
      chunk += str[0];
      str = str.slice(1);
    }
  }
  return [chunk, str];
}

function isLetter(c) {
  code = c.charCodeAt(0);
  return ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122));
}

function isQuantifier(c) {
  return c == '?' || c == '+' || c == "*";
}

var s = 'ab(cd+)e';
console.log(tokenize(s));
