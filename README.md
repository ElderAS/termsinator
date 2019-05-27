# termsinator

[![Build Status](https://travis-ci.org/ElderAS/termsinator.svg?branch=master&style=flat-square)](https://travis-ci.org/ElderAS/termsinator)
[![npm](https://img.shields.io/npm/dt/termsinator.svg?style=flat-square)](https://www.npmjs.com/package/termsinator)
[![npm](https://img.shields.io/npm/v/termsinator.svg?style=flat-square)](https://www.npmjs.com/package/termsinator)

Plugin to simplify consent management.

### Requirements

This plugin is based on the following stack:

- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)

### Installation

`npm install --save termsinator`

### Usage

```js
const Termsinator = require('termsinator')

/* This is the most simplest configuration, check out the docs for more features */
Termsinator.config({
  server: {
    endpoint: '/terms-and-conditions',
    host: 'https://myapp.com',
    instance: INSTANCE, // Express instance
    extractUser: function(req) {
      /* Must return a mongoose document with the same 
         type as defined in `database.schema` options */
      return req.user
    },
  },
  database: {
    schema: userSchema,
    setConsentOnCreate: function(doc) {
      return false
    },
  },
  ui: {
    logo: 'https://myapp.com/logo', //Path
    title: 'Avtalevilkår',
    termsLink: 'Les gjennom avtalevilkårene',
    termsCheckbox: 'Jeg godtar avtalevilkårene',
    submitButton: 'Send og godkjenn',
  },
  documents: JSON, // JSON -> containing all terms and conditions -> see doc
})
```

### Config

You can configurate `Termsinator` anytime by calling:

```js
Termsinator.config({
  /* Your config */
})
```

The following props are available for configuration:

#### server

Sets all necessary endpoints.
It should look like this:

```js
Termsinator.config({
  server: {
    endpoint: '/terms-and-conditions', // Your preferred endpoint for TAC management
    host: 'https://myapp.com', // Host address of your app
    instance: INSTANCE, // Express instance
    extractUser: function(req) {
      /* Must return a mongoose document with the same 
         type as defined in `database.schema` options */
      return req.user
    },
  },
})
```

#### database

Sets schema methods and hooks.

It should look like this:

```js
Termsinator.config({
  database: {
    schema: userSchema, // Your user schema
    setConsentOnCreate: function(doc) {
      // Determine if consent should be set on creation, return true or false
      return false
    },
  },
})
```

`Termsinator` will expose the following methods on all of your user documents:

`userDocument.getConsent()` -> return the current consent status and all historical consents

```js
{
  current: {
    date: '...', // Date of consent action - null if no consent given
    status: '...', //Enum: ['accepted', 'declined', 'undetermined']
    document: '...', //Path to terms document
    metadata: {
      id: '...', // Document ID
      date: '...', // Document date
      message: '...', // Document message (Changelog)
    }
  },
  history: [CONSENT], // Array of historical consents (same as "current")
}
```

`userDocument.setConsent()` -> return the current consent status and all historical consents

```js
userDocument.setConsent({
  id: '...', // Document ID to be consented
  status: '...', //Enum: ['accepted', 'declined']
})
```

#### ui

Set ui spesific properties like i18n, logo etc.

Example:

```js
ui: {
  logo: 'https://myapp.com/logo',
  title: 'Avtalevilkår',
  termsLink: 'Les gjennom avtalevilkårene',
  termsCheckbox: 'Jeg godtar avtalevilkårene',
  submitButton: 'Send og godkjenn',
}
```

It is also possible to set ui with a function that has the request as first parameter. This allows for more dynamic content.

Example:

```js
ui: req => {
  // Do something like language resolving etc
  return {
    logo: 'https://myapp.com/logo',
    title: 'Avtalevilkår',
    termsLink: 'Les gjennom avtalevilkårene',
    termsCheckbox: 'Jeg godtar avtalevilkårene',
    submitButton: 'Send og godkjenn',
  }
}
```

#### documents

Manage your terms & conditions, add new terms etc.

Example:

```js
;[
  {
    id: '1.0.0',
    document: '/terms/Terms-1-0-0.pdf', // Relative path (from project root) to file on disk
    date: '2018-11-01T14:29:24.811Z',
  },
  {
    id: '1.1.0',
    document: '/terms/Terms-1-1-0.pdf', // Relative path (from project root) to file on disk
    message: 'Changes in usage of user properties',
    date: '2018-11-01T15:29:24.811Z',
  },
]
```

## License

[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) Carsten Jacobsen
