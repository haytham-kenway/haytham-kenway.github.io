class Compile{
    constructor(el,vm){
        // 判断el是否为DOM，不是需要自己找
        this.el=this.isElementNode(el)?el:document.querySelector(el);
        this.vm=vm;
        if(this.el){
            // 获取到el,开始编译
            // 将真实的DOM移到内存中,可以提高性能
            // 将节点放入文档碎片fragment中
            let fragment = this.node2fragment(this.el);
            // 编译，提取 元素节点v-model 文本节点{{}}
            this.compile(fragment);
            // 把编译好的fragment放回页面
            this.el.appendChild(fragment);
        }
    }
    // 判断功能
    // 判断el是否为DOM
    isElementNode(node){  
        return node.nodeType === 1;
    }
    // 是否为指令
    isDirective(name){
        return name.includes('v-');
    }
    // 核心流程
    compileElement(node){
        // 有v-model
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr=>{
            // 判断属性名称是否包含v-
            let attrName = attr.name;
            if(this.isDirective(attrName)){
                // 取对应的值放到节点中
                let expr = attr.value;
                let [,type] = attrName.split('-');
                // console.log(type)
                // this.vm.$data -> attrValue
                CompileUtil[type](node,this.vm,expr);
            }
        })
    }
    compileText(node){
        // 有{{}}
        // 取到文本的内容
        let expr = node.textContent;
        // g:全局，中间可以有除了}以外的字符
        let reg = /\{\{([^}]+)\}\}/g
        if(reg.test(expr)){
            // this.vm.$data -> text
            CompileUtil['text'](node,this.vm,expr);
        }
    }
    node2fragment(el){
        // 将el中的内容全部放入内存
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 一个一个将节点存放到内存中
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    compile(fragment){
        // 递归
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node)){
                // 是元素节点，需要分解
                // 要编译元素
                this.compileElement(node);
                this.compile(node)
            }else{
                // 是文本节点
                // 要编译文本
                this.compileText(node);
            }
        });
    }

}

CompileUtil = {
    // 获取数据
    getVal(vm,expr){
        // 防止message.a.b.c情况
        expr = expr.split('.');
        // vm.$data指的是prev
        // next:数组第一项
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    },
    // 获取{{}}中的值对应的数据
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm,arguments[1]);
        })
    },
    setVal(vm,expr,value){
        expr = expr.split('.');
        // reduce收敛
        return expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex === expr.length-1){
                return prev[next]=value;
            }
            return prev[next];
        },vm.$data)
    },
    text(node,vm,expr){//文本处理
        let updateFn = this.updater['textUpdater'];
        // vm.$data[expr]; "message.a"=>[message,a]
        let value = this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm,arguments[1],(newValue)=>{
                // 如果数据变化了，文本节点需要重新获取依赖的属性更新文本中的内容
                updateFn && updateFn(node,this.getTextVal(vm,expr))
            })
        })
        
        updateFn && updateFn(node,value)
    },
    model(node,vm,expr){//输入框处理
        let updateFn = this.updater['modelUpdater'];
        // 添加一个watch,数据变化就调用callback
        new Watcher(vm,expr,()=>{
            // 当值变化后，会调用cb，传递新的值
            updateFn && updateFn(node,this.getVal(vm,expr));
        })
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue)
        })
        // vm.$data[expr]; "message.a"=>[message,a]
        updateFn && updateFn(node,this.getVal(vm,expr));
    },
    updater:{
        // 文本更新
        textUpdater(node,value){
            node.textContent = value
        },
        // 输入框更新
        modelUpdater(node,value){
            node.value = value
        }
    }
}