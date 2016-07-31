# CSC309 Sharing Economy Web App
Greetings! This is the CSC309 Assignment 4 (Sharing Economy Web App) submission for the AIDA web app. Group members include:

## Installation
For Windows:
- Go to https://www.mongodb.org/downloads#production and install MongoDB.
- Create a new folder somewhere on your file system named <i>data</i>.
- Create a new folder under the <i>data</i> folder named <i>db</i>.

## Launching the app
For Windows:
- Open your command window and enter:

  mongod --port 27017 --dbpath "<i>Path to db folder</i>"

- Open your command window in the root folder of the app and enter:

  node app/server.js


# Enhancements / Ideas for Final
- Database select: field
- Password retries: fail 5 times wait 15 minutes
- Logout if inactive
- File upload
- Favicon
- Mobile friendly (except top 10 projects, top 10 people, inbox)
