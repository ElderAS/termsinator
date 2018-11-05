module.exports = {
  extractUser(req) {
    return req.user
  },
  setConsentOnCreate(doc) {
    return false
  },
  ui: {
    title: 'Terms & Condition',
    termsLink: 'Read our terms & condition',
    termsCheckbox: 'I accept the terms & conditions',
    submitButton: 'Send and accept',
  },
}
