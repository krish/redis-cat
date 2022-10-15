# Redis Cat

## Description

Redis Cat is a Rest API for any REDIS server

## Docker

Docker available in docker hub

```bash
docker pull krishlabs/redis-cat
```

## Installation

```bash
$ npm install
```

## Running the app

### environment variables

You can use .env file to set up environment variables or set in command line

```bash
#REDIS_URL
#set `REDIS_URL` to your redis server.
#if you skip this default url will be `redis://127.0.0.1:6379`.
#if your server use `tls` then you need to use `rediss://` instead of `redis://`

export REDIS_URL=redis://127.0.0.1:6379

#if you have username/password with tls (like AWS ElastiCache)

export REDIS_URL=rediss://username:password@hostname:port/db

#SERVER_BASE_URL (only for swagger UI)
# This only effect to Swagger UI
# If your API required some base path then you can specify your URL here.
# As an example if you are using ingress path based routing then you need to specify URL with your base path

export SERVER_BASE_URL=https://api.krishantha.com/basepath
# with above config your API url will be https://api.krishantha.com/basepath/redis-cat/
# if you skip this value API url will be https://api.krishantha.com/redis-cat/

#SERVER_NAME
#this is alias for the above SERVER_BASE_URL
export SERVER_NAME="Dev redis server"

#PORT
#by default API run on port 8191. if you want to chage the port you can use this variable

export PORT=8080
```

Note: if you do not have base_path to your API then you can ignore `SERVER_BASE_URL` and `SERVER_NAME`

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## URL and PORT

by default API run on port `8191` unless you have set `PORT` environment variable

## Swagger UI

Swagger UI will run on root of your URL. eg: `http://localhost:8191/`

## Stay in touch

- Author - [Krishantha Dinesh](https://krishantha.com)
- Youtube - [https://youtube.com/@krish](https://youtube.com/@krish)

## License

Redis Cat is [MIT licensed](LICENSE).
