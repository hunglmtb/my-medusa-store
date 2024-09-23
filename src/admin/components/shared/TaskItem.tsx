import React, { memo, PropsWithChildren, useCallback, useState } from 'react'
// import { useTranslation } from 'react-i18next'
import { LineItem } from '@medusajs/medusa/dist/models/line-item'
import { useAdminDeleteOrderEditItemChange, useAdminOrderEditAddLineItem, useAdminOrderEditDeleteLineItem } from 'medusa-react'
import { Button } from '@medusajs/ui'
import { OrderEdit } from '@medusajs/medusa'
import { HandingStep, TaskProperties } from '../../utils/handing-flow'
// @ts-ignore
// eslint-disable-next-line import/extensions
import useNotification from '../../../hooks/use-notification'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { getErrorMessage } from '../../../utils/error-messages'

const TaskItem = memo(
  ({
    item,
    orderEdit,
    property,
    variantId,
    step,
    preSave,
    children,
  }: PropsWithChildren<{ item?: LineItem; orderEdit?: OrderEdit; property: TaskProperties; variantId: string; step: HandingStep; preSave?: () => Promise<boolean> }>) => {
    // const { t } = useTranslation()
    const notification = useNotification()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const orderEditId = orderEdit?.id
    const { mutateAsync: addLineItem } = useAdminOrderEditAddLineItem(orderEditId)
    const itemShouldChangeId = item?.id ? orderEdit?.changes?.find((c) => c.line_item_id === item?.id)?.id : undefined
    const { mutateAsync: removeChangeItem } = useAdminDeleteOrderEditItemChange(orderEditId, itemShouldChangeId)
    const { mutateAsync: removeLineItem } = useAdminOrderEditDeleteLineItem(orderEditId, item?.id)

    const setProperty = useCallback(
      (metadata: Record<string, string>) => {
        if (isSubmitting || !orderEditId) {
          return
        }
        setIsSubmitting(true)
        const submit = () =>
          addLineItem({ variant_id: variantId, quantity: 1, metadata })
            .then(() => {
              notification('Send success', 'continue your work', 'success')
            })
            .catch((err) => notification('Error', getErrorMessage(err), 'error'))
            .finally(() => setIsSubmitting(false))
        const save = () => {
          if (itemShouldChangeId) {
            removeChangeItem()
              .then(() => submit())
              .catch((err) => notification('Error', getErrorMessage(err), 'error'))
              .finally(() => setIsSubmitting(false))
          } else if (item?.id) {
            removeLineItem()
              .then(() => submit())
              .catch((err) => notification('Error', getErrorMessage(err), 'error'))
              .finally(() => setIsSubmitting(false))
          } else submit()
        }
        if (preSave) {
          preSave().then((r) => {
            if (r) save()
            else setIsSubmitting(false)
          })
        } else save()
      },
      [variantId, orderEditId, item, itemShouldChangeId],
    )

    return (
      <div className="mt-4 flex items-center justify-between">
        {children}
        <Button
          variant="secondary"
          size="base"
          isLoading={isSubmitting}
          disabled={!orderEditId}
          onClick={() => {
            setProperty({
              step,
              [TaskProperties[property]]: 'sent',
            })
          }}
        >
          {item?.id ? 'Resubmit' : 'Submit'}
        </Button>
      </div>
    )
  },
)

export default TaskItem
