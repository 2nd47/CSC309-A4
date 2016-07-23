# CSC309-A4
CSC309 Summer 2016 Assignment 4 - Sharing Economy Web App

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
