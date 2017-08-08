---
layout: post
title:  "IOS 인앱 결제 영수증 체크 호출시 주의점"
writer: "배진환"
date: 2017-08-08 12:50:00 +0900
tags: InAppPurchase IOS verifyReceipt
---
IOS 인앱 결제를 서버에서 구현해야 할 일이 생겼는데 서버 쪽에서 응답이 잘 안되어 이메일 영수증 key를 가지고 직접 verifyReceipt에 호출해보았더니 `{status:21002}`가 데이터로 넘어온다.
분명 이상한건 하나도 없는데 exception도 없고 인자로 receipt-data도 오타없고 다~~~ 확인했는데 이상이 없다.
서버쪽 코드수정 후 서버에서 영수중 검증서버로 호출하니 정상적으로 응답이 돌아와서 멘붕상태였다.

이것저것 검색을 해보니 IOS의 영수증 검증서버는 표준이 아니다(?)라는 말을 하고 json형태로 넘기는 코드를 봐서
혹시나 싶어서 json형태로 api를 호출하니 정상적으로 결과 값이 돌아왔다.

~~~애플 미친거같다~~~

Postman에서 body에서 raw를 선택한 후에 Text를 JSON(application/json)으로 변경한다.
raw data의 형태를 json형태로 바꿔준다음에 호출하면 여태 안되던 호출이 잘~ 작동한다.
![image](/images/post/20170808/postman.png)
