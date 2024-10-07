import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { Order, OrderEdit } from '@medusajs/medusa'
import { LineItem } from '@medusajs/medusa/dist/models/line-item'
import { HandingStep } from '../../../utils/handing-flow'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { OrderEditContext } from '../../../../domain/orders/edit/context'

export type IOrderEditForHandingStepContext = {
  orderEditForPre?: OrderEdit
  orderEditForSubmitted?: OrderEdit
  currentStep: HandingStep
}

export const OrderEditForHandingStepContext = createContext<IOrderEditForHandingStepContext>({ currentStep: HandingStep.PendingApprove })

function OrderEditForHandingStepContextProvider({ order, children }: PropsWithChildren<{ order: Order }>) {
  // @ts-ignore
  const { orderEdits } = useContext(OrderEditContext)
  const value = useMemo(() => {
    const orderEditsByStep = orderEdits?.reduce((previous, oe) => {
      if (oe.status === 'created') {
        if (oe.internal_note === HandingStep.PreVisaApplication) previous[HandingStep.PreVisaApplication] = oe
        else if (oe.internal_note === HandingStep.SubmittedVisaApplication) previous[HandingStep.SubmittedVisaApplication] = oe
      }
      return previous
    }, {} as Record<string, OrderEdit>)

    const itemsByTask = order?.items.reduce((previous, item) => {
      if (item?.metadata?.step && typeof item?.metadata?.step === 'string') previous[item?.metadata.step] = item
      return previous
    }, {} as Record<string, LineItem>)

    const itemForPre = itemsByTask?.[HandingStep.PreVisaApplication]
    const itemForSubmitted = itemsByTask?.[HandingStep.SubmittedVisaApplication]

    const orderEditForPre = orderEditsByStep?.[HandingStep.PreVisaApplication]
    const orderEditForSubmitted = orderEditsByStep?.[HandingStep.SubmittedVisaApplication]
    let currentStep: HandingStep

    if (itemForSubmitted) {
      if (orderEditForSubmitted) currentStep = HandingStep.ReSubmittedVisaApplication
      else if (orderEditForPre) currentStep = HandingStep.RePreVisaApplication
      else currentStep = HandingStep.COMPLETED
    } else if (itemForPre) {
      if (orderEditForPre) currentStep = HandingStep.RePreVisaApplication
      else currentStep = HandingStep.SubmittedVisaApplication
    } else if (orderEditForPre) currentStep = HandingStep.PreVisaApplication
    else currentStep = HandingStep.PendingApprove

    // console.log('OrderEditForHandingStepContextProvider over order', order, orderEdits, currentStep, orderEditForPre, orderEditForSubmitted)
    return {
      orderEditForPre,
      orderEditForSubmitted,
      currentStep,
    }
  }, [order, orderEdits])

  return <OrderEditForHandingStepContext.Provider value={value}>{children}</OrderEditForHandingStepContext.Provider>
}

export default OrderEditForHandingStepContextProvider
