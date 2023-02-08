import { useMatch } from '@tanstack/react-location';
import { useEffect, useState } from 'react';
import { FaEdit, FaHeart, FaRegHeart, FaReply, FaTrash } from 'react-icons/fa';
import { useUser } from '../App';
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
} from '../services/comments';
import { CommentType, LocationGenerics } from '../types/PostTypes';
import { CommentForm } from './CommentForm';
import { CommentsList } from './CommentsList';
import { IconButton } from './IconButton';

function formatDate() {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function Comment({
  id,
  parentId,
  message,
  user,
  createdAt,
  getReplies,
  likeCount,
  likedByCurrentUser,
}) {
  const childComments = getReplies(id);
  const [hideChildren, setHideChildren] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const {
    data: { postId },
  } = useMatch<LocationGenerics>();
  const currentUser = useUser();

  useEffect(() => {
    if (childComments) {
      setComments(childComments);
    }
  }, []);

  const handleCommentCreate = async (commentValue: string): Promise<void> => {
    const comment = await createComment(postId!, commentValue, id);
    setIsReplying(false);
    setComments((prevComments) => [comment, ...prevComments]);
  };

  const handleCommentUpdate = async (commentValue: string): Promise<void> => {
    const updatedComment = await updateComment(postId!, commentValue, id);
    // refactor this shit cuz it's buggy
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (comment.id === id) return { ...comment, commentValue };
        return comment;
      });
    });
    setIsReplying(false);
    console.log(updatedComment);
  };

  const handleCommentDelete = async () => {
    await deleteComment(postId!, id);
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id),
    );
  };

  const handleToggleLike = async (addLike: boolean) => {
    await toggleCommentLike(postId!, id);
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (id === comment.id) {
          if (addLike)
            return {
              ...comment,
              likeCount: comment.likeCount + 1,
              likedByCurrentUser: true,
            };
          return {
            ...comment,
            likeCount: comment.likeCount - 1,
            likedByCurrentUser: false,
          };
        }
        return comment;
      });
    });
  };

  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="date">
            {formatDate().format(Date.parse(createdAt))}
          </span>
        </div>
        {isEditing ? (
          <CommentForm
            initialValue={message}
            onCommentAction={handleCommentUpdate}
          />
        ) : (
          <div className="message">{message}</div>
        )}
        <div className="footer">
          <IconButton
            Icon={likedByCurrentUser ? FaHeart : FaRegHeart}
            aria-label={likedByCurrentUser ? 'Unlike' : 'Like'}
            onClick={handleToggleLike}
          >
            {likeCount}
          </IconButton>
          <IconButton
            Icon={FaReply}
            aria-label={isReplying ? 'Cancel Reply' : 'Reply'}
            onClick={() => setIsReplying((prevState) => !prevState)}
            isActive={isReplying}
          />
          {currentUser?.id === user.id && (
            <>
              <IconButton
                Icon={FaEdit}
                aria-label={isEditing ? 'Cancel Edit' : 'Edit'}
                onClick={() => setIsEditing((prevState) => !prevState)}
                isActive={isEditing}
              />
              <IconButton
                Icon={FaTrash}
                aria-label="Delete"
                color="danger"
                onClick={handleCommentDelete}
              />
            </>
          )}
        </div>
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm initialValue="" onCommentAction={handleCommentCreate} />
        </div>
      )}
      {comments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${hideChildren ? 'hide' : ''}`}
          >
            <button
              aria-label="Hide Replies"
              className="collapse-line"
              onClick={() => setHideChildren(true)}
            />
            <div className="nested-comments">
              <CommentsList comments={comments} getReplies={getReplies} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!hideChildren ? 'hide' : ''}`}
            onClick={() => setHideChildren(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}
