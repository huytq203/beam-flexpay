# e-wallet-web-admin

Quy chuẩn tổ chức tính năng frontend, giới hạn 300 dòng/file và bước kiểm tra
nằm trong [AGENTS.md](AGENTS.md). Lấy
`src/pages/merchant-management/merchant-access/` làm mẫu tham chiếu.

## Installation

- Make sure that you have Node.js v16, npm v8, yarn v1, Docker v20,
  docker-compose v1 or above installed.

- Setup in order to install dependencies :

```bash
yarn install
```

- Move to the appropriate directory: cd <YOUR_PROJECT_NAME>.

- Environment:

```bash
.env
```

## Quick Start

```bash
yarn dev
```

- See the example app at:

```bash
http://localhost:8080
```

## Build and Deploy Dev with yarn

- Move to the appropriate directory: cd <YOUR_PROJECT_NAME>.

- Environment:

```bash
cp .env.example .env.development
```

- Build:

```bash
yarn deploy:dev
```

## Build and Deploy Production with yarn

- Move to the appropriate directory: cd <YOUR_PROJECT_NAME>.

- Environment:

```bash
cp .env.example .env.production
```

- Build:

```bash
yarn deploy:prod
```
