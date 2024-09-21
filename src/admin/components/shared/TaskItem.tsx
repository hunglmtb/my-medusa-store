import React, { memo, PropsWithChildren, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HandingStep, TaskProperties } from '../../utils/handing-flow'
import { LineItem } from '@medusajs/medusa/dist/models/line-item'
import { useAdminOrderEditAddLineItem, useAdminOrderEditDeleteLineItem } from 'medusa-react'
// @ts-ignore
import useNotification from '../../../hooks/use-notification'
// @ts-ignore
import { getErrorMessage } from '../../../utils/error-messages'
import { Button } from '@medusajs/ui'

const TaskItem = memo(
  ({ item, orderEditId, property, variantId, step, children }: PropsWithChildren<{ item?: LineItem; orderEditId?: string; property: TaskProperties; variantId: string; step: HandingStep }>) => {
    const { t } = useTranslation()
    const notification = useNotification()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { mutateAsync: addLineItem } = useAdminOrderEditAddLineItem(orderEditId)
    const { mutateAsync: removeLineItem } = useAdminOrderEditDeleteLineItem(orderEditId, item?.id)

    const setProperty = useCallback(
      (metadata: Record<string, string>) => {
        if (isSubmitting || !orderEditId) {
          return
        }
        setIsSubmitting(true)
        const submit = () =>
          addLineItem({ variant_id: variantId, quantity: 1, metadata })
            .then(({ order_edit }) => {
              notification('Send success', 'continue your work', 'success')
              console.log('order_edit', order_edit)
            })
            .catch((err) => notification('Error', getErrorMessage(err), 'error'))
            .finally(() => setIsSubmitting(false))
        if (item?.id) {
          removeLineItem()
            .then((r) => submit())
            .catch((err) => notification('Error', getErrorMessage(err), 'error'))
            .finally(() => setIsSubmitting(false))
        } else submit()
      },
      [variantId, addLineItem, removeLineItem, orderEditId, item],
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

export default TaskItem;