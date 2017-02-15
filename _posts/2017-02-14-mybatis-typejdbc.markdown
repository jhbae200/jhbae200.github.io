---
layout: post
title:  "mybatis에서 null 처리"
writer: "배진환"
date:   2017-02-14 17:24:00 +0900
tags: mybatis sql
description: "mybatis에서 null 값을 처리하는 방법입니다."
---
프로젝트를 진행하다가 mybatis에서 null값을 포함하여 insert할 때 nested exception is java.sql.SQLException: 부적합한 열 유형: 1111 오류가 난다.  
한참을 쿼리문 오타보고 로직 쪽 오타를 보다가 그대로 검색을 하니 파라미터 값이 null이면 jdbcType을 지정해주면 된다고 한다. ~~내 한시간 두시간~~

> The JDBC Type is required by JDBC for all nullable columns, if null is passed as a value. You can investigate this yourself by reading the JavaDocs for the PreparedStatement.setNull() method.

_[Mybatis-3-docs][mybatis]_

{% highlight SQL %}
INSERT INTO H_BOARD VALUES (#{b_boardnum}, #{e_empnum, jdbcType=VARCHAR}, #{d_deptnum, jdbcType=VARCHAR},
#{b_subject, jdbcType=VARCHAR}, #{b_body, jdbcType=VARCHAR},
#{b_boardtype}, #{b_frontfix}, SYSDATE, SYSDATE, 'N'
)
{% endhighlight %}

역시나 공식문서를 잘 봐야겠다고 또 다짐한다.

[mybatis]: http://www.mybatis.org/mybatis-3/sqlmap-xml.html
