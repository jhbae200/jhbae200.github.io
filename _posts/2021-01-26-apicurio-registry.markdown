---
layout: post
title:  "Kafka Connect에서 Apicurio Registry 사용하기"
writer: "배진환"
date:   2021-01-26 16:00:00 +0900
tags: kafka kafka_connect apicurio
description: "Schema Registry 대용으로 Apicurio Registry 사용해서 avro, parquet, json 형식 사용하기"
---
소비자와 생산자 간에 데이터를 주고 받을 때 생산자에서 변경된 필드 값이나 데이터 형식이 발생되면 변경된 것을 다시 알려야하고 
해당 로직을 생산자가 다시 수정해주어야되는 경우가 생긴다.

이런 작업들을 관리하기 위해서 나온게 Schema Registry이다. 중앙에서 데이터의 스키마(필드명, 데이터 타입, 스키마 버저닝)를 저장, 조회 가능하게 
해준다.

Schema Registry는 Confluent Platform 아니면 라이센스의 제약(유료)이 있어 대용품을 찾다보니 Redhat에서 오픈소스로 만든 스키마 관리 서비스가 있어
Kafka Connect에서 Schema Registry 대신 사용해보려고 한다.

# Apicurio Registry on Ubuntu
Required Jdk11

```
#Download Apicurio Registry
wget https://github.com/Apicurio/apicurio-registry/archive/1.3.2.Final.tar.gz
tar -xzvf 1.3.2.Final.tar.gz
cd apicurio-registry
./mvnw clean package -Pprod -Pkafka -DskipTests
sudo mkdir -p /opt/apicurio-registry
sudo unzip ./storage/kafka/target/apicurio-registry-storage-kafka-1.3.2.Final-all.zip -d /opt/apicurio-registry
```

make service file  
ex) /etc/systemd/system/apicurio-registry.service
```
[Unit]
Description=Apicurio Registry Service
Documentation=https://www.apicur.io/registry/docs
Requires=network.target remote-fs.target
After=network.target remote-fs.target

[Service]
User=kafka
Group=kafka
WorkingDirectory=/opt/apicurio-registry
Environment=JAVA_HOME=/usr/lib/jvm/zulu11
ExecStart=/bin/bash -c 'java -jar /opt/apicurio-registry/apicurio-registry-storage-kafka-1.3.2.Final-runner.jar'

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl start apicurio-registry
```

# Configure Kafka Connect
apicurio-kafka-connect-converter 라이브러리 사용. kafka connect plugins 폴더에 해당 jar들이 있어야 합니다.
```
cd /home/ubuntu/apicurio-registry/distro/connect-converter/target
tar -xzvf apicurio-kafka-connect-converter-1.3.2.Final-converter.tar.gz -C /opt/connectors
```

conneter.properties 일부
```
key.converter=io.apicurio.registry.utils.converter.AvroConverter
#
key.converter.apicurio.registry.url=http://localhost:8080/api
key.converter.apicurio.registry.global-id=io.apicurio.registry.utils.serde.strategy.GetOrCreateIdStrategy
key.converter.apicurio.registry.as-confluent=true
value.converter=io.apicurio.registry.utils.converter.AvroConverter
value.converter.apicurio.registry.url=http://localhost:8080/api
value.converter.apicurio.registry.global-id=io.apicurio.registry.utils.serde.strategy.GetOrCreateIdStrategy
value.converter.apicurio.registry.as-confluent=true
```

