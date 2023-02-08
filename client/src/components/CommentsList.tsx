import { Comment } from './Comment';

export function CommentsList({ comments, getReplies }) {
  return (
    <>
      {comments.map((comment) => (
        <div key={comment.id} className="comment-stack">
          <Comment {...comment} getReplies={getReplies} />
        </div>
      ))}
    </>
  );
}
