import React from 'react';
import { ViewBlog } from './ViewBlog';
import { BlogId } from '../types';
import { useStorybookContext } from '../utils/StorybookContext';

type Props = {
  blogId: BlogId
  title: JSX.Element | string
}

export const BloggedSectionTitle = ({
  blogId,
  title
}: Props) => {
  const { isStorybook } = useStorybookContext()
  return <>
    {!isStorybook && <>
      <a href={`/blogs/${blogId.toString()}`}>
        <ViewBlog nameOnly={true} id={blogId} />
      </a>
      <span style={{ margin: '0 .75rem' }}>/</span>
    </>}
    {title}
  </>
}

export default BloggedSectionTitle
