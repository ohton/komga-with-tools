# Komga サーバ Docker セットアップ手順

このドキュメントでは、Komga サーバを Docker を使ってセットアップする方法を説明します。

## 前提条件
- Docker Composeが使用できること

## セットアップ手順

### 1. Docker Compose
`docker-compose.yml` の例:
```yaml
version: '3.3'
services:
	komga:
		image: gotson/komga:latest
		container_name: komga
		ports:
			- "8080:8080"
		volumes:
			- ./komga-data:/config
			- ./komga-data:/data
```
起動コマンド:
```bash
docker compose up -d
```

## Web UI へのアクセス
ブラウザで [http://localhost:25600](http://localhost:25600) にアクセスしてください。

## 参考リンク
- [Komga公式Dockerガイド](https://komga.org/docs/introduction)
