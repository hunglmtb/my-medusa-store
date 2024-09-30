import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa'
import { AppConfigModule } from '../../../types/app'

type PostBody = {
  to: string
  templateIdKey: string
  dynamic_template_data?: Record<string, any>
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sendgridService = req.scope.resolve('sendgridService')
  const configModule = req.scope.resolve<AppConfigModule>('configModule')
  const { senderName, emailTemplates } = configModule.projectConfig
  const body = req.body as PostBody
  const sendgridPlugin = configModule.plugins.find((p) => typeof p !== 'string' && p.resolve === 'medusa-plugin-sendgrid')
  // @ts-ignore
  const { from: email } = sendgridPlugin?.options || {}
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { to, templateIdKey, dynamic_template_data = {} } = body
  if (email) {
    if (to && templateIdKey && emailTemplates[templateIdKey]) {
      const sendOptions = {
        templateId: emailTemplates[templateIdKey],
        from: { name: senderName, email },
        to: body.to,
        dynamic_template_data,
      }
      const result = await sendgridService.sendEmail(sendOptions)
      res.status(200).json({ result })
    } else res.status(400).json({ result: 'check post params', body })
  } else res.status(400).json({ result: 'sendgrid config not found' })
}
