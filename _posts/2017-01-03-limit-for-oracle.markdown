---
layout: post
title:  "oracle에서 rownum을 이용하는 방법들"
writer: "배진환"
date:   2017-01-06 16:14:00 +0900
tags: oracle limit rownum
description: "oracle에서 rownum을 이용하여 결과 개수 제한, 페이징 처리를 하고 페이징 처리 시 성능을 최적화할 수 있는 방법"
---
oracle은 좋은 데이터베이스이지만 페이징 처리 시엔 참 mysql이 간절히 생각납니다.  
oracle에서는 limit 키워드가 없어서 페이징에 어려움을 겪는 경우가 많은데 ROWNUM을 적절히 이용하면 limit처럼 쓸 수 있습니다.

이 글을 작성하면서 양이 많아져 점점 이게 맞을까 정답일까 고민을 하게 되었습니다. 메일로 틀린 부분이나 의견이 있으시면 보내주세요.  

공부하는 입장에서 작성한 글입니다. 이 글을 읽고 실적용을 해보실 분들은 다른 자료를 더 찾아보시고 적용하시길 바랍니다.

#### ROWNUM?? ####
> ROWNUM은 쿼리에서 사용할 수 있는 가상 열 (실제 열이 아님)입니다. ROWNUM에는 숫자 1, 2, 3, 4... N이 할당됩니다. 여기서 N은 ROWNUM 세트와 함께 사용되는 행의 수입니다. ROWNUM 값은 행에 영구적으로 할당되지 않습니다. (이는 일반적인 오해입니다) 테이블의 행에 숫자가 없습니다. 당신은 테이블에서 5열을 요구할 수 없습니다. 그런 것은 없습니다.

_Ask Tom: On ROWNUM and Limiting Results - [Ask-Tom][ask-tom]_

#### Top-n Query ####

ROWNUM으로 top-n 쿼리는 쉽게 작성할 수 있습니다.

{% highlight SQL %}
SELECT * FROM EMP WHERE ROWNUM <= 5
{% endhighlight %}

_2017-01-19 12:05 pm 수정했습니다._

| EMPNO | ENAME  | JOB      | MGR  | HIREDATE            | SAL     | COMM    | DEPTNO |
|-------|--------|----------|------|---------------------|---------|---------|--------|
| 7369  | SMITH  | CLERK    | 7902 | 1980-12-17 00:00:00 | 800.00  |         | 20     |
| 7499  | ALLEN  | SALESMAN | 7698 | 1981-02-20 00:00:00 | 1600.00 | 300.00  | 30     |
| 7521  | WARD   | SALESMAN | 7698 | 1981-02-22 00:00:00 | 1250.00 | 500.00  | 30     |
| 7566  | JONES  | MANAGER  | 7839 | 1981-04-02 00:00:00 | 2975.00 |         | 20     |
| 7654  | MARTIN | SALESMAN | 7698 | 1981-09-28 00:00:00 | 1250.00 | 1400.00 | 30     |

ROWNUM은 다른 WHERE 조건이 실행된 후에 할당되고 그 뒤에 ORDER BY, GROUP BY가 수행됩니다.  

{% highlight SQL %}
SELECT * FROM EMP WHERE ROWNUM <= 5 ORDER BY ENAME;
SELECT * FROM EMP ORDER BY ENAME;
{% endhighlight %}

첫 번째 쿼리문과 두 번째 쿼리문의 실행결과의 첫 번째 ROW가 조금 다른 것을 확인할 수 있습니다. ROWNUM 부여가 먼저 수행된 후에 ORDER BY 절이 수행되므로 만일 ORDER BY 절을 ROWNUM과 같이 써서 결과를 얻으려면 올바른 쿼리문이 아닙니다.  
서브쿼리를 이용하여 정렬이 들어간 쿼리를 감싼 후에 ROWNUM 조건을 걸어야 합니다.

{% highlight SQL %}
SELECT
  *
FROM
  (SELECT * FROM EMP ORDER BY ENAME)
WHERE
  ROWNUM <= 5;
{% endhighlight %}

oracle에서 ORDER BY 절을 사용하여 ROWNUM으로 자르면 ex)`SELECT * FROM (SELECT * FROM EMP ORDER BY ENAME) WHERE ROWNUM <= 5;`

* 테이블을 스캔합니다.
* ROWNUM의 n개 만큼 정렬을 수행하고 n개만큼 가져옵니다. (이는 그 뒤 정렬은 생각하지 않습니다.)

ROWNUM을 사용하지 않고 쿼리문을 실행하여 자를 시엔

* 테이블을 스캔합니다.
* __전체적인__ 정렬을 수행합니다.
* n개만큼 자르거나 사용합니다.

java로 ojdbc6.jar을 사용하여 두 개의 속도 테스트를 해보겠습니다.  
테스트 환경은

~~~~
OS : Windows 7 Professional K 64bit
CPU : Intel Code i5 3.20GHz
RAM : 8.00GB
Oracle Version : Oracle 11g(11.2.0)
Java : JDK 1.8.0_111
IDE : Intellij 2016.3.1
~~~~

먼저 데이터베이스에 테스트 데이터를 넣기 위해 PL/SQL로 column이 4개인 테이블에 테스트 데이터를 랜덤으로 1,000,000개 삽입하였습니다.

{% highlight SQL%}

CREATE TABLE TEST_ROWNUM(
  LONGTEXT VARCHAR2(500),
  SHORTTEXT VARCHAR2(20),
  NORMALTEXT VARCHAR2(100),
  INTVAL INTEGER
);

DECLARE

BEGIN
  FOR i IN 1 .. 1000000
  LOOP
    INSERT INTO TEST_ROWNUM VALUES (
      DBMS_RANDOM.STRING ('X', 500), --문자숫자혼합 500자
      DBMS_RANDOM.STRING ('X', 20), --문자숫자혼합 20자
      DBMS_RANDOM.STRING ('X', 100), --문자숫자혼합 100자
      DBMS_RANDOM.VALUE (1, 100000) --숫자 1~100000
    );
  END LOOP;
  COMMIT;
END;
{% endhighlight %}

실행결과  
`[2017-01-05 16:08:50] completed in 13m 49s 853ms`

ROWNUM으로 쿼리문에서 자를 RownumQuery.java와 ResultSet에서 자를 SingleQuery.java 파일을 만들어서 쿼리 검색 후 rs.next()를 20번 하는 속도를 측정하여 50번 반복하여 평균값을 구했습니다.

&nbsp;
: _RownumQuery.java_
{% highlight java %}
package io.github.jhbae200.topNQuery;

import java.sql.*;

public class SingleQuery {
    private static final String CLASS_FORNAME = "oracle.jdbc.driver.OracleDriver";
    private static final String URL = "jdbc:oracle:thin:@localhost:1521:orclBJH";
    private static final String USER = "scott";
    private static final String PASSWORD = "tiger";
    static {
        try {
            Class.forName(CLASS_FORNAME);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws SQLException {
        long startTime;
        long endTime;
        long totalTime;
        long sum = 0;
        Connection conn;
        conn = DriverManager.getConnection(URL, USER, PASSWORD);
        for (int j = 0; j < 50; j++) {
            startTime = System.currentTimeMillis();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM TEST_ROWNUM ORDER BY 2");
            rs.setFetchSize(20);
            for (int i = 0; rs.next()&&i<rs.getFetchSize();i++) {
            }
            endTime = System.currentTimeMillis();
            totalTime = endTime - startTime;
            sum += totalTime;
            rs.close();
            stmt.close();
        }
        conn.close();
        System.out.println("Avg Total Time : "+((double)sum/100));
    }
}
{% endhighlight %}

&nbsp;
: _SingleQuery.java_
{% highlight java %}
package io.github.jhbae200.topNQuery;

import java.sql.*;

public class RownumQuery {
    private static final String CLASS_FORNAME = "oracle.jdbc.driver.OracleDriver";
    private static final String URL = "jdbc:oracle:thin:@localhost:1521:orclBJH";
    private static final String USER = "scott";
    private static final String PASSWORD = "tiger";
    static {
        try {
            Class.forName(CLASS_FORNAME);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws SQLException {
        long startTime;
        long endTime;
        long totalTime;
        long sum = 0;
        Connection conn;
        conn = DriverManager.getConnection(URL, USER, PASSWORD);
        for (int j = 0; j < 50; j++) {
            startTime = System.currentTimeMillis();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM\n" +
                    "  (SELECT * FROM TEST_ROWNUM ORDER BY 2)\n" +
                    "WHERE ROWNUM <= 20");
            rs.setFetchSize(20);
            for (int i = 0; rs.next()&&i<rs.getFetchSize();i++) {
            }
            endTime = System.currentTimeMillis();
            totalTime = endTime - startTime;
            sum += totalTime;
            rs.close();
            stmt.close();
        }
        conn.close();
        System.out.println("Avg Total Time : "+((double)sum/100));
    }
}
{% endhighlight %}

_데이터베이스의 캐싱, jdbc의 캐싱은 생각하지 않았습니다._

작업을 돌려놓고 작업관리자를 켜서 확인해보니

__SingleQuery__
: 실행 전 oracle process의 메모리가 약 1,431,000kb 지만 Connection을 가져온 후 작업 중의 메모리는 약 1,564,000kb입니다.  
작업의 평균 시간은 5926.72ms입니다.

__RownumQuery__
: 실행 전 oracle process의 메모리가 약 1,429,200kb 지만 Connection을 가져온 후 작업 중의 메모리는 약 1,430,200kb입니다.  
작업의 평균 시간은 400.35ms입니다.

데이터베이스의 ROWNUM을 사용하여 결과를 제한하는 쿼리의 성능이 더 뛰어나다는 것을 알 수 있습니다.

#### Paning Query ####

ROWNUM의 기능을 이용하여 자주 사용하는 것은 페이징 처리입니다.

{% highlight SQL %}
select *
  from ( select /*+ FIRST_ROWS(n) */
  a.*, ROWNUM rnum
      from ( your_query_goes_here,
      with order by ) a
      where ROWNUM <=
      :MAX_ROW_TO_FETCH )
where rnum  >= :MIN_ROW_TO_FETCH;
{% endhighlight %}

`/*+ FIRST_ROWS(n)`는 Oracle에서의 Optimizer hints인데 Query의 plan을 변경할 수 있습니다. 주로 SQL의 성능을 튜닝하는 데 쓰입니다. 잘 쓰면 SQL을 최적화시킬 수 있으나 잘못 쓰게 되면 hint를 쓰는 것보다 못하게 되므로 조심해야 합니다.

FIRST_ROWS 말고도 INDEX hint도 있으나 사용하는 INDEX가 변경되면 해당 hint도 변경해야 합니다. FIRST_ROWS는 옵티마이저가 스스로 INDEX, 데이터양, CPU 등을 고려하여 plan을 만듭니다. 가능한 FIRST_ROWS를 쓰고 FIRST_ROWS가 비효율적일 때 다른 hint를 사용하는 게 좋습니다. (개인적인 생각입니다.)

> FIRST_ROWS (N)은 옵티마이저에게 "어이, 처음 n만큼에 행에 관심이 있고 가능한 한 빨리 N 개를 가져와줘."라고 말합니다.

_Ask Tom: On ROWNUM and Limiting Results - [Ask-Tom][ask-tom]_

Top-n Query에서 이용했던 TEST_ROWNUM 테이블을 이용하여 페이징 쿼리에 힌트를 쓴 것과 안쓴 것의 차이를 보겠습니다.  
ROWNUM을 사용하는 쿼리에서 order by를 사용할 때 조심해야 할 것이 있습니다. order by 정렬 조건의 칼럼이 유니크 해야 합니다.  
중복된 값이 있으면 중복된 값이 얼마나 있는지 알기 위해(5개의 중복 값이 있으면 전체에서 5개의 중복 값을 찾고 그 뒤에 남은 ROWNUM조건 만큼 정렬을 할 것입니다.) Oracle은 Query의 plan에서 TABLE ACCESS FULL이 발생합니다. (중복값이 없어도 Oracle은 알지 못하므로)  

##### PRIMARY KEY 제약 조건 주기 전 #####
{% highlight SQL %}
SELECT *
  FROM (SELECT /*+ FIRST_ROWS(10) */
              a.*, ROWNUM rnum
          FROM (  SELECT *
                    FROM TEST_ROWNUM
                ORDER BY SHORTTEXT) a
         WHERE ROWNUM <= 1000000)
 WHERE rnum >= 999991;
{% endhighlight %}
~~~~
Plan hash value: 558244070

------------------------------------------------------------------------------------------------
| Id  | Operation                | Name        | Rows  | Bytes |TempSpc| Cost (%CPU)| Time     |
------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT         |             |   952K|   310M|       | 91713   (1)| 00:18:21 |
|*  1 |  VIEW                    |             |   952K|   310M|       | 91713   (1)| 00:18:21 |
|*  2 |   COUNT STOPKEY          |             |       |       |       |            |          |
|   3 |    VIEW                  |             |   952K|   298M|       | 91713   (1)| 00:18:21 |
|*  4 |     SORT ORDER BY STOPKEY|             |   952K|   298M|   323M| 91713   (1)| 00:18:21 |
|   5 |      TABLE ACCESS FULL   | TEST_ROWNUM |   952K|   298M|       | 24689   (1)| 00:04:57 |
------------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------

   1 - filter("RNUM">=999991)
   2 - filter(ROWNUM<=1000000)
   4 - filter(ROWNUM<=1000000)

Note
-----
   - dynamic sampling used for this statement (level=2)
~~~~

Cost 값이 많은 것을 볼 수 있습니다. SHORTTEXT가 UNIQUE하지 않으니 hint의 내용도 의미가 없었습니다.
위에 명시한 테스트 환경에서 작업이 `45s 717ms`걸렸습니다.

##### PRIMARY KEY 제약 조건 준 후 #####

{% highlight SQL %}
ALTER TABLE SCOTT.TEST_ROWNUM ADD CONSTRAINT TEST_ROWNUM_SHORTTEXT_pk PRIMARY KEY (SHORTTEXT);
{% endhighlight %}

먼저 테이블에서 SHORTTEXT column에 PRIMARY KEY 제약 조건을 추가했습니다.

hint를 따로 사용하지 않으니 PRIMARY KEY INDEX를 사용하지 않고 TABLE ACCESS FULL이 발생하며 정렬을 위해 TEMP SPACE를 사용한 것을 보았습니다. 제약 조건이 안 걸린 상태의 테이블의 조회결과와 다를 게 없습니다.
{% highlight SQL %}
SELECT *
  FROM (SELECT
              a.*, ROWNUM rnum
          FROM (  SELECT *
                    FROM TEST_ROWNUM
                ORDER BY SHORTTEXT) a
         WHERE ROWNUM <= 1000000)
 WHERE rnum >= 999991;
{% endhighlight %}
~~~~
Plan hash value: 558244070

------------------------------------------------------------------------------------------------
| Id  | Operation                | Name        | Rows  | Bytes |TempSpc| Cost (%CPU)| Time     |
------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT         |             |   952K|   310M|       | 91713   (1)| 00:18:21 |
|*  1 |  VIEW                    |             |   952K|   310M|       | 91713   (1)| 00:18:21 |
|*  2 |   COUNT STOPKEY          |             |       |       |       |            |          |
|   3 |    VIEW                  |             |   952K|   298M|       | 91713   (1)| 00:18:21 |
|*  4 |     SORT ORDER BY STOPKEY|             |   952K|   298M|   323M| 91713   (1)| 00:18:21 |
|   5 |      TABLE ACCESS FULL   | TEST_ROWNUM |   952K|   298M|       | 24689   (1)| 00:04:57 |
------------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------

   1 - filter("RNUM">=999991)
   2 - filter(ROWNUM<=1000000)
   4 - filter(ROWNUM<=1000000)

Note
-----
   - dynamic sampling used for this statement (level=2)
~~~~

아래는 Optimizer hints를 사용한 쿼리입니다.

{% highlight SQL %}
SELECT *
  FROM (SELECT /*+ FIRST_ROWS(10) */
              a.*, ROWNUM rnum
          FROM (  SELECT *
                    FROM TEST_ROWNUM
                ORDER BY SHORTTEXT) a
         WHERE ROWNUM <= 1000000)
 WHERE rnum >= 999991;
{% endhighlight %}

~~~~
Plan hash value: 3045836861

-----------------------------------------------------------------------------------------------------------
| Id  | Operation                      | Name                     | Rows  | Bytes | Cost (%CPU)| Time     |
-----------------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT               |                          |   952K|   310M|    15   (0)| 00:00:01 |
|*  1 |  VIEW                          |                          |   952K|   310M|    15   (0)| 00:00:01 |
|*  2 |   COUNT STOPKEY                |                          |       |       |            |          |
|   3 |    VIEW                        |                          |   952K|   298M|    15   (0)| 00:00:01 |
|   4 |     TABLE ACCESS BY INDEX ROWID| TEST_ROWNUM              |   952K|   298M|    15   (0)| 00:00:01 |
|   5 |      INDEX FULL SCAN           | TEST_ROWNUM_SHORTTEXT_PK |    11 |       |     3   (0)| 00:00:01 |
-----------------------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------

   1 - filter("RNUM">=999991)
   2 - filter(ROWNUM<=1000000)

Note
-----
   - dynamic sampling used for this statement (level=2)
~~~~

Explain Plan을 봤더니 TEMP SPACE를 사용하지 않고 Cost 값도 많이 적어진 것을 확인할 수 있습니다.
작업이 `2s 287ms`걸려 결과가 나오는 속도도 줄었습니다.

#### Oracle 12c ROWNUM ####

Oracle 12c에서는 키워드가 추가되어 ROWNUM Query가 조금 간결해 졌습니다.

{% highlight SQL %}
SELECT val
FROM   rownum_order_test
ORDER BY val DESC
FETCH FIRST 5 ROWS ONLY;
{% endhighlight %}

하지만 이 키워드는 쿼리 변환 기능입니다. 실제 쿼리는 아래와 같습니다.

{% highlight SQL %}
Final query after transformations:******* UNPARSED QUERY IS *******
SELECT "from$_subquery$_002"."VAL" "VAL"
FROM  (SELECT "ROWNUM_ORDER_TEST"."VAL" "VAL",
              "ROWNUM_ORDER_TEST"."VAL" "rowlimit_$_0",
              ROW_NUMBER() OVER ( ORDER BY "ROWNUM_ORDER_TEST"."VAL" DESC ) "rowlimit_$$_rownumber"
       FROM "TEST"."ROWNUM_ORDER_TEST" "ROWNUM_ORDER_TEST") "from$_subquery$_002"
WHERE  "from$_subquery$_002"."rowlimit_$$_rownumber"<=5
ORDER BY "from$_subquery$_002"."rowlimit_$_0" DESC
{% endhighlight %}

#### 정리 ####
* Oracle에서 ROWNUM을 사용할 때는 ROWNUM은 다른 WHERE 조건이 실행된 후에 할당되고 그 뒤에 ORDER BY, GROUP BY가 수행되서 정렬을 할 때는 서브 쿼리를 이용하자.
* Oracle에서 ROWNUM을 정렬할 때는 FIRST_ROWS hint를 이용하고 정렬이 유니크해야 한다. 유니크하지 않으면 TABLE ACCESS FULL이 발생하고 Cost가 늘어난다.


#### 참고 링크 ####
* [Ask Tom: On ROWNUM and Limiting Results][ask-tom]  
* [Index_desc 힌트와 rownum = 1 조합은 안전한가?][indexdesc-rownum-tistory]  
* [Oracle 12c Row Limiting Clause for Top-N Queries][oracle-12c-row-limit]

[ask-tom]: http://www.oracle.com/technetwork/issue-archive/2006/06-sep/o56asktom-086197.html
[indexdesc-rownum-tistory]: http://scidb.tistory.com/entry/Indexdesc-%ED%9E%8C%ED%8A%B8%EC%99%80-rownum-1-%EC%A1%B0%ED%95%A9%EC%9D%80-%EC%95%88%EC%A0%84%ED%95%9C%EA%B0%80
[oracle-12c-row-limit]: https://oracle-base.com/articles/12c/row-limiting-clause-for-top-n-queries-12cr1
