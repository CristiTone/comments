import { makeRequest } from './makeRequest';

export function createComment(
  postId: string,
  message: string,
  parentId: string | null,
) {
  return makeRequest(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message, parentId }),
  });
}

export function updateComment(postId: string, message: string, id: string) {
  return makeRequest(`/posts/${postId}/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ message }),
  });
}

export function deleteComment(postId: string, id: string) {
  return makeRequest(`/posts/${postId}/comments/${id}`, {
    method: 'DELETE',
  });
}

export function toggleCommentLike(postId: string, id: string) {
  return makeRequest(`/posts/${postId}/comments/${id}/toggleLike`, {
    method: 'PATCH',
  });
}
