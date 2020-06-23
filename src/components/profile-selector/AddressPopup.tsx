import React from 'react'
import { Dropdown } from 'antd';
import Address from '../profiles/address-views/Name'
import Avatar from '../profiles/address-views/Avatar'
import { AddressProps } from '../profiles/address-views/utils/types';
import { withLoadedOwner } from '../profiles/address-views/utils/withLoadedOwner';
import { InfoDetails } from '../profiles/address-views';
import { isBrowser } from 'react-device-detect';
import { AccountMenu } from 'src/components/profile-selector/AccountMenu';

export const SelectAddressPreview: React.FunctionComponent<AddressProps> = ({
  address,
  owner
}) => (
  <div className='DfChooseAccount'>
    <div className='DfAddressIcon d-flex align-items-center'>
      <Avatar address={address} avatar={owner?.content?.avatar} />
    </div>
    <div className='DfAddressInfo ui--AddressComponents'>
      <Address asLink={isBrowser} owner={owner} address={address} />
      <InfoDetails address={address} />
    </div>
  </div>
)

export const AddressPopup: React.FunctionComponent<AddressProps> = ({
  address,
  owner
}) => {
  const struct = owner?.struct;
  const reputation = struct?.reputation
  const menu = (
    <AccountMenu address={address} reputation={reputation || 0}/>
  );

  return <Dropdown overlay={menu} placement="bottomLeft">
    <span className='DfCurrentAddress icon'><SelectAddressPreview address={address} owner={owner} /></span>
  </Dropdown>
}

export const AddressPopupWithOwner = withLoadedOwner(AddressPopup);
export const AddressPreviewWithOwner = withLoadedOwner(SelectAddressPreview)
export default AddressPopupWithOwner;