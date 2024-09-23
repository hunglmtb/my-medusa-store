import React, { memo, useContext, useMemo, useState } from 'react'
import { Order } from '@medusajs/medusa'
import { Button } from '@medusajs/ui'
import { useAdminConfirmOrderEdit } from 'medusa-react'
import { useTranslation } from 'react-i18next'
import { LineItem } from '@medusajs/medusa/dist/models/line-item'
// @ts-ignore
// eslint-disable-next-line import/extensions
import useNotification from '../../../hooks/use-notification'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { getErrorMessage } from '../../../utils/error-messages'
// @ts-ignore
// eslint-disable-next-line import/extensions
import medusaRequest from '../../../services/request'
import { HandingStep, TaskProperties, TaskPropertiesTexts } from '../../utils/handing-flow'
import { OrderEditForHandingStepContext } from './context/OrderEditForHandingStepContext'
import TaskItem from './TaskItem'

const keys = [TaskProperties[TaskProperties.sendGuidelines], TaskProperties[TaskProperties.applicantPassportUrl], TaskProperties[TaskProperties.sendInvitationLetters]]

const PrepareVisaApplication = memo(({ order }: { order: Order }) => {
  const { t } = useTranslation()
  const notification = useNotification()
  const { orderEditForPre: orderEdit } = useContext(OrderEditForHandingStepContext)
  const [isConfirming, setIsConfirming] = useState(false)
  const { items } = order
  const variantId = items[0].variant_id
  const orderEditId = orderEdit?.id
  const confirmOrderEdit = useAdminConfirmOrderEdit(orderEditId)
  const itemsByProperty = useMemo(() => {
    const currentItems = orderEdit?.items || items
    return keys.reduce((previous, prop) => {
      previous[prop] = currentItems?.find((item) => !!item?.metadata[prop])
      return previous
    }, {} as Record<string, LineItem | undefined>)
  }, [items, orderEdit?.items])

  return (
    <div>
      <TaskItem
        item={itemsByProperty[TaskProperties[TaskProperties.sendGuidelines]]}
        orderEdit={orderEdit}
        property={TaskProperties.sendGuidelines}
        variantId={variantId}
        step={HandingStep.PreVisaApplication}
        preSave={async () => {
          const result = await medusaRequest('POST', `/admin/email`, {
            to: order.customer.email,
            templateIdKey: TaskProperties[TaskProperties.sendGuidelines],
            dynamic_template_data: {
              first_name: order.customer.first_name,
            },
          })
          return !!result
        }}
      >
        <span className="inter-small-regular text-grey-50">
          {t(`visa-application-${TaskProperties[TaskProperties.sendGuidelines]}`, TaskPropertiesTexts[TaskProperties[TaskProperties.sendGuidelines]])}
        </span>
      </TaskItem>
      <TaskItem
        item={itemsByProperty[TaskProperties[TaskProperties.applicantPassportUrl]]}
        orderEdit={orderEdit}
        property={TaskProperties.applicantPassportUrl}
        variantId={variantId}
        step={HandingStep.PreVisaApplication}
      >
        <span className="inter-small-regular text-grey-50">
          {t(`visa-application-${TaskProperties[TaskProperties.applicantPassportUrl]}`, TaskPropertiesTexts[TaskProperties[TaskProperties.applicantPassportUrl]])}
        </span>
      </TaskItem>

      <TaskItem
        item={itemsByProperty[TaskProperties[TaskProperties.sendInvitationLetters]]}
        orderEdit={orderEdit}
        property={TaskProperties.sendInvitationLetters}
        variantId={variantId}
        step={HandingStep.PreVisaApplication}
      >
        <span className="inter-small-regular text-grey-50">
          {t(`visa-application-${TaskProperties[TaskProperties.sendInvitationLetters]}`, TaskPropertiesTexts[TaskProperties[TaskProperties.sendInvitationLetters]])}
        </span>
      </TaskItem>

      {orderEditId ? (
        <div className="mt-4 flex items-center justify-between">
          <span className="inter-small-regular text-grey-50">{t(`visa-application-done`, 'All tasks done, move to next step')}</span>
          <Button
            variant="secondary"
            size="base"
            disabled={!orderEditId}
            isLoading={isConfirming}
            onClick={() => {
              if (orderEditId) {
                setIsConfirming(true)
                confirmOrderEdit.mutate(undefined, {
                  onSuccess: () => {
                    notification('Success', `Successfully confirmed. Move to next Procedure`, 'success')
                    setIsConfirming(false)
                  },
                  onError: (err) => {
                    notification('Error', getErrorMessage(err), 'error')
                    setIsConfirming(false)
                  },
                })
              }
            }}
          >
            Done
          </Button>
        </div>
      ) : null}
    </div>
  )
})

export default PrepareVisaApplication
