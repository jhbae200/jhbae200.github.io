---
layout: post
title:  "Elastic 사용기"
writer: "배진환"
date:   2017-05-12 14:51:00 +0900
tags: Elastic ElasticSearch
---
검색 성능을 높이기 위해 Elastic을 도입하면서 공부한것을 내맘대로 정리해보려한다.

#### Elastic ####
> Elasticsearch is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases. As the heart of the Elastic Stack, it centrally stores your data so you can discover the expected and uncover the unexpected.

_Elasticsearch - [Elasticsearch][Elasticsearch]_

거의 실시간이라고 한다. 문서를 색인 할 때 부터 검색가능 할 때까지(일반적으론 1초) 약간의 시간이 필요하다고 한다.

__노드__ 로 구성되며 __클러스터__ 로 그룹짓는다.  
노드는 하나의 서버안에서 하나이상을 구성할수있다.

기본적으로 알아야 할 용어들..
* Index: 색인, 원하는 만큼의 색인을 정의할 수 있다.
* Type: 색인 내에서 더 정의할 수 있는 색인.
* Document: 색인을 생성할 수 있는 기본 단위.
* Shard: 색인을 여러조각으로 나누어 저장. 분산 작업으로 성능/처리량을 향상.
* Replica: 샤드의 복제본. 서로 다른 샤드 복제본을 갖고 노드 장애시 복구 가능.

설치시 주의점
swapping 사용중지
JVM의 힙의 일부가 디스크로 스와핑되면 Elastic의 성능에 안좋은 영향을 미치므로 swapping을 사용 중지하는 것이 좋다.

JVM Heap 사이즈 조정
Elastic은 기본적으로 2GB의 힙 사이즈를 가지고 실행되는데 프로덕트 환경에서는 적절히 조절하여 더 많은 메모리를 사용할 수 있도록 한다.
시스템을 고려하여 적절한 사이즈를 주는 것이 중요할 것 같다..

Kabana 사용하기
웹으로 접속하여 쉽게 쿼리를 테스트 할 수 있고 그 외 모니터링도 가능해서 Elastic에 따라붙는 서비스다.

결과를 적당히 조절하여(size와 from을 이용하여) 응답에 많은 시간이 걸리지 않도록 하기
가능한 큰 쿼리 사용지양
