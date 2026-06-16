const fs = require('fs');
const path = 'c:/Users/USER/Desktop/Software Programming/godemars-empire4/myApp-frontend/src/screens/AddPostScreen.js';
const s = fs.readFileSync(path,'utf8');
const counts = {'{':0,'}':0,'(':0,')':0,'[':0,']':0};
for(const ch of s) { if(counts.hasOwnProperty(ch)) counts[ch]++; }
console.log('counts:', JSON.stringify(counts));

const stack = [];
for(let i=0;i<s.length;i++){
  const ch = s[i];
  if(ch==='{' || ch==='(' || ch==='[') stack.push({ch, idx:i});
  else if(ch==='}'||ch===')'||ch===']'){
     const last = stack.pop();
     if(!last) {
        console.log('Unmatched closing', ch, 'at', i);
        break;
     }
     const match = (last.ch==='{' && ch==='}') || (last.ch==='(' && ch===')') || (last.ch==='['&&ch===']');
     if(!match) {
        console.log('Mismatch at', i, 'closing', ch, 'for', last.ch, 'opened at', last.idx);
        break;
     }
  }
}
if(stack.length) {
  const last = stack[stack.length-1];
  const prefix = s.slice(0, last.idx);
  const line = prefix.split('\n').length;
  const col = last.idx - prefix.lastIndexOf('\n');
  console.log('Unmatched openings left (last):', last, 'count', stack.length);
  console.log('Location -> line:', line, 'column:', col);
  const context = s.slice(Math.max(0, last.idx - 120), Math.min(s.length, last.idx + 120));
  console.log('Context around unmatched char:\n---START---\n' + context + '\n---END---');
  console.log('\nFull unmatched stack:');
  stack.forEach((item, i) => {
    const pref = s.slice(0, item.idx);
    const l = pref.split('\n').length;
    const c = item.idx - pref.lastIndexOf('\n');
    console.log(i, item.ch, 'at idx', item.idx, 'line', l, 'col', c);
  });
  const pos = last.idx;
  console.log('Char at idx', pos, ':', JSON.stringify(s[pos]));
  console.log('Next 60 chars:', JSON.stringify(s.slice(pos, pos+60)));
  // Find matching closing brace for this opening, if any
  let depth = 1;
  let matchIdx = -1;
  for (let i = pos + 1; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) { matchIdx = i; break; }
    }
  }
  if (matchIdx >= 0) {
    const pref2 = s.slice(0, matchIdx);
    const line2 = pref2.split('\n').length;
    console.log('Found matching } at idx', matchIdx, 'line', line2);
  } else {
    console.log('No matching } found for opening at idx', pos);
  }
  // Counts in the remainder of the file from the unmatched opening
  const tail = s.slice(pos);
  const tailCounts = { '{': 0, '}': 0 };
  for (const ch of tail) { if (ch === '{') tailCounts['{']++; else if (ch === '}') tailCounts['}']++; }
  console.log('Tail counts from unmatched opening:', tailCounts);
  // Analyze brace depth to find where it peaks
  let depth2 = 0;
  let maxDepth = 0;
  let maxIdx = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') depth2++;
    else if (s[i] === '}') depth2--;
    if (depth2 > maxDepth) { maxDepth = depth2; maxIdx = i; }
  }
  console.log('Max brace depth', maxDepth, 'at idx', maxIdx);
  if (maxIdx >= 0) {
    const pref3 = s.slice(0, maxIdx);
    const l3 = pref3.split('\n').length;
    console.log('Context at max depth (line', l3, '):\n---\n' + s.slice(Math.max(0, maxIdx-80), Math.min(s.length, maxIdx+80)) + '\n---');
  }
} else {
  console.log('All balanced');
}
