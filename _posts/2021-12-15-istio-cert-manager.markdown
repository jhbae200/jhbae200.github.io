---
layout: post
title:  "Kubernetes 1.22 이상에서 istio + cert-manager 설정시 ingress 생성 문제"
writer: "배진환"
date:   2021-01-27 16:00:00 +0900
tags: istio cert-manager kubernetes 
---
`networking.k8s.io/v1beta1, IngressClass`가 k8s 버전 1.22에서 제거되면서 `ClusterIssuer`에서 ingress class가 
istio일때 renew시 해당 IngressClass를 찾지 못해서 ignress 생성이 영원히 되지않는 경우가 생긴다.

해당 IngressClass를 생성해두면 ingress가 정상적으로 생성된다.

```
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: istio
  namespace: istio-system
spec:
  controller: istio.io/ingress-controller
```

