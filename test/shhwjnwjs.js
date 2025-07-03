class Bundle {
   // privet variable 
   #target;
   
   #playground;
   
   // constructor 
   constructor() {
      this.version = '2.0.0';
      this.#target = new EventTarget();
      this.#playground = {
         name: 'Bundle',
         version: '1.0.0',
         type: 'url',
         key: '[[[KEY]]]',
         template: null,
         variables: {},
      };
   }
   
   // private function 
   #fetch(url, type) {
      let maxRequest = 5;
      if (type === undefined) type = this.#preferenceBlob(this.#getFormat(url)) ? 'blob' : 'text';
      return new Promise((resolve, reject) => {
         const request = (retryCount) => {
            fetch(url).then(res => {
               if (!res.ok) {
                  throw res
               } else {
                  return res[type]();
               }
            }).then(data => {
               if (type == 'blob') this.#fileToBase64(data).then(x => resolve(x)).catch(e => reject(e));
               else resolve(data);
            }).catch(error => {
               if (retryCount > 0) {
                  request(retryCount - 1)
               } else {
                  let { status, statusText, url } = error;
                  reject(`${status}: ${statusText} \n - ${url}`);
               }
            });
         }
         request(maxRequest);
      })
   }
   #fileToBase64(blob) {
      return new Promise((resolve, reject) => {
         let reader = new FileReader();
         reader.readAsDataURL(blob);
         reader.onload = () => resolve(reader.result);
         reader.onerror = () => reject('Error getting base64');
      });
   }
   #dispatch(event, detail = {}) {
      this.#target.dispatchEvent(new CustomEvent(event, { detail }));
   }
   #getFormat(input) {
      let output = input.split('.').reverse()[0];
      return output;
   }
   #preferenceBlob(input) {
      let arr = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'mp3', 'wav', 'ogg', 'aac', 'mp4', 'webm', 'mov', 'avi', 'zip', 'rar', '7z', 'tar', 'gz'];
      return arr.includes(input.toLowerCase());
   }
   #write(template, key, value) {
      let arr = this.#key.split('KEY');
      let output = template.split((arr[0] || '') + key + (arr[1] || '')).join(value);
      return output;
   }
   #insert() {
      this.#output = this.#template;
      for (let key in this.#variables) {
         this.#output = this.#write(this.#output, key, this.#variables[key]);
      }
   }
   #getMIME(input) {
      switch (input.toLowerCase()) {
         // font
         case 'woff':
            return 'font/woff';
         case 'woff2':
            return 'font/woff2';
         case 'ttf':
            return 'font/ttf';
         case 'otf':
            return 'font/otf';
         case 'eot':
            return 'application/vnd.ms-fontobject';
            
            // image
         case 'png':
            return 'image/png';
         case 'jpg':
         case 'jpeg':
            return 'image/jpeg';
         case 'gif':
            return 'image/gif';
         case 'webp':
            return 'image/webp';
         case 'svg':
            return 'image/svg+xml';
         case 'ico':
            return 'image/x-icon';
         case 'bmp':
            return 'image/bmp';
            
            // media
         case 'mp3':
            return 'audio/mpeg';
         case 'wav':
            return 'audio/wav';
         case 'mp4':
            return 'video/mp4';
         case 'webm':
            return 'video/webm';
         case 'ogg':
            return 'video/ogg';
            
            // docs
         case 'json':
            return 'application/json';
         case 'xml':
            return 'application/xml';
         case 'zip':
            return 'application/zip';
         case 'rar':
            return 'application/x-rar-compressed';
         case '7z':
            return 'application/x-7z-compressed';
            
            // code & text
         case 'txt':
            return 'text/plain';
         case 'html':
            return 'text/html';
         case 'css':
            return 'text/css';
         case 'js':
            return 'application/javascript';
            
            // default 
         default:
            return 'application/octet-stream';
      }
   }
   #applyJS(id) {
      let blob = new Blob([this.#output], { type: 'application/javascript' });
      let url = URL.createObjectURL(blob);
      let script = document.getElementById(id);
      if (script) script.remove();
      script = document.createElement('script');
      script.id = id;
      script.src = url;
      document.head.appendChild(script);
      script.onload = () => {
         URL.revokeObjectURL(url);
         this.#target.dispatchEvent(new Event('apply'));
      }
   }
   #applyCSS(id) {
      let blob = new Blob([this.#output], { type: 'text/css' });
      let url = URL.createObjectURL(blob);
      let link = document.getElementById(id);
      if (link) link.remove();
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      link.onload = () => {
         URL.revokeObjectURL(url);
         this.#target.dispatchEvent(new Event('apply'));
      }
   }

   
   // method
   setName(str){
      this.#playground.name = str;
      return this;
   }
   setVersion(str) {
      this.#playground.version = str;
      return this;
   }
   setType(str){
      if (/^(inline|url)$/i.test(str)) {
         this.#playground.type = str;
      }
      return this;
   }
   setKey(str){
      this.#playground.key = str;
   }
   
   
   bundle() {
      console.log(this.#playground);
   }
   download(filename = 'bundle') {
      if (!this.#output) {
         console.error('No output available to download');
         return false;
      }
      
      let format = this.#getFormat(this.#playground.template);
      let mimeType = this.#getMIME(format);
      
      if (!mimeType) {
         console.warn(`Unknown format: ${format}, using default MIME type`);
         mimeType = 'text/plain';
      }
      
      try {
         let blob = new Blob([this.#output], { type: mimeType });
         
         let url = URL.createObjectURL(blob);
         let a = document.createElement('a');
         a.href = url;
         a.download = filename.includes('.') ? filename : `${filename}.${format || 'txt'}`;
         
         document.body.appendChild(a);
         a.click();
         
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
      } catch (error) {
         console.error('Error during download:', error);
      }
   }
   apply(id) {
      let format = this.#getFormat(this.#playground.template);
      let code = this.#output;
      id = id ?? 'BUNDLE-OUTPUT-' + format.toUpperCase();
      
      switch (format.toLowerCase()) {
         case 'js':
            this.#applyJS(id);
            break;
         case 'css':
            this.#applyCSS(id);
            break;
            // Not Supported 
         default:
            console.warn('"apply" is only supposed for "js" and "css"');
      }
      
   }
   
   // property 
   
}