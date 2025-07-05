let B = new Bundle();

B.bundle('files/playground.json');
B.onfinished = (o)=> document.body.innerHTML = o;