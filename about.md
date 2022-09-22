---
layout: about
title: About Me
permalink: /about
sitemap: no
date: 2017-02-24 12:23:00 +0900
update: 2017-04-18 20:59:00 +0900
---
관련 자료는 [https://drive.google.com/open?id=0BygbtABrAJ-8ZTl6bW5lUkYyaHM](https://drive.google.com/open?id=0BygbtABrAJ-8ZTl6bW5lUkYyaHM)에서도 볼 수 있습니다.
1. [프로필](#프로필)
2. [경력사항](#경력사항)
  * [애니펜 (2017-03-21 ~ {{ "now" | date: "%Y-%m-%d" }} 재직중)](#애니펜)
  * [피치트리 (2015-08-01 ~ 2016-02-29 7개월)](#피치트리)
  * [젤리스케치 (2015-03-25 ~ 2015-07-31 4개월)](#젤리스케치)
3. [프로젝트](#프로젝트)
  * [화니소프트 전자결재 (2017-01 ~ 2017-02 약 6주)](#화니소프트-전자결재)
  * [선린라이프 (2014-10 ~ 2014-11 약 4주)](#선린라이프)
  * [DragonRush (2014-08 ~ 2015-8 약 10일)](#dragonrush)
4. [기타](#기타)
  * [창업아이템경진대회](#창업아이템경진대회)

# 학력
2016.02 선린인터넷고등학교 졸업

# 수상 내역
__2017.02__ 한국아이티인재개발원 빅데이터 플랫폼기반 IoT 개발자 양성 과정 성적우수상 및 최우수 프로젝트  
__2014.12__ 선린인터넷고등학교 교내 디지털컨텐츠 경진대회 웹콘텐츠부문 3인 공동수상 동상(4위)  
__2014.08__ 국민대학교 제로원디자인센터 게임교육원 프리스쿨 최우수 프로젝트 수상  
__2014.04__ 선린인터넷고등학교 교내 창업아이템 경진대회 장려상(4위)  
__2014.12__ 선린인터넷고등학교 네트워크 구축대회 은상(2위)  

# 수상 내역
__2016.08.31 ~ 2017.02.23 (6개월)__ 한국아이티인재개발원 빅데이터 플랫폼기반 IoT 개발자 양성 과정 수료  
__2014.08.04 ~ 2014.08.14 (10일)__ 국민대학교 제로원디자인센터 게임교육원 프리스쿨 이수  

# 자격증
2015.07 정보처리기능사 한국산업인력공단

# 경력사항
[젤리스케치 (2015-03-25 ~ 2017-07-31 4개월)](#젤리스케치)  
[피치트리 (2015-08-01 ~ 2016-02-29 7개월)](#피치트리)

# 사용기술
어느정도 능숙하게 다룰 수 있음  
Java, Go, Node.js, HTML5, CSS3, React  
Mysql, MongoDB  
Arduino, Linux, Kubernetes, Istio  
GCP, AWS  
FFmpeg  
아직 공부 중  
Eos, Flutter

# 경력사항

## 애니펜
2017-03-21 ~ {{ "now" | date: "%Y-%m-%d" }}

현재 재직중

### AnibeaR 서비스 개발
AR을 기반으로 한 소셜미디어 서비스에서 촬영한 AR영상을 인코딩하여 스트리밍을 제공하고 SNS 서비스를 개발했습니다.

- Java Spring Boot 2.0, Node.js, React.js, MySQL, Kubernetes, Istio
- Java Spring 기반의 SNS API 서버 개발
- SNS 서비스를 관리할 수 있는 관리자 페이지 개발
- Kubernetes, Istio 사용하여 안정적인 라이브 서비스와 버전별 API 서버 분기
- Cloud Gpu를 활용하여 AR영상 촬영물을 인코딩하고 스트리밍 서비스를 제공하는 인코딩 서버 개발

### Anipen 홈페이지 개발
React를 활용하여 반응형 홈페이지를 개발했습니다.
<div class="columns">
  <div class="column is-half">
    <img class="materialboxed2" src="/images/about/anipen.png" width="100%" attr="anipen.png"/>
  </div>
</div>

### Kcon ARlive 스트리밍 개발
FFmpeg 으로 한개의 스트리밍을 다수의 스트리밍 주소로 보내는 서비스 개발.

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/arlive.png" width="100%" attr="arlive.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/arlive-la.png" width="100%" attr="arlive-la.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/arlive-mama.png" width="100%" attr="arlive-mama.png"/>
  </div>
</div>

[KCON 2018 JAPAN Red carpet event 생중계](https://youtu.be/YkXjyR1X_Bk)  
[KCON 2018 NY Red carpet event 생중계](https://youtu.be/HoW3OE5OVZI)  
[KCON 2018 LA Red carpet event 생중계](https://youtu.be/2kqRueK2fzU)

### Video Encoding Server 개발
gcp cloud gpu, kubernetes, [bull](https://github.com/OptimalBits/bull), Redis, FFmpeg을 활용하여 다운로드, 화질별 인코딩, 썸네일링, 업로드 작업을 병렬로 처리하게 개발.

<div class="columns">
  <div class="column is-full">
    <img class="materialboxed2" src="/images/about/encoding-01.png" width="100%" attr="encoding-01.png"/>
  </div>
</div>
<div class="columns">
  <div class="column is-one-third">
    <img class="materialboxed2" src="/images/about/encoding-02.png" width="100%" attr="encoding-02.png"/>
  </div>
</div>

### Miniforcex 게임서버 개발
3가지 재화가 있는 게임 서버를 개발.

### OpenId Connect 스펙이 포함된 통합 회원 서버 개발
OpenId Connect의 스펙이 포함된 통합 회원 서버를 개발.  
OAuth 2.0, OpenId Connect 스펙 문서를 읽고 직접 구현하는 과정을 통해 개발했습니다.

<div class="columns">
  <div class="column is-one-third">
    <img class="materialboxed2" src="/images/about/encoding-02.png" width="100%" attr="account_server-02.png"/>
  </div>
</div>

## 피치트리
2015-08-01 ~ 2016-02-29 (7개월)

### 피치트리 it 장비 관리  
- 라즈베리파이로 cups를 설치하여 네트워크 프린트 서버를 구축  
- 회사 네트워크 연결 작업  
- 공용 컴퓨터 관리

### 피치트리 홈페이지 개발  
- Aws, Python Flask, JQuery, Bootstrap 사용하여 구축(소개, 방문예약, 맴버십)  
- 방문예약시 예약 내용을 메일로 전송하였는데, Gmail의 smtp를 이용하여 전송.  
- 맴버 등록 전산화  

<div class="columns">
  <div class="column is-half">
    <img class="materialboxed2" src="/images/about/peachtree-01.png" width="100%" attr="peachtree-01.png"/>
  </div>
</div>

### 사무실 검색 서비스 개발  
- Angularjs, Python Flask, MySQL 사용  

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/office-01.jpg" width="100%" attr="office-01.jpg"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/office-02.jpg" width="100%" attr="office-02.jpg"/>
  </div>
</div>

공부목적이 좀 더 큰 서비스였는데 Angularjs를 사용하였고 MVW를 조금이나마 맛볼 수 있는 프로젝트였습니다.

### honesthouse 개발
인테리어를 의뢰하고 경매방식으로 낙찰받아 시공, 관리 해주는 서비스(honesthouse) 개발  

- Python Flask, MySQL, JQuery, Foundation 6 사용  

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/honesthouse-01.png" width="100%" attr="honesthouse-01.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/honesthouse-02.png" width="100%" attr="honesthouse-02.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/honesthouse-03.png" width="100%" attr="honesthouse-03.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/honesthouse-04.png" width="100%" attr="honesthouse-04.png"/>
  </div>
</div>  

## 젤리스케치
2015-03-25 ~ 2017-07-31 (4개월)

### 담당업무
#### 젤리스케치 서비스 개발  
- PHP, MySQL, JQuey, Bootstrap 사용  
- 반응형 웹 구현  
- 멀티미디어 콘텐츠와 글을 함께 쓸 수 있는 포트폴리오 작성 개발  
- 소셜 로그인 추가  

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/jellysketch-01.png" width="100%" attr="jellysketch-01.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/jellysketch-03.png" width="100%" attr="jellysketch-03.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/jellysketch-02.png" width="100%" attr="jellysketch-02.png"/>
  </div>
</div>


# 프로젝트

## 화니소프트 전자결재
2017-01-06 ~ 2017-02-27  
직업능력개발 훈련과정(빅데이터 플랫폼기반 IoT 개발자 양성 과정) 중 진행한 프로잭트입니다.

O/S: Window 7 64bit  
Web Server: Apache Tomcat 7.0.75  
DBMS: Oracle 11g  
Language: Java 8  
Framework: Mybatis 3.4.2, Mybatis Spring 1.3.1, Spring Framework   3.2.18, Bootstrap 3  
Browser Support: Internet Explorer 10++, Chrome 52++, Firefox 48++, Safari 10++

담당 파트: 게시판, 게시판 덧글 답글, 알림, 그 외 다른 팀원 서포트

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/hyservice-01.png" width="100%" attr="hyservice-01.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/hyservice-02.png" width="100%" attr="hyservice-02.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/hyservice-03.png" width="100%" attr="hyservice-03.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/hyservice-04.png" width="100%" attr="hyservice-04.png"/>
  </div>
</div>

## 선린라이프
2014-10-12 ~ 2014-11-04  
선린인터넷고등학교에서 디지털 콘텐츠 경진대회를 위해 준비한 프로젝트입니다.

Web Server: Apache 2.4.10, Nginx 1.6.0  
DBMS: MariaDB 5.5.38  
Language: PHP 5.4.31, HTML5, CSS3, JavaScript, jQuery  
Framework: Foundation 5  

담당 파트: 학생코드와 학생정보로 회원가입 기능, 학사일정, 급식표 파싱, 쪽지 기능

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/sunrinlife-01.png" width="100%" attr="sunrinlife-01.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/sunrinlife-02.png" width="100%" attr="sunrinlife-02.png"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/sunrinlife-03.png" width="100%" attr="sunrinlife-03.png"/>
  </div>
</div>

## DragonRush
2014-08-04 ~ 2014-08-14  
제로원디자인센터의 프리스쿨 과정에서 진행한 프로젝트입니다.

Engine: Unity 4.5.0

담당 파트: 게임 개발

<div class="columns">
  <div class="column">
    <img class="materialboxed2" src="/images/about/dragonrush-01.jpg" width="100%" attr="dragonrush-01.jpg"/>
  </div>
  <div class="column">
    <img class="materialboxed2" src="/images/about/dragonrush-02.jpg" width="100%" attr="dragonrush-02.jpg"/>
  </div>
</div>


# 기타

## 창업아이템경진대회

[사업계획서.pdf](https://drive.google.com/open?id=0BygbtABrAJ-8NjhqZ0laSFdMMms)

14년엔 창업에 관심이 많아서 창업에 관련한 책도 많이 찾아보고 읽어보곤 했습니다. 마침 교내창업아이템경진대회가 있어 '처음 프로그래밍을 접한 사람에게 복잡한 설치과정 필요 없이 다른 유저가 만든 튜토리얼을 보고 코딩, 즉시 실행해보게 하자'라는 주제로 사업계획서를 작성하였습니다. 처음 만나는 사업계획서는 정말 막막했지만, 인터넷에서, 학교에서 사업계획서 쓰는 방법을 찾아 많이 도움을 받았습니다. 제출하고 나니 속이 후련하고 정말 뿌듯했는데 얼마 뒤에 수상까지 했다고 해서 정말 놀랐고 덕분에 도전하는 것에 대하여 두려워 하지 말고 일단 도전해보자는 생각이 들었습니다.
