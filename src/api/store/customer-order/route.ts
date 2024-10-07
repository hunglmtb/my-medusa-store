import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa'
import { DraftOrderService, CustomerService, RegionService, ShippingOptionService } from '@medusajs/medusa'
import { DraftOrderCreateProps } from '@medusajs/medusa/dist/types/draft-orders'
import { AppConfigModule } from '../../../types/app'

type PostBody = {
  title: string
  metadata?: Record<string, string>
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // @ts-ignore
  const { customer_id: customerId, email } = req.user

  if (!customerId) {
    res.json({ message: `You have to sign in and have verified email ${customerId} ${email}` }).status(401)
    return
  }
  let customerEmail = email
  if (!customerEmail) {
    const customerService: CustomerService = req.scope.resolve('customerService')
    const customer = await customerService.retrieve(customerId)
    if (!customer) {
      res.json({ message: `customer Id not found ${customerId}` }).status(401)
      return
    }
    customerEmail = customer.email
  }

  const { title, metadata } = req.body as PostBody
  // const productService: ProductService = req.scope.resolve('productService')
  const regionService: RegionService = req.scope.resolve('regionService')
  const shippingOptionService: ShippingOptionService = req.scope.resolve('shippingOptionService')
  const draftOrderService: DraftOrderService = req.scope.resolve('draftOrderService')

  /* const product = await productService.retrieveByExternalId(productExternalId)
  if (!product) {
    res.json({ message: `product not found by productExternalId ${productExternalId}` }).status(401)
    return
  } */
  /* const variantId = product.variants?.[0].id
  if (!variantId) {
    res.json({ message: `could not find variantId of productExternalId: ${productExternalId}` }).status(401)
    return
  } */

  const regions = await regionService.list()
  if (regions.length <= 0) {
    res.json({ message: `empty regions` }).status(400)
    return
  }
  const shippingOptions = await shippingOptionService.list()
  if (shippingOptions.length <= 0) {
    res.json({ message: `empty shipping Option` }).status(400)
    return
  }

  const draft: DraftOrderCreateProps = {
    customer_id: customerId,
    email: customerEmail,
    // @ts-ignore
    items: [{ title, quantity: 1, thumbnail: metadata?.cover_image }],
    metadata,
    region_id: regions[0].id,
    shipping_methods: [{ option_id: shippingOptions[0].id }],
    status: 'pending',
  }
  const draftOrder = await draftOrderService.create(draft)
  if (customerEmail && draftOrder) {
    const sendgridService = req.scope.resolve('sendgridService')
    const configModule = req.scope.resolve<AppConfigModule>('configModule')
    const { senderName, emailTemplates } = configModule.projectConfig
    const sendgridPlugin = configModule.plugins.find((p) => typeof p !== 'string' && p.resolve === 'medusa-plugin-sendgrid')
    const from = typeof sendgridPlugin !== 'string' ? sendgridPlugin?.options?.from : undefined
    if (from && emailTemplates.registerProjectPlaced) {
      const sendOptions = {
        templateId: emailTemplates.registerProjectPlaced,
        from: { name: senderName, email: from },
        to: customerEmail,
      }
      sendgridService.sendEmail(sendOptions)
    } else console.log('check sendgrid config')
  } else console.log('customer has not email for sendgrid')

  res.json({ draftOrder })
}
