---
layout: post
title:  "nodejs로 Google Container Registry에 오래된 이미지들 삭제하기"
writer: "배진환"
date:   2020-09-15 16:00:00 +0900
tags: node gcr docker
description: "nodejs로 Google Container Registry에 오래된 이미지들 삭제하기"
---
# Intro
최근 개발서버를 kubernets로 이전하면서 Jenkins로 image 빌드 및 푸시, deployment rollout 자동화를 설정해놨는데 
Google Container Registry(이후 gcr로 부르겠습니다)에 이미지들이 무시할 수 없을만큼 쌓이기 시작해서 옛날 빌드를 삭제해야하는 상황.  
수동으로 일일히 보면서 삭제하기보다는 스크립트를 하나 만들어서 jenkins에 연동하면 좋겠다고 생각이 들어서 만들기 시작했습니다.

하지만 자바에서 JIB로 빌드하면서 특성상 Created Time을 설정하지 않으면 timestamp 값이 0이 된다. gcloud 명령어로 쉽게 만들려고 했던 계획은 
크게 틀어져서 일이 커지게 되는데..

# gcloud container images 명령어 살펴보기
먼저 했던 일은 gcloud 명령어를 찾아보는 것이였습니다.  
https://cloud.google.com/sdk/gcloud/reference/container/images/list-tags 여기서 찾은 명령어로 java 이미지를 리스트 해봤는데
```
$ gcloud container images list-tags gcr.io/[PROJECT_ID]/[IMAGE_NAME]
DIGEST        TAGS    TIMESTAMP
2b2ce30d06b8          1970-01-01T09:00:00
2f4893805a1d          1970-01-01T09:00:00
3a64e46d0000          1970-01-01T09:00:00
77276058674d          1970-01-01T09:00:00
998d4e46b89c  latest  1970-01-01T09:00:00
b11882404663          1970-01-01T09:00:00
cc6404ad054f          1970-01-01T09:00:00
cf475b84dd57          1970-01-01T09:00:00
```
앞서 말했듯 timestamp 값이 0이여서 순서는 digest 이름 순으로 정렬되면서 기대했던 최근 업로드 시간 정렬이 아니였습니다.  
구글을 열심히 뒤져봤지만 해당 명령어에선 createdTime만 파싱해서 TIMESTAMP를 만드는 듯 싶었어요.

아무래도 API 상으로 처리해야겠다고 계획을 돌린채 GCR API를 찾으려고 하는데 gcloud에서 눈에 띄던 옵션 한가지
## log-http Option
해당 옵션을 키면 아무래도 http 요청을 로그로 내보내주나 봅니다. API 응답 데이터에 뭐가 있는지 확인하기 위해 `--log-http`를 추가했습니다.

일부 정보를 가리거나 생략했습니다.
```
$ gcloud container images list-tags gcr.io/[PROJECT_ID]/[IMAGE_NAME] --log-http
=======================
==== request start ====
uri: https://gcr.io/v2/
method: GET
== headers start ==
b'content-type': b'application/json'
b'user-agent': b'google-cloud-sdk [...ETC]'
== headers end ==
== body start ==

== body end ==
==== request end ====
---- response start ----
status: 401
-- headers start --
-content-encoding: gzip
content-type: application/json
.
.
.
[ETC HEADERS]
.
.
.
-- headers end --
-- body start --
{"errors":[{"code":"UNAUTHORIZED","message":"Unauthorized access."}]}
-- body end --
total round trip time (request+response): 0.193 secs
---- response end ----
----------------------
=======================
==== request start ====
uri: https://gcr.io/v2/token?scope=repository%3A[PROJECT_ID]%2F[IMAGE_NAME]%3Apull&service=gcr.io
method: GET
== headers start ==
b'Authorization': --- Token Redacted ---
b'content-type': b'application/json'
b'user-agent': b'google-cloud-sdk [...ETC]'
== headers end ==
== body start ==

== body end ==
==== request end ====
---- response start ----
status: 200
-- headers start --
-content-encoding: gzip
content-type: application/json
.
.
.
[ETC HEADERS]
.
.
.
-- headers end --
-- body start --
{"expires_in":43200,"issued_at":"2020-09-13T21:42:30.844703449-07:00","token":"[DOCKER_REGISTRY_TOKEN]"}
-- body end --
total round trip time (request+response): 0.076 secs
---- response end ----
----------------------
=======================
==== request start ====
uri: https://gcr.io/v2/[PROJECT_ID]/[IMAGE_NAME]/tags/list
method: GET
== headers start ==
b'Authorization': --- Token Redacted ---
b'user-agent': b'google-cloud-sdk [...ETC]'
== headers end ==
== body start ==

== body end ==
==== request end ====
---- response start ----
status: 200
-- headers start --
-content-encoding: gzip
content-type: application/json
.
.
.
[ETC HEADERS]
.
.
.
-- headers end --
-- body start --
{
   "child":[
      
   ],
   "manifest":{
      "[IMAGE_DIGEST]":{
         "imageSizeBytes":"114683291",
         "layerId":"",
         "mediaType":"application/vnd.docker.distribution.manifest.v2+json",
         "tag":[
            
         ],
         "timeCreatedMs":"0",
         "timeUploadedMs":"1597194959140"
      },
      "[IMAGE_DIGEST]":{
         "imageSizeBytes":"114529934",
         "layerId":"",
         "mediaType":"application/vnd.docker.distribution.manifest.v2+json",
         "tag":[
            "latest"
         ],
         "timeCreatedMs":"0",
         "timeUploadedMs":"1599183292887"
      },
      "[IMAGE_DIGEST]":{
         "imageSizeBytes":"114529896",
         "layerId":"",
         "mediaType":"application/vnd.docker.distribution.manifest.v2+json",
         "tag":[
            
         ],
         "timeCreatedMs":"0",
         "timeUploadedMs":"1598582566115"
      }
   },
   "name":"[PROJECT_ID]/[IMAGE_NAME]",
   "tags":[
      "latest"
   ]
}
-- body end --
total round trip time (request+response): 0.517 secs
---- response end ----
----------------------
DIGEST        TAGS    TIMESTAMP
2b2ce30d06b8          1970-01-01T09:00:00
2f4893805a1d          1970-01-01T09:00:00
3a64e46d0000          1970-01-01T09:00:00
77276058674d          1970-01-01T09:00:00
998d4e46b89c  latest  1970-01-01T09:00:00
b11882404663          1970-01-01T09:00:00
cc6404ad054f          1970-01-01T09:00:00
cf475b84dd57          1970-01-01T09:00:00
``` 

살펴보니 리스트를 불러올때 업로드 시간이 포함되어있는 것을 확인할 수 있습니다.
흐름은 `GET https://gcr.io/v2/` 로 서버가 살아있는지 확인하고 `GET https://gcr.io/v2/token?scope=repository%3A[PROJECT_ID]%2F[IMAGE_NAME]%3Apull&service=gcr.io`
토큰을 얻어와 `https://gcr.io/v2/[PROJECT_ID]/[IMAGE_NAME]/tags/list` 호출인듯 합니다.

찾아보니 https://docs.docker.com/registry/spec/api/ 의 스펙을 사용하는 것 같고 gcloud내의 accessToken을 gcr.io에서 사용하는 accessToken으로 교환해서 쓰는듯 합니다.

이제 프로그래밍만 하면 될 것 같네요 ㅎ

# 코드 계획
먼저 `gcloud auth print-access-token`으로 구글 인증 토큰을 얻어온 후 `https://gcr.io/v2/token` 에 토큰과 scope를 포함하여 요청  
`https://gcr.io/v2/[PROJECT_ID]/[IMAGE_NAME]/tags/list` 호출하여 리스트를 가져오고 업로드 시간순 정렬  
keep할 갯수만큼 남기고 나머지 삭제 호출(삭제 API: https://docs.docker.com/registry/spec/api/#deleting-an-image)

# 완성 코드
삭제할때 한개 한개씩 요청하는 것보다 nodejs의 비동기를 활용해 한꺼번에 요청을 처리하도록 설계했고 또 너무 많이 한꺼번에 요청되면 gcr api 서버도
컴퓨터의 네트워크 리소스도 버티지 못하니 최대 동시에 3개씩 요청하도록 처리했습니다.

해당 소스는 깃에도 올려져있으니 살펴보시기 바래요. https://github.com/jhbae200/gcr-clean

`yarn add flags superagent`

{% highlight js %}
const superagent = require('superagent');
const flags = require('flags');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// 플레그 설정
flags.defineString('repository', undefined, 'Insert Repository to be deleted');
flags.defineInteger('keep', 5, 'Max # of images to keep');

// 플레그 파싱
flags.parse();

// 플레그 검증(repository)
let repoUrlStr = flags.get('repository');
if (repoUrlStr === undefined) {
    throw Error('Repository must not be null.');
}
const repoUrl = new URL(`https://${repoUrlStr}`);
if (!repoUrl.hostname) throw Error('Repository Url hostname not found.');
// gcr.io 주소는 아래와 같기 때문에 해당 주소를 제외한 애들은 애러를 내도록 처리
switch (repoUrl.hostname) {
    case 'gcr.io':
    case 'us.gcr.io':
    case 'eu.gcr.io':
    case 'asia.gcr.io':
        break;
    default:
        throw Error('Repository one of [gcr.io, us.gcr.io, eu.gcr.io, asia.gcr.io].');
}

// 플레그 검증(keep)
let keep = flags.get('keep');
if (keep <= 0) throw Error('Keep must be unsigned.');

// 쉘로 accessToken 얻어오는 함수 
async function gcloudToken() {
    const {stdout, stderr} = await exec('gcloud auth print-access-token');
    if (stderr) {
        throw Error(stderr);
    }
    return stdout.replace('\n', '');
}


// 오래된 빌드 삭제 함수
async function deleteOldBuilds(manifest, registryAccessToken) {
    // 최근 업로드 순으로 정렬
    manifest.sort((a, b) => {
        if (a.timeUploadedMs > b.timeUploadedMs) {
            return -1;
        }
        if (a.timeUploadedMs < b.timeUploadedMs) {
            return 1;
        }
        return 0;
    });
    if (keep >= manifest.length) {
        console.log('There is no images to delete. manifest length: ', manifest.length);
        return [];
    }
    let deleteReqs = [];
    // 한번에 콜하기 위한 배열
    let requestQueue = [];
    for (let i = keep; i < manifest.length; i++) {
        requestQueue.push(
            superagent
                .delete(`${repoUrl.origin}/v2${repoUrl.pathname}/manifests/${manifest[i].key}`)
                .auth(registryAccessToken, {type: 'bearer'}).then(res => ({image: `${repoUrl.hostname}${repoUrl.pathname}@${manifest[i].key}`, status: res.status})).catch(err => {
                return {image: `${repoUrl.hostname}${repoUrl.pathname}@${manifest[i].key}`, status: err.status, reason: 'status: '+ err.status + ', body: ' +JSON.stringify(err.response.body)}
            })
        );
        // request queue가 3개일때 기다리기
        if(requestQueue.length === 3) {
            deleteReqs.push(...await Promise.all(requestQueue));
            requestQueue = [];
        }
    }
    // 아직 처리 못한 request queue가 있는지 확인하고 있다면 기다리기
    if(requestQueue.length > 0) {
        deleteReqs.push(...await Promise.all(requestQueue));
    }
    return deleteReqs;
}

async function main() {
    const googleAccessToken = await gcloudToken();

    // gcr 토큰으로 변환
    const tokenRes = await superagent.get(`${repoUrl.origin}/v2/token`)
        .auth(googleAccessToken, {type: 'bearer'})
        .accept('json')
        .query({scope: `repository:${repoUrl.pathname.substring(1)}:push,pull`, service: repoUrl.hostname});
    const registryAccessToken = tokenRes.body.token;

    const tagListRes = await superagent.get(`${repoUrl.origin}/v2${repoUrl.pathname}/tags/list`)
        .query({n: 99})
        .auth(registryAccessToken, {type: 'bearer'})
        .accept('json');

    const tagList = tagListRes.body;

    // key value 형태의 응답이므로 array로 변환하기
    let manifestArr = [];
    for (let key of Object.keys(tagList.manifest)) {
        manifestArr.push({key: key, ...tagList.manifest[key]});
    }
    const imageResults = await deleteOldBuilds(manifestArr, registryAccessToken);

    // 삭제 성공한 이미지 로그 출력
    console.log('Success Deleted Images:', imageResults.filter(value => value.status === 202).map(value => value.image));
    const failedImages = imageResults.filter(value => value.status !== 202);
    if (failedImages.length > 0) {
        // 삭제 실패한 이미지 로그 출력
        console.log('Failed Deleted Images:', failedImages);
    }
}

main();
{% endhighlight %}


