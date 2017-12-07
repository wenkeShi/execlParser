var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var xlsxParser = require('node-xlsx').default;
// var formidable = require('formidable');
var multer = require('multer');
var storage =multer.memoryStorage();
var upload = multer({storage : storage});
// var upload = multer({ dest: 'uploads/' })

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
// app.use(bodyParser.raw({ type: 'multipart/form-data' }))
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static('public'));

// app.use('/', index);
// app.use('/users', users);


app.post('/execlparser' , upload.single('execl') , (req, res, next) => {

	// console.log(req.file);
	// console.log(req.file.buffer);
  let sheetsData = xlsxParser.parse(req.file.buffer);
  // console.log(sheetsData);
  let sendBackData = {
    grid : {
      no1 : [],
      zero :[],
    },
    //劳动竞赛
    ldjs : {
      jd : '',
      qian : '',
      last3 : [],
      advance : [], //时间进度赶超
    },
    node : {
      fztotal : 0,
      ldtotal : 0,
      percent :0,
      zeroPerc : [],
      low30 : [], 
    },
  };
  let ldjs =  sendBackData.ldjs;
  let sheet1 = sheetsData[0].data;
  let newMax = 0;
  //循环一遍，找出新增为0的,并找出网格之中最大的新增值
  for(let i=1;i<17;i++){
    //新增数为0的
    let line = sheet1[i];
    if(line[2]==0){
      sendBackData.grid.zero.push({
        gridName : line[0].replace('天门',''),
        person : line[1],
      });
    }else{}

    if(line[0].indexOf('网格') !== -1){
      line[2]>newMax?newMax=line[2]:'';
      //劳动竞赛进度赶超的
      if(line[6]>0) ldjs.advance.push({
        gridName : line[0].replace('天门',''),
      });
    }else{
      continue;
    }
  }
  //循环一遍，找出新增最大的网格
  for(let i=1;i<17;i++){
    let line = sheet1[i];
    if(line[2]==newMax&&line[0].indexOf('网格') !== -1){
      sendBackData.grid.no1.push({
          gridName : line[0].replace('天门',''),
          person :line[1],
        }
      );
    }
  }
  //劳动竞赛参与情况
  let line17 = sheet1[17];
  let line17Len = line17.length;

  ldjs.jd = line17[line17Len-3];
  ldjs.qian = line17[line17Len-4];
  for(let i =14; i<17;i++){
    let line = sheet1[i];
    ldjs.last3.push({
      gridName : line[0].replace('天门',''),
      person : line[1],
    });
  }

  //网点参与率
  let sheet2 = sheetsData[1].data;
  let node = sendBackData.node;

  let low30 = node.low30;
  let zeroPerc = node.zeroPerc;

  let line14 = sheet2[14];
  let line14Len = line14.length;

  node.fztotal =  line14[line14Len-3];
  node.ldtotal = line14[line14Len-2];
  node.percent = line14[line14Len-1]; 

  for(let i=1;i<14;i++){
    let line = sheet2[i];
    if(line[4] == 0){
      zeroPerc.push({
        gridName : line[0].replace('天门',''),
        person : line[1],
      });
    }else if(line[4] < 0.3){
      low30.push({
        gridName : line[0].replace('天门',''),
        person : line[1],
      });

    }
  }
	res.status(200).json(sendBackData);		
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080);

module.exports = app;