---
layout: post
title:  "Window에서 Linux 이용하기(WSL)"
writer: "배진환"
date: 2017-08-22 22:56:00 +0900
tags: Window Bash Ubuntu BashOnWindows
---
# TL;DR
작성일 기준으로 아직 베타입니다만 곧 가을에 출시될 Windows 10 Fall Creators Update에서는 beta를 뗀다고 합니다. (Insider Preview는 Build 16251에서 WSL이 베타가 아니게 된다고 하네요.)[링크][WSL-out-beta]  
기능이 발표된 지 그렇게 오래되진 않았는데 어떤 생각인지는 모르겠습니다. 추가로 [cmd에서 컬러링][console-colors]도 이제 지원을 하네요. 요새 여러모로 개발자를 생각해주는 것 같아서 좋습니다.

아직 뭐 완벽하게 지원이 되는 것 같진 않고 문제점도 많아 보입니다만 일단 윈도우 환경에서 가상머신 띄워서 linux를 테스트하는 것보단(디스크 공간, 메모리, CPU 및 관리에 많은 오버헤드 발생) 나아 보입니다.  
[BashOnWindows][BashOnWindows]에서 이슈가 엄청 많이 논의되고 있으니 사용하시다가 발생하는 문제를 이슈에 검색해보시길 바랍니다.

# 설치하기
BashOnWindows는 기본적으로 기능이 꺼져있습니다. 프로그램 및 기능에서 Windows 기능 켜기/끄기에서 Linux용 Windows 하위 시스템(베타)을 체크하여 해당 기능을 켜시기 바랍니다.

![install-1](/images/post/20170822/install-1.png)

가을 업데이트 전까지는 아직 개발단계의 기능이기 때문에 설정에서 업데이트 및 보안의 개발자용 메뉴에서 개발자 모드로 설정하셔야 합니다.

![install-2](/images/post/20170822/install-2.png)

명령 프롬프트를 관리자 권한으로 실행 후 속성에서 레거시 콘솔 사용이 체크해제 되어 있는지 확인해주세요.

![install-3](/images/post/20170822/install-3.png)

`lxrun /install`또는 `bash`명령어를 프롬프트에 입력하여 Ubuntu를 설치합니다. Ubuntu의 버전은 16.04.2 LTS 입니다.  
가을 업데이트 이후에는 윈도우 스토어에서 간편하게 설치, 삭제할 수 있게 되었다고 하네요!  
설치 시에 언어 설정 이후에 시간이 많이 필요한데 y 엔터 눌러놓고 인내를 가지고 기다려 보시면 됩니다.

설치 이후 `bash`로 진입할 수 있습니다.

# Overview
Linux용 Windows 서브 시스템에는
1. Linux 인스턴스 수명주기를 처리하는 Session Manager
2. Linux의 syscalls를 에뮬레이팅하는 Pico provider drivers(lxss.sys, lxcore.sys)
3. Linux를 호스트하는 Pico Process

![LXSS-diagram](/images/post/20170822/LXSS-diagram.jpg)

## LXSS Manager Service
설치, 삭제, 바이너리 실행에 관한 것들을 관리해주는 Service. NT에서 Linux 바이너리를 처음 실행하면 Linux가 생성되고, 마지막 클라이언트가 닫히면 리눅스 인스턴스도 종료됨. 현재로는 crontab작업 등의 백그라운드 작업을 등록하고 Bash를 종료시키면 리눅스 호스트가 종료되어 작업을 유지할 수 없습니다.

## Pico Process
Pico Process는 Project Drawbridge의 일부입니다.  
Pico Process는 Windows NT Kernel이 관리하지 않고 따로 관리하는 드라이버가 존재하며 Win32의 Process Environment Block, Thread 등을 사용하지 않는 Micro Process.  
이 때문에 BashOnWindows는 윈도우와 독립된 공간에서 실행되는 것처럼 보인다.

![pico-process](/images/post/20170822/pico-process.png)

## System Calls
Linux의 syscalls의 예로 fork, oepn, kill 등이 있는데 윈도우의 NtCreateProcess, NtOpenFile, NtTerminateProcess가 있습니다. 이와 같은 syscalls들을 매핑해주고 상호작용이 가능하도록(disk R/W) 드라이버(lxss.sys, lxcore.sys)가 요청을 처리해줍니다.

![syscall-graphic](/images/post/20170822/syscall-graphic.png)

## File System
1. Linux 파일 시스템의 완벽한 충실도를 지원하는 환경 제공 (VolFs)
2. Windows에서 드라이브 및 파일과의 상호 운용성 허용 (DriveFs)

WSL에서는 VolFs와 DriveFs가 두 가지 목표를 충족하도록 도와줍니다.

### VolFs
VolFs는 다음을 포함하여 Linux 파일 시스템 기능을 완벽하게 지원하는 파일 시스템입니다.
- chmod 및 chroot와 같은 조작을 통해 수정할 수 있는 Linux 사용 권한
- 다른 파일에 대한 심볼릭 링크
- Windows 파일 이름에서 일반적으로 유효하지 않은 문자가 있는 파일 이름
- 대소문자 구분
- 리눅스 시스템, 응용 프로그램 파일 (/etc, /bin, /usr 등) 및 사용자의 Linux 홈 폴더가 들어있는 디렉터리는 모두 VolFs를 사용합니다.

Linux의 root directory는 Windows에서 `%LocalAppData%\lxss/rootfs`에 위치하고 있습니다. 파일이 있다고 해서 Bash 밖의 윈도우에서 파일을 쓰거나 수정해서는 안 된다고 하네요. VolFs에서 Windows의 파일 시스템과 다르게 관리하고 있기 때문입니다.

## DriveFs
DriveFs는 Windows와의 상호 운용성을 위해 사용되는 파일 시스템입니다. 모든 파일 이름은 유효한 Windows 파일 이름이어야하며 Windows 보안을 사용하며 Linux 파일 시스템의 모든 기능을 지원하지는 않습니다. 파일은 대소 문자를 구분하므로 사용자는 대소 문자만 다른 이름의 파일을 만들 수 없습니다.

모든 고정 Windows 볼륨은 DriveFs를 사용하여 /mnt/c, /mnt/d 등에 마운트됩니다.

[console-colors]: https://blogs.msdn.microsoft.com/commandline/2017/08/02/updating-the-windows-console-colors/
[WSL-out-beta]: https://blogs.msdn.microsoft.com/commandline/2017/07/28/windows-subsystem-for-linux-out-of-beta/
[BashOnWindows]: https://github.com/Microsoft/BashOnWindows
