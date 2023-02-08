import { PostsList } from './components/PostsList';
import {
  Link,
  MakeGenerics,
  Outlet,
  ReactLocation,
  Router,
  useMatch,
} from '@tanstack/react-location';
import { getPostById, getPosts } from './services/posts';
import { Post } from './components/Post';

export function useUser() {
  if (document?.cookie)
    return { id: document.cookie.match(/userId=(?<id>[^;]+);?$/).groups?.id };
  return null;
}

const location = new ReactLocation();

function App() {
  return (
    <div className="container">
      <Router
        location={location}
        routes={[
          {
            path: '/',
            element: <PostsList />,
            loader: async () => {
              return {
                posts: await getPosts(),
              };
            },
          },
          {
            path: 'posts/:postId',
            element: <Post />,
            loader: async ({ params: { postId } }) => {
              return {
                postId,
                post: await getPostById(postId),
              };
            },
          },
        ]}
      >
        <h3>Comments app</h3>
        <Outlet />
      </Router>
    </div>
  );
}

export default App;
