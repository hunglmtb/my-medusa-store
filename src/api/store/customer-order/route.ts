import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa'
import { DraftOrderService, CustomerService, RegionService, ShippingOptionService, ProductService, ProductVariantService } from '@medusajs/medusa'
import { DraftOrderCreateProps } from '@medusajs/medusa/dist/types/draft-orders'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MedusaError } from 'medusa-core-utils'
import { AppConfigModule } from '../../../types/app'

type PostBody = {
  title: string
  metadata?: Record<string, string>
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // @ts-ignore
  if (!req.user?.customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, `You have to sign in and have verified email`)
  }
  // @ts-ignore
  const { customer_id: customerId, email } = req.user
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

  if (!metadata.slug) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `post body should have slug`)
  }
  const productService: ProductService = req.scope.resolve('productService')
  const regionService: RegionService = req.scope.resolve('regionService')
  const shippingOptionService: ShippingOptionService = req.scope.resolve('shippingOptionService')
  const draftOrderService: DraftOrderService = req.scope.resolve('draftOrderService')
  const productVariantService: ProductVariantService = req.scope.resolve('productVariantService')

  const regions = await regionService.list()
  if (regions.length <= 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `empty regions`)
  }
  const shippingOptions = await shippingOptionService.list()
  if (shippingOptions.length <= 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `empty shipping Option`)
  }

  let variantId: string
  const variants = await productVariantService.list({ sku: metadata.slug }, { skip: 0, take: 1, select: ['id'] })
  if (variants.length <= 0) {
    const products = await productService.list({ external_id: metadata.slug }, { skip: 0, take: 1, select: ['id'], relations: ['variants'] })
    if (products.length > 0) {
      variantId = products[0].variants?.[0].id
    } else {
      const product = await productService.create({
        title: metadata.title,
        thumbnail: metadata.cover_image,
        external_id: metadata.slug,
        variants: [{ sku: metadata.slug, title: metadata.title, inventory_quantity: 1, prices: [{ amount: 1, currency_code: 'usd' }] }],
      })
      const p = await productService.retrieve(product.id, { relations: ['variants'] })
      if (p.variants?.length > 0) {
        variantId = p.variants?.[0].id
      }
    }
  } else variantId = variants[0].id

  if (!variantId) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `variantId not found or could not be initial`)
  }
  const draft: DraftOrderCreateProps = {
    customer_id: customerId,
    email: customerEmail,
    items: [{ title, quantity: 1, variant_id: variantId, unit_price: 1 }],
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
        dynamicTemplateData: {
          projectTitle: title,
          ...metadata,
        },
      }
      sendgridService.sendEmail(sendOptions)
    } else console.log('check sendgrid config')
  } else console.log('customer has not email for sendgrid')

  res.json({ draftOrder })
}
