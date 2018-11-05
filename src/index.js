const Utils = require('./utils')
const path = require('path')
const router = require('express').Router()
const cors = require('cors')
const Mustache = require('mustache')
const { URL } = require('url')
const fs = require('fs')
const Defaults = require('./defaults')
const validOptions = ['server', 'database', 'documents', 'ui']

const scriptContent = fs.readFileSync(path.resolve(__dirname + '/../dist/script.js'), { encoding: 'utf-8' })
const middlewareContent = fs.readFileSync(path.resolve(__dirname + '/middleware.html'), { encoding: 'utf-8' })

function Termsinator() {
  this.options = {
    server: {
      enpoint: null,
      instance: null,
      host: null,
      extractUser: Defaults.extractUser,
    },
    database: {
      schema: null,
      setConsentOnCreate: Defaults.setConsentOnCreate,
    },
    ui: Defaults.ui,
    documents: [],
  }

  return {
    config: (options = {}) => {
      Object.keys(options).forEach(key => {
        if (!validOptions.includes(key)) return
        this['set' + Utils.Capitalize(key)](options[key])
      })
    },
    middleware: () => (req, res, next) => {
      Promise.resolve(this.options.server.extractUser(req))
        .then(user => user.getConsent())
        .then(consent => {
          if (consent.current.status === 'accepted') return next()
          const url = new URL(this.options.server.endpoint, this.options.server.host)
          return res.send(Mustache.render(middlewareContent, { base: url.href, ui: this.options.ui }))
        })
        .catch(err => next(err))
    },
  }
}

Termsinator.prototype.getDocumentById = function(id) {
  return this.options.documents.find(d => d.id === id)
}

Termsinator.prototype.getLatestDocument = function() {
  return this.options.documents
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .pop()
}

Termsinator.prototype.resolveDocumentUrl = function(entry) {
  return Utils.TrailingSlash(this.options.server.endpoint) + 'docs/' + entry.id + '/document'
}

Termsinator.prototype.resolveDocumentEntry = function(entry) {
  return {
    id: entry.id,
    status: entry.status,
    date: entry.date,
    message: entry.message,
    document: this.resolveDocumentUrl(entry),
  }
}

Termsinator.prototype.setUi = function(options = {}) {
  Object.assign(this.options.ui, options)
}

Termsinator.prototype.setServer = function(options = {}) {
  Object.assign(this.options.server, options)
  let { instance, extractUser, endpoint } = this.options.server

  router.get('/', (req, res, next) => {
    Promise.resolve(extractUser(req))
      .then(user => user.getConsent())
      .then(consent => res.json(consent))
      .catch(err => next(err))
  })

  router.get('/docs/latest', (req, res, next) => {
    let entry = this.getLatestDocument()
    if (!entry) return res.sendStatus(404)
    return res.redirect(Utils.TrailingSlash(endpoint) + 'docs/' + entry.id)
  })

  router.get('/docs/latest/document', (req, res, next) => {
    let entry = this.getLatestDocument()
    if (!entry) return res.sendStatus(404)
    return res.redirect(Utils.TrailingSlash(endpoint) + 'docs/' + entry.id + '/document')
  })

  router.post('/', (req, res, next) => {
    Promise.resolve(extractUser(req))
      .then(user => user.setConsent(req.body, true))
      .then(() => res.sendStatus(200))
      .catch(err => next(err))
  })

  router.get('/docs/:id', (req, res, next) => {
    let entry = this.getDocumentById(req.params.id)
    if (!entry) return res.sendStatus(404)
    return res.json(this.resolveDocumentEntry(entry))
  })

  router.get('/docs/:id/document', (req, res, next) => {
    let entry = this.getDocumentById(req.params.id)
    if (!entry) return res.sendStatus(404)
    return res.sendFile(path.resolve(entry.document))
  })

  router.get('/script.js', (req, res, next) => {
    const url = new URL(this.options.server.endpoint, this.options.server.host)
    return res.send(Mustache.render(scriptContent, { base: url.href, ui: this.options.ui }))
  })

  instance.use(
    Utils.TrailingSlash(endpoint),
    cors(),
    function(req, res, next) {
      res.header('Cache-Control', 'no-cache')
      next()
    },
    router,
  )
}

Termsinator.prototype.setDocuments = function(documents = []) {
  this.options.documents = documents
}

Termsinator.prototype.setDatabase = function(options = {}) {
  Object.assign(this.options.database, options)
  let { schema, setConsentOnCreate } = this.options.database
  let that = this

  schema.add({
    termsinator: [
      {
        id: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: true,
          enum: ['accepted', 'declined'],
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  })

  schema.pre('save', function(next) {
    Promise.resolve(setConsentOnCreate(this))
      .then(state => {
        if (!state) return next()
        let latest = that.getLatestDocument()
        this.setConsent({
          status: 'accepted',
          id: latest.id,
        })

        next()
      })
      .catch(err => next())
  })

  schema.methods.setConsent = function({ status, id }, save = false) {
    if (!this.termsinator) this.termsinator = []
    this.termsinator.push({
      id,
      status,
      date: new Date(),
    })

    return this.save()
  }

  schema.methods.getConsent = function() {
    let user = this
    let entries = user.termsinator ? user.termsinator.sort((a, b) => new Date(b.date) - new Date(a.date)) : []
    let latest = that.getLatestDocument()
    let { document, ...latest_rest } = latest
    let latestUserConsent = entries.find(entry => entry.id === latest.id)

    return {
      current: {
        date: latestUserConsent ? latestUserConsent.date : null,
        status: latestUserConsent ? latestUserConsent.status : 'undetermined',
        document: that.resolveDocumentUrl(latest),
        metadata: latest_rest,
      },
      history: entries
        .filter(entry => entry !== latestUserConsent)
        .map(entry => that.resolveDocumentEntry(entry.toJSON())),
    }
  }
}

module.exports = new Termsinator()
