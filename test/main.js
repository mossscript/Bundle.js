let B1 = new Bundle();
let B2 = new Bundle();

B1.setPlayground({
   key: '$KEY',
   template: {
      type: 'subPlayground',
      value: {
         key: '<KEY/>',
         template: {
            type: 'url',
            value: 'files/template.xml',
         },
         variables: {
            A: 'Bundle.js',
            B: 'V2',
         }
      }
   },
   variables: {
      A: 'Hello',
      B: 'Bundle',
   }
});
B1.bundle();

B2.bundle('files/playground.json');

B1.onload = (e)=> console.log(e);
B1.onfinished = (e)=> document.body.innerHTML += e;
B2.onfinished = (e)=> document.body.innerHTML += e;