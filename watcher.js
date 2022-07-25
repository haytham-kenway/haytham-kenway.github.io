// 给需要变化的元素，增加观察者
// 数据变化，执行相应的方法
class Watcher{
    constructor(vm,expr,cb){
        this.vm=vm;
        this.expr=expr;
        this.cb=cb;
        // 获取旧的值
        this.value=this.get();
    }
    getVal(vm,expr){
        // 防止message.a.b.c情况
        expr = expr.split('.');
        // vm.$data指的是prev
        // next:数组第一项
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    }
    get(){
        Dep.target = this;
        let value = this.getVal(this.vm,this.expr);
        Dep.target = null;
        return value;
    }
    // 对外暴露的方法
    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(newValue != oldValue){
            // 调用watch的callback
            this.cb(newValue);
        }
    }
}
