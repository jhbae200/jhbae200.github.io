---
layout: post
title:  "jenkins에서 kubernetes deployment rollout 기다리기"
writer: "배진환"
date: 2020-09-10 15:31:00 +0900
tags: kubernetes jenkins
---
jenkins로 이미지를 빌드해서 롤아웃 요청을 보내는데 롤아웃 성공 여부와 관계없이 빌드가 
항상 성공으로 나와 롤아웃이 다 될때까지 jenkins 빌드가 기다리게끔 설정해봤습니다.

기준은 java gradle jib build 기준으로 작성했습니다.

핵심은 롤아웃 이후에 `kubectl rollout status deployment/${DEPLOYMENT_NAME}` 명령으로 해당 작업부하가 롤아웃이 완료될때까지 기다리는 것입니다.

# Gradle script 
{% highlight shell %}
clean
jib --image=${IMAGE_URL} --console=plain
{% endhighlight %}

# Execute shell
{% highlight shell %}
cd $WORKSPACE
if [ ! -f build/jib-image.digest ] ; then
    echo 'File "build/jib-image.digest" is not there, aborting.'
    exit 1
fi
kubectl set image deployment/${DEPLOYMENT_NAME} ${CONTAINER_NAME}=${IMAGE_URL}@$(cat build/jib-image.digest)
kubectl rollout status deployment/${DEPLOYMENT_NAME} --timeout=120s
{% endhighlight %}
`$WORKSPACE`로 이동후 jib build에서 나온 이미지 digest가 이미지 주소에 쓰일 예정입니다. (image id)  
쉘스크립트로 해당 파일 체크후 만약 파일이 없으면 이미지 주소가 정확하지 않으므로 exit로 빌드 실패를 내게끔 쉘을 작성했습니다.

이미지를 set해서 롤아웃 요청을 하고 `kubectl rollout status`로 해당 deployment에 새로운 버전이 잘 올라오는지 확인합니다.  
timeout시간은 해당 시간동안 status가 정상이 안될시 에러로 종료됩니다. 현재 서버 셋팅이 **readinessProbe initialDelay 55초, livenessProbe initialDelay 48초** 이므로 넉넉하게 잡아줬습니다.

# Console output
## 성공시
{% highlight shell %}
...
...
+ kubectl rollout status deployment/${DEPLOYMENT_NAME} --timeout=120s
Waiting for deployment spec update to be observed...
Waiting for deployment "${DEPLOYMENT_NAME}" rollout to finish: 0 out of 1 new replicas have been updated...
Waiting for deployment "${DEPLOYMENT_NAME}" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "${DEPLOYMENT_NAME}" rollout to finish: 1 old replicas are pending termination...
deployment "${DEPLOYMENT_NAME}" successfully rolled out
{% endhighlight %}
## timeout 실패시
{% highlight shell %}
...
...
+ kubectl rollout status deployment/${DEPLOYMENT_NAME} --timeout=120s
Waiting for deployment "${DEPLOYMENT_NAME}" rollout to finish: 1 old replicas are pending termination...
error: timed out waiting for the condition
{% endhighlight %}
