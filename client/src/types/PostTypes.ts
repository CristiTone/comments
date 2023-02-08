import { MakeGenerics } from '@tanstack/react-location';

type PostType = {
  id: string;
  title: string;
  body: string;
  comments: CommentType[];
};

type UserType = {
  id: string;
  name: string;
};

export type CommentType = {
  id: string;
  parentId: string;
  message: string;
  createdAt: string;
  user: UserType;
  likeCount: number;
};

export type LocationGenerics = MakeGenerics<{
  LoaderData: {
    posts: PostType[];
    post: PostType;
    postId: string;
  };
}>;
