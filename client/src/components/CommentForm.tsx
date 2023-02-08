import { FormEvent, useRef } from 'react';

export function CommentForm({
  onCommentAction,
  initialValue = '',
}: {
  onCommentAction: (commentValue: string) => void;
  initialValue: string;
}) {
  const formRef = useRef<HTMLTextAreaElement | null>(null);
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formRef.current?.value) {
      onCommentAction(formRef.current.value);
      formRef.current!.value = '';
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea
          className="message-input"
          ref={formRef}
          autoFocus
          defaultValue={initialValue}
        ></textarea>
        <button type="submit" className="btn">
          Post
        </button>
      </div>
    </form>
  );
}
