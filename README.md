# Break free (student project)

Simple two player jump'n'run side-scroller
* Phaser 
* NodeJS Backend with MongoDB to save/load games

The game was developed in 2017 by five students as part of a course at LMU Munich, see the [course page](http://www.pms.ifi.lmu.de/lehre/praktikum/progprakt/17ss/).

# How to run

1. Clone project

2. Build project 
```
docker build -t breakfree:latest .
```

3. Startup
```
docker-compose up
```

4. Browse
[localhost:8080](localhost:8080)

### Dependencies
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
Slides of the [final präsentation](https://docs.google.com/presentation/d/1qO8Ctf0PK-kNqtzp0Idy-s3wpD_E1Fv-7NEx1x65fbU/edit#slide=id.p)