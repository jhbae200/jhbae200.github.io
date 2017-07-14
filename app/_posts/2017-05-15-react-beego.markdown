---
layout: post
title:  "React, Beego 맛보기"
writer: "배진환"
date:   2017-05-12 14:51:00 +0900
tags: React Golang Beego
---
#### React ####
[React][React]
React는 재사용 가능한 사용자 인터페이스(UI)를 구축하기 위한 JavaScript 라이브러리.
##### 특징 #####
* MVC 프레임 워크가 아닌 V(View)에 집중한 라이브러리.
* Virtual DOM 사용으로 최소한의 변경으로 높은 성능.
* UI 분리로 코드 관리가 쉬워진다.

##### 단점 #####
* 진입 장벽이 너무나도 높다. (익숙하지 않은 jsx문법, Virtual DOM은 또 뭐야? 서버 사이드 랜더링은 어떻게 하는 거지? 등..)
* 초기 설정이 복잡하다.

#### Beego ####
[Beego][Beego]
Go 언어의 Web Framwork

끝이다.

#### React 초기 구성 ####
React는 js로 작성해도 되지만 React Element를 작성할 때 매우 가독성이 낮으므로 jsx로 작성하는 것을 추천.  
대신 jsx를 js로 변환하는 과정이 필요하므로 귀찮다. es6 문법도 같이 쓸 것이므로 더 귀찮을 것이다.

여러 모듈을 번들해주는 webpack과 jsx, es6를 변환시켜줄 babel을 조합해서 사용한다면 컴파일에 한두 번만 에너지를 쏟으면 된다.

working directory를 잘 정하고 해당 폴더에서 `npm init`로 package.json을 생성한다.  
그 후 dependencies와 devDependencies를 설정해주고 `npm install`.
_package.json_
{% highlight json %}
{
  "name": "static",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "jquery": "^3.2.1",
    "react": "^15.5.4",
    "react-dom": "^15.5.4"
  },
  "devDependencies": {
    "babel": "^6.23.0",
    "babel-core": "^6.24.1",
    "babel-loader": "^7.0.0",
    "babel-preset-es2015": "^6.24.1",
    "babel-preset-react": "^6.24.1",
    "css-loader": "^0.28.1",
    "extract-text-webpack-plugin": "^2.1.0",
    "file-loader": "^0.11.1",
    "style-loader": "^0.17.0",
    "webpack": "^2.5.1"
  }
}
{% endhighlight %}

그 후 webpack.config.js를 작성.  
webpack.config.js 안에는 babel-loader를 사용하여 js파일의 문법을 바꿔주고 그 외로 js minify를 사용설정.

_webpack.config.js_
{% highlight javascript %}
let webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: {
        index: './js/index.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname+'/../static/js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ]
};
{% endhighlight %}
번들된 js는 src/static/js에 생성될 것이다.
이 후 working directory에서 `webpack --watch`로 개발 중에는 번들이 자동화 되도록 한다.

js 파일이 minify되어서 react 쪽에서 에러가 나서 당황할 수도 있다. 그냥 에러 메세지가 축약되서 나오는 것이니 걱정하지 말기를 바란다.

#### Beego 초기설정 ####

`go get github.com/astaxie/beego
go get github.com/beego/bee`

src 폴더 이동후 `bee new [project-name]` 그리고 `bee run`

끝났다.
진짜다.

#### index.js와 ui components ####

앞서 entry에 적어두었던 index.js와 html을 그릴 components를 하나 만들어준다.

_components/App.js_
{% highlight javascript %}
import React from 'react';
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {second: 0};
    }
    tick() {
        this.setState((prevState) => ({
            second: prevState.second + 1
        }));
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    render(){
        return (
            <h1>Hello React {this.state.second}</h1>
        );
    }
}

export default App;
{% endhighlight %}

_index.js_
{% highlight javascript %}
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App';

const rootElement = document.getElementById('app');
ReactDOM.render(<App />, rootElement);
{% endhighlight %}

view/index.tpl도 수정하도록 한다.

_index.tpl_
{% highlight html %}
<!DOCTYPE html>

<html>
<head>
    <title>Beego</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>

<body>
<div id="app"></div>
<script src="/static/js/index.js"></script>
</body>
</html>
{% endhighlight %}

http://localhost:8080/ 에 접속하면 React로 로딩된 Hello React 0이 보이고 0이 1씩 늘어나는 것을 볼 수 있을 것이다.

[React]: https://facebook.github.io/react/
[Beego]: https://beego.me/
