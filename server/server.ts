import fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fastifyCookie from '@fastify/cookie';
dotenv.config();

const app = fastify();

app.register(sensible);
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});
app.register(fastifyCookie, { secret: process.env.COOKIE_SECRET });

const prisma = new PrismaClient();

// app.addHook('onRequest', (req, res, done) => {
//   res.setCookie('userId', '2fade16f-c6a0-4286-8a8e-eee85ce7b4da');
//   done();
// });

const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

app.get('/posts', async (req, res) => {
  return await commitToDb(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    }),
  );
});

app.get('/posts/:id', async (req, res) => {
  return await commitToDb(
    prisma.post
      .findUnique({
        /* @ts-ignore-next-line */
        where: { id: req.params.id },
        select: {
          body: true,
          title: true,
          comments: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              ...COMMENT_SELECT_FIELDS,
              _count: { select: { likes: true } },
            },
          },
        },
      })
      .then(async (post) => {
        const likes = await prisma.like.findMany({
          where: {
            userId: req.cookies.userId,
            commentId: { in: post.comments.map((comment) => comment.id) },
          },
        });
        return {
          ...post,
          comments: post.comments.map((comment) => {
            const { _count, ...commentFields } = comment;
            return {
              ...commentFields,
              likedByCurrentUser: likes.find(
                (like) => like.commentId === comment.id,
              ),
              likeCount: _count.likes,
            };
          }),
        };
      }),
  );
});

app.post('/posts/:id/comments', async (req, res) => {
  /* @ts-ignore-next-line */
  const body = JSON.parse(req.body);
  return await commitToDb(
    prisma.comment
      .create({
        data: {
          userId: req.cookies.userId || '2fade16f-c6a0-4286-8a8e-eee85ce7b4da',
          /* @ts-ignore-next-line */
          message: body.message,
          /* @ts-ignore-next-line */
          parentId: body.parentId,
          /* @ts-ignore-next-line */
          postId: req.params.id,
        },
        select: COMMENT_SELECT_FIELDS,
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          likedByCurrentUser: false,
        };
      }),
  );
});

app.put('/posts/:id/comments/:commentId', async (req, res) => {
  /* @ts-ignore-next-line */
  const body = JSON.parse(req.body);
  const { userId } = await prisma.comment.findUnique({
    /* @ts-ignore-next-line */
    where: { id: req.params.commentId },
    select: { userId: true },
  });
  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized(
        'You do not have permission to edit this comment',
      ),
    );
  }

  return await commitToDb(
    prisma.comment.update({
      /* @ts-ignore-next-line */
      where: { id: req.params.commentId },
      data: { message: body.message },
      select: { message: true },
    }),
  );
});

app.delete('/posts/:id/comments/:commentId', async (req, res) => {
  /* @ts-ignore-next-line */
  const { userId } = await prisma.comment.findUnique({
    /* @ts-ignore-next-line */
    where: { id: req.params.commentId },
    select: { userId: true },
  });
  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized(
        'You do not have permission to edit this comment',
      ),
    );
  }

  return await commitToDb(
    prisma.comment.delete({
      /* @ts-ignore-next-line */
      where: { id: req.params.commentId },
      select: { message: true },
    }),
  );
});

app.patch('/posts/:id/comments/:commentId/toggleLike', async (req, res) => {
  const data = {
    /* @ts-ignore-next-line */
    commentId: req.params.commentId,
    userId: '2fade16f-c6a0-4286-8a8e-eee85ce7b4da',
  };

  const like = await prisma.like.findUnique({
    where: { userId_commentId: data },
  });

  if (like == null) {
    return await commitToDb(prisma.like.create({ data })).then(() => {
      return { addLike: true };
    });
  } else {
    return await commitToDb(
      prisma.like.delete({ where: { userId_commentId: data } }),
    ).then(() => {
      return { addLike: false };
    });
  }
});

async function commitToDb(promise: Promise<unknown>) {
  const [error, data] = await app.to(promise);
  console.log('error =>', error);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}

app.listen({ port: +process.env.PORT });
