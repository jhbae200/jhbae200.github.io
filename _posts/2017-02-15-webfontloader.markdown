---
layout: post
title:  "웹폰트 사용하기"
writer: "배진환"
date:   2017-02-15 17:24:00 +0900
tags: node mysql express
description: "웹폰트를 로딩하는 방법 중 css import방법이 아니라 webfontloader.js를 이용하여 로딩을 해보았습니다."
---

웹 폰트를 사용하다가 일반적으로 사용하는 방법인 css에서 import하는 방법으로 사용하고 있었는데 생각보다 로딩속도도 느리고 로딩중에는 폰트가 보이지 않아서 답답한 구석이 많았습니다.  
다른 방법이 있을까 찾아보다가 javascript로 로딩을 하는 방법이 있길래 소개드립니다.

#### webfontloader.js ####

[Web Font Loader][webfontloader]

[Google][google]과 [Typekit][typekit]이 공동 개발한 자바스크립트 라이브러리입니다. 기본적으로 구글 폰트를 편리하게 불러올 수 있고 기존의 css에서는 폰트를 그대로 사용할 수 있습니다.

{% highlight html %}
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script>
  WebFont.load({
    google: {
      families: ['Droid Sans', 'Droid Serif']
    }
  });
</script>
{% endhighlight %}

만일 나눔 고딕을 사용하러면 나눔고딕은 early access이므로 따로 설정 해주셔야합니다.

{% highlight html %}
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script>
  WebFont.load({
    custom: {
      families: ['Nanum Gothic'],
      urls: ['http://fonts.googleapis.com/earlyaccess/nanumgothic.css']
    }
  });
</script>
{% endhighlight %}

비동기적으로 로딩하러면 다음과 같은 코드를 사용하면 됩니다.

{% highlight html %}
<script>
   WebFontConfig = {
      custom: {
	      families: ['Nanum Gothic'],
	      urls: ['http://fonts.googleapis.com/earlyaccess/nanumgothic.css']
	    }
   };

   (function(d) {
      var wf = d.createElement('script'), s = d.scripts[0];
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      wf.async = true;
      s.parentNode.insertBefore(wf, s);
   })(document);
</script>
{% endhighlight %}

[webfontloader]: https://github.com/typekit/webfontloader
[google]: http://www.google.com/
[typekit]: http://www.typekit.com/
