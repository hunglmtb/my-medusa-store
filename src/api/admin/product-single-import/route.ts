import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa'
import { ProductService } from '@medusajs/medusa'
import { CreateProductInput } from '@medusajs/medusa/dist/types/product'

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productInput = req.body as CreateProductInput
  const productService: ProductService = req.scope.resolve('productService')

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { title, external_id } = productInput
  if (!title) {
    res.json({ message: `product must have title` }).status(401)
    return
  }
  if (!external_id) {
    res.json({ message: `product must have external_id` }).status(401)
    return
  }
  const product = await productService.create(productInput)

  res.json({ product })
}
