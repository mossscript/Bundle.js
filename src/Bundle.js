/*!
 * Bundle.js v2.0.0
 * (c) 2025 Mossscript 
 * Released under the Apache 2.0 License
 */

((G) => {
   // ----------
   // Validation
   // ----------
   class Validation {
      /*** constructor ***/
      constructor() {
         
      }
      /*** method ***/
      string(input) {
         return typeof input === 'string';
      }
      object(input) {
         return typeof input === 'object' && !Array.isArray(input) && input !== null;
      }
      subPlayground(input) {
         return this.string(input) && /^(subPlayground)$/i.test(input);
      }
      inline(input) {
         return this.string(input) && /^(inline)$/i.test(input);
      }
      url(input) {
         return this.string(input) && /^(url)$/i.test(input);
      }
      inherit(input) {
         return this.string(input) && /^(inherit)$/i.test(input);
      }
      default (input) {
         return this.string(input) && /^(default)$/i.test(input);
      }
      name(input) {
         return this.string(input) && /^[a-z][a-z0-9_.\-]*$/i.test(input);
      }
      version(input) {
         return this.string(input) && /^\d+(?:\.\d+)*$/.test(input);
      }
      type(input) {
         return this.string(input) && /^(url|inline|subPlayground)$/i.test(input);
      }
      format(input) {
         return this.string(input) && /^[a-z][a-z0-9]*$/i.test(input);
      }
      context(input) {
         return this.string(input) && /^(text|base64|fromBase64|binary|fromBinary|encodeURL|fromEncodeURL|decodeURL|buffer)$/i.test(input);
      }
      key(input) {
         return this.string(input) && /^(?=[\s\S]*KEY[\s\S]*$)(?![\s\S]*KEY[\s\S]*KEY[\s\S]*$)/.test(input);
      }
      variable(input) {
         return this.string(input) && /^[a-z0-9_\-]+$/i.test(input);
      }
      relativeValues(input) {
         return this.string(input) && /^(inherit|default)$/i.test(input);
      }
      emptyObject(input) {
         return Object.keys(input).length === 0;
      }
      depth(input) {
         return input >= 10;
      }
   }
   
   // ----------
   // Playground
   // ----------
   class Playground {
      /*** private variable ***/
      #raw;
      /*** private object ***/
      #D = {
         name: 'bundle',
         version: '1.0.0',
         type: 'inline',
         context: 'text',
         format: 'txt',
         key: '[[[KEY]]]',
         template: '',
         variables: {},
      }
      /*** constructor ***/
      constructor() {
         this.#raw = {};
      }
      /*** private method ***/
      #warn(code, warn) {
         let messages = {
            0: `Invalid 'name': ${warn}`,
            1: `Invalid 'version': ${warn}`,
            2: `Invalid 'format': ${warn}`,
            3: `Invalid 'type': ${warn}`,
            4: `Invalid 'context': ${warn}`,
            5: `Invalid 'key': ${warn}`,
            6: `Invalid 'template': ${warn}`,
            7: `Invalid 'variables': ${warn}`,
            20: `Maximum playground depth exceeded`,
         }
         console.warn('Playground warn: ', messages[code]);
      }
      #normalize(input = {}, parent = null, root = this.#D, depth = 0) {
         // validation 
         let V = new Validation();
         if (V.depth(depth)) {
            this.#warn(20);
            return {};
         }
         
         const obj = { ...root, ...input };
         const context = obj.context || root.context;
         const type = obj.type || root.type;
         
         // Normalize template
         let template = obj.template;
         if (V.string(template)) {
            if (V.relativeValues(template)) {
               template = {
                  type: template,
                  value: '',
               };
            } else {
               template = {
                  type: type,
                  value: template,
               };
            }
         } else if (V.object(template)) {
            let tempType = template.type || type;
            let value = template.value;
            if (V.inherit(template.type)) {
               tempType = parent?.template?.type || type;
            } else if (V.default(template.type)) {
               tempType = root.template?.type || type;
            }
            if (V.subPlayground(tempType) && V.object(value)) {
               value = this.#normalize(value, obj, root, depth + 1);
            }
            template = {
               type: tempType,
               value: V.string(value) || V.object(value) ? value : '',
            };
         } else {
            template = {
               type: type,
               value: '',
            };
         }
         
         // Normalize variables
         const resultVars = {};
         const rawVars = V.object(obj.variables) ? obj.variables : {};
         for (const [k, v] of Object.entries(rawVars)) {
            if (!V.variable(k)) {
               this.#warn(7, k);
               continue;
            }
            
            if (V.string(v)) {
               resultVars[k] = {
                  type: type,
                  context: context,
                  value: v,
               };
            } else if (V.object(v)) {
               if (V.subPlayground(v.type)) {
                  resultVars[k] = {
                     type: 'subPlayground',
                     context: v.context || context,
                     value: this.#normalize(v.value, obj, root, depth + 1),
                  };
               } else {
                  resultVars[k] = {
                     type: v.type || type,
                     context: v.context || context,
                     value: v.value,
                  };
               }
            } else {
               this.#warn(7, k);
               resultVars[k] = {
                  type: type,
                  context: context,
                  value: '',
               };
            }
         }
         
         // return normalize playground 
         return {
            name: obj.name,
            version: obj.version,
            type: type,
            context: context,
            format: obj.format,
            key: obj.key,
            template,
            variables: resultVars,
         };
      }
      /*** property ***/
      get output() {
         return this.#normalize(this.#raw);;
      }
      get raw() {
         return this.#raw;
      }
      get default() {
         return this.#D;
      }
      /*** method ***/
      setPlayground(input = {}) {
         this.#raw = input;
      }
      setName(input) {
         this.#raw.name = input;
      }
      setVersion(input) {
         this.#raw.version = input;
      }
      setFormat(input) {
         this.#raw.format = input;
      }
      setType(input) {
         this.#raw.type = input;
      }
      setContext(input) {
         this.#raw.context = input;
      }
      setKey(input) {
         this.#raw.key = input;
      }
      setTemplate(input) {
         this.#raw.template = input;
      }
      setVariables(input) {
         this.#raw.variables = input;
      }
      addVariable(key, value) {
         if (this.#raw.variables) {
            this.#raw.variables = {};
         }
         this.#raw.variables[key] = value
      }
   }
   
   // ------
   // Bundle
   // ------
   class Bundle {
      /*** privet variable ***/
      #P; // Playground 
      #E; // EventTarget
      #V; // Validation 
      #T; // Tasks 
      #O; // Output 
      #F; // Format 
      #ST; // Source Tree
      #SP; // Source Path
      #SBS; // StepByStep
      
      /*** constructor ***/
      constructor() {
         this.version = '1.0.0';
         this.#E = new EventTarget();
         this.#V = new Validation();
         this.#P = new Playground();
         this.#T = [];
         this.#ST = {};
         this.#SP = {};
         this.#SBS = false;
      }
      
      /*** privet method ***/
      #warn(code, warn) {
         let lib = {
            0: `\nThe playground is empty!`,
            1: `\nPlayground not found!\nurl: ${warn}`,
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
         }
         console.warn('[Bundle.js]', lib[code])
      }
      #dispatch(event, detail = {}) {
         this.#E.dispatchEvent(new CustomEvent(event, { detail }));
      }
      #addTask(type, value, context, path) {
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
                  [path]: data
               };
            }));
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
               this.#dispatch('progress', { progress, length, output: this.#O });
               if (progress !== length) {
                  walk(progress);
               } else {
                  if (!this.#SBS) this.#insert();
                  this.#dispatch('finished', this.#O);
               }
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
                  resolve(data);
               }).catch(error => {
                  if (retryCount > 0) {
                     request(retryCount - 1)
                  } else {
                     reject(error);
                  }
               });
            }
            request(maxRequest);
         })
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
         
         collect(this.#P.output);
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
      #write(template, key, value, keyPattern) {
         let arr = keyPattern.split('KEY');
         let start = arr[0] || '';
         let end = arr[1] || '';
         let target = start + key + end;
         return template.split(target).join(value);
      }
      #insert() {
         let rootNode = this.#P.output;
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
      #deepCheck(playground) {
         const result = {};
         const V = this.#V;
         
         const walk = (node, path = [], out = result, depth = 0) => {
            let current = {};
            
            if (!V.object(node)) {
               this.#warn(3, playground);
               return;
            }
            if (V.emptyObject(node)) {
               this.#warn(0, playground);
               return;
            }
            
            if (node.name) {
               if (V.name(node.name)) {
                  current.name = node.name;
               } else {
                  this.#warn(4, node.name);
               }
            }
            if (node.version) {
               if (V.version(node.version)) {
                  current.version = node.version;
               } else {
                  this.#warn(5, node.version);
               }
            }
            if (node.type) {
               if ((depth === 0) ? (V.type(node.type)) : (V.type(node.type) || V.relativeValues(node.type))) {
                  current.type = node.type;
               } else {
                  this.#warn(6, node.type);
               }
            }
            if (node.format) {
               if (V.format(node.format)) {
                  current.format = node.format;
               } else {
                  this.#warn(7, node.format);
               }
            }
            if (node.context) {
               if ((depth === 0) ? (V.context(node.context)) : (V.context(node.context) || V.relativeValues(node.context))) {
                  current.context = node.context;
               } else {
                  this.#warn(8, node.context);
               }
            }
            if (node.key) {
               if (V.key(node.key)) {
                  current.key = node.key;
               } else {
                  this.#warn(9, node.key);
               }
            }
            
            // temple 
            if (node.template) {
               if (V.object(node.template) || V.string(node.template)) {
                  if (V.subPlayground(node.template.type)) {
                     walk(node.template, [...path, 'template'], current, depth + 1);
                  } else {
                     current.template = node.template;
                  }
               } else {
                  this.#warn(10, node.template)
               }
            }
            
            // variables 
            if (node.variables) {
               if (V.object(node.variables)) {
                  for (let key in node.variables) {
                     if (V.object(key) || V.variable(key)) {
                        let val = node.variables[key];
                        if (!current.variables) current.variables = {};
                        if (!current.variables[key]) current.variables[key] = {};
                        // context 
                        if (val.context) {
                           if ((depth === 0) ? (V.context(val.context)) : (V.context(val.context) || V.relativeValues(val.context))) {
                              current.variables[key].context = val.context
                           } else {
                              this.#warn(8, val.context);
                           }
                        }
                        // type
                        if (V.subPlayground(val.type) || V.object(val.value)) {
                           current.variables[key].type = val.type;
                           current.variables[key].value = {};
                           walk(val.value, [...path, 'variables', key], current.variables[key].value, depth + 1);
                        } else if (V.type(val.type) || V.relativeValues(val.type)) {
                           // type
                           current.variables[key].type = val.type;
                        }
                        // value 
                        if (V.string(val.value) || V.object(val.value) || !V.subPlayground(val.type)) {
                           current.variables[key].value = val.value;
                        } else {
                           this.#warn(13, val.value);
                        }
                     } else {
                        this.#warn(12, key);
                     }
                  }
               } else {
                  this.#warn(11, node.variables);
               }
            }
            
            
            //save
            let pointer = out;
            for (let key of path) {
               pointer[key] = pointer[key] || {};
               pointer = pointer[key];
            }
            Object.assign(pointer, current);
         };
         
         walk(playground);
         this.setPlayground(result);
      }
      #context(input, context) {
         context = context ?? 'text';
         
         switch (context.toLowerCase()) {
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
               return decodeURIComponent(escape(atob(input)));
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
            default: {
               return input;
            }
         }
      }
      
      /*** method ***/
      setPlayground(obj) {
         this.#P.setPlayground(obj);
      }
      setName(str) {
         this.#P.setName(str);
      }
      setVersion(str) {
         this.#P.setVersion(str);
      }
      setFormat(str) {
         this.#P.setFormat(str);
      }
      setType(str) {
         this.#P.setType(str);
      }
      setContext(str) {
         this.#P.setContext(str);
      }
      setKey(str) {
         this.#P.setKey(str);
      }
      setTemplate(str) {
         this.#P.setTemplate(str);
      }
      setVariables(obj) {
         this.#P.setVariables(obj);
      }
      addVariable(variable, value) {
         this.#P.addVariable(variable, value);
      }
      bundle(url) {
         if (url) {
            this.#fetch(url, 'json').then((data) => {
               this.#deepCheck(data);
               this.#F = this.#P.output.format;
               this.#dispatch('load', this.#P.output);
               this.#getSources();
               this.#runAllTask();
            }).catch((error) => {
               if (error.status === 404) {
                  this.#warn(1, error.url);
                  return;
               }
               this.#warn(2, { message: error.message, url });
            })
         } else {
            this.#deepCheck(data);
            this.#F = this.#P.output.format;
            this.#getSources();
            this.#runAllTask();
            queueMicrotask(() => {
               this.#dispatch('load', this.#P.output);
            })
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
   
   // Export 
   G.Bundle = Bundle;
   
})(globalThis)