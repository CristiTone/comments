import { makeRequest } from './makeRequest';

export async function getPosts() {
  return await makeRequest('/posts');
}

export async function getPostById(id: string) {
  return await makeRequest(`/posts/${id}`);
}
