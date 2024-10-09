import type { MedusaRequest, MedusaResponse } from '@medusajs/medusa'
import { defaultAdminDraftOrdersFields, defaultAdminDraftOrdersRelations, DraftOrderService } from '@medusajs/medusa'
import { MedusaError } from 'medusa-core-utils'
// import { defaultAdminOrdersFields, defaultAdminOrdersRelations } from '@medusajs/medusa/dist/types/orders'

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // @ts-ignore
  const { customer_id: customerId, email } = req.user

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, `You have to sign in and have verified email ${customerId} ${email}`)
  }
  const draftOrderService: DraftOrderService = req.scope.resolve('draftOrderService')
  const listDraftOrderConfig = {
    select: defaultAdminDraftOrdersFields,
    relations: defaultAdminDraftOrdersRelations,
    skip: 0,
    take: 10,
  }
  const [draftOrders, count] = await draftOrderService.listAndCount(
    {
      cart: {
        customer_id: customerId,
      },
    },
    listDraftOrderConfig,
  )
  res.json({
    draft_orders: draftOrders,
    count,
    offset: listDraftOrderConfig.skip,
    limit: listDraftOrderConfig.take,
  })

  /* const orderService: OrderService = req.scope.resolve('orderService')
  const listOrderConfig = {
    relations: defaultAdminOrdersRelations,
    skip: 0,
    take: 10,
  }
  const [orders, orderCount] = await orderService.listAndCount(
    {
      customer_id: customerId,
    },
    listOrderConfig,
  )

  res.json({
    draftOrders: {
      draft_orders: draftOrders,
      count,
      offset: listDraftOrderConfig.skip,
      limit: listDraftOrderConfig.take,
    },
    orders: {
      orders,
      count: orderCount,
      offset: listOrderConfig.skip,
      limit: listOrderConfig.take,
    },
  }) */
}
