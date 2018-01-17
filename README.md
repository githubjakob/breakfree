# Break free (student project)

The game was developed in 2017 by five students as part of a computer science course at LMU Munich, see the [course page](http://www.pms.ifi.lmu.de/lehre/praktikum/progprakt/17ss/).

The game makes use of the [Phaser framework](https://phaser.io/) and features a NodeJS backend with a MongodDb to save/load the current game state. The game can be build as a Docker image and was hosted on AWS EC2 for the final präsentation of the project.

![Screenshhttps://phaser.io/ot of the Game](https://user-images.githubusercontent.com/15627894/35049906-2bfd6fc8-fbaa-11e7-98d8-45fe72cac410.png)

## How to run
Quickly start up the NodeJS using docker compose:

1. Clone the project from GitHub

2. Switch to project's directory and build project 

```
docker build -t breakfree:latest .
```

3. Startup the docker images

```
docker-compose up
```

4. Browse

[localhost:8080](localhost:8080)

## Used Technologies
- JavaScript (ECMAScript 6)
- Phaser
- NodeJs
- MongoDB
- Docker

## Dependencies
Server dependencies, install with `npm install`
- express: 4.15.2
- mongodb: 2.2.26
- socket.io: 1.7.4
- mongoose: 4.9.8
- winston: 2.3.1

Client dependencies, stored in `client/javascript/lib`
- Phaser
- Logger: 1.3.0
- Jquery: 3.2.1
- Phaser Illuminated
- Illuminated

## Slides
Slides of the [final präsentation](https://docs.google.com/presentation/d/1qO8Ctf0PK-kNqtzp0Idy-s3wpD_E1Fv-7NEx1x65fbU/edit#slide=id.p) of the project.