---
layout: post
title:  "Polymer를 사용하여 github page 꾸미기"
writer: "배진환"
date:   2017-07-17 17:40:00 +0900
tags: Polymer Jekyll
---
최근에 [Angular][Angular]와 [React][React]의 사용 하면서 이전의 [jQuery][jQuery]와 그 외 다수의 플러그인을 사용할 때보다 많이 빠른 것을 느끼면서 지금 사용하고 있는 이 블로그도 빠른 웹을 위해 변경할 필요가 있다고 느껴서 Angular와 React는 이미 사용해봤으므로 [Polymer][Polymer]를 사용하여 블로그를 변경해보았습니다. 간단한 소개와  Polymer를 [Github Page][Github-Page]에 적용 시 문제점 등을 공유해보려 합니다.

~~언젠간 Polymer 사용하기라는 제목으로 Polymer에 대한 글을 자세히 쓰겠죠..~~

# Polymer
> Polymer는 사용자 정의 재사용 가능한 HTML 요소를 만들고이를 사용하여 효율적이고 유지
보수가 가능한 앱을 제작하는 데 도움이되는 JavaScript 라이브러리입니다.

구글 번역이 저보다 더 뛰어나군요.  
어쨋든 React와 Angular하고 비슷하게? 재사용 가능한 요소를 만들고 사용할 수 있게 도움을 주는 JavaScript 라이브러리 입니다.

필요한 Component가 있으면 [WebComponent][WebComponent]에서 검색 후 [bower][bower] install로 설치해서 사용하면 됩니다.

# Github Page에서 Polymer
Github Page의 특정상 루트 도메인 아래의 콘텐츠들을 index.html로 연결할 수는 없으니 조금 다르게 생각을 해야 했습니다.

* Polymer의 기능으로 route를 변경했을 때 location이 변경된 상태(ex: https://jhbae200.github.io/home)에서 새로고침 시 404페이지로 가버리는 것
* markdown으로 작성한 포스트의 연결
* 다른 정적페이지..?
* 일반 github.io 도메인으로는 h2 프로토콜이 아니므로 [PWA(Progresive Web App)][PWA]을 적용하지 못함
* `polymer build`로 bundle, minify, polyfill 작업 후 나오는 index.html에서 jekyll parsing 오류
* [SEO][SEO] 적용

일단 디렉토리의 구조는 이렇습니다.

~~~~
.
├─images
│  └─manifest
├─paginate
├─src
│  ├─my-about
│  ├─my-app
│  ├─my-home
│  ├─my-pagination
│  └─my-post
├─test
├─_includes
├─_layouts
└─_posts
~~~~

하나하나 답변을 달아보자면..

## Polymer의 기능으로 route를 변경했을 때 location이 변경된 상태(ex: https://jhbae200.github.io/home)에서 새로고침 시 404페이지로 가버리는 것

app-location Component에서 `use-hash-as-path` 옵션으로 hashtag를 사용해서 페이지 이동을 하면 location이 변경되어도 index.html을 불러옵니다.  
페이지 내에서 열심히 돌려도 github의 404페이지로 가지 않겠죠.ㅎㅎ

: _/src/my-app/index.html_
{% highlight html %}
---
---
<link rel="import" href="/bower_components/polymer/polymer-element.html">
<link rel="import" href="/bower_components/app-layout/app-drawer/app-drawer.html">
<link rel="import" href="/bower_components/app-layout/app-drawer-layout/app-drawer-layout.html">
<link rel="import" href="/bower_components/app-layout/app-header/app-header.html">
<link rel="import" href="/bower_components/app-layout/app-header-layout/app-header-layout.html">
<link rel="import" href="/bower_components/app-layout/app-scroll-effects/app-scroll-effects.html">
<link rel="import" href="/bower_components/app-layout/app-toolbar/app-toolbar.html">
<link rel="import" href="/bower_components/app-route/app-location.html">
<link rel="import" href="/bower_components/app-route/app-route.html">
<link rel="import" href="/bower_components/iron-pages/iron-pages.html">
<link rel="import" href="/bower_components/iron-icon/iron-icon.html">
<link rel="import" href="/bower_components/iron-selector/iron-selector.html">
<link rel="import" href="/bower_components/paper-icon-button/paper-icon-button.html">

<link rel="import" href="/src/shared-styles.html">
<link rel="import" href="/src/my-icons.html">
<link rel="import" href="/src/my-search-bar.html">
<link rel="import" href="/src/my-snackbar.html">

<link rel="lazy-import" href="/src/my-home/index.html">
<link rel="lazy-import" href="/src/my-post/index.html">
<link rel="lazy-import" href="/src/my-about/index.html">
<link rel="lazy-import" href="/src/my-view404.html">
<link rel="import" href="/src/my-network-warning.html">

<dom-module id="my-app">
{{'{'}}% raw %}{% raw %}
    <template>
        <style include="shared-styles">
          /*
          something css code
          */
        </style>
        <app-location route="{{route}}" use-hash-as-path=""></app-location>
        <app-route
                route="{{route}}"
                pattern="!/:page"
                data="{{routeData}}"
                tail="{{subroute}}"></app-route>

        <app-drawer-layout fullbleed>
            <!-- Drawer content -->
            <app-drawer id="drawer" slot="drawer">
                <app-toolbar>Menu</app-toolbar>
                <iron-selector selected="[[routeData.page]]" attr-for-selected="name" class="drawer-list"
                               role="navigation">
                    <a name="home" href="#!/home/">
                        <iron-icon icon="my-icons:home"></iron-icon>
                        Home</a>
                    <a name="about" href="#!/about">
                        <iron-icon icon="my-icons:person"></iron-icon>
                        About</a>
                    <a name="feed" href="/feed.xml" target="_blank">
                        <iron-icon icon="my-icons:rss-feed"></iron-icon>
                        Rss Feed</a>
                    <hr>
                    {% endraw %}{{'{'}}% endraw %}{% raw %}
                    {% if site.github_username %}
                    <a name="github" href="https://github.com/{{site.github_username}}">
                        <iron-icon icon="my-icons:github"></iron-icon>
                        Github</a>
                    {% endif %}
                    {% if site.email %}
                    <a name="email" href="mailto:{{site.email}}">
                        <iron-icon icon="my-icons:email"></iron-icon>
                        Email</a>
                    {% endif %}
                    {% endraw %}{{'{'}}% raw %}{% raw %}
                    <hr>
                    <div class="copyright">© 2016, Jinhwan Bae</div>
                </iron-selector>
            </app-drawer>

            <!-- Main content -->
            <app-header-layout has-scrolling-region>

                <app-header slot="header" condenses reveals effects="waterfall">
                    <app-toolbar>
                        <paper-icon-button icon="my-icons:menu" drawer-toggle></paper-icon-button>
                        <div main-title>{% endraw %}{{ site.title }}{% raw %}</div>
                        <my-search-bar active="{{searchActive}}"></my-search-bar>
                    </app-toolbar>
                </app-header>

                <iron-pages
                        selected="[[page]]"
                        attr-for-selected="name"
                        fallback-selection="view404"
                        role="main"
                        selected-attribute="selected">
                    <my-home name="home" route="[[subroute]]"></my-home>
                    <my-post name="post" route="[[subroute]]"></my-post>
                    <my-about name="about"></my-about>
                    <my-view404 name="view404"></my-view404>
                    <my-network-warning name="network-warning"></my-network-warning>
                </iron-pages>
            </app-header-layout>
        </app-drawer-layout>
    </template>
    {% endraw %}{{'{'}}% endraw %}
    <script>
        class MyApp extends Polymer.Element {

            static get is() {
                return 'my-app';
            }

            static get properties() {
                return {
                    page: {
                        type: String,
                        reflectToAttribute: true,
                        observer: '_pageChanged',
                    },
                    oldPage: {
                        type: String,
                    },
                    rootPattern: String,
                    routeData: Object,
                    subroute: String,
                    searchActive: {
                        type: Boolean,
                    },
                };
            }

            static get observers() {
                return [
                    '_routePageChanged(routeData.page)',
                ];
            }

            constructor() {
                super();
                window.performance && performance.mark && performance.mark('my-app.created');
            }

            ready() {
                super.ready();
                // listen for online/offline
                Polymer.RenderStatus.afterNextRender(this, () => {
                    window.addEventListener('online', (e)=>this._notifyNetworkStatus(e));
                    window.addEventListener('offline', (e)=>this._notifyNetworkStatus(e));
                });
            }

            _notifyNetworkStatus() {
                let oldOffline = this.offline;
                this.offline = !navigator.onLine;
                // Show the snackbar if the user is offline when starting a new session
                // or if the network status changed.
                if (this.offline || (!this.offline && oldOffline === true)) {
                    if (!this._networkSnackbar) {
                        this._networkSnackbar = document.createElement('my-snackbar');
                        this.root.appendChild(this._networkSnackbar);
                    }
                    this._networkSnackbar.innerHTML = this.offline ?
                        'You are offline' : 'You are online';
                    this._networkSnackbar.open();
                }
                if (this.offline === false) {
                    this.page = this.oldPage;
                }
            }

            _routePageChanged(page) {
                this.searchActive = false;
                if (page === undefined) {
                    this.set('route.path', '!/home/');
                    this.page = 'home';
                } else {
                    this.page = page || 'home';
                }
            }

            _pageChanged(page) {
                if (this.offline === true || this.page === 'network-warning') {
                    if (this.page !== 'network-warning') {
                        this.oldPage = this.page;
                    }
                    this.page = 'network-warning';
                    return;
                }
                let resolvedPageUrl = this.resolveUrl('/src/my-' + page + '/');
                Polymer.importHref(
                    resolvedPageUrl,
                    null,
                    this._showErrorPage.bind(this),
                    true);
            }


            _showErrorPage() {
                this.page = 'view404';
            }
        }

        window.customElements.define(MyApp.is, MyApp);
    </script>
</dom-module>
{% endhighlight %}

## markdown으로 작성한 포스트의 연결

markdown으로 작성한 포스트의 layout을 json 형식으로 바꿔버렸습니다.  
content에 워낙 다양한 내용이 있어서 그런지 자꾸 parsing 오류가 나길래 url_encode 해서 화면에 표시할 때 decode 했습니다.

: _/_layouts/post.html_
{% highlight JSON %}
{% raw %}
---
---
{
    "title": "{{ page.title | escape }}",
    "date": "{{ page.date | date: '%Y-%m-%d %H:%M KST' }}",
    "modify": "{{ page.update | date: '%Y-%m-%d %H:%M KST' }}",
    "content": "{{ content | url_encode }}",
    "description": "{{ post.content | strip_html | truncatewords: 70 | url_encode }}",
    "url": "{{ page.url }}",
    "writer": "{{ page.writer | escape }}",
    "tags": ["{{ page.tags | join: '","' }}"]
}
{% endraw %}
{% endhighlight %}

그 후 my-post라는 Component를 만들어주고 `app-route`와 `iron-ajax`를 사용하여 post를 가져왔습니다.

: _/src/my-post/index.html_
{% highlight html %}
{% raw %}
<link rel="import" href="/bower_components/polymer/polymer-element.html">
<link rel="import" href="/bower_components/paper-card/paper-card.html">
<link rel="import" href="/bower_components/paper-styles/paper-styles.html">
<link rel="import" href="/bower_components/paper-button/paper-button.html">
<link rel="import" href="/bower_components/app-route/app-route.html">
<link rel="import" href="/bower_components/iron-ajax/iron-ajax.html">

<link rel="import" href="/src/shared-styles.html">

<dom-module id="my-post">
    <template>
        <style include="shared-styles">
            /*
            something css code
            */
        </style>
        <app-route
                route="{{route}}"
                pattern="/:year/:month/:day/:title/"></app-route>
        <iron-ajax auto url="{{page}}" handle-as="json"
                   last-response="{{response}}" on-error="_onError" on-response="_onSuccess"></iron-ajax>
        <paper-card>
            <div class="card-content">
                <div class="post-header"><h1>[[ response.title ]]</h1></div>
                <div class="post-info">
                    <span class="user">[[ response.writer ]]</span><br>
                    <span class="date">[[ response.date ]]</span><br>
                    <span class="modify">Last Update: [[ response.modify ]]</span>
                </div>
                <div id="post-content"></div>
            </div>
        </paper-card>
    </template>
    <script>
        class MyPost extends Polymer.Element {
            static get is() {
                return 'my-post';
            }

            static get properties() {
                return {
                    page: {
                        type: String,
                        reflectToAttribute: true,
                    },
                    route: Object,
                    response: Object,
                    selected: {
                        type: Boolean,
                        value: false,
                        observer: '_selectedChanged',
                    },
                };
            }

            static get observers() {
                return [
                    '_routePageChanged(route.path)',
                ];
            }

            _routePageChanged(page) {
                if (this.route.prefix !== '!/post') {
                    return;
                }
                this.page = '/post' + page;
            }

            _onError() {
                document.querySelector('my-app').page = 'view404';
            }

            _onSuccess() {
                if (this.response) {
                    let data = this.response.content.replace(/\+/g, '%20');
                    let html = decodeURIComponent(data);
                    this.$['post-content'].innerHTML = html;
                }
                this._selectedChanged();
            }

            _selectedChanged() {
                if (this.response) {
                    document.querySelector('title').innerHTML = this.response.title;
                    document.querySelector('meta[name="description"]').content = this.response.description;
                    document.querySelector('meta[property="og:title"]').content = this.response.title;
                    document.querySelector('meta[property="og:description"]').content = this.response.description;
                    document.querySelector('meta[property="og:url"]').content = '{{ site.url }}{{ site.baseurl }}/#!' + this.response.url;
                }
            }
        }

        window.customElements.define(MyPost.is, MyPost);
    </script>
</dom-module>
{% endraw %}
{% endhighlight %}

## 다른 정적페이지 연결

다른 정적페이지의 연결은 다른 정적페이지의 layout을 WebComponent로 만들면 됩니다. 저는 about페이지 하나만 필요하므로 about으로 고정되어있지만 template을 이용해서 각각에 Component로 만들 수는 있습니다.

: _/_layouts/about.html_
{% highlight html %}
{% raw %}
---
---
<link rel="import" href="/bower_components/polymer/polymer-element.html">
<link rel="import" href="/bower_components/paper-card/paper-card.html">
<link rel="import" href="/bower_components/paper-styles/paper-styles.html">
<link rel="import" href="/bower_components/paper-button/paper-button.html">

<link rel="import" href="/src/shared-styles.html">

<dom-module id="my-about">
    <template>
        <style include="shared-styles">
            :host {
                display: block;

                padding: 10px;
            }

            paper-card {
                width: 100%;
            }

            .post-info .date {
                color: var(--paper-grey-600);
            }
        </style>
        <paper-card>
            <div class="card-content">
                <div class="post-header"><h1>{{ page.title }}</h1></div>
                <div class="post-info">
                    <span class="date">Last Update: {{ page.update | date: '%Y-%m-%d %H:%M KST' }}</span><br>
                </div>
                <div id="post-content">{{ content }}</div>
            </div>
        </paper-card>
    </template>
    <script>
        class MyAbout extends Polymer.Element {
            static get is() {
                return 'my-about';
            }

            static get properties() {
                return {
                    selected: {
                        type: Boolean,
                        value: false,
                        observer: '_selectedChanged',
                    },
                };
            }

            _selectedChanged() {
                let title = '{{ page.title }} | {{ site.title }}';
                let description = `{{ site.description }}`;
                document.querySelector('title').innerHTML = title;
                document.querySelector('meta[name="description"]').content = description;
                document.querySelector('meta[property="og:title"]').content = title;
                document.querySelector('meta[property="og:description"]').content = description;
                document.querySelector('meta[property="og:url"]').content = '{{ site.url }}{{ site.baseurl }}/#!/about';
            }
        }

        window.customElements.define(MyAbout.is, MyAbout);
    </script>
</dom-module>
{% endraw %}
{% endhighlight %}

## PWA 적용

github.io를 그대로 사용한다면 github.io가 h2를 지원해주길 ~~우주에 바랄~~ 바랄 수밖에 없습니다.  
[CloudFlare][CloudFlare]를 사용하여 Github Page에 도메인을 연결하면 된다고는 합니다. 아직 이 블로그에는 적용 전이기 때문에 만약 적용하게 된다면 다시 포스팅이 되겠죠..
참고하실 사이트입니다.  
[https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/][Github-Page-CloudFlare]

## `polymer build`작업 후 나오는 index.html에서 jekyll parsing 오류

polymer로 다 작성 후 `polymer bulid`로 빌드하고 빌드된 파일을 기반으로 app을 실행해보니 polyfill에서 `{{'{%'}}` 또는 `{{'{{'}}`을 포함하고 있어서 그런지 Jekyll에서 parsing error가 발생합니다. glup으로 수동 빌드를 만들어 사용하면 될 것 같았는데 glup을 해당 문제를 해결하기 위해 찾아보다 발견한 것이고 사용해본 적이 없으므로 그냥 손으로 하기로 했습니다. 해봤자 5개의 파일만 수정하면 될 것 같거든요, glup이 익숙해지면 한번 고민해보도록 (...) 하겠습니다.

polymer.json 설정이 조금 필요합니다.

: _polymer.json_
{% highlight JSON %}
{
  "entrypoint": "index.html",
  "shell": "src/my-app/index.html",
  "fragments": [
    "src/my-home/index.html",
    "src/my-post/index.html",
    "src/my-view404.html",
    "src/my-network-warning.html"
  ],
  "sources": [
    "_layouts/about.html",
    "src/**/*",
    "bower.json"
  ],
  "extraDependencies": [
    "manifest.json",
    "bower_components/webcomponentsjs/*.js"
  ],
  "lint": {
    "rules": [
      "polymer-2"
    ]
  },
  "builds": [
    {
      "name": "app",
      "bundle": true,
      "html": {
        "minify": true
      },
      "css": {
        "minify": true
      },
      "js": {
        "minify": true,
        "compile": true
      },
      "addServiceWorker": true
    }
  ]
}
{% endhighlight %}

_layouts/about.html도 Component로 bundling이 필요하므로 sources에 추가해줬습니다.

`polymer build` 후 build directory기준 파일명입니다.

_src/my-app/index.html_

첫 `<script>` 태그 앞에 `{{'{'}}% raw %}`를 붙여주시고 그 뒤로 사용한 `{{'{'}}% raw %}`를 찾아 앞에 `{{'{'}}% endraw %}`를 붙여주시면 앱은 작동합니다.

## SEO 적용

Poylmer는 JavaScript기반의 라이브러리이기 때문에 JavaScript를 실행하지 않는 검색 엔진은 최적화가 불가능 합니다. [server-side-rendering][server-side-rendering]이 지원된다면 앞으론 가능성이 있겠으나 정적페이지인 Github Page에선.. (절래절래)

그래도 구글은 JavaScript를 실행하기 때문에 SEO에 필요한 몇 가지를 Component가 보여질 때 바꿔주면 됩니다.  
iron-pages를 사용하고 있으니 iron-pages의 Attribute로 `selected-attribute="selected"`를 사용하여 각각 Component에서 Attribute Event를 잡을 수 있도록 합니다. 해당 Component에 properties에
~~~~
selected: {
    type: Boolean,
    value: false,
    observer: '_selectedChanged',
},
~~~~
를 추가 하고 `_selectedChanged` 함수에 title과 meta tag들의 값들을 수정합니다.

{% highlight javascript %}
_selectedChanged() {
    if (this.response) {
        document.querySelector('title').innerHTML = this.response.title;
        document.querySelector('meta[name="description"]').content = this.response.description;
        document.querySelector('meta[property="og:title"]').content = this.response.title;
        document.querySelector('meta[property="og:description"]').content = this.response.description;
        document.querySelector('meta[property="og:url"]').content = '{{ site.url }}{{ site.baseurl }}/#!' + this.response.url;
    }
}
{% endhighlight %}

`iron-ajax`의 `last-response`으로 `response`를 지정해서 `this.response`를 사용 중입니다. `response`에서 가져온 정보를 기반으로 title과 meta tag값을 수정하면 일단은 페이지 노출은 될 수 있겠죠..
이후로 sitemap, rss-feed를 만들어 검색엔진에 제출하면 검색엔진은 더 정확하게 크롤링을 할 수 있을겁니다.

의욕만 된다면 PWA적용 후 블로그 글을 읽다 중간에 나갔을 때 마지막 블로그 글 위치로 이동할 수 있게 하는 기능이라든지 검색 기능, 새 글 등록 시 Notification등을 구현하고 싶은데 맘이 안 따라주는 것 같습니다. ㅎㅎㅎㅎㅎ  
천천히 블로그를 업데이트할 테니 이 블로그에 사용한 build전의 소스는 [polymer-jekyll][polymer-jekyll]에 있습니다.

[Angular]: https://angular.io/
[React]: https://facebook.github.io/react/
[jQuery]: https://jquery.com/
[Polymer]: https://www.polymer-project.org/
[Github-Page]: https://pages.github.com/
[WebComponent]: https://www.webcomponents.org/
[bower]: https://bower.io/
[SEO]: https://ko.wikipedia.org/wiki/%EA%B2%80%EC%83%89_%EC%97%94%EC%A7%84_%EC%B5%9C%EC%A0%81%ED%99%94
[PWA]: https://developers.google.com/web/progressive-web-apps/
[CloudFlare]: https://www.cloudflare.com/
[Github-Page-CloudFlare]: https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/
[server-side-rendering]: https://github.com/Polymer/polymer/issues/3955
[polymer-jekyll]: https://github.com/jhbae200/polymer-jekyll
