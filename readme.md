# Express Messagely API

Project: Backend Express application with a RESTful API for users to register, login, message other users, and view exchanged messages. Optional feature to send text messages to cell phones via the Twilio API.

## Available Scripts

App requires PostgreSQL database setup.
To create/seed the app database, and create a test database with psql:

    psql -f messagely.sql

App requires a `.env` file in the main directory with:
- SECRET_KEY = secret (or any secret key of choice)
- (OPTIONAL) A Twilio account with API access:
    - TWILIO_ACCOUNT_SID =
    - TWILIO_AUTH_TOKEN =
    - TWILIO_PHONE =
    - MY_PHONE =

### In the project directory, you can:

Install required dependencies from package.json:

    npm install

Run the app in the development mode on port 3000, [http://localhost:3000](http://localhost:3000):

    npm start

Run all tests:

    npm test

Run all tests and display coverage report:

    jest -i --coverage
