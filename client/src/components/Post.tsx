import { useMatch } from '@tanstack/react-location';
import { useEffect, useMemo, useState } from 'react';
import { createComment } from '../services/comments';
import { LocationGenerics, CommentType } from '../types/PostTypes';
import { CommentForm } from './CommentForm';
import { CommentsList } from './CommentsList';

function groupByParent(comments: CommentType[]) {
  let node: { [key: string]: CommentType[] } = {};
  comments.forEach((comment) => {
    node[comment.parentId] ||= [];
    node[comment.parentId].push(comment);
  });

  return node;
}

export function Post() {
  const {
    data: { post, postId },
  } = useMatch<LocationGenerics>();
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [post?.comments]);

  if (!post) return <div>'Loading......'</div>;

  const groupedComments = useMemo(() => groupByParent(comments), [comments]);
  const getReplies = (parentId: string): CommentType[] => {
    return groupedComments[parentId];
  };

  const handleCommentCreate = async (commentValue: string): Promise<void> => {
    const comment = await createComment(postId!, commentValue, null);
    setComments((prevComments) => [comment, ...prevComments]);
  };

  return (
    <>
      <h1>{post.title}</h1>
      <article>{post.body}</article>
      <h3 className="comments-title">Comments</h3>
      <section>
        <CommentForm onCommentAction={handleCommentCreate} initialValue="" />
        {comments.length > 0 && (
          <div className="mt-4">
            <CommentsList
              comments={getReplies('null')}
              getReplies={getReplies}
            />
          </div>
        )}
      </section>
    </>
  );
}
