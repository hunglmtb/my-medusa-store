import React, { memo } from 'react'
import { Order } from '@medusajs/medusa'
import { useTranslation } from 'react-i18next'

const HandingVisaResult = memo(({ order }: { order: Order }) => {
  const { t } = useTranslation()
  return (
    <div>
      <span>TBD</span>
      <span>update for visa result here</span>
    </div>
  )
})

export default HandingVisaResult
