import React, { useCallback, useContext } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Button } from '@medusajs/ui'
import { Order } from '@medusajs/medusa'
import { useAdminCreateOrderEdit } from 'medusa-react'
import { useTranslation } from 'react-i18next'
// @ts-ignore
// eslint-disable-next-line import/extensions
import BodyCard from '../../../components/organisms/body-card'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { FulfillmentStatusComponent } from '../../../domain/orders/details/templates'
// @ts-ignore
// eslint-disable-next-line import/extensions
import useNotification from '../../../hooks/use-notification'
import { OrderEditForHandingStepContext } from './context/OrderEditForHandingStepContext'
import HandingVisaResult from './HandingVisaResult'
import { HandingStep } from '../../utils/handing-flow'
import PrepareVisaApplication from './PrepareVisaApplication'

let isRequestRunningFlag = false

const HandingFlow = ({ order }: { order: Order }) => {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { id, status, fulfillment_status, items } = order
  const notification = useNotification()
  const { orderEditForPre, orderEditForSubmitted, currentStep } = useContext(OrderEditForHandingStepContext)

  const { mutateAsync: createOrderEdit } = useAdminCreateOrderEdit()
  const requestCreateOrderEditForHanding = useCallback(
    (step: HandingStep) => {
      if (!!orderEditForPre || !!orderEditForSubmitted || isRequestRunningFlag || items.length <= 0) {
        notification('Error', 'There is already other active process of handling the work', 'error')
        return
      }
      isRequestRunningFlag = true
      createOrderEdit({ order_id: id, internal_note: step })
        .then(() => {
          notification('Done', 'Continue the work', 'success')
        })
        .catch(() => {
          notification('Error', 'There is already an active process of handling the work', 'error')
        })
        .finally(() => {
          isRequestRunningFlag = false
        })
    },
    [id, orderEditForPre, orderEditForSubmitted],
  )

  return (
    <div>
      <BodyCard
        className="h-auto min-h-0 w-full"
        title={t('prepare-visa', 'Prepare for Visa Application')}
        status={<FulfillmentStatusComponent status={fulfillment_status} />}
        customActionable={
          status !== 'canceled' && currentStep !== HandingStep.PreVisaApplication && currentStep !== HandingStep.RePreVisaApplication ? (
            <Button variant="secondary" size="small" onClick={() => requestCreateOrderEditForHanding(HandingStep.PreVisaApplication)}>
              {currentStep === HandingStep.PendingApprove ? t('approve-request', 'Begin Flow') : t('re-approve-request', 'Modify')}
            </Button>
          ) : null
        }
      >
        {currentStep !== HandingStep.PendingApprove ? <PrepareVisaApplication order={order} /> : null}
      </BodyCard>
      {currentStep === HandingStep.SubmittedVisaApplication || currentStep === HandingStep.ReSubmittedVisaApplication || currentStep === HandingStep.COMPLETED ? (
        <BodyCard
          className="h-auto min-h-0 w-full"
          title={t('visa-result', 'Visa Application Result')}
          status={<FulfillmentStatusComponent status={fulfillment_status} />}
          customActionable={
            status !== 'canceled' && (
              <Button variant="secondary" size="small" onClick={() => requestCreateOrderEditForHanding(HandingStep.SubmittedVisaApplication)}>
                {t('visa-result-update', 'Visa Result Update')}
              </Button>
            )
          }
        >
          <HandingVisaResult order={order} />
        </BodyCard>
      ) : null}
    </div>
  )
}

export default HandingFlow
