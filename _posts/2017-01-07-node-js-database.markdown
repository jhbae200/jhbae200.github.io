---
layout: post
title:  "node js express에서 mysql을 연결하는 패턴"
writer: "배진환"
date:   2017-01-07 17:24:00 +0900
tags: node mysql express
description: "node js express에서 mysql을 사용해보고 패턴에 대해 고민을 해봤습니다."
---
한참 java에서 DAO(Data Access Object)패턴으로 데이터베이스 연동을 하고 mybatis를 사용을 해봤는데 node js express를 공부하면서 데이터베이스를 연동하려고 보니 express에서는 DAO같은 패턴이 없어서 이걸 DAO 비슷하게 패턴을 만들면 어떨까 생각을 하게 됬습니다.  
'이런 패턴으로도 사용이 가능하구나'로 그냥 가볍게 생각해주시기 바랍니다.

#### Express ? ####
> Express는 웹 및 모바일 애플리케이션을 위한 일련의 강력한 기능을 제공하는 간결하고 유연한 Node.js 웹 애플리케이션 프레임워크입니다.

_[Express][express-ko]_

Express는 웹 어플리케이션을 작성하기 위한 간결한 웹 프레임워크로 가볍지만 다른 모듈을 써드파티 미들웨어로 사용하여 기능을 강력하게 만들 수 있습니다.  
저는 미들웨어 기능이 매우 매력적으로 다가왔습니다.

#### Mysql for Nodejs ####
일반적으로 node.js에서 mysql을 사용하는 방법은 `npm install mysql`으로 설치하고 [공식문서][mysqljs]를 기반으로 사용하면 됩니다.
{% highlight js %}
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

connection.end();
{% endhighlight %}

#### Express database usage pattern ####
_Express generator로 생성하였습니다._
대강 시나리오는 다음과 같이 생각했습니다.
* express를 실행할 때(bin/www) database/dbcon에서 createPool을 호출하고 웹 서비스를 시작하게 한다.
* index에서 처음에 database/testDAO의 selectAll을 미들웨어로 호출한다.
* testDAO에서 select 구문을 실행하고 req에 db_result라는 속성으로 결과 rows를 담고 db close 후 callback.
* index.ejs에 데이터 {data: req.db_result}를 담아 랜더링.
##### directory tree view #####
~~~~
.
├── app.js
├── bin
│   └── www
├── database
│   ├── dbcon.js
│   └── testDAO.js
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
├── testExpress.iml
└── views
    ├── error.ejs
    └── index.ejs
~~~~

database 폴더에 데이터베이스를 사용하는 것들을 모아놓았다.

_database/dbcon.js_
{% highlight js %}
/**
 * Created by baejinhwan on 2017. 1. 7..
 */
var mysql = require('mysql');
var pool;
function createPool(next) {
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'testdb',
    password: 'pass'
  });
  next();
}
function getPool() {
  return pool;
}

module.exports.createPool = createPool;
module.exports.getPool = getPool;
{% endhighlight %}

_database/testDAO.js_
{% highlight js %}
/**
 * Created by baejinhwan on 2017. 1. 7..
 */
var dbcon = require('./dbcon');

function selectAll(req,res,next) {
  var con = dbcon.getPool();
  con.getConnection(function (err, connection){
    if (err) {
      console.error("err : " + err);
      return next(err);
    }
    connection.query('select * from member', function (err, rows) {
      if (err) {
        console.error("err : " + err);
        return next(err);
      }
      console.log("rows : " + JSON.stringify(rows));

      req.db_result = rows;
      connection.release();

      next();
    });
  });
}

module.exports.selectAll = selectAll;
{% endhighlight %}

_routes/index.js_
{% highlight js %}
var express = require('express');
var router = express.Router();
var testDAO = require('../database/testDAO');

router.get('/', testDAO.selectAll);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { data: req.db_result });
});

module.exports = router;
{% endhighlight %}

이런 패턴을 사용한 이유는 database access부분과 로직부분을 나누고 싶어서 생각했던 패턴입니다. database에서는 sql을 실행하는 용도만 있고 만일 오류가 날 땐 next(err)로 오류처리를 하면 되지않을까 라는 생각에서 나왔습니다.

##### project files #####
[testExpress - jhbae200.github][testExpress]

#### 참고 링크 ####
_[Express][express-ko]_
_[Express Middleware][express-ko-middleware]_



[express-ko]: http://expressjs.com/ko/
[express-ko-middleware]: http://expressjs.com/ko/guide/writing-middleware.html
[mysqljs]: https://github.com/mysqljs/mysql
[testExpress]: https://github.com/jhbae200/testExpress
