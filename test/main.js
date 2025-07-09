let B = new Bundle();

B.setPlayground({
   name: 'Logo',
   key: '$KEY',
   template: {
      type: 'subPlayground',
      value: {
         template: {
            value: '$A'
         }
      }
   },
   variables: {
      A: {
         type: 'url',
         value: '../image/bundle.svg',
      },
      B: {
         type: 'subPlayground',
         context: 'base64',
         value: {
            context: 'inherit',
            template: 'B variable results',
            variables: {
               A: ''
            }
         }
      },
      Z: 'Hello'
   }
});

B.bundle()

B.onfinished = (o) => document.body.innerHTML = o;