
Author: Isabel Hampton

Title: Coastal Carnage

Description: 
Wave survival game where players must try and survive as long as possible against hoards of enemies invading the beach.

Shoot hoards of zombies as they invade the beach to freeze them in time and survive as long as possible.
Zombies are stupid and they will likely get stuck in the trees trying to get you, use this to your advantage.
And more importantly, don't let them catch you!

How to Play:

For current version:
Install node.js and xampp
Run xampp.control and Start Apache and MySQL
Open CoastalCarnage/setPath.bat with Notpad and edit path to Node.js
Open CoastalCarnage/setPath.bat (double-click file)
Enter into the console 'nodemon myGame/app.js'
Open Chrome and enter the URL 'http://localhost:3000/index'

Running Older version (without server-side support):
Open Coastal Carnage folder with Visual Studio and run index.html with Live Server 
OR
Paste this URL into Chrome: https://izzyh787.github.io/CoastalCarnageSubmission/

Controls:
WASD- Movement
Space- Shoot

File Structure:
myGame>
    static>
        js> contains all js files except app.js
        resources>
            3dmodels> contains fbx and glb 3d models 
            audio> contains all sound files used in game
            images> contains any image assets used for game
            textures> contains image asset used for textures in game
        style.css : stylesheet for all web pages
    app.js : server-side js file used for loading all pages and main server-side funcitonality
    error404.html : displayed when invalid url is visited
    game-database.sql : exported database from phpMyAdmin that is used for storing user database
    game.html : web page displayed when player is playing game
    index.html : first web page player should visit, contains description of game
    login.html : web page dispplayed for user to login to existing accounts
    register.html : web page displayed for user to register a new account
README.txt : this file
setPath.bat : opens command prompt to run game with node using 'nodemon myGame/app.js'
     
Dependences:
Three.js

Resources:
Three.js intro: https://www.youtube.com/watch?v=sPereCgQnWQ
Animating planes: https://www.youtube.com/watch?v=ZYi0xGp882I&t=176s
Loading screen: https://www.youtube.com/watch?v=zMzuPIiznQ4
Animating models:
https://www.youtube.com/watch?v=8n_v1aJmLmc ,
https://www.youtube.com/watch?v=C3s0UHpwlf8&t=123s
Server-side:
https://www.youtube.com/watch?v=ILviQic0c8g
https://www.youtube.com/watch?v=S6VE2lsAGo0&t=880s
https://www.youtube.com/watch?v=heb6C8wHEzs&t=520s

Credits:

Textures:
Water Texture: https://www.vecteezy.com/vector-art/1844212-water-texture-top-view-background-vector-design-illustration
Sky texture: https://www.freepik.com/free-vector/sky-background-video-conferencing_9444270.htm#fromView=keyword&page=1&position=4&uuid=1a2faa61-689d-4db5-bc00-3d727369d1c5
Sand texture: https://www.the3rdsequence.com/texturedb/texture/43/smooth+sand+dunes/
Trunk texture: Unknown

Models:
Zombie: mixamo.com
Goblin: mixamo.com
Sword: Long Sword by ImForth [CC-BY] via Poly Pizza