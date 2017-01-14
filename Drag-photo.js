function EventEmitter(){}
//给某个自定义行为，绑定某个方法；把所有的方法，都放进了数组中；
EventEmitter.prototype.on=function(type,fn){
    if(!this[type]){
        this[type]=[];
    }
    var a=this[type];
    for(var i=0; i<a.length; i++){
        if(a[i]==fn) return;
    }
    a.push(fn);
    return this;
}
EventEmitter.prototype.fire=function(type,e){
    //1.拿到数组
    var a=this[type];
    //2.遍历数组，顺序调用；
    if(a && a.length){
        for(var i=0; i<a.length; i++){
            a[i].call(this,e);
        }
    }
}
function Drag(opt){
    if(!opt.ele) return;
    this.ele=opt.ele;
    this.x=this.y=this.l=this.t=null;
    this.DOWN=processThis(this.down,this);
    this.MOVE=processThis(this.move,this);
    this.UP=processThis(this.up,this);
    //系统事件绑定直接用on；自定义事件绑定this.on()
    on(this.ele,'mousedown',this.DOWN)
};
Drag.prototype=new EventEmitter();//实现继承
Drag.prototype.constructor=Drag;//更改constructor指向；
//思路2:可以把全局变量，存在唯一的这个类的私有属性上；
//Drag.zIndex=0;//静态属性
//思路1：把共同要修改的东西，放在原型上；因为他们找到的最近的原型是唯一的；
Drag.prototype.zIndex=0;
Drag.prototype.down=function(e){
    this.x=e.clientX;
    this.y=e.clientY;
    this.l=this.ele.offsetLeft;
    this.t=this.ele.offsetTop;
    if(this.ele.setCapture){
        this.ele.setCapture();
        on(this.ele,'mousemove',this.MOVE);
        on(this.ele,'mouseup',this.UP);
    }else{
        on(document,'mousemove',this.MOVE);
        on(document,'mouseup',this.UP);
        e.preventDefault();
    }
    //在down下面暴露一个'selfDown'的接口
    this.fire('selfDown',e)
};
Drag.prototype.move=function(e){
    this.ele.style.left=e.clientX-this.x+this.l+'px';
    this.ele.style.top=e.clientY-this.y+this.t+'px';
    //在move下面暴露一个'selfMove'的接口
    this.fire('selfMove',e)
};
Drag.prototype.up=function(e){
    if(this.ele.releaseCapture){
        this.ele.releaseCapture();
        off(this.ele,'mousemove',this.MOVE);
        off(this.ele,'mouseup',this.UP);
    }else{
        off(document,'mousemove',this.MOVE);
        off(document,'mouseup',this.UP);
    }
    //在up下面暴露一个'selfUp'的接口
    this.fire('selfUp',e)
};
Drag.prototype.range=function(opt){
    this.opt=opt;
    this.on('selfMove',this.addRange)
};
Drag.prototype.addRange=function(e){
    var range=this.opt;
    var l=e.clientX-this.x+this.l;
    var t=e.clientY-this.y+this.t;
    if(l<=range.left){
        l=range.left
    }else if(l>=range.right){
        l=range.right
    }
    if(t<=range.top){
        t=range.top
    }else if(t>=range.bottom){
        t=range.bottom
    }
    this.ele.style.left=l+'px';
    this.ele.style.top=t+'px';
};
Drag.prototype.creaseIndex=function(){
    this.on('selfDown',function(){
        this.ele.style.zIndex=++Drag.prototype.zIndex;
    })
    return this;
};
Drag.prototype.jump=function(){
    //on后面的链式操作，要给on里面写返回值this;
    this.on('selfDown',this.clearEffect).on('selfMove',this.getSpeedX).on('selfUp',this.fly).on('selfUp',this.drop);
    return this;
};
Drag.prototype.clearEffect=function(){
    clearTimeout(this.flyTimer);
};
Drag.prototype.getSpeedX=function(e){
    if(!this.prev){
        this.prev=e.clientX;
    }else{
        this.speedX=e.clientX-this.prev;
        this.prev=e.clientX;
    }
};
Drag.prototype.fly=function(){
    clearInterval(this.flyTimer);
    this.speedX*=.93;
    var l=this.ele.offsetLeft+this.speedX;
    var maxL=(document.documentElement.clientWidth||document.body.clientWidth)-this.ele.offsetWidth;
    if(l<=0){
        l=0;
        this.speedX*=-1;
    }else if(l>=maxL){
        l=maxL;
        this.speedX*=-1;
    }
    if(Math.abs(this.speedX)>=0.5){
        this.ele.style.left=+'px';
        this.flyTimer=setTimeout(processThis(this.fly,this),10);
    }
};
Drag.prototype.drop=function(){
    if(!this.speedY){
        this.speedY=9.8;
    }else{
        this.speedY+=9.8;
    }
    this.speedY*=.93;
    var t=this.ele.offsetTop+this.speedY;
    var maxT=(document.documentElement.clientHeight||document.body.clientHeight)-this.ele.offsetHeight;
    if(t>=maxT){
        t=maxT;
        this.speedY*=-1;
        this.flag++;
    }else{
        this.flag=0;
    }
    if(this.flag<2){
        this.ele.style.top=t+'px';
        this.dropTimer=setTimeout(processThis(this.drop,this),10);
    }
}