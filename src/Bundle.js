class Bundle {
   /* privet variable */
   #target;
   #playground;
   
   #tasks;
   
   #source;
   #paths;
   #output;
   
   #stepByStep;
   
   /* constructor */
   constructor() {
      this.version = '1.0.0';
      this.#target = new EventTarget();
      this.#playground = new this.#Playground();
      this.#source = {};
      this.#paths = {};
      this.#tasks = [];
      this.#stepByStep = true;
   }
   
   /* private class */
   #Playground = class {
      /* private variable */
      #raw;
      
      /* private object */
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
      #V = {
         // setField
         name: (input) => {
            return typeof input === 'string' && /^[a-z][a-z0-9_.\-]*$/i.test(input);
         },
         version: (input) => {
            return typeof input === 'string' && /^\d+(?:\.\d+)*$/.test(input);
         },
         type: (input) => {
            return typeof input === 'string' && /^(url|inline)$/i.test(input);
         },
         subType: (input) => {
            return typeof input === 'string' && /^(url|inline|default|inherit)$/i.test(input);
         },
         format: (input) => {
            return typeof input === 'string' && /^[a-z][a-z0-9]*$/i.test(input);
         },
         subType: (input) => {
            return typeof input === 'string' && /^(text|base64|buffer|binary|encode)$/i.test(input);
         },
         key: (input) => {
            return typeof input === 'string' && /^(?=[\s\S]*KEY[\s\S]*$)(?![\s\S]*KEY[\s\S]*KEY[\s\S]*$)/i.test(input);
         },
         template: (input) => {
            return typeof input === 'string' || (typeof input === 'object' && !Array.isArray(input) && input !== null);
         },
         variables: (input) => {
            return typeof input === 'object' && !Array.isArray(input) && input !== null;
         },
         // other 
         variablesKey: (input) => {
            return typeof input === 'string' && /^[a-z0-9_.-]+$/i.test(input);
         },
         relativeValue: (input) => {
            return typeof input === 'string' && /^(default|inherit)$/i.test(input);
         },
         isInherit: (input) => {
            return typeof input === 'string' && /^(inherit)$/i.test(input);
         },
         isDefault: (input) => {
            return typeof input === 'string' && /^(default)$/i.test(input);
         },
         isString: (input) => {
            return typeof input === 'string';
         },
         isObject: (input) => {
            return typeof input === 'object' && !Array.isArray(input) && input !== null;
         },
         isPlayground: (input) => {
            return typeof input === 'string' && /^(subPlayground)$/i.test(input);
         },
         depth: (input) => {
            return input >= 10;
         },
      }
      
      /* constructor */
      constructor() {
         this.#raw = {};
      }
      
      /* private method */
      #setField(key, value, code) {
         if (this.#V[key](value)) this.#raw[key] = value;
         else this.#warn(code, value);
      }
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
         let V = this.#V;
         if (V.depth(depth)) {
            this.#warn(20);
            return {};
         }
         
         const obj = { ...root, ...input };
         const context = obj.context || root.context;
         const type = obj.type || root.type;
         
         // Normalize template
         let template = obj.template;
         if (V.isString(template)) {
            if (V.relativeValue(template)) {
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
         }
         if (V.isObject(template)) {
            let tempType = template.type || type;
            let value = template.value;
            if (V.isInherit(template.type)) {
               value = parent?.template?.value || '';
               tempType = parent?.template?.type || type;
            } else if (V.isDefault(template.type)) {
               value = root.template?.value || '';
               tempType = root.template?.type || type;
            }
            if (V.isPlayground(tempType) && V.isObject(value)) {
               value = this.#normalize(value, obj, root, depth + 1);
            }
            template = {
               type: tempType,
               value: V.isString(value) || V.isObject(value) ? value : '',
            };
         } else {
            template = {
               type: type,
               value: '',
            };
         }
         
         // Normalize variables
         const resultVars = {};
         const rawVars = V.isObject(obj.variables) ? obj.variables : {};
         for (const [k, v] of Object.entries(rawVars)) {
            if (!V.variablesKey(k)) {
               this.#warn(7, k);
               continue;
            }
            
            if (V.isString(v)) {
               resultVars[k] = {
                  type: type,
                  context: context,
                  value: v,
               };
            } else if (V.isObject(v)) {
               if (V.isPlayground(v.type)) {
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
      
      /* property */
      get output() {
         return this.#normalize(this.#raw);;
      }
      get raw() {
         return this.#raw;
      }
      
      /* method */
      setPlayground(input = {}) {
         for (let [key, value] of Object.entries(input)) {
            const method = `set${key[0].toUpperCase()}${key.slice(1)}`;
            if (typeof this[method] === 'function') {
               this[method](value);
            }
         }
      }
      
      setName(input) {
         this.#setField('name', input, 0);
      }
      setVersion(input) {
         this.#setField('version', input, 1);
      }
      setFormat(input) {
         this.#setField('format', input, 2);
      }
      setType(input) {
         this.#setField('type', input, 3);
      }
      setContext(input) {
         this.#setField('context', input, 4);
      }
      setKey(input) {
         this.#setField('key', input, 5);
      }
      setTemplate(input) {
         this.#setField('template', input, 6);
      }
      setVariables(input) {
         this.#setField('variables', input, 7);
      }
      
      addVariable(key, value) {
         if (this.#V.variablesKey(key)) {
            if (!this.#V.variables(this.#raw.variables)) {
               this.#raw.variables = {};
            }
            this.#raw.variables[key] = value
         } else {
            this.#warn(7, key);
         }
      }
   }
   
   /* privet method */
   #dispatch(event, detail = {}) {
      this.#target.dispatchEvent(new CustomEvent(event, { detail }));
   }
   #addTask(type, value, path) {
      if (type === 'inline') {
         this.#tasks.push(() => Promise.resolve().then(() => {
            return {
               [path]: value };
         }));
      }
      if (type === 'url') {
         this.#tasks.push(() => this.#fetch(value).then((data) => {
            return {
               [path]: data };
         }));
      }
   }
   #runAllTask() {
      let progress = 0;
      let length = this.#tasks.length;
      queueMicrotask(() => {
         this.#dispatch('start', { length })
      })
      const walk = (i) => {
         this.#tasks[i]().then((data) => {
            progress++;
            let [path, value] = Object.entries(data)[0];
            this.#paths[path] = value;
            this.#pathToTree(path, value);
            if (this.#stepByStep) this.#insert();
            this.#dispatch('progress', { progress, length, output: this.#output });
            if (progress !== length) {
               walk(progress);
            } else {
               if (!this.#stepByStep) this.#insert();
               this.#dispatch('finished', this.#output);
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
                  let { status, statusText, url } = error;
                  reject(`${status}: ${statusText} \n - ${url}`);
               }
            });
         }
         request(maxRequest);
      })
   }
   #getSources() {
      const collect = (node, path = '') => {
         // Template
         if (node.template.type === 'inline' || node.template.type === 'url') {
            const id = path ? `${path}/template` : 'template';
            this.#addTask(node.template.type, node.template.value, id);
         } else if (node.template.type === 'subPlayground') {
            const id = path ? `${path}/template` : 'template';
            collect(node.template.value, id);
         }
         
         // Variables
         for (let [key, val] of Object.entries(node.variables)) {
            const id = path ? `${path}/variables/${key}` : `variables/${key}`;
            if (val.type === 'inline' || val.type === 'url') {
               this.#addTask(val.type, val.value, id);
            } else if (val.type === 'subPlayground') {
               collect(val.value, varPath);
            }
         }
         
      };
      collect(this.#playground.output);
   }
   #pathToTree(path, value) {
      const keys = path.split('/');
      let node = this.#source;
      
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
      let rootNode = this.#playground.output;
      let sourceTree = this.#source;
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
      this.#output = walk(rootNode, sourceTree);
   }
   
   /* method */
   setPlayground(obj) {
      this.#playground.setPlayground(obj);
   }
   setName(str) {
      this.#playground.setName(str);
   }
   setVersion(str) {
      this.#playground.setVersion(str);
   }
   setFormat(str) {
      this.#playground.setFormat(str);
   }
   setType(str) {
      this.#playground.setType(str);
   }
   setContext(str) {
      this.#playground.setContext(str);
   }
   setKey(str) {
      this.#playground.setKey(str);
   }
   setTemplate(str) {
      this.#playground.setTemplate(str);
   }
   setVariables(obj) {
      this.#playground.setVariables(obj);
   }
   addVariable(variable, value) {
      this.#playground.addVariable(variable, value);
   }
   
   bundle(url) {
      if (url) {
         this.#fetch(url, 'json').then((data) => {
            this.setPlayground(data);
            this.#getSources();
            this.#runAllTask();
         })
      } else {
         this.#getSources();
         this.#runAllTask();
      }
   }
   
   /* event */
   set onstart(callback) {
      this.#target.addEventListener('start', (e) => callback(e.detail));
   }
   set onprogress(callback) {
      this.#target.addEventListener('progress', (e) => callback(e.detail));
   }
   set onfinished(callback) {
      this.#target.addEventListener('finished', (e) => callback(e.detail));
   }
}