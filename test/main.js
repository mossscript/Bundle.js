let B = new Bundle();

B.bundle('files/playground.json');
B.onfinished = (output)=> {
   document.body.innerHTML = output;
}