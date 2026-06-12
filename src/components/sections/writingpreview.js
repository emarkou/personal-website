import React, { useEffect, useRef } from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';

const StyledSection = styled.section`
  max-width: 900px;
`;

const StyledPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-gap: 20px;
  margin-bottom: 50px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StyledPostCard = styled.article`
  transition: var(--transition);

  &:hover,
  &:focus-within {
    .card-inner {
      transform: translateY(-5px);
    }
    .post-title {
      color: var(--green);
    }
  }
`;

const StyledCardInner = styled.div`
  ${({ theme }) => theme.mixins.boxShadow};
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.75rem;
  border-radius: var(--border-radius);
  background-color: var(--light-navy);
  transition: var(--transition);
`;

const StyledMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const StyledDate = styled.time`
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StyledReadingTime = styled.span`
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);

  &:before {
    content: '·';
    margin-right: 10px;
  }
`;

const StyledTitle = styled.h3`
  margin: 0 0 10px;
  font-size: var(--fz-xl);
  transition: var(--transition);

  a {
    color: var(--lightest-slate);

    &:hover,
    &:focus {
      color: var(--green);
    }
  }
`;

const StyledDescription = styled.p`
  color: var(--light-slate);
  font-size: var(--fz-md);
  line-height: 1.5;
  margin: 0;
  flex-grow: 1;
`;

const StyledMoreLink = styled(Link)`
  ${({ theme }) => theme.mixins.bigButton};
  margin: 0 auto;
  display: block;
  width: max-content;
`;

const getReadingTime = html => {
  const words = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
};

const WritingPreview = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/posts/" }, frontmatter: { draft: { ne: true } } }
        sort: { frontmatter: { date: DESC } }
        limit: 3
      ) {
        edges {
          node {
            html
            frontmatter {
              title
              description
              slug
              date
            }
          }
        }
      }
    }
  `);

  const posts = data.allMarkdownRemark.edges;

  const revealTitle = useRef(null);
  const revealPosts = useRef([]);

  useEffect(() => {
    sr.reveal(revealTitle.current, srConfig());
    revealPosts.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  if (!posts.length) {
    return null;
  }

  return (
    <StyledSection id="writing">
      <h2 className="numbered-heading" ref={revealTitle}>
        Latest Writing
      </h2>

      <StyledPostsGrid>
        {posts.map(({ node }, i) => {
          const { title, description, slug, date } = node.frontmatter;
          const d = new Date(date);
          const readingTime = getReadingTime(node.html);

          return (
            <StyledPostCard key={i} ref={el => (revealPosts.current[i] = el)}>
              <StyledCardInner className="card-inner">
                <StyledMeta>
                  <StyledDate dateTime={date}>
                    {d.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </StyledDate>
                  <StyledReadingTime>{readingTime}</StyledReadingTime>
                </StyledMeta>

                <StyledTitle className="post-title">
                  <Link to={slug}>{title}</Link>
                </StyledTitle>

                <StyledDescription>{description}</StyledDescription>
              </StyledCardInner>
            </StyledPostCard>
          );
        })}
      </StyledPostsGrid>

      <StyledMoreLink to="/blog">View all posts</StyledMoreLink>
    </StyledSection>
  );
};

export default WritingPreview;
