/* 照片墙  拖拽交换位置 */
// 思路分析
// 1 JS 重新排列图片位置
//2 加入拖拽效果
//3 在move 中 判断碰撞 放入数组
// 4 up后  查找距离最小的 交换位置 以及地址

~function () {
    var aP = $('p');
//    1 JS 重新定位
    for(var i=aP.length-1;i>=0;i--){
        var cur = aP.eq(i);
        cur.css({
            left:cur.position().left+'px',
            top:cur.position().top+'px',
            position:'absolute',
            margin:0
        })
        // 2 加入拖拽 层级提升
        new Drag({ele:cur[0]}).creaseIndex().on('selfMove',hited).on('selfUp',changePos);




    }
    function isHited(a,b){
        var if1= (a.offset().left+a.width())<b.offset().left; // a在左侧
        var if2= (b.offset().left+b.width())<a.offset().left; // a在 右侧
        var if3= a.offset().top>(b.offset().top+b.height());// a 在下方
        var if4= (a.offset().top+a.height())<b.offset().top;// a 在上方
        return (if1||if2||if3||if4)?false:true;// 返回是否发生了碰撞
    }


    // 3 碰撞测试 在move 中记录发生碰撞的元素 放入属性数组
    function hited(){
        this.hiteAry=[];
        for(var i=0;i<aP.length;i++) {
            var other = aP[i];
            // 处理自己与自己碰撞
            if(this.ele==other) continue;

            if( isHited($(this.ele),$(other)) ){
                // 如果发生碰撞
                this.hiteAry.push(other);
                $(other).addClass('on');
            }else{
                $(other).removeClass('on');
            }
        }
    }
    // 4 up 之后 判断与谁距离最短 交换两者位置
    function changePos(){
// 判断距离
        var ary= this.hiteAry;
        // 处理没有碰撞的 释放后回到原位
        if(ary.length){
            for(var i=0;i<ary.length;i++){
                var cur=$(ary[i]);
                cur.pos =  Math.pow( this.l-cur.position().left ,2)+ Math.pow(this.t-cur.position().top,2);
                cur.removeClass('on');
            }
            ary.sort(function (a,b) {
                return a.pos-b.pos;
            });

            // 和 距离最短的交换位置 交换地址
            var minBox = ary[0];
            minBox.className=this.ele.className='change';

            animate({
                id:this.ele,
                target:{
                    left:minBox.offsetLeft,
                    top:minBox.offsetTop
                },
                effect:3,
                duration:500
            })
            animate({
                id:minBox,
                target:{
                    left:this.l,
                    top:this.t
                },
                effect:3,
                duration:500
            })

            // 记得交换地址
            var tmpL = this.ele.l , tmpT=this.ele.t;
            this.ele.l= minBox.offsetLeft , this.ele.t=minBox.offsetTop;
            minBox.l=tmpL ,minBox.t=tmpT;

        }else{
            // 处理没有碰撞的 释放后回到原位
            animate({
                id:this.ele,
                target:{
                    left:this.l,
                    top:this.t
                },
                effect:3,
                duration:500
            })
        }




    }

}();