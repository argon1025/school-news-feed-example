# School News Feed Example

## ToC

- [Introduce](#introduce)
- [Built With](#built-with)
- [Architecture](#architecture)
  - 폴더 구조
  - ERD
- [Convention](#convention)
  - 이슈 관리
  - Git
  - 코드 컨벤션
- [How To Start](#how-to-start)
  - 1. Docker-compose 로컬 개발환경 구성
  - 2. NodeJS 버전 확인
  - 3. 패키지 설치
  - 4. 환경설정 구성
  - 5. Prisma Client 생성
  - 6. 프로젝트 시작
  - (참고) Swagger
  - (참고) 테스트 시작

## Introduce

학교 소식을 전달하고 받아보는 뉴스피드 기능 예제

## Built With

- NestJS(Express)
- TypeScript / Jest
- Swagger
- PostgreSQL/Prisma
- Husky

## Architecture

![image](https://github.com/argon1025/school-news-feed-example/assets/55491354/151994f0-fdf0-47e3-b62b-c316db78a239)

이벤트 스토밍을 통해 도메인 내에서 분리할 수 있는 애그리거트를 식별했습니다.

- 학교(School) 애그리거트
- 학교 소식(SchoolNews) 애그리거트
- 학교 구독(SchoolMember) 애그리거트
- 뉴스 피드(NewsFeed) 애그리거트

각 애그리거트간에 상호작용이 필요한 경우(쓰기 작업) 도메인 이벤트를 사용합니다.  
도메인 이벤트 트리거는 [NestJS Event-Emitter](https://docs.nestjs.com/techniques/events) 패키지를 사용하여 구현합니다.
현재 구현된 도메인 이벤트는 다음과 같습니다
- 학교 생성 이벤트
  - 학교 구독 이벤트 핸들러에서 사용
- 학교 소식 생성 이벤트
  - 뉴스 피드 이벤트 핸들러에서 사용
- 학교 소식 수정 이벤트
  - 뉴스 피드 이벤트 핸들러에서 사용
- 학교 소식 삭제 이벤트
  - 뉴스 피드 이벤트 핸들러에서 사용


### 폴더 구조

```
📂environments            # 환경변수, 로컬환경 Docker 데이터 관리
📂prisma                  # 프리즈마 파일
┣ 📂migrations            # DB 마이그레이션 히스토리
📦src
 ┣ 📂common               # 공통 provider
 ┃ ┣ 📂exception          # - 에러 처리
 ┃ ┣ 📂logger             # - 커스텀 로거
 ┃ ┣ 📂middleware         # - http-request 로깅 미들웨어
 ┃ ┣ 📂type               # - 공통 타입
 ┃ ┗ 📂prisma             # - Prisma provider
 ┣ 📂school               # 학교
 ┣ 📂school-member        # 학교 구독
 ┃ ┣ 📜event-handler.ts   # - 학교 구독 이벤트 핸들러
 ┣ 📂school-news          # 학교 소식
 ┣ 📂news-feed            # 뉴스 피드
 ┃ ┣ 📜event-handler.ts   # - 뉴스 피드 이벤트 핸들러
 ┣ 📂user                 # 유저 (요구사항 구현용)
 ┗ 📜main.ts
```
애그리거트별로 폴더를 분리했습니다.

### ERD

![image](https://github.com/argon1025/school-news-feed-example/assets/55491354/18785393-f8d2-4d32-be54-e5fe78592639)

## Convention

### 👀 이슈 관리

- Github Projects Kanban을 사용하여 이슈를 생성 및 트래킹 합니다. [링크](https://github.com/users/argon1025/projects/5/views/1)

### 👏 Git

**브랜치 정책**

- 각 이슈별로 브랜치를 분리합니다.
  - 브랜치 명칭은 `{feature|fix}-#{이슈 번호}` 로 생성합니다. ex) `feature-#19`, `fix-#19`

**병합 정책**

- `main` 브랜치의 경우 리니어하게 관리합니다.
  - 핫픽스 브랜치를 메인브랜치에 병합할 경우 이력 전체를 저장하기 위해 `Rebase`를 진행합니다.
  - 기능 브랜치를 메인브랜치에 병합할 경우 `Squash`를 진행합니다.

**✍커밋 정책**

- conventionalCommits을 준수합니다.
- push전 반드시 테스트를 통과해야 합니다.
  - 해당 액션은 husky를 통해 자동화합니다.

### 💁‍♂️ 코드 컨벤션

**패키지**

- 패키지 매니저는 pnpm을 사용합니다.

**네이밍**

NestJS에서 사용하는 기본 네이밍 컨벤션을 준수합니다.

- 폴더, 파일 : `{케밥 케이스}.{역할정보}.ts`
- 클래스 : 파스칼 케이스
- 서비스 메소드 : 카멜 케이스

**코드 스타일**

- Airbnb Rule을 사용합니다.

**기타**

- 재사용되는 provider에 대해 유닛테스트를 작성합니다.
  - 서비스 레이어 유닛 테스트의 경우 테스트 데이터베이스를 사용해서 테스트합니다.
- 요청, 응답에 대해서 DTO를 사용하고 알맞은 Validation 및 직렬화, 역직렬화 프로세스를 거쳐야 합니다.
- Service 레이어의 경우 변경에 유연한 구조를 만들기 위해 의존성 역전을 활용합니다
  - 객체는 하나의 책임만 가져야 하며 GOD 객체를 만드는 행위를 지양합니다.
- 서비스 시간대는 UTC를 사용하며 결과 응답시 ISO8601 String을 리턴합니다.

## How To Start

### 1. Docker-compose 로컬 개발환경 구성
```
$ cd ./school-news-feed-example
$ pnpm run docker-compose:init
```

프로젝트 폴더로 이동한 뒤 다음 명령어를 통해 개발환경을 구성할 수 있습니다.
`docker-compose:init` 스크립트는 두 개의 컨테이너를 실행하게 됩니다.

- 개발환경 DB (Port 5432)
- 테스트환경 DB (Port 5431)

테스트 환경 DB는 테스트에 사용됩니다.

> - `pnpm`, `Docker-compose`가 설치되어 있지 않다면 먼저 설치해야 합니다.
> - DB 데이터는 프로젝트 폴더 .environments/docker에 저장됩니다
> - 해당 단계에서 컨테이너를 미리 구성하지 않으면 다음 단계가 원활하게 진행되지 않을 수 있습니다.

### 2. NodeJS 버전 확인

```
$ cat .nvmrc
$ fnm use
```

nodeJS 버전을 확인하고 NodeJS NVM(node version manager)을 통해 명시된 버전으로 전환합니다.

> 예제의 nvm은 fnm을 사용하고 있습니다. [링크](https://github.com/Schniz/fnm)

### 3. 패키지 설치

```
$ pnpm i
```

> 해당 프로젝트의 기본 패키지 매니저는 pnpm입니다.

### 4. 환경설정 구성

```
# 서비스 포트 설정
SERVICE_PORT=8080

# 데이터베이스 설정
DATABASE_URL="postgresql://root:root@localhost:5432/SchoolNewsFeed?schema=public"
```

`.environments/.env.${환경별칭}` 에서 환경변수를 추가, 편집할 수 있습니다.  
현재 실행에 필요한 환경변수는 미리 정의되어 있기 때문에 추가로 수정하실 필요는 없습니다.

미리 정의된 환경변수 목록은 다음과 같습니다.

- `.environments/.env.local` 로컬 개발환경 환경변수
- `.environments/.env.test` 테스트환경 환경변수

### 5. Prisma Client 생성

```
pnpm run prisma:migrate:local
```

이 프로젝트에서는 Prisma로 마이그레이션을 관리합니다

위 명령어를 통해 로컬환경과 마이그레이션 기록을 동기화하고  
서버 애플리케이션 실행을 위한 PrismaClient 모듈이 생성됩니다

### 6. 프로젝트 시작

```
pnpm run start:local
```


### (참고) Swagger

```
http://localhost:{port}/api
```

해당 프로젝트는 Swagger 문서를 제공합니다.

### (참고) 테스트 시작

```
pnpm run test # 테스트 시작
pnpm run test:cov # 테스트 커버리지 측정

 PASS  src/school-news/school-news.service.spec.ts
 PASS  src/school-member/school-member.service.spec.ts
 PASS  src/news-feed/news-feed.event-handler.spec.ts
 PASS  src/school/school.service.spec.ts
 PASS  src/user/user.service.spec.ts
 PASS  src/news-feed/news-feed.service.spec.ts
 PASS  src/school-member/school-member.event-handler.spec.ts
 PASS  src/common/exception/validation-exception/validation-exception.factory.spec.ts
 PASS  src/common/exception/all-exception/all-exception.filter.spec.ts
 PASS  src/common/prisma/prisma.repository.spec.ts
```

유닛테스트는 실제 테스트 DB를 통해 진행합니다.  
`module`, `interface`, `type`, `dto`, `controller`, `constant` 파일이 현재 커버리지 측정에서 제외되어 있습니다.  
커버리지 측정 범위의 경우`package.json` 내 jest.collectCoverageFrom에서 관리하고 있습니다.

> `.environments/.env.test` 내 정의된 환경변수를 사용하여 테스트를 진행합니다.
