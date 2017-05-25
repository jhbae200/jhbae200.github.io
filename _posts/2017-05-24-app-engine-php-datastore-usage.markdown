---
layout: post
title:  "app engine php datastore 사용하기"
writer: "배진환"
date:   2017-05-24 17:11:25 +0900
tags: appengine php php-gds
description: "app engine에서 datastore 사용하기 및 php-gds 라이브러리 사용시 select 후 update를 하면 type이 string으로 변하는 문제 해결"
---

app engine php 환경에서 datastore를 사용하려는데 번들되어있는 구글sdk를 쓰려니까 설계부터 복잡하기도 하고 내장되어있는 datastore sdk의 버전도 v1bete3이길래 다른 라이브러리를 찾다가 좀 더 쉽고 간단하게 만들 수 있는 [php-gds][php-gds]가 눈에 들어왔다.  
php-gds와 silex를 이용해 간단한 api 서버를 구성해보고 발생하는 문제점을 해결하고 리펙토링(!)까지 해보도록 하겠다.

#1.app engine php project 생성 및 구성
먼저 앱 실행에 필요한 app.yaml, 의존성 관리를 위한 [composer][composer]를 구성하도록 한다.

_/app.yaml_
{% highlight yaml %}
runtime: php55
#application: [your-project-id]
api_version: 1
threadsafe: yes

skip_files:
- ^(.*/)?#.*#$
- ^(.*/)?.*~$
- ^(.*/)?.*\.py[co]$
- ^(.*/)?.*/RCS/.*$
- ^(.*/)?\..*$
- ^\.idea$
- ^tools$

handlers:
- url: /favicon\.ico
  static_files: favicon.ico
  upload: favicon\.ico
- url: .*
  script: web/index.php
{% endhighlight %}

_/composer.json_
{% highlight json%}
{
  "require": {
    "silex/silex": "~2.1",
    "twig/twig": "~1.28|~2.0",
    "symfony/twig-bridge": "~3.2.8",
    "tomwalder/php-gds": "~v3.0.1"
  },
  "require-dev": {
    "google/appengine-php-sdk": "~1.9",
    "symfony/yaml": "~3.2"
  },
  "authors": [
    {
      "name": "jinhwan",
      "email": "jhbae200@gmail.com"
    }
  ],
  "autoload": {
    "psr-4": {
      "Jhbae\\GdsExample\\": ["src"]
    }
  }
}
{% endhighlight %}
#2.코드 작성
directory tree view
~~~~
.
├── app.yaml
├── composer.json
├── composer.lock
├── favicon.ico
├── index.yaml
├── php.ini
├── src
│   ├── app.php
│   ├── controller
│   │   └── ApiController.php
│   ├── controllers.php
│   └── datamodel
│       └── DataStore.php
├── templates
└── web
    └── index.php
~~~~

composer의 autoload기능으로 인해 src 디렉토리의 php파일 중에서 namespace가 Jhbae\\GdsExample\\ 인 파일들은 require vendor/autoload.php로 자동적으로 로드 될 것이다.

src/controller/ApiController.php 컨트롤러 마운트를 하고 web/index.php에서 app.php, controllers.php를 require 한다.
자세한 코드는 [GdsExample][GdsExample] 깃허브를 참고하기 바란다.

## DataStore.php
{% highlight php %}
<?php

/**
 * Created by IntelliJ IDEA.
 * User: Jinhwan
 * Date: 2017-05-24
 * Time: 오후 1:58
 */

namespace Jhbae\GdsExample\DataModel;

use google\appengine\api\modules\ModulesService;

class DataStore
{
    const KIND_NOTIFICATION = 'Notification';

    public function addNotification($userId, $targetUserId, $message)
    {
        $store = $this->getStore(self::KIND_NOTIFICATION);
        $entity = $store->createEntity(array(
            'userId' => $userId,
            'targetUserId' => $targetUserId,
            'message' => $message,
            'isRead' => false,
            'registeredTime' => (new \DateTime('now'))
        ));
        $store->upsert($entity);

        return $entity;
    }

    private function getStore($kind)
    {
        $storeGateway = new \GDS\Gateway\ProtoBuf(null, self::getNamespace());
        $store = new \GDS\Store($kind, $storeGateway);

        return $store;
    }

    private function getNamespace()
    {
        return ModulesService::getCurrentModuleName();
    }

    public function getNotification($targetUserId, $last, $count)
    {
        $store = $this->getStore(self::KIND_NOTIFICATION);
        $gql = "SELECT * FROM " . self::KIND_NOTIFICATION . " WHERE targetUserId = @targetUserId ORDER BY registeredTime DESC";
        $store->query($gql, ['targetUserId' => (int)$targetUserId]);
        $results = array();
        $notifications = $store->fetchPage($count, $last);
        foreach ($notifications as &$notification) {
            $this->updateIsRead($notification);
            array_push($results, $notification->getData());
        }
        return $results;
    }

    public function updateIsRead($notification)
    {
        $store = $this->getStore(self::KIND_NOTIFICATION);

        $notification->isRead = true;
        $store->upsert($notification);
    }
}
{% endhighlight %}

위의 코드가 좋은 코드는 아니다. 단지 테스트를 위해 급하게 만들었을 뿐. 나중에 리펙토링하도록 하자.  
datastore에서 핵심은 데이터를 select하고 데이터들의 isRead값을 true로 변경하고 반영한다는 것이다.
Notification에 몇몇 데이터를 밀어넣고 Notification을 가져오면 것보기엔 정상적으로 가져온 것처럼 보이나
datastore를 보면 각각 칼럼들의 데이터 타입이 string(!!)으로 변경되어있다. 단순히 isRead를 true로 변경했을 뿐인데 다른 칼럼들의 데이터 타입이 string으로 변경되어 버리면 다른코드에서 문제를 일으킬 가능성이나 index에 안좋은 영향을 미칠 수 있다.

<div class="row">
  <div class="col s12">
    <img class="materialboxed2" src="/assets/img/post/20170524-1/1.png" width="100%" attr="1.png"/>
  </div>
</div>

isRead값이 true로 바뀐 것을 볼 수 있다. 이 중 update가 되지않은 엔티티 하나와 update된 엔티티를 비교해보았다.

<div class="row">
  <div class="col s6">
    <img class="materialboxed2" src="/assets/img/post/20170524-1/2.png" width="100%" attr="2.png"/>
  </div>
  <div class="col s6">
    <img class="materialboxed2" src="/assets/img/post/20170524-1/3.png" width="100%" attr="3.png"/>
  </div>
</div>

isRead를 제외한 모든 데이터가 string으로 변경되어 있다.

해결을 위해 schema를 정의해준다.

_datamodel/DataStore.php_
{% highlight php %}
class DataStore
{
  /* something code.. */
    private function getNotificationSchema()
    {
        return (new Schema(self::KIND_NOTIFICATION))
            ->addInteger('targetUserId')
            ->addInteger('userId')
            ->addBoolean('isRead')
            ->addString('message')
            ->addDatetime('registeredTime');
    }
}
{% endhighlight %}

store를 생성할때 `$store = $this->getStore($this->getNotificationSchema());`으로 생성하여 스키마를 정의해준다.  
다시 `GET /api/notification`을 호출하여 isRead값을 업데이트 해도 데이터 타입이 변경되지 않는 것을 확인할 수 있다.

<div class="row">
  <div class="col s12">
    <img class="materialboxed2" src="/assets/img/post/20170524-1/4.png" width="100%" attr="4.png"/>
  </div>
</div>


[php-gds]: https://github.com/tomwalder/php-gds
[GdsExample]: https://github.com/jhbae200/GdsExample
