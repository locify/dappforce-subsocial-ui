import React from 'react';

import Button from 'antd/lib/button';
import { isMobile } from 'react-device-detect';
import { useAuth, ModalKind } from './AuthContext';
import { useMyAccount } from './MyAccountContext';
import { useApi } from '@subsocial/react-hooks';

type InnerAuthButtonProps = {
  type?: 'default' | 'primary' | 'link'
  size?: 'small' | 'default' | 'large',
  title?: string,
  className?: string
}

type OpenAuthButton = InnerAuthButtonProps & {
  kind: ModalKind
}

export function OpenAuthButton ({
  type = 'default',
  size = isMobile ? 'small' : 'default',
  title = 'Click me',
  kind = 'OnBoarding',
  className
}: OpenAuthButton) {
  const { isApiReady } = useApi()
  const { openSignInModal } = useAuth()
  return <Button
    size={size}
    className={className}
    disabled={!isApiReady}
    type={type}
    onClick={() => openSignInModal(kind)}>
    {title}
  </Button>;
}

type SignInButtonProps = InnerAuthButtonProps & {
  isPrimary?: boolean
};

export const SignInButton = ({
  isPrimary,
  size,
  title = 'Sign in'
}: SignInButtonProps) => (
  <OpenAuthButton
    type={isPrimary ? 'primary' : 'default'}
    size={size}
    title={title}
    kind={'OnBoarding'}
  />
)

type ChangeAccountButtonProps = InnerAuthButtonProps

export const ChangeAccountButton = ({
  size,
  title = 'Change account'
}: ChangeAccountButtonProps) => (
  <OpenAuthButton
    kind={'ChangeAccount'}
    type={'link'}
    size={size}
    title={title}
    className='DfChangeAccountButton'
  />
)

type SignOutButtonProps = InnerAuthButtonProps & {

};

export function SignOutButton ({
  size = isMobile ? 'small' : 'default',
  title = 'Sign out'
}: SignOutButtonProps) {
  const { signOut } = useMyAccount()
  return <div className='m-3'>
    <Button
      block
      size={size}
      onClick={() => signOut()}>
      {title}
    </Button>
  </div>
}