import type { WidgetConfig } from '@medusajs/admin'
import React from 'react'
import { OrderDetailsWidgetProps } from '@medusajs/admin/types/widgets'
import OrderEditForHandingStepContextProvider from '../components/shared/context/OrderEditForHandingStepContext'
import HandingFlow from '../components/shared/HandingFlow'

const HandingFlowWidget = ({ order }: OrderDetailsWidgetProps) => (
  <div>
    <OrderEditForHandingStepContextProvider order={order}>
      <HandingFlow order={order} />
    </OrderEditForHandingStepContextProvider>
  </div>
)

export const config: WidgetConfig = {
  zone: 'order.details.fullfillment.after',
}

export default HandingFlowWidget
