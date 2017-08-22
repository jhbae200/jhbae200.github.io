---
layout: post
title:  App engine에서 Lets encrypt 사용하여 ssl 적용하기
writer: "배진환"
date: 2017-08-21 14:30:00 +0900
tags: App-engine, letsencrypt, ssl
---
<https://code.luasoftware.com/tutorials/google-app-engine/lets-encrypt-on-google-app-engine/>을 참고 하여 Renewal 시에 storage에 verification file을 업로드하고 서버가 해당 파일을 불러올 수 있게 바꿔보았습니다.

# System Requirements
- Python 2.6, 2.7, or 3.3+,
- root 사용자가 `/etc/letsencrypt`, `/var/log/letsencrypt`, `/var/lib/letsencrypt`에 접근할 수 있어야 합니다.
- OSes based on Debian, Fedora, SUSE, Gentoo and Darwin.  
즉 윈도우는 지원이 안됩니다.

# Install Let's encrypt
Let's encrypt ACME Client로 [Certbot][Certbot]을 사용합니다.

{% highlight shell %}
user@webserver:~$ wget https://dl.eff.org/certbot-auto
user@webserver:~$ chmod a+x ./certbot-auto
user@webserver:~$ ./certbot-auto --help
{% endhighlight %}

따로 플러그인을 사용하지 않을 예정이니 컴파일 버전을 받았습니다.

# Install Gcloud
<https://cloud.google.com/sdk/docs/quickstarts>
각 환경에 맞춰서 설치하시기 바랍니다.

command beta, gsutil을 사용할 것이니 설치해주세요.
`gcloud components install beta`  
`gcloud components install gsutil`

# Create SSL cert
Let's encrypt에서 따로 App engine을 인증해주는 도구가 없으니 직접 작성하셔야 합니다.

## Setting for App Engine
각 언어에 맞춰서 `gs://my-bucket/ssl/[VERIFICATION_FILE_NAME]`을 바라볼 수 있게 해주세요.
go와 php로 작성한 게 있어서 아래는 예제 소스입니다.

### php
_app.yaml_
{% highlight yaml %}
runtime: php55
handlers:
  - url: /.well-known/acme-challenge/.*
    script: acme-challenge.php
env_variables:
  GS_BUCKET: [YOUR_BUCKET_ID]
{% endhighlight %}

_acme-challenge.php_
{% highlight php %}
<?php

$path = explode('/', $_SERVER['PATH_INFO']);
$verifyName = end($path);

if (file_exists('gs://' . getenv('GS_BUCKET') . '/ssl/' . $verifyName)) {
  $fileContents = file_get_contents('gs://' . getenv('GS_BUCKET') . '/ssl/' . $verifyName);
  echo $fileContents;
} else {
  http_response_code(404);
  die();
}
{% endhighlight %}

### go
_app.yaml_
{% highlight yaml %}
runtime: go
api_version: go1.8

handlers:
- url: /.*
  script: _go_app
{% endhighlight %}

_main.go_
{% highlight go %}
package main

import (
	"net/http"
	"fmt"
	"github.com/gorilla/mux"
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"cloud.google.com/go/storage"
	"io/ioutil"
	"context"
)

func init() {
	route := mux.NewRouter()
	route.HandleFunc("/", index)
	route.HandleFunc("/.well-known/acme-challenge/{encrypt}", acmeChallenge)
	http.Handle("/", route)
}

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello World")
}

func acmeChallenge(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	encrypt := vars["encrypt"]
	var ctx context.Context
	ctx = appengine.NewContext(r)
	client, err := storage.NewClient(ctx)
	if err != nil {
		log.Errorf(ctx, "failed to create client: %v", err)
		w.WriteHeader(500)
		return
	}
	defer client.Close()
	bucketName := "jhbae-live"
	cBucket := client.Bucket(bucketName)
	rc, err := cBucket.Object(encrypt).NewReader(ctx)
	if err != nil {
		log.Errorf(ctx, "readFile: unable to open file from bucket %q, file %q: %v", bucketName, encrypt, err)
		w.WriteHeader(404)
		return
	}
	defer rc.Close()
	slurp, err := ioutil.ReadAll(rc)
	if err != nil {
		log.Errorf(ctx, "readFile: unable to open file from bucket %q, file %q: %v", bucketName, encrypt, err)
		w.WriteHeader(404)
		return
	}
	fmt.Fprint(w, string(slurp))
}
{% endhighlight %}
**

## Config Domain for App engine
SSL을 사용할 맞춤 도메인을 추가하여 주세요.
![image](/images/post/20170821/custom-domain.png)

## Create shell script HTTP verification file upload to Cloud Storage
certbot의 `--manual-auth-hook`을 이용하여 verification시 Cloud Storage에 Upload되도록 합시다.

_auth-hook.sh_
{% highlight shell %}
#!/bin/bash
# for debugging purpose only
set -x

echo $CERTBOT_VALIDATION | gsutil cp -a project-private - gs://my-bucket/ssl/$CERTBOT_TOKEN

set +x
{% endhighlight %}

## Create shell script SSL Renewal hook
renew 시에 app engine에 SSL을 업로드하고 해당 도메인에 SSL을 매핑해줘야 합니다.

_renew-hook.sh_
{% highlight shell %}
#!/bin/bash
set -x

PROJECT_NAME=your-project-id

#gcloud config set project $PROJECT_NAME

NOW=$(date +"%y/%m/%d")

openssl rsa -in $RENEWED_LINEAGE/privkey.pem -out $RENEWED_LINEAGE/privkeyrsa.pem

CERTID=$(gcloud beta app ssl-certificates create \
  --display-name $PROJECT_NAME-$NOW \
  --certificate $RENEWED_LINEAGE/fullchain.pem \
  --private-key $RENEWED_LINEAGE/privkeyrsa.pem \
  --project $PROJECT_NAME --format='value(id)')

for domain in $RENEWED_DOMAINS; do
  gcloud beta app domain-mappings update $domain --certificate-id $CERTID --project $PROJECT_NAME
done

set +x
{% endhighlight %}

## Run Script
{% highlight text %}
certbot-auto certonly --manual --manual-public-ip-logging-ok \
--preferred-challenges http --manual-auth-hook /[FULLPATH]/auth-hook.sh \
--renew-hook /[FULLPATH]/renew-hook.sh -d your-domain.com -d www.your-domain.com
{% endhighlight %}

Results
{% highlight text %}
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/asdf.jhbae.in/fullchain.pem. Your cert will
   expire on 2017-11-19. To obtain a new or tweaked version of this
   certificate in the future, simply run certbot again. To
   non-interactively renew *all* of your certificates, run "certbot
   renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
{% endhighlight %}

## Test Renewal
`certbot-auto renew --dry-run`

## Register Crontab
`sudo crontab -e`

{% highlight text %}
# m h  dom mon dow   command
15 3 * * * /FULL/PATH/TO/certbot-auto renew --quiet
{% endhighlight %}

![image](/images/post/20170821/ssl.png)  
정상적으로 등록이 되었습니다.


[Certbot]: https://certbot.eff.org/
