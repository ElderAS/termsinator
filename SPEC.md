# Specs

## Topics

- Server
  - Endpoints
  - Database
- Frontend

## Dependencies

- Express
- Mongoose

### Server

**Structure (Draft)**

```js
const Termsinator = require('termsinator')

Termsinator.config({
  server: {
    endpoint: '/terms-condition',
    host: 'https://localhost:4040',
    instance: INSTANCE, // Express instance
    extractUser: function(req) {
      // This is the default func
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
    logo: '...', //Path
    title: 'Avtalevilkår',
    termsLink: 'Les gjennom avtaleviklårene',
    termsCheckbox: 'Jeg godtar avtalevilkårene',
    submitButton: 'Send og godkjenn',
  },
  documents: JSON,
})
```

```js
//GET to root of endpoint
let response = {
  current: {
    // CONSENT OBJ
    date: '...',
    status: '...', //Enum: ['accepted', 'declined', 'undetermined']
    document: '...', //Path to terms
    metadata: OBJECT, // -> matching json entry from documents
  },
  history: [CONSENT],
}
```

```js
//POST to root of endpoint
let body = {
  id: '1.0.0',
  status: '...', //Enum: ['accepted', 'declined']
} // Response -> same as GET
```

### Database

**Structure (Draft)**

```js
const user = QUERY() //Mongoose query

//userSchema -> Extension via plugin
{
  //... existing definitions
  termsinator: [
    {
      date: Date,
      status: '...',
      id: '...',
    },
  ]
}

user.setConsent(CONSENT) // sets -> same input as POST
user.getConsent() // returns same as GET
```

### Documents

```json
[
  {
    "id": "1.0.0",
    "document": "/terms-condition/1-0-0.pdf", //Absolute path from project root
    "message": "Custom message...", //can be html
    "date": DATE
  }
]
```

options.database.schema.pre('save', function(next) {
if(options.database.setConsentOnCreate(this)) this.setConsent({})
next()
})
