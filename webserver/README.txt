Installation for SpeakScents API

Backend Installation

1. Install node js from https://nodejs.org/en/
2. Using Visual Studio code, navigate to the directory of when you download files in terminal. Check if installed by running in terminal 
    node -v
3. In terminal install the required dependencies by injecting this line:
    node install express body-parser multer tedious ejs connect-mssql-v2 cookie-parser express-session helmet nodemon
4. Check to see you have the dependencies isntalled by typing in terminal, 
    npm list

FrontEnd Installation
Note: To view .ejs webpages must have the ejs module installed, see above.
Bootstrap is linked to HTML files. Not required to download.

To run: In, terminal
    nodemon webserver.js, open localhost on port 8080.