import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import PrismicDOM from 'prismic-dom';
import { format as dateFormat } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): React.ReactElement {
  const router = useRouter();

  let readTime = 0;

  if (!router.isFallback) {
    readTime = post.data.content.reduce((acc, content) => {
      const paragraph = PrismicDOM.RichText.asText(content.body);

      const words = paragraph.split(' ');

      return acc + words.length;
    }, 0);
  }

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <section className={styles.heading}>
        <Header />
      </section>

      <img src={post.data.banner.url} alt="banner" className={styles.banner} />

      <main className={commonStyles.container}>
        <div className={styles.postTitle}>
          <strong>{post.data.title}</strong>
          <div>
            <time>
              <FiCalendar />
              {dateFormat(
                new Date(post.first_publication_date),
                'dd LLL yyyy'
              ).toLowerCase()}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <time>
              <FiClock /> {Math.ceil(readTime / 200)} min
            </time>
          </div>
        </div>

        <section className={styles.postContent}>
          {post.data.content.map(content => {
            return (
              <div key={content.heading}>
                <h1>{content.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(content.body),
                  }}
                />
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'post')
  );

  return {
    fallback: true,
    paths: posts.results.map(post => {
      return { params: { slug: post.uid } };
    }),
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', context.params.slug, {});

  const post: Post = response;

  return {
    props: {
      post,
    },
  };
};
