import './styles.scss'
import Request from './request'
import CreateElement from './createElement'

const API = {
  get() {
    return Request({ url: '{{{base}}}', method: 'GET' })
  },
  post(body) {
    return Request({ url: '{{{base}}}', method: 'POST', body })
  },
}

const ID = Math.random().toString(36).substr(2, 9)

const Modal = {
  show(consent) {
    let el = CreateElement(
      'form',
      {
        className: 'termsinator',
        onsubmit(event) {
          event.preventDefault()
          let submit = el.querySelector('.termsinator__submit')
          submit.classList.add('termsinator__button--loading')
          SetConsent(consent).then(() => {
            if (document.documentElement.getAttribute('termsinator-middleware')) window.location.reload()
            else document.body.removeChild(el)
          })
        },
      },
      CreateElement('div', { className: 'termsinator__modal' }, [
        CreateElement('div', { className: 'termsinator__header' }, [
          CreateElement('div', { className: 'termsinator__branding' }, [
            CreateElement('h1', {
              innerText: '{{{ui.title}}}',
              className: 'termsinator__title',
            }),
            '{{{ui.logo}}}'
              ? CreateElement('img', {
                  src: '{{{ui.logo}}}',
                  className: 'termsinator__logo',
                })
              : null,
          ]),
          CreateElement(
            'blockquote',
            {
              className: 'termsinator__changelog',
            },
            [
              CreateElement('div', {
                innerHTML: new Date(consent.current.metadata.date).toLocaleDateString(),
                className: 'termsinator__date',
              }),
              consent.current.metadata.message
                ? CreateElement('div', {
                    innerHTML: consent.current.metadata.message,
                    className: 'termsinator__message',
                  })
                : null,
            ],
          ),
        ]),
        CreateElement(
          'object',
          {
            data: `${consent.current.document}#toolbar=0`,
            type: 'application/pdf',
          },
          CreateElement('a', {
            className: 'termsinator__doc-fallback',
            innerText: '{{{ui.termsLink}}}',
            target: '_blank',
            href: consent.current.document,
          }),
        ),
        CreateElement('div', { className: 'termsinator__actions' }, [
          CreateElement('div', { className: 'termsinator__checkbox' }, [
            CreateElement('input', {
              type: 'checkbox',
              required: true,
              id: 'termsinator-consent_' + ID,
            }),
            CreateElement('label', {
              type: 'checkbox',
              for: 'termsinator-consent_' + ID,
              innerText: '{{{ui.termsCheckbox}}}',
            }),
          ]),
          CreateElement('button', {
            className: 'termsinator__button termsinator__submit',
            innerText: '{{{ui.submitButton}}}',
          }),
        ]),
      ]),
    )

    document.body.appendChild(el)
  },
}

function SetConsent(consent) {
  return API.post({
    id: consent.current.metadata.id,
    status: 'accepted',
  })
}

API.get().then(res => {
  if (res.current.status !== 'accepted') Modal.show(res)
})
