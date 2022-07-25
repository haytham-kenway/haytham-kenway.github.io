class Observer{
    constructor(data){
        this.observe(data);
    }
    observe(data){
        // 属性改成get和set
        if(!data || typeof data !== 'object'){
            return;
        }
        // 数据要逐一劫持
        Object.keys(data).forEach(key=>{
            // 劫持
            this.defineReactive(data,key,data[key])
            // 防止劫持的对象里面还有对象
            // 深度递归劫持 
            this.observe(data[key]);
        });
    }
    // 定义响应式
    defineReactive(obj,key,value){
        let that = this;
        let dep = new Dep();
        Object.defineProperty(obj,key,{
            // 可枚举
            enumerable:true,
            // 可删除
            configurable:true,
            get(){
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            // 设置值时，更改获取的属性的值
            set(newValue){
                // 这里的this不是实例
                if(newValue!=value){
                    // 如果是对象，还需要劫持
                    that.observe(newValue);
                    value = newValue;
                    // 通知，数据已经更新
                    dep.notify();
                }
            }
        });
    }
}
// 发布订阅
class Dep{
    constructor(){
        // 订阅数组
        this.subs = []

    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    // 通知
    notify(){
        this.subs.forEach(watcher=>watcher.update());
    }
}