---
layout: post
title:  "Jeykll로 블로그 제작하기"
writer: "배진환"
date:   2016-12-30 12:00:00 +0900
tags: jekyll tag search start
---
연말을 맞아 새심 귀찮았던 블로그를 다시 마음을 잡고 쓰려고 합니다

예전에 네이버와 티스토리를 써왔는데 친구의 추천으로 [Jekyll][jekyll-home]를 이용하여 Github page로 만들어 보았습니다.

퍼블리싱도 경험이 있고 문서를 읽고 사용하는건 어렵지 않으니 1주일 정도만에 다 만들겠지라고 생각했지만 시간에 쫓겨서(...) 꽤나 오래걸렸습니다.

***

만들면서 문서를 중점으로 참고하였고 [Materializecss][materializecss]를 사용하였습니다. 만들면서 어려웠던 부분, 공유하면 좋을 것 같은 것들을 써보려 합니다.

#### Jekyll ? ####

> Jekyll 은 아주 심플하고 블로그 지향적인 정적 사이트 생성기입니다. Jekyll 은 다양한 포맷의 원본 텍스트 파일을 템플릿 디렉토리로부터 읽어서, (Markdown 등의) 변환기와 Liquid 렌더러를 통해 가공하여, 당신이 즐겨 사용하는 웹 서버에 곧바로 게시할 수 있는, 완성된 정적 웹사이트를 만들어냅니다. 그리고 Jekyll 은 GitHub Pages 의 내부 엔진이기도 합니다. 다시 말해, Jekyll 을 사용하면 자신의 프로젝트 페이지나 블로그, 웹사이트를 무료로 GitHub 에 호스팅 할 수 있다는 뜻입니다.

_지킬 한글 번역 문서에 쓰여진 내용 - [Jekyll-docs-kr][jekyll-docs-kr]_

Jekyll은 Github에 무료로 페이지나 블로그를 호스팅 할 수 있습니다!  
Jekyll은 ruby로 만들어졌고 사이트를 랜더링할 때 쓰이는 Liquid는 루비로 작성된 템플릿 언어입니다.  
몇가지 명령어를 활용하여 시작할 수 있습니다.
`jekyll new [myblog-name]`, `jekyll serve`

설치방법은 문서에 잘 나와있으니 넘어가도록 하겠습니다.

#### Jekyll에서 검색 ####

Github page에서는 jekyll의 플러그인이 작동하지 않습니다. 검색 기능을 넣으려면 다른 방법으로 만들어야 합니다.  
갓 구글의 검색으로 정보를 종합하여 시나리오를 작성해보았습니다.  

- 각각 글의 정보가 담긴 파일을 생성한다. ex) tags.json
- /search 페이지를 만들어 url의 paramater를 읽어 검색어를 가지고와 ajax로 tags.json파일을 요청한다.
- ajax로 파일을 가져오면 javascript로 검색하여 해당하는 정보만 body에 보여준다.

full text 검색은 블로그 초기엔 필요가 없다고 판단하여 간단히 태그 검색만 구현하였습니다.

##### 태그 검색 #####

처음 생각으론 어짜피 로컬에서 글을 쓰고 글을 확인한 후에 업로드를 하니 로컬에서 한번쯤은 Jekyll을 실행하니까 \_plugins에 플러그인을 작성하여 실행 시 마다 post의 tag들을 가져와 json파일을 만들려고 했습니다.  

_\_plugins\tags_build.rb_
{% highlight ruby %}
require "json"
module Jekyll

   class VersionReporter < Generator
      def generate(site)
         json_data = {}
         if site.config['tag_build'] == true
           for tag in site.tags.keys
             json_data[tag] = [];
             for post in site.tags[tag]
               json_data[tag].push({"url"=> post.url,
                 "title" => post.data['title'],
                 "tags": post.data['tags']
                 #other content add..
                 })
             end
           end

          File.open(File.join("tags.json"), "w+") do |f|
             f.write(JSON.generate(json_data))
          end
         end
      end
   end

end
{% endhighlight %}

문서를 다시 읽어보던 중 site 전역변수에 tags를 발견하여 이것을 이용하여 페이지를 만들어서 플러그인을 사용하지 않고도 태그 검색을 구현할 수 있겠다 싶어서 html 파일이지만 형태는 json으로 만들어서 js에서 JSON.parse로 json 변환하여 사용하였습니다.

_/tags.html_
{% highlight liquid %}
{% raw %}
---
layout: none
title: test
permalink: /tags
---
{
  {% for tag in site.tags %}
    "{{tag[0]}}" : [
      {% for post in tag[1] %}
        {
        "title" : "{{ post.title }}",
        "date" : "{{ post.date | date: '%Y-%m-%d %H:%M KST' }}",
        "content" : "{{ post.content | strip_html | truncatewords: 80, "..." }}",
        "url" : "{{ post.url }}",
        "writer" : "{{ post.writer }}",
        "tags" : ["{{ post.tags | join: '","' }}"]
        }
        {% if forloop.last != true %},{% endif %}
      {% endfor %}
    ]
    {% if forloop.last != true %},{% endif %}
  {% endfor %}
}
{% endraw %}
{% endhighlight %}

_/search.html_
{% highlight html %}
{% raw %}
---
layout: none
title: Search
permalink: /search
---
<!DOCTYPE html>
<html lang="ko">
  <head>
    {% include head.html %}
  </head>
  <body>
    {% include navbar.html %}
    <main>
      <section>
        <div class="container">
          <div class="row" id="result">
            <h3><span id="query">${query}</span> 검색 결과</h3>
          </div>
        </div>
      </section>
    </main>
    {% include footer.html %}
    {% include modal.html %}
    {% include script.html %}
    <script>
      //querystring 가져오기(없다면 빈문자열 저장)
      var q = location.search.split('?q=')[1]?decodeURIComponent(location.search.split('?q=')[1]):'';
      //검색어를 #query의 innerhtml에 escape하여 넣기
      $("#query").html('\"'+q.replace(/</g, "&lt;").replace(/>/g, "&gt;")+'\"');
      $.ajax({
        url: '{{ "/tags" | relative_url }}',
        success: function(data) {
          //data를 json형태로 저장
          var json_data = JSON.parse(data);
          if(q in json_data) {
            //each로 json_data[q]의 값들을 저장 후 #result에 append
            $.each(json_data[q], function(index, value) {
              var output = '';
              output += '<div class=\"col s12 \">';
              output += '<div class="post-list">';
              output += '  <h4>';
              output += '    <a href="'+value.url+'">';
              output += '      '+value.title;
              output += '    </a>';
              output += '  </h4>';
              output += '  <div class="row post-info">';
              output += '    <div class="col s6 left-align">';
              output += '      <p>'+value.writer+'</p>';
              output += '    </div>';
              output += '    <div class="col s6 right-align">';
              output += '      <p>'+value.date+'</p>';
              output += '    </div>';
              output += '  </div>';
              output += '  <p class="post-content">';
              output += '    <a href="'+value.url+'">'+value.content+'</a>';
              output += '  </p>';
              output += '  <ul class="post-tags">';
              $.each(value.tags, function(index, tag) {
                if ( tag == q) {
                  output += '      <li class="active"><a href="/search?q='+tag+'"># '+tag+((index == value.tags.length-1)?'':',')+'</a></li>';
                } else {
                  output += '      <li><a href="/search?q='+tag+'"># '+tag+((index == value.tags.length-1)?'':',')+'</a></li>';
                }
              })
              output += '  </ul>';
              output += '</div>';
              output += '<hr class="post-hr">';
              output += '</div>';
              $("#result").append(output);
              console.log(value);
            });
          } else {
            var output = '';
            output += '<div class=\"col s12 \">';
            output += '<h3>검색 결과가 없습니다.</h3>';
            output += '</div>';
            $("#result").append(output);
          }
        }
      })
    </script>
  </body>
</html>
{% endraw %}
{% endhighlight %}

현재는 검색이 빨라서 따로 로딩처리는 하지 않았으나 데이터가 많아져 검색에 시간이 걸리는 경우에는 로딩처리 로직을 구현하는게 좋겠습니다.

[jeykll-home]: https://jekyllrb.com/
[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-docs-kr]: https://jekyllrb-ko.github.io/docs/home/
[materializecss]: http://materializecss.com/
