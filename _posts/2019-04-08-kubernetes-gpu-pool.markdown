---
layout: post
title:  "google kubernetes에서 nvidia driver 버전 특정하기"
writer: "배진환"
date: 2019-04-08 22:45:00 +0900
tags: gke kubernetes gpu
---
Google Kubernetes에서 gpu pool을 사용할 일이 생겨서 클러스터를 새로 생성하는 와중에 nvidia의 드라이버 버전을 최신버전(418)을 
써야하는 이슈가 생겼다. (ffmpeg에서 gpu를 써야하는 상황이였는데 cuda버전이 10.1이였어야 했다.)  
구글 gpu 문서([https://cloud.google.com/kubernetes-engine/docs/how-to/gpus#installing_drivers](https://cloud.google.com/kubernetes-engine/docs/how-to/gpus#installing_drivers))를 
보고 따라했지만 `nvidia-smi` 명령어를 쳐보니 410버전에 cuda 10.0 버전이여서 버전을 변경할 필요가 있어서 
DaemonSet을 재설정해서 포드가 생성될때 인젝션 되는 nvidia driver version을 직접 설정해주었다.

_기존 DaemonSet_
{% highlight yaml %}
...
initContainers:
  - image: "cos-nvidia-installer:fixed"
    imagePullPolicy: Never
    name: nvidia-driver-installer
    resources:
      requests:
        cpu: 0.15
    securityContext:
      privileged: true
...
{% endhighlight %}

**cos-nvidia-installer**를 직접 까보면 entrypoint.sh에 nvidia version이 따로 명시되어 있어서 해당 버전만 바꿔주면 된다. 

[https://github.com/GoogleCloudPlatform/cos-gpu-installer](https://github.com/GoogleCloudPlatform/cos-gpu-installer)

해당 깃을 clone해서 수정을 해보자..

**cos-gpu-installer-docker/entrypoint.sh**에서 `NVIDIA_DRIVER_VERSION="${NVIDIA_DRIVER_VERSION:-410.79}"` 해당 부분을 
`NVIDIA_DRIVER_VERSION="${NVIDIA_DRIVER_VERSION:-418.40.04}"`로 변경한다.

해당 **cos-gpu-installer/cos-gpu-installer-docker** 폴더에서 아래 커멘드를 실행해서 이미지를 gcp에 업로드한다.

`gcloud buils submit --tag gcr.io/[projectId]/cos-gpu-installer .`

DaemonSet을 새로 업로드한 cos-gpu-installer이미지로 설정하고 다시 배포하면 끝.

{% highlight yaml %}
apiVersion: extensions/v1beta1
kind: DaemonSet
metadata:
  name: nvidia-driver-installer
  namespace: kube-system
  labels:
    k8s-app: nvidia-driver-installer
spec:
  template:
    metadata:
      labels:
        name: nvidia-driver-installer
        k8s-app: nvidia-driver-installer
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: cloud.google.com/gke-accelerator
                operator: Exists
      tolerations:
      - operator: "Exists"
      hostNetwork: true
      hostPID: true
      volumes:
      - name: dev
        hostPath:
          path: /dev
      - name: nvidia-install-dir-host
        hostPath:
          path: /home/kubernetes/bin/nvidia
      - name: root-mount
        hostPath:
          path: /
      initContainers:
      - image: "gcr.io/[project-id]/cos-nvidia-installer"
        imagePullPolicy: Never
        name: nvidia-driver-installer
        resources:
          requests:
            cpu: 0.15
        securityContext:
          privileged: true
        env:
          - name: NVIDIA_INSTALL_DIR_HOST
            value: /home/kubernetes/bin/nvidia
          - name: NVIDIA_INSTALL_DIR_CONTAINER
            value: /usr/local/nvidia
          - name: ROOT_MOUNT_DIR
            value: /root
        volumeMounts:
        - name: nvidia-install-dir-host
          mountPath: /usr/local/nvidia
        - name: dev
          mountPath: /dev
        - name: root-mount
          mountPath: /root
      containers:
      - image: "gcr.io/google-containers/pause:2.0"
        name: pause
{% endhighlight %}


cos-gpu-installer에서 쉘 스크립트를 살펴보던 중에 캐시를 활용할 수 있는 것 같은데 추후에 다시 살펴봐야겠다.

gpu 사용할때는 pod에 해당 내용을 추가하면 된다. google kubernetes gpu 문서 항목을 살펴보자. 
{% highlight yaml %}
resources:
  limits:
   nvidia.com/gpu: 2
{% endhighlight %}


gpu사용을 요청하게 되면 포드가 준비되는 시간이 생각보다 오래걸리게 되는데 천천히 기다리면 포드가 준비된다.  
포드에 nvidia driver를 설치하는데에 대한 시간인듯 하다..

gpu리소스를 요청하면 포드당 자동으로 gpu-pool이 늘어나고 사용하지 않는 gpu가 있으면 자동으로 풀 사이즈를 줄인다. 참 스마트하다.
