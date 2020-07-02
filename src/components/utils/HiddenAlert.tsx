import React from 'react'
import { Post, Space } from '@subsocial/types/substrate/interfaces'
import { Alert } from 'antd'
import HiddenSpaceButton from '../spaces/HiddenSpaceButton'
import HiddenPostButton from '../posts/HiddenPostButton'
import { isMyAddress } from '../auth/MyAccountContext'

type HiddenAlertProps = {
  type: 'post' | 'space',
  struct: Post | Space,
  showEveryone?: boolean
}

export const HiddenAlert = ({ struct, type, showEveryone }: HiddenAlertProps) => {
  const isSpace = type === 'space';
  const address = isSpace ? (struct as Space).owner : struct.created.account

  if (!struct.hidden.valueOf() || (!showEveryone && !isMyAddress(address))) return null;

  const HiddenButton = () => isSpace ? <HiddenSpaceButton space={struct as Space} /> : <HiddenPostButton post={struct as Post} />
  return <Alert
    className='mb-3'
    style={{ fontSize: '1.5rem' }}
    message={
      <div className='mx-2 d-flex justify-content-between' style={{ fontSize: '1.25rem' }}>
        This {type} is hidden and only you can see it
        <HiddenButton />
      </div>
    }
    banner
    closable
    type="warning"
  />
}

export default HiddenAlert;