function submitExecl() {
  var fileDom = $( "#file" )[0];
  var formData = new FormData();
  var file =  fileDom.files[0];
  var fileName = file.name;
  var ext = fileName.slice(fileName.lastIndexOf('.')+1);
  var size = file.size;

  if(size > 2*1024*1024 || (ext !=='xlsx' && ext !== 'xls')){
    return;
  }

  var result = $('#result').addClass('result');
  var grid = $('.grid');
  let node = $('.node');
  formData.append('execl', file);  //这里的execl名就是这个值域名
  $.ajax({  
      url: 'http://localhost:8080/execlparser' ,  
      type: 'POST',  
      data: formData,  
      async: true,  
      cache: false,  
      contentType: false,  
      processData: false,  
      success: function (res) { 
        console.log(res);
        let gridData = res.grid;
        let today = new Date();
        let dateStr = (today.getMonth()+1) + '月' + (today.getDate()) + '日';


        let no1 = gridData.no1;
        let gridText = '二、网格发展情况： 当日新增第1名是';

        for(let i=0;i<no1.length;i++){
          if(i==no1.length-1){
            gridText += (no1[i].gridName+'('+no1[i].person+')；办理量为0的是');
          }else{
            gridText += (no1[i].gridName+'('+no1[i].person+')、');
          }
        }

        gridData.zero.forEach((item, index) => {
          if(index == gridData.zero.length-1){
            gridText += (item.gridName+'('+item.person+')；\n');
          }else{
            gridText += (item.gridName+'('+item.person+')、');
          }
        });

        let ldjs = res.ldjs;
        let last3 = ldjs.last3;
        gridText += '三、劳动竞赛参与情况：截止'+ dateStr 
        + '完成劳动竞赛进度'+ (ldjs.jd*100).toString().substr(0,5)
        +'%，欠时间进度'+(-ldjs.qian*100).toString().substr(0,5)
        +'%。月累计排名后3名的分别为'
        +last3[0].gridName+'('+last3[0].person+')，'
        +last3[1].gridName+'('+last3[1].person+')，'
        +last3[2].gridName+'('+last3[2].person+')，';

        if(ldjs.advance.length>0){
          gridText += '各网格中仅有';
          ldjs.advance.forEach((item, index) => {
            // Todo...
            if(index == ldjs.advance.length-1){
              gridText += (item.gridName + '超时间进度；具体办理情况如下：');
            }else{
            gridText += (item.gridName+'、');
            }
          })
        }else{
          gridText += '无网格超时间进度；具体办理情况如下：'
        }
        grid.text(gridText);



        let nodeData = res.node;
        let nodeText = dateStr+'网点参与率情况通报：\n'
        +dateStr+'参与发展的网点共'+nodeData.fztotal
        +'家，参与劳动竞赛的网点共'+nodeData.ldtotal
        +'家，参与率仅为'+(nodeData.percent*100).toString().substr(0,5)
        +'%；劳动竞赛网点基本要求为“一镇一店一日一新增”，当日发展具体情况如下：\n'
        +'一、参与率为0的网格：';
        if(nodeData.zeroPerc.length == 0){
          nodeText+='无；\n'
        }else{
          nodeData.zeroPerc.forEach((item,index) => {
            // Todo...
            if(index == nodeData.zeroPerc.length-1){
              nodeText += (item.gridName+'('+item.person+')；\n');
            }else{
              nodeText += (item.gridName+'('+item.person+')、');
            }
          });
        }

        if(nodeData.low30.length ==0){
          nodeText += '二、参与率低于30%的网格：无；\n三、未参与的网点明细如下；';
        }else{
          nodeText += '二、参与率低于30%的网格为';
          nodeData.low30.forEach((item,index) => {
            // Todo...
            if(index == nodeData.low30.length-1){
              nodeText += (item.gridName+'('+item.person+')；\n三、未参与的网点明细如下；');
            }else{
              nodeText += (item.gridName+'('+item.person+')、');
            }
          });
        }
        node.text(nodeText);
      },  
      error: function (returndata) {  
          //alert(returndata);
          grid.text('和说好的格式不一样呀...'); 
      }  
  });  
}

function pickFile(){
  var file = document.getElementById('file').files[0];
  console.log(file);
  var fileName = file.name;
  var ext = fileName.slice(fileName.lastIndexOf('.')+1);
  var size = file.size;
  console.log(ext);
  if(size > 2*1024*1024){
    $('.pick-notice').html('文件不得超过2M');
    return;
  }
  if(ext !=='xlsx' && ext !== 'xls'){
    $('.pick-notice').html('请新新选择execl文件...');
  }else{
    // $('.picker').text(fileName);
    //.text(value)不会转义字符串 ，html会，两者都会清空元素里面的内容(包括标签)然后设置为相应值
    $('.pick-icon').html('&#xe603;');
    $('.pick-notice').html(fileName);
  }
}