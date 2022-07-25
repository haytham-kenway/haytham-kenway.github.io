class MVVM{
    constructor(op,){
        // 将可用属性挂载到this上
        this.$el=op.el;
        this.$data=op.data;
        // 编译
        if(this.$el){
            // 数据劫持，把对象的所有属性，给成get和set方法
            new Observer(this.$data);
            // 代理数据，不需要$data来获取数据
            this.proxyData(this.$data);
            // 利用数据、元素进行编译
            new Compile(this.$el,this);
        }
       
    }
    proxyData(data){
        Object.keys(data).forEach(key=>{
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key] = newValue
                }
            })
        })
    }
}