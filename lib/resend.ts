import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FALLBACK_FROM = 'Cocinarte PDX <noreply@comcreate.org>'

export type EmailOptions = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions) {
  const from = process.env.EMAIL_FROM || FALLBACK_FROM
  const toArray = Array.isArray(options.to) ? options.to : [options.to]

  const payload = {
    from,
    to: toArray,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  }

  const { data, error } = await resend.emails.send(payload)

  if (error) {
    // If the domain isn't verified, retry with the known verified fallback address
    if (error.message?.toLowerCase().includes('domain is not verified') && from !== FALLBACK_FROM) {
      console.warn(`[Resend] Domain not verified for "${from}", retrying with fallback "${FALLBACK_FROM}"`)
      const { data: retryData, error: retryError } = await resend.emails.send({
        ...payload,
        from: FALLBACK_FROM,
      })

      if (retryError) {
        throw new Error(`Failed to send email (fallback): ${retryError.message}`)
      }

      return retryData
    }

    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}
