/*!
 * Bundle.js v2.0.0
 * (c) 2025 Mossscript 
 * Released under the Apache 2.0 License
 */

class Bundle {
   /*** privet variable ***/
   #E; // EventTarget
   #P; // Playground 
   #T; // Tasks 
   #O; // Output 
   #ST; // Source Tree
   #SP; // Source Path
   #SBS; // StepByStep
   
   // default playground
   #D = {
      name: 'Bundle',
      version: '1.0.0',
      devVersion: '100',
      type: 'inline',
      relativeValues: 'inherit',
      context: 'text',
      format: 'txt',
      key: '[[[KEY]]]',
      value: '',
      template: {},
      variables: {},
   }
   
   // validation
   #V = {
      // elementary 
      string: (input) => {
         return typeof input === 'string';
      },
      object: (input) => {
         return typeof input === 'object' && !Array.isArray(input) && input !== null;
      },
      // words
      subPlayground: (input) => {
         return this.#V.string(input) && /^(subPlayground)$/i.test(input.trim());
      },
      inline: (input) => {
         return this.#V.string(input) && /^(inline)$/i.test(input.trim());
      },
      url: (input) => {
         return this.#V.string(input) && /^(url)$/i.test(input.trim());
      },
      inherit: (input) => {
         return this.#V.string(input) && /^(inherit)$/i.test(input.trim());
      },
      default: (input) => {
         return this.#V.string(input) && /^(default)$/i.test(input.trim());
      },
      isTrue: (input) => {
         return input === true || (this.#V.string(input) && /^(true)$/i.test(input.trim()))
      },
      isFalse: (input) => {
         return input === false || (this.#V.string(input) && /^(false)$/i.test(input.trim()))
      },
      // method
      name: (input) => {
         return this.#V.string(input) && /^[a-z][a-z0-9_.\-]*$/i.test(input);
      },
      version: (input) => {
         return this.#V.string(input) && /^\d+(?:\.\d+)*$/.test(input);
      },
      devVersion: (input) => {
         return this.#V.string(input);
      },
      type: (input) => {
         return this.#V.string(input) && /^(url|inline|subPlayground)$/i.test(input.trim());
      },
      format: (input) => {
         return this.#V.string(input) && /^[a-z][a-z0-9]*$/i.test(input);
      },
      context: (input) => {
         return this.#V.string(input) && /^(text|base64|fromBase64|binary|fromBinary|encodeURL|fromEncodeURL|decodeURL|buffer)$/i.test(input.trim());
      },
      key: (input) => {
         return this.#V.string(input) && /^(?=[\s\S]*KEY[\s\S]*$)(?![\s\S]*KEY[\s\S]*KEY[\s\S]*$)/.test(input);
      },
      value: (input) => {
         return this.#V.string(input) || this.#V.object(input);
      },
      template: (input) => {
         return this.#V.string(input) || this.#V.object(input);
      },
      variables: (input) => {
         return this.#V.object(input);
      },
      variablesKey: (input) => {
         return this.#V.string(input) && /^[a-z0-9_\-]+$/i.test(input);
      },
      relativeValues: (input) => {
         return this.#V.string(input) && /^(inherit|default)$/i.test(input.trim());
      },
      emptyObject: (input) => {
         return Object.keys(input).length === 0;
      },
      depth: (input) => {
         return input >= 10;
      }
   }
   
   // check
   #C = {
      maxDepth: (depth) => {
         if (this.#V.depth(depth)) {
            this.#warn('playground-max-depth');
            return true;
         } else {
            return false;
         }
      },
      emptyPlayground: (node) => {
         if (this.#V.emptyObject(node)) {
            this.#warn('playground-empty');
            return true;
         } else {
            return false;
         }
      },
      invalidPlayground: (node) => {
         if (!this.#V.object(node)) {
            this.#warn('playground-invalid');
            return true;
         } else {
            return false;
         }
      },
      name: (node) => {
         if (node?.name) {
            if (this.#V.name(node.name)) {
               return node.name;
            } else {
               this.#warn('playground-name', node.name);
               return this.#D.name;
            }
         } else {
            return this.#D.name;
         }
      },
      version: (node) => {
         if (node?.version) {
            if (this.#V.version(node.version)) {
               return node.version;
            } else {
               this.#warn('playground-version', node.version);
               return this.#D.version;
            }
         } else {
            return this.#D.version;
         }
      },
      devVersion: (node) => {
         if (node?.devVersion) {
            if (this.#V.devVersion(node.devVersion)) {
               return node.devVersion;
            } else {
               this.#warn('playground-dev-version', node.devVersion);
               return this.#D.devVersion;
            }
         } else {
            return this.#D.devVersion;
         }
      },
      type: (node) => {
         if (node?.type) {
            if (this.#V.type(node.type)) {
               return node.type;
            } else {
               this.#warn('playground-type', node.type);
               return this.#D.type;
            }
         } else {
            return this.#D.type;
         }
      },
      depthType: (node) => {
         if (node?.type) {
            if (this.#V.type(node.type) || this.#V.relativeValues(node.type)) {
               return node.type;
            } else {
               this.#warn('playground-depth-type', node.type);
               return this.#D.relativeValues;
            }
         } else {
            return this.#D.relativeValues;
         }
      },
      format: (node) => {
         if (node?.format) {
            if (this.#V.format(node.format)) {
               return node.format;
            } else {
               this.#warn('playground-format', node.format);
               return this.#D.format;
            }
         } else {
            return this.#D.format;
         }
      },
      depthFormat: (node) => {
         if (node?.format) {
            if (this.#V.format(node.format) || this.#V.relativeValues(node.format)) {
               return node.format;
            } else {
               this.#warn('playground-depth-format', node.format);
               return this.#D.relativeValues;
            }
         } else {
            return this.#D.relativeValues;
         }
      },
      context: (node) => {
         if (node?.context) {
            if (this.#V.context(node.context)) {
               return node.context;
            } else {
               this.#warn('playground-context', node.context);
               return this.#D.context;
            }
         } else {
            return this.#D.context;
         }
      },
      depthContext: (node) => {
         if (node?.context) {
            if (this.#V.context(node.context) || this.#V.relativeValues(node.context)) {
               return node.context;
            } else {
               this.#warn('playground-depth-context', node.context);
               return this.#D.relativeValues;
            }
         } else {
            return this.#D.relativeValues;
         }
      },
      key: (node) => {
         if (node?.key) {
            if (this.#V.key(node.key)) {
               return node.key;
            } else {
               this.#warn('playground-key', node.key);
               return this.#D.key;
            }
         } else {
            return this.#D.key;
         }
      },
      depthKey: (node) => {
         if (node?.key) {
            if (this.#V.key(node.key) || this.#V.relativeValues(node.key)) {
               return node.key;
            } else {
               this.#warn('playground-depth-key', node.key);
               return this.#D.relativeValues;
            }
         } else {
            return this.#D.relativeValues;
         }
      },
      value: (node) => {
         if (node?.value) {
            if (this.#V.value(node.value)) {
               return node.value;
            } else {
               this.#warn('playground-value', node.value);
               return this.#D.value;
            }
         } else {
            return this.#D.value;
         }
      },
      template: (node) => {
         if (node?.template) {
            if (this.#V.template(node.template)) {
               return node.template;
            } else {
               this.#warn('playground-template', node.template);
               return this.#D.template;
            }
         } else {
            return this.#D.template;
         }
      },
      variables: (node) => {
         let result = {};
         if (node?.variables) {
            if (this.#V.variables(node.variables)) {
               for (let key in node.variables) {
                  if (this.#V.variablesKey(key)) {
                     result[key] = node.variables[key];
                  } else {
                     this.#warn('playground-variables-key',key)
                  }
               }
               return result;
            } else {
               this.#warn('playground-variables', node.variables);
               return this.#D.variables;
            }
         } else {
            return this.#D.variables;
         }
      },
      deepCheck: (playground) => {
         let result = {};
         let V = this.#V;
         let D = this.#D;
         let C = this.#C;
         
         let walk = (node, path = [], output = result, parent = null, depth = 0) => {
            
            if (C.maxDepth(depth)) { result = {}; return }
            if (C.invalidPlayground(node)) { result = {}; return }
            if (C.emptyPlayground(node)) { result = {}; return }
            
            // checking 
            let current = {};
            
            current.key = (depth === 0) ? C.key(node) : C.depthKey(node);
            current.type = (depth === 0) ? C.type(node) : C.depthType(node);
            current.format = (depth === 0) ? C.format(node) : C.depthFormat(node);
            current.context = (depth === 0) ? C.context(node) : C.depthContext(node);
            current.template = C.template(node);
            current.variables = C.variables(node);
            
            if (depth === 0) {
               current.name = C.name(node);
               current.version = C.version(node);
               current.devVersion = C.devVersion(node);
            } else {
               if (V.inherit(current.key)) current.key = C.key(parent);
               if (V.inherit(current.type)) current.type = C.type(parent);
               if (V.inherit(current.format)) current.format = C.format(parent);
               if (V.inherit(current.context)) current.context = C.context(parent);
            }
            
            // template 
            if (V.string(current.template)) {
               current.template = {
                  type: current.type,
                  value: current.template,
               };
            }
            else if (V.object(current.template)) {
               let value = C.value(current.template);
               if (V.subPlayground(current.template.type) && V.object(value)) {
                  let child = {
                     key: current.key,
                     type: current.type,
                     format: current.format,
                     context: current.context,
                  }
                  value = {};
                  walk(current.template.value, [...path], value, child, depth + 1);
               }
               current.template = {
                  type: current.template.type ?? current.type,
                  value: V.string(value) || V.object(value) ? value : '',
               };
            }
            
            // variables
            for (let key in current.variables) {
               let val = current.variables[key];
               if (V.string(val)) {
                  current.variables[key] = {
                     type: current.type,
                     value: val,
                  };
               }
               else if (V.object(val)) {
                  let value = C.value(val);
                  if (V.subPlayground(current.template.type) && V.object(value)) {
                  let child = {
                     key: current.key,
                     type: current.type,
                     format: current.format,
                     context: current.context,
                  }
                  value = {};
                  walk(val.value, [...path], value, child, depth + 1);
               }
                  current.variables[key] = {
                     type: val.type ?? current.type,
                     format: val.format ?? current.format,
                     context: val.context ?? current.context,
                     value: V.string(value) || V.object(value) ? value : '',
                  };
               }
            }
            
            // save 
            let pointer = output;
            for (let key of path) {
               if (!pointer[key]) pointer[key] = {};
               pointer = pointer[key];
            }
            Object.assign(pointer, current);
            
         }
         
         walk(playground);
         return result;
      }
   }
   
   // MIME Type
   #MIME = {
      map: {
         // fonts
         woff: 'font/woff',
         woff2: 'font/woff2',
         ttf: 'font/ttf',
         otf: 'font/otf',
         eot: 'application/vnd.ms-fontobject',
         
         // images
         png: 'image/png',
         jpg: 'image/jpeg',
         jpeg: 'image/jpeg',
         gif: 'image/gif',
         webp: 'image/webp',
         svg: 'image/svg+xml',
         ico: 'image/x-icon',
         bmp: 'image/bmp',
         
         // media
         mp3: 'audio/mpeg',
         wav: 'audio/wav',
         mp4: 'video/mp4',
         webm: 'video/webm',
         ogg: 'application/ogg',
         
         // documents
         json: 'application/json',
         xml: 'application/xml',
         
         // code & text
         txt: 'text/plain',
         html: 'text/html',
         css: 'text/css',
         js: 'application/javascript',
         
         // default & alias
         bin: 'application/octet-stream',
         default: 'text/plain',
      },
      get(input = 'default') {
         return this.map[input.toLowerCase().trim()] ?? this.map.default;
      }
   };
   
   /*** constructor ***/
   constructor() {
      this.version = '1.0.0';
      this.#E = new EventTarget();
      this.#P = undefined;
      this.#T = [];
      this.#ST = {};
      this.#SP = {};
      this.#SBS = false;
   }
   
   
   /*** privet method ***/
   #error(code, warn) {
      let lib = {
         0: `\nThe playground is empty!`,
         1: `\nPlayground Not Found!\nurl: ${warn}`,
         2: `\n${warn.message}!\nurl: ${warn.url}`,
         3: `\nThe playground must be an object!`,
         4: `\nInvalid name! "${warn}"\nThe name must start with a letter and can only contain letters, numbers, dot(.), hyphens(-), and underscores(_).`,
         5: `\nInvalid version format! "${warn}"\nPlease use a version number like "1", "1.0", or "10.200.300".`,
         6: `\nInvalid type! "${warn}"\nThe type must be either "url", "inline" or "subPlayground".`,
         7: `\nInvalid format! "${warn}"\nThe input must start with a letter and can only contain letters and numbers.`,
         8: `\nInvalid context! "${warn}"\nThe context must be one of the following: "text", "base64", "fromBase64", "binary", "fromBinary", "encodeURL", "fromEncodeURL" or "decodeURL".`,
         9: `\nInvalid key! "${warn}"\nThe input must contain the word "KEY" exactly once, regardless of capitalization.`,
         10: `\nInvalid template! "${warn}"\nThe template must be a string or valid object.`,
         11: `\nInvalid variables! "${warn}"\nThe variables must be a valid object.`,
         12: `\nInvalid variables key"! "${warn}"\nThe variables key must be a valid object or a string with letters, numbers, hyphens(-), and underscores(_).`,
         13: `\nInvalid variables value"! "${warn}"\nThe variables must be string or a valid object.`,
         14: `Maximum playground depth exceeded`,
         100: warn,
      }
      throw new Error('[Bundle.js]' + lib[code])
   }
   #warn(name, warn) {
      let logs = {
         'playground-empty': `Invalid playground! \nThe playground is empty.`,
         'playground-invalid': `Invalid playground! \nThe playground must be an object.`,
         'playground-max-depth': `Invalid playground! \nMaximum playground depth exceeded`,
         'playground-name': `Invalid name! "${warn}".\nThe name must start with a letter and can only contain letters, numbers, dot (.), hyphen (-), or underscore (_).`,
         'playground-version': `Invalid version! "${warn}".\nThe version must follow the format "1", "1.0", or "10.200.300".`,
         'playground-dev-version': `Invalid dev version! "${warn}".\nThe dwv version must be a string.`,
         'playground-type': `Invalid type! "${warn}".\nThe type must be one of: "url", "inline", or "subPlayground".`,
         'playground-depth-type': `Invalid depth type! "${warn}".\nThe depth type must be one of: "url", "inline", "subPlayground", "inherit", or "default".`,
         'playground-format': `Invalid format! "${warn}".\nThe format must start with a letter and contain only letters and numbers, or be one of: "default", "binary", or "bin".`,
         'playground-depth-format': `Invalid format! "${warn}".\nThe format must start with a letter and contain only letters and numbers, or be one of: "default", "binary", "bin", "inherit" or "default".`,
         'playground-context': `Invalid context! "${warn}".\nThe type must be one of: "text", "base64", "fromBase64", "binary", "fromBinary", "encodeURL", "fromEncodeURL" or "decodeURL".`,
         'playground-depth-context': `Invalid depth context! "${warn}".\nThe depth type must be one of: "text", "base64", "fromBase64", "binary", "fromBinary", "encodeURL", "fromEncodeURL", "decodeURL", "inherit", or "default".`,
         'playground-key': `Invalid key! "${warn}".\nThe key must contain the word "KEY" exactly once, regardless of capitalization.`,
         'playground-depth-key': `Invalid key: "${warn}".\nThe key must contain the word "KEY" exactly once, regardless of capitalization, or be set to "inherit" or "default".`,
         'playground-template': `Invalid template! "${warn}".\nThe template must be a string or valid object.`,
         'playground-variables': `Invalid variables! "${warn}".\nThe variables must be a valid object.`,
         'playground-variables-key': `Invalid variables key! "${warn}".\nThe variables key must be a valid object or a string with letters, numbers, hyphens(-), and underscores(_).`,
         'playground-variable-value': `Invalid variable value! "${warn}".\nThe value must be a valid string or object.`,
      };
      console.warn('[Bundle.js]', logs[name])
   }
   #dispatch(event, detail = {}) {
      this.#E.dispatchEvent(new CustomEvent(event, { detail }));
   }
   #addTask(type, value, context, path) {
      context = context ?? 'text';
      
      if (this.#V.inline(type)) {
         this.#T.push(() => Promise.resolve().then(() => {
            return {
               [path]: this.#context(value, context)
            };
         }));
      }
      if (this.#V.url(type)) {
         this.#T.push(() => this.#fetch(value).then((data) => {
            return {
               [path]: this.#context(data, context)
            }
         }))
      }
   }
   #runAllTask() {
      let progress = 0;
      let length = this.#T.length;
      queueMicrotask(() => {
         this.#dispatch('start', { length })
      })
      const walk = (i) => {
         this.#T[i]().then((data) => {
            progress++;
            let [path, value] = Object.entries(data)[0];
            this.#SP[path] = value;
            this.#pathToTree(path, value);
            if (this.#SBS) this.#insert();
            this.#dispatch('progress', { progress, length, output: this.#O, successful: true });
            if (progress !== length) {
               walk(progress);
            } else {
               if (!this.#SBS) this.#insert();
               this.#dispatch('finished', this.#O);
            }
         }).catch((e) => {
            progress++;
            this.#dispatch('progress', { progress, length, output: this.#O, successful: true });
            if (progress !== length) {
               walk(progress);
            } else {
               this.#dispatch('finished', this.#O);
            }
            this.#error(100, e);
         })
      }
      
      walk(progress);
   }
   #fetch(url, type = 'text') {
      let maxRequest = 5;
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
                  if (error.status === undefined) {
                     reject(`\n${error.message}!\nurl: ${url}`)
                  } else {
                     reject(`\nError getting link! \n${error.statusText} (${error.status}) \nurl: ${error.url}`);
                  }
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
   #getSources() {
      const V = this.#V;
      const collect = (node, path = '') => {
         // Template
         if (V.url(node.template.type) || V.inline(node.template.type)) {
            const id = path ? `${path}/template` : 'template';
            this.#addTask(node.template.type, node.template.value, null, id);
         } else if (V.subPlayground(node.template.type)) {
            const id = path ? `${path}/template` : 'template';
            collect(node.template.value, id);
         }
         
         // Variables
         for (let [key, val] of Object.entries(node.variables)) {
            const id = path ? `${path}/variables/${key}` : `variables/${key}`;
            if (V.url(val.type) || V.inline(val.type)) {
               this.#addTask(val.type, val.value, val.context, id);
            } else if (V.subPlayground(val.type)) {
               collect(val.value, id);
            }
         }
         
      };
      
      collect(this.#P);
   }
   #pathToTree(path, value) {
      const keys = path.split('/');
      let node = this.#ST;
      
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];
         if (i === keys.length - 1) {
            node[key] = value;
         } else {
            if (!(key in node)) {
               node[key] = {};
            }
            node = node[key];
         }
      }
   }
   #insert() {
      let rootNode = this.#P;
      let sourceTree = this.#ST;
      let walk = (node, source) => {
         const keyPattern = node.key;
         let output;
         
         // template
         if (typeof source.template === 'string') {
            output = source.template;
         } else {
            output = walk(node.template.value, source.template);
         }
         
         // variables
         for (let [k, v] of Object.entries(source.variables || {})) {
            const val = (typeof v === 'string') ? v : walk(node.variables[k].value, v);
            output = this.#write(output, k, val, keyPattern);
         }
         
         return output;
      };
      this.#O = walk(rootNode, sourceTree);
   }
   
   // tools
   #context(input, context) {
      switch (context.toLowerCase().trim()) {
         case 'text': {
            return input;
         }
         case 'encodeurl': {
            return encodeURIComponent(input);
         }
         case 'fromencodeurl':
         case 'decodeurl': {
            return decodeURIComponent(input);
         }
         case 'base64': {
            return btoa(unescape(encodeURIComponent(input)));
         }
         case 'frombase64': {
            let base64 = input.includes(',') ? input.split(',')[1] : input;
            return decodeURIComponent(escape(atob(base64)));
         }
         case 'binary': {
            let encoder = new TextEncoder();
            return [...encoder.encode(input)].map(byte => byte.toString(2).padStart(8, '0')).join('');
         }
         case 'frombinary': {
            let decoder = new TextDecoder();
            let bytes = input.match(/.{1,8}/g).map(bin => parseInt(bin, 2));
            let uint8Array = new Uint8Array(bytes);
            return decoder.decode(uint8Array);
         }
         case 'utf8':
         case 'utf-8': {
            return Array.from(input).map(c => c.codePointAt(0)).join(' ');
         }
         case 'fromutf8':
         case 'fromutf-8': {
            let codes = input.split(' ').map(n => parseInt(n, 10));
            return String.fromCodePoint(...codes);
         }
         default: {
            return input;
         }
      }
   }
   #getFormat(input) {
      if (!this.#V.string(input) || !input.includes('.')) {
         return undefined;
      }
      return input.trim().split('.').reverse()[0];
   }
   #write(template, key, value, keyPattern) {
      let [start = '', end = ''] = keyPattern.split('KEY');
      let target = start + key + end;
      return template.split(target).join(value);
   }
   
   /*** method ***/
   setPlayground(obj) {
      this.#P = this.#C.deepCheck(obj);
   }
   bundle(url) {
      if (url) {
         this.#fetch(url, 'json').then((data) => {
            this.#dispatch('load', this.#P);
            this.#getSources();
            this.#runAllTask();
         }).catch((error) => {
            this.#error(100, error);
         })
      } else {
         this.#getSources();
         this.#runAllTask();
      }
   }
   
   /*** event ***/
   set onload(callback) {
      this.#E.addEventListener('load', (e) => callback(e.detail));
   }
   set onstart(callback) {
      this.#E.addEventListener('start', (e) => callback(e.detail));
   }
   set onprogress(callback) {
      this.#E.addEventListener('progress', (e) => callback(e.detail));
   }
   set onfinished(callback) {
      this.#E.addEventListener('finished', (e) => callback(e.detail));
   }
}