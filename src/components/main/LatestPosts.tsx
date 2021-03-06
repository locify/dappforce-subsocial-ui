import React from 'react';
import { PostWithAllDetails } from '@subsocial/types';
import PostPreview from '../posts/view-post/PostPreview';
import DataList from '../lists/DataList';

type Props = {
  postsData: PostWithAllDetails[]
  type: 'post' | 'comment'
}

export const LatestPosts = (props: Props) => {
  const { postsData = [], type } = props
  const posts = postsData.filter((x) => typeof x.post.struct !== 'undefined')

  if (posts.length === 0) {
    return null
  }

  return <DataList
    title={`Latest ${type}s`}
    dataSource={postsData}
    renderItem={(item) =>
      <PostPreview postDetails={item} withActions />
    }
  />
}
