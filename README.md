# DockerLogger

## Purpose
This is a logger service for containers.
This service will listen to containers' logs and write their logs into storage.
It implements a selection logic (detailed below under "Configuration"),
passes the logs to a configurable storage layer,
and provides an interface to retrieve the logs of a specific container - via Swagger UI.  
The program uses a cache to reduce the overhead of retrieving logs from the storage.

## Configuration
Open the "config.json" file,
and set the fields to your desired values:

port: 
int
The port number on your localhost, which the program will listen to.

storage: 
string
The type of storage API you'd like to work with. Please note: Even though there is a level of abstraction to this element of the project, some functions in the current internal implementation still rely specifically on MongoDB API.

currentContainersFile: 
string
the file name which will log the info about all attached containers.

logAllErrors: 
boolean
Determine whether or not to log every single stderr log produced by
every container (regardless of the selection filter).

logStoppedContainersAlso:
boolean
Determine whether or not to load stopped containers into the database.

imageSettings:
<image_name> (string)
You are invited to add as many <image_name>s as you wish, setting each one as its own object, just like the example called "YourImageName".
            
lowListenThreshold: 
int
Determine the lower threshold from which a reduction logic will apply, with the use of the next configurable field, called:

attachOneForEvery:
int
In case there more than <lowListenThreshold> attached containers - belonging to this specific image - then no longer will every new container (of this image) be attached to the logger. Instead, only 1 out of <attachOneForEvery> new containers (of this image) will be attached to the logger.

maxAttached:
int
Determine the maximum possible number of containers (of this image)
to be attached to the logger at any given time.

"*":
Set the default settings of the above logic, for any image which you do not wish to provide a custom behavior for.

## Run    
```npm i```
    
```node index.js```

after a moment, you'll see the following output: 
// 
DockerLogger is now listening at port http:localhost:<config.port>
// 
        
Please note:
At the current version of this program, it's perfectly possible to run additional containers while the program is running. However, building new images while the program is running - is not supported. Please be sure to have the required images already built before running DockerLogger.

Open a web browser and navigate to 'localhost:<config.port>/api-docs'.
Example:
Given config.port = 55000, the complete url should be:
localhost:55000/api-docs
    
An intuitive interface will be waiting for you there :)
Notice the 'Try it out' button at the top right corner of each operation box.

## Room for Improvement

### Specific Issues:

GET / container
The request which lists the containers that are currently attached to DockerLogger.
In case there are no any running containers at the time of execution, attempting to 'GET / container' will return the list that the *previous* run of the program was listening to. In any other case, the request will result in the expected valid output: the current state of attached containers.

Building a new image at runtime:
There is no problem with running new CONTAINERS after DockerLogger is already running.
However, there's an error that requires fixing, when building a new image while the program is running.
    
### Further improvements:

1. Enhance selection logic
A better selection logic would have been taking into account the frequency of usage for each container and/or image, and would analyze it to determine dynamically
its level of importance to the user. Through such a mechanism, the user would both:
* Be required to less effort in configurations
* Get a better, more dynamic and service to answer his/her needs.

2. Better flexibility as to the the type of logs tracked for an individual container:
In the existing implementation, it's either listening to the stderr of all containers, or to no stderr of anyone at all.
This would be one of the first things I'd improve given more time.

3. Make the interface more flexible.
For example, for the following configurations:

3.A. Delete:
3.A.1 delete one specific log
3.A.2 delete logs of specific container:
3.A.2.a delete all of its stderr 
3.A.2.b delete all its stdout

3.B Post:
3.B.1 post a specific log
3.B.2 post a log as a selected container
3.B.2.a to stdout
3.B.2.b to debug

4. Complete the abstraction of DB model
generify all the lines of code which at this point still rely specifically on MongoDB.

5. Improve function compartmentalization
Primarily of logContainer(), but also of start(), and perhaps others - 
in order to provide a better implementation of the Single Responsibility prinicple.
            
6. Testing
Learn about ways to implement deeper, more automated and more informative tests.
            
7. Research
I would continue learning about what goes on behind the curtains.
        
8. Shorten this README :)

## What did I learn

    Thanks to this task,
    I've made my first-ever steps in the following topics:
        Javascript, Docker, NodeJS, Express, MongoDB, and producing a UI.
        
    Looking forward to keep learning :)
