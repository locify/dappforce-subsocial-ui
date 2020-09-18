import React from 'react'
import { Space } from '@subsocial/types/substrate/interfaces'
import { ViewComment } from './ViewComment';
import { NewComment } from './CreateComment';
import mdToText from 'markdown-to-txt';
import { HeadMeta } from '../utils/HeadMeta';
import { PostWithSomeDetails, PostData } from '@subsocial/types/dto';
import { NextPage } from 'next';
import { getProfileName } from '../substrate';
import { Pluralize } from '../utils/Plularize';
import ViewPostLink from '../posts/ViewPostLink';
import { CommentsTree } from './CommentTree';
import Section from '../utils/Section';

type CommentSectionProps = {
  space: Space,
  post: PostWithSomeDetails,
  replies?: PostWithSomeDetails[],
  hashId?: string
}

export const CommentSection: React.FunctionComponent<CommentSectionProps> = React.memo(({ post, hashId, space, replies = [] }) => {
  const { post: { struct } } = post;
  const { total_replies_count } = struct
  const totalCount = total_replies_count.toString()

  return <Section id={hashId} className='DfCommentSection'>
    <h3><Pluralize count={totalCount} singularText='comment' /></h3>
    <NewComment
      post={struct}
    />
    <CommentsTree parent={struct} space={space} replies={replies} />
  </Section>
})

type CommentPageProps = {
  comment: PostWithSomeDetails,
  parentPost: PostData,
  space: Space,
  replies: PostWithSomeDetails[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentPost, replies, space }) => {
  const { post: { struct, content }, owner } = comment;
  const { content: postContent } = parentPost;
  const address = struct.created.account.toString()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => <>
    In response to{' '}
    <ViewPostLink space={space} post={parentPost.struct} title={postContent?.title} />
  </>

  return <Section className='DfContentPage DfEntirePost'>
    <HeadMeta title={`${profileName} commented on ${content?.title}`} desc={mdToText(content?.body)} />
    {renderResponseTitle()}
    <ViewComment space={space} comment={comment} replies={replies} withShowReplies />
  </Section>

}
