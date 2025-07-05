let B = new Bundle();

B.setPlayground({
   key: '$KEY',
   type: 'url',
   template: 'files/template.xml',
   variables: {
      A: {
         value: 'files/A.txt',
         context: 'binary'
      },
      B: 'files/B.txt',
      C: '../image/bundle.svg',
   }
});
B.bundle();

B.onfinished = (output)=> {
   document.body.innerHTML = output;
}