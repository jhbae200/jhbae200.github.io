---
layout: post
title:  "최근 뻘짓들(Kafka)"
writer: "배진환"
date:   2021-01-27 16:00:00 +0900
tags: kafka gcp aws k8s
---
# [Strimizi Kafka Operator](https://github.com/strimzi/strimzi-kafka-operator) 
kubernetes에서 kafka 운영자 사용   
오픈소스이면서 나름 안정적인듯

# [Strimizi Kafka Operator](https://github.com/strimzi/strimzi-kafka-operator) 랑 [Prometheus Stack](https://github.com/prometheus-operator/prometheus-operator) 통합
Prometheus Stack를 따로 설치해서 Kafka Operator에 있는 예제에서는 그쪽 namespace에 또 프로메테우스를 설치하길래 Prometheus Stack에 통합해서 그대로 메트릭 수집 할 방법을 찾았었음
```
# To update additional settings create a Secret custom resource by using a command below
# kubectl create secret generic additional-scrape-configs --from-file=prometheus-additional.yaml
- job_name: kubernetes-cadvisor
  honor_labels: true
  scrape_interval: 10s
  scrape_timeout: 10s
  metrics_path: /metrics/cadvisor
  scheme: https
  kubernetes_sd_configs:
  - role: node
    namespaces:
      names: []
  bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
  tls_config:
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    insecure_skip_verify: true
  relabel_configs:
  - separator: ;
    regex: __meta_kubernetes_node_label_(.+)
    replacement: $1
    action: labelmap
  - separator: ;
    regex: (.*)
    target_label: __address__
    replacement: kubernetes.default.svc:443
    action: replace
  - source_labels: [__meta_kubernetes_node_name]
    separator: ;
    regex: (.+)
    target_label: __metrics_path__
    replacement: /api/v1/nodes/${1}/proxy/metrics/cadvisor
    action: replace
  - source_labels: [__meta_kubernetes_node_name]
    separator: ;
    regex: (.*)
    target_label: node_name
    replacement: $1
    action: replace
  - source_labels: [__meta_kubernetes_node_address_InternalIP]
    separator: ;
    regex: (.*)
    target_label: node_ip
    replacement: $1
    action: replace
  metric_relabel_configs:
  - source_labels: [container, __name__]
    separator: ;
    regex: POD;container_(network).*
    target_label: container
    replacement: $1
    action: replace
  - source_labels: [container]
    separator: ;
    regex: POD
    replacement: $1
    action: drop
  - source_labels: [container]
    separator: ;
    regex: ^$
    replacement: $1
    action: drop
  - source_labels: [__name__]
    separator: ;
    regex: container_(network_tcp_usage_total|tasks_state|cpu_usage_seconds_total|memory_failures_total|network_udp_usage_total)
    replacement: $1
    action: drop

- job_name: kubernetes-nodes-kubelet
  scrape_interval: 10s
  scrape_timeout: 10s
  scheme: https
  kubernetes_sd_configs:
  - role: node
    namespaces:
      names: []
  bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
  tls_config:
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    insecure_skip_verify: true
  relabel_configs:
  - action: labelmap
    regex: __meta_kubernetes_node_label_(.+)
  - target_label: __address__
    replacement: kubernetes.default.svc:443
  - source_labels: [__meta_kubernetes_node_name]
    regex: (.+)
    target_label: __metrics_path__
    replacement: /api/v1/nodes/${1}/proxy/metrics
```
Prometheus 설치할 namespace에 해당 secret 추가해주고 Prometheus 설치 옵션 수정
```
prometheus:
  ...
  prometheusSpec:
  ...
    additionalScrapeConfigsSecret:
      enabled: true
      name: additional-scrape-configs
      key: prometheus-additional.yaml
  ...
    podMonitorSelector:
      matchLabels:
        app: strimzi # 포드모니터 메트릭 수집할 namespace 지정해주기(기본값으로 두면 모두 선택한다고 되어있는데 그렇게 작동안함)
        
  ...
    additionalRulesForClusterRole:
    - apiGroups: [ "" ]
      resources:
        - nodes
        - nodes/proxy
        - services
        - endpoints
        - pods
      verbs: [ "get", "list", "watch" ]
    - apiGroups:
        - extensions
      resources:
        - ingresses
      verbs: [ "get", "list", "watch" ]
    - nonResourceURLs: [ "/metrics" ]
      verbs: [ "get" ]
```
PodMonitor 설정
```
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: cluster-operator-metrics
  namespace: kafka
  labels:
    app: strimzi
spec:
  selector:
    matchLabels:
      strimzi.io/kind: cluster-operator
  namespaceSelector:
    matchNames:
      - kafka
  podMetricsEndpoints:
  - path: /metrics
    port: http
---
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: entity-operator-metrics
  namespace: kafka
  labels:
    app: strimzi
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: entity-operator
  namespaceSelector:
    matchNames:
      - kafka
  podMetricsEndpoints:
  - path: /metrics
    port: healthcheck
---
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: bridge-metrics
  namespace: kafka
  labels:
    app: strimzi
spec:
  selector:
    matchLabels:
      strimzi.io/kind: KafkaBridge
  namespaceSelector:
    matchNames:
      - kafka
  podMetricsEndpoints:
  - path: /metrics
    port: rest-api
---
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: kafka-resources-metrics
  namespace: kafka
  labels:
    app: strimzi
spec:
  selector:
    matchExpressions:
      - key: "strimzi.io/kind"
        operator: In
        values: ["Kafka", "KafkaConnect", "KafkaConnectS2I", "KafkaMirrorMaker", "KafkaMirrorMaker2"]
  namespaceSelector:
    any: true
  podMetricsEndpoints:
  - path: /metrics
    port: tcp-prometheus
    relabelings:
    - separator: ;
      regex: __meta_kubernetes_pod_label_(.+)
      replacement: $1
      action: labelmap
    - sourceLabels: [__meta_kubernetes_namespace]
      separator: ;
      regex: (.*)
      targetLabel: namespace
      replacement: $1
      action: replace
    - sourceLabels: [__meta_kubernetes_pod_name]
      separator: ;
      regex: (.*)
      targetLabel: kubernetes_pod_name
      replacement: $1
      action: replace
    - sourceLabels: [__meta_kubernetes_pod_node_name]
      separator: ;
      regex: (.*)
      targetLabel: node_name
      replacement: $1
      action: replace
    - sourceLabels: [__meta_kubernetes_pod_host_ip]
      separator: ;
      regex: (.*)
      targetLabel: node_ip
      replacement: $1
      action: replace
```
kafka operator에 메트릭 설정해주면 프로메테우스에서 수집 잘함 굳;

# [Schema Registry](https://github.com/confluentinc/schema-registry) 대신 [Apicurio Registry](https://github.com/Apicurio/apicurio-registry) 사용  
https://github.com/Apicurio/apicurio-registry-demo 이거 말고 설정하는 거 어디서 좀 자세하게 봤었는데 ..

# [kafka-connect-storage-cloud](https://github.com/confluentinc/kafka-connect-storage-cloud) Google Storage 호환 방법..
aws에 맞춰져있는 kafka-connect-storage-cloud와 달리 구글 버전인 [Kafka Connect GCS](https://www.confluent.io/hub/confluentinc/kafka-connect-gcs) 이것도 있지만 유료;;

어떻게 할 방법이 없나 찾다가 https://cloud.google.com/storage/docs/migrating 이거 찾아서 키 셋팅하고 해봤는데 https://cloud.google.com/storage/docs/migrating#methods-comparison 여기보면 멀티파트 업로드가 호환되지 않음ㅠ

다음으로 찾은건 s3 api와 호환된다는 [minio](https://github.com/minio/minio) https://docs.min.io/docs/minio-gateway-for-gcs.html gcs gateway를 지원한다길래 아래와 같이 구조를 생각하고 테스트 해봄

![image](/images/post/20200127/diagram.png)

오 이러니까 된다.. 조금 많이 복잡하긴 하지만 이런 형태로 사용할 순 있을거같다
