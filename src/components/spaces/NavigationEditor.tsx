import React, { useState } from 'react';
import Button from 'antd/lib/button';
import { Form, Field, withFormik, FormikProps, FieldArray } from 'formik';
import { Option } from '@polkadot/types';
import Section from '../utils/Section';
import { spacesQueryToProp, getNewIdFromEvent, getTxParams, withMulti, withCalls } from '../substrate';
import { Loading } from '../utils';
import { useMyAddress } from '../auth/MyAccountContext';
import Router from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { AutoComplete, Switch, Affix, Alert } from 'antd';
import Select, { SelectValue } from 'antd/lib/select';
import EditableTagGroup from '../utils/EditableTagGroup';
import ReorderNavTabs from '../utils/ReorderNavTabs';
import dynamic from 'next/dynamic';
import { withSpaceIdFromUrl } from './withSpaceIdFromUrl';
import { validationSchema } from './NavValidation';
import SpacegedSectionTitle from './SpacedSectionTitle';
import { Space, IpfsCid } from '@subsocial/types/substrate/interfaces';
import { SpaceContent, NavTab } from '@subsocial/types/offchain';
import { SpaceUpdate, OptionOptionText, OptionBool, OptionIpfsContent } from '@subsocial/types/substrate/classes';
import BN from 'bn.js'
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import DfMdEditor from '../utils/DfMdEditor';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { TxFailedCallback, TxCallback } from '../substrate/SubstrateTxButton';
import { SpaceNotFound } from './helpers';
import NoData from '../utils/EmptyList';
import { resolveCidOfContent } from '@subsocial/api/utils';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

export interface FormValues {
  navTabs: NavTab[]
}

interface OuterProps {
  struct: Space;
  json: SpaceContent;
  spaceId: BN;
}

const InnerForm = (props: OuterProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    isValid,
    isSubmitting,
    setSubmitting,
    struct,
    spaceId,
    json
  } = props;

  const {
    navTabs
  } = values;

  const {
    about,
    image,
    tags: spaceTags = [],
    name,
    email,
    links
  } = json

  const getMaxId = (): number => {
    if (navTabs.length === 0) return 0

    const x = navTabs.reduce((cur, prev) => (cur.id > prev.id ? cur : prev))
    return x.id
  }
  const typesOfContent = [ 'url', 'by-tag' ]

  const defaultTab = { id: getMaxId() + 1, title: '', type: 'url', description: '', content: { data: '' }, hidden: false }

  const renderValueField = (nt: NavTab, index: number) => {
    switch (nt.type) {
      case 'url': {
        const url = nt.content.data ? nt.content.data : ''
        return (
          <Field
            type="text"
            name={`nt.${index}.content.data`}
            value={url}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.content.data`, e.currentTarget.value)}
          />
        )
      }
      case 'by-tag': {
        const tags = nt.content.data as string[] || []
        return (
          <div className="NETagsWrapper">
            <EditableTagGroup
              name={`navTabs.${index}.content.data`}
              tags={tags}
              tagSuggestions={spaceTags}
              setFieldValue={setFieldValue}
            />
          </div>
        )
      }
      default: {
        return undefined
      }
    }
  }

  const handleSaveNavOrder = (tabs: NavTab[]) => {
    setFieldValue('navTabs', tabs)
  }

  const handleTypeChange = (e: SelectValue, index: number) => {
    setFieldValue(`navTabs.${index}.type`, e)
    setFieldValue(`navTabs.${index}.content.data`, '')
  }

  const renderError = (index: number, name: keyof NavTab) => {
    if (touched &&
      errors.navTabs && errors.navTabs[index]?.[name]) {
      return <div className='ui pointing red label NEErrorMessage'>{errors.navTabs[index]?.[name]}</div>
    }
    return null
  }

  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>();

  const onTxFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess: TxCallback = (txResult) => {
    setSubmitting(false);

    const _id = spaceId || getNewIdFromEvent(txResult);
    _id && goToView(_id);
  };

  const goToView = (id: BN) => {
    Router.push('[spaceId]', '/' + id.toString()).catch(console.log);
  };

  const newTxParams = (hash: IpfsCid) => {
    if (!isValid || !struct) return [];

    const update = new SpaceUpdate({
      handle: new OptionOptionText(null),
      content: new OptionIpfsContent(hash),
      hidden: new OptionBool(false) // TODO has no implementation on UI
    });
    return [ struct.id, update ];
  };

  const pageTitle = `Edit space navigation`

  const sectionTitle =
    <SpacegedSectionTitle space={{ struct, content: json }} subtitle={pageTitle} />

  return <>
    <HeadMeta title={pageTitle} />
    <div className='NavEditorWrapper'>
      <Section className='EditEntityBox NavigationEditor' title={sectionTitle}>
        <Form className='ui form DfForm NavigationEditorForm'>
          <FieldArray
            name="navTabs"
            render={arrayHelpers => (
              <div>
                {values.navTabs && values.navTabs.length > 0 && (
                  values.navTabs.map((nt, index) => (
                    <div className={`NERow ${(nt.hidden ? 'NEHidden' : '')}`} key={nt.id}>

                      <div className="NEText">Tab name:</div>
                      <Field
                        type="text"
                        name={`nt.${index}.title`}
                        placeholder="Tab name"
                        style={{ maxWidth: '30rem' }}
                        value={nt.title}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.title`, e.currentTarget.value)}
                      />
                      {renderError(index, 'title')}

                      <div className="NEText">Type of content:</div>
                      <Field
                        component={Select}
                        name={`nt.${index}.type`}
                        defaultValue={nt.type}
                        onChange={(e: SelectValue) => handleTypeChange(e, index)}
                        className={'NESelectType'}
                      >
                        {
                          typesOfContent.map((x) => <AutoComplete.Option key={x} value={x}>{x}</AutoComplete.Option>)
                        }
                      </Field>

                      <div className="NEText">Value:</div>
                      {renderValueField(nt, index)}

                      <div className="NEText">Description:</div>
                      <Field
                        component={DfMdEditor}
                        name={`navTabs.${index}.description`} value={nt.description}
                        onChange={(data: string) => setFieldValue(`navTabs.${index}.description`, data)}
                        className={`NETextEditor`} />

                      <div className="NEButtonsWrapper">
                        <div className="NEHideButton">
                          <Switch onChange={() => setFieldValue(`navTabs.${index}.hidden`, !nt.hidden)} />
                          Don't show this tab in space navigation
                        </div>
                        <div className="NERemoveButton">
                          <Button onClick={() => arrayHelpers.remove(index)}>Delete tab</Button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
                <div className="NERow">
                  <div
                    className="NEAddTab"
                    onClick={() => { arrayHelpers.push(defaultTab) }}
                  >
                    + Add Tab
                  </div>
                </div>
              </div>
            )}
          />

          <TxButton
            type='primary'
            label={'Update Navigation'}
            disabled={!isValid || isSubmitting}
            params={() => getTxParams({
              json: { name, about, image, email, links, tags: spaceTags, navTabs },
              buildTxParamsCallback: newTxParams,
              setIpfsCid,
              ipfs
            })}
            tx={'spaces.updateSpace'}
            onFailed={onTxFailed}
            onSuccess={onTxSuccess}
          />

        </Form>
      </Section>

      <Affix offsetTop={80}>
        <div style={{ marginLeft: '2rem', minWidth: '300px' }}>
          <Alert type="info" showIcon closable message="Drag tabs to reorder them." style={{ marginBottom: '1rem' }} />
          <ReorderNavTabs tabs={navTabs} onChange={(tabs: NavTab[]) => handleSaveNavOrder(tabs)} />
        </div>
      </Affix>
    </div>
  </>
}

export interface NavEditorFormProps {
  struct: Space;
  json: SpaceContent;
  spaceId: BN;
}

export const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  mapPropsToValues: props => {
    const { json } = props;
    if (json && json.navTabs) {
      return {
        navTabs: json.navTabs
      };
    } else {
      return {
        navTabs: []
      };
    }
  },

  validationSchema,

  handleSubmit: values => {
    console.log(values)
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  structOpt: Option<Space>;
};

// TODO refactor copypasta. See the same function in EditSpace
function LoadStruct (props: LoadStructProps) {
  const myAddress = useMyAddress()
  const { structOpt } = props;
  const [ json, setJson ] = useState<SpaceContent>();
  const [ struct, setStruct ] = useState<Space>();
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
  };

  useSubsocialEffect(({ ipfs }) => {
    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

    setStruct(structOpt.unwrap());

    if (!struct) return toggleTrigger();

    const cid = resolveCidOfContent(struct.content)

    cid && ipfs.findSpace(cid).then(json => {
      setJson(json);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (!struct || !struct.owner.eq(myAddress)) {
    return <NoData description='You have no rights to edit this space' />
  }

  if (structOpt.isNone) {
    return <SpaceNotFound />
  }

  return <NavigationEditor {...props} struct={struct} json={json as SpaceContent} />;
}

export const EditNavigation = withMulti(
  LoadStruct,
  withSpaceIdFromUrl,
  withCalls<OuterProps>(
    spacesQueryToProp('spaceById', { paramName: 'spaceId', propName: 'structOpt' })
  )
);

export default EditNavigation;
