// import { useEffect, useState } from 'react';
// import { getPosts } from '../services/posts';
import { Link, useMatch } from '@tanstack/react-location';
import { LocationGenerics } from '../types/PostTypes';

// type Post = {
//   id: String;
//   title: String;
// };

export function PostsList() {
  // const [posts, setPosts] = useState<Post[]>([]);
  // useEffect(() => {
  //   getPosts().then((res) => setPosts(res));
  // }, []);

  const {
    data: { posts },
  } = useMatch<LocationGenerics>();

  return (
    <>
      {posts?.map((post, index) => (
        <h1 key={index}>
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h1>
      ))}
    </>
  );
}
