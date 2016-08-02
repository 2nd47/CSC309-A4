# CSC309 Sharing Economy Web App
Greetings! This is the CSC309 Assignment 4 (Sharing Economy Web App) submission for the AIDA web app. Group members include:

## Installation
For Windows:
- Go to https://www.mongodb.org/downloads#production and install MongoDB.
- Create a new folder somewhere on your file system named <i>data</i>.
- Create a new folder under the <i>data</i> folder named <i>db</i>.

## Launching the app
For Windows:
- Open your command window and enter the following code, replacint <i>db_folder_path</i> with the absolute path to the db folder you've made:
~~~
  mongod --port 27017 --dbpath "db_folder_path"
~~~
- Open your command window in the root folder of the app and enter:
~~~
  npm install
  node app.js
~~~
- You can now go to the app by going to <i>localhost:3000</i> in your web browser

## Testing the app
For Windows:
- Open your command window and enter the following code, replacint <i>db_folder_path</i> with the absolute path to the db folder you've made:
~~~
  mongod --port 27017 --dbpath "db_folder_path"
~~~
- Open your command window in the root folder of the app and enter:
~~~
  npm install
  npm test
~~~
- Mocha should now run and display the tests that are being run.
