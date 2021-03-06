import { addComments, removeComment } from 'src/redux/slices/replyIdsByPostIdSlice';
import { addPost, removePost, editPost } from 'src/redux/slices/postByIdSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { PostsStoreType } from 'src/redux/types';
import { PostData, PostWithSomeDetails, CommentContent, PostContent, ProfileData } from '@subsocial/types';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';
import { IpfsCid } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { FVoid } from '../utils/types';

type Reply<T> = {
  replyId: T,
  parentId: string
}

type SetCommentStore<T> = {
  reply: Reply<T>,
  comment: PostsStoreType
}

type EditCommentStore = {
  replyId: string,
  comment: PostData
}

export const useRemoveReplyFromStore = (dispatch: Dispatch, reply: Reply<string>) => {
  dispatch(removeComment(reply));
  dispatch(removePost({ postId: reply.replyId }))
}

export const useSetReplyToStore = (dispatch: Dispatch, { reply, comment }: SetCommentStore<string | string[]>) => {
  dispatch(addComments(reply));
  dispatch(addPost({ posts: comment }))
}

export const useChangeReplyToStore = (dispatch: Dispatch, oldReply: Reply<string>, newStore: SetCommentStore<string>) => {
  useRemoveReplyFromStore(dispatch, oldReply)
  useSetReplyToStore(dispatch, newStore)
}

export const useEditReplyToStore = (dispatch: Dispatch, { replyId, comment }: EditCommentStore) => {
  dispatch(editPost({ postId: replyId, post: comment }))
}

type MockComment = {
  fakeId: string,
  address: string,
  owner?: ProfileData,
  content: CommentContent
}

export type CommentTxButtonType = {
  ipfs: SubsocialIpfsApi
  setIpfsCid: (hash: IpfsCid) => void
  json: CommentContent | PostContent,
  fakeId?: string,
  disabled?: boolean,
  onClick?: FVoid,
  onSuccess?: TxCallback,
  onFailed?: TxFailedCallback
}

export const buildMockComment = ({ fakeId, address, owner, content }: MockComment) => {
  return {
    owner,
    post: {
      struct: {
        id: fakeId,
        created: {
          account: address,
          time: new Date().getTime()
        },
        score: 0,
        shares_count: 0,
        direct_replies_count: 0,
        space_id: null,
        extension: { Comment: {} },
        content: { None: null },
        hidden: false
      },
      content: content
    }
  } as any as PostWithSomeDetails
}
