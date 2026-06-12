import React, { useState } from 'react';
import { graphql, Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';

const StyledMainContainer = styled.main`
  & > header {
    margin-bottom: 80px;
    text-align: center;

    h1 {
      margin-bottom: 10px;
    }

    p {
      margin: 0;
    }
  }
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 50px;
  justify-content: center;
`;

const StyledFilterButton = styled.button`
  ${({ theme }) => theme.mixins.link};
  padding: 6px 14px;
  border-radius: 20px;
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  border: 1px solid ${({ $active }) => ($active ? 'var(--green)' : 'var(--lightest-navy)')};
  color: ${({ $active }) => ($active ? 'var(--green)' : 'var(--slate)')};
  background-color: ${({ $active }) => ($active ? 'var(--green-tint)' : 'transparent')};
  cursor: pointer;
  transition: var(--transition);

  &:hover,
  &:focus {
    border-color: var(--green);
    color: var(--green);
    outline: none;
  }
`;

const StyledGrid = styled.div`
  .posts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    grid-gap: 20px;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
`;

const StyledPost = styled.article`
  transition: var(--transition);
  cursor: default;

  &:hover,
  &:focus-within {
    outline: 0;

    .post-inner {
      transform: translateY(-5px);
    }

    .post-title {
      color: var(--green);
    }
  }
`;

const StyledPostInner = styled.div`
  ${({ theme }) => theme.mixins.boxShadow};
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 1.75rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  background-color: var(--light-navy);
`;

const StyledPostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StyledDate = styled.time`
  color: var(--light-slate);
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
    margin-right: 12px;
    color: var(--slate);
  }
`;

const StyledPostTitle = styled.h2`
  margin: 0 0 10px;
  font-size: var(--fz-xxl);
  transition: var(--transition);

  a {
    color: var(--lightest-slate);

    &:hover,
    &:focus {
      color: var(--green);
    }

    &:before {
      content: '';
      display: block;
      position: absolute;
      z-index: 0;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
`;

const StyledPostDescription = styled.p`
  color: var(--light-slate);
  font-size: var(--fz-md);
  flex-grow: 1;
  margin: 0 0 20px;
  line-height: 1.5;
`;

const StyledTags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
  margin-top: auto;

  li a {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    letter-spacing: 0.05em;

    &:hover,
    &:focus {
      color: var(--green);
      text-decoration: underline;
    }
  }
`;

const StyledEmpty = styled.p`
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: var(--fz-md);
  text-align: center;
  margin-top: 50px;
`;

const getReadingTime = html => {
  const wordCount = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
};

const BlogPage = ({ location, data }) => {
  const posts = data.allMarkdownRemark.edges;
  const allTags = [...new Set(posts.flatMap(({ node }) => node.frontmatter.tags || []))].sort();

  const [activeTag, setActiveTag] = useState(null);

  const filtered = activeTag
    ? posts.filter(({ node }) => (node.frontmatter.tags || []).includes(activeTag))
    : posts;

  return (
    <Layout location={location}>
      <Helmet title="Blog" />

      <StyledMainContainer>
        <header>
          <h1 className="big-heading">Blog</h1>
          <p className="subtitle">Thoughts on ML, engineering, and things I&apos;m learning</p>
        </header>

        {allTags.length > 0 && (
          <StyledFilters>
            <StyledFilterButton $active={!activeTag} onClick={() => setActiveTag(null)}>
              All
            </StyledFilterButton>
            {allTags.map(tag => (
              <StyledFilterButton
                key={tag}
                $active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </StyledFilterButton>
            ))}
          </StyledFilters>
        )}

        <StyledGrid>
          <div className="posts">
            {filtered.length > 0 ? (
              filtered.map(({ node }, i) => {
                const { frontmatter, html } = node;
                const { title, description, slug, date, tags } = frontmatter;
                const d = new Date(date);
                const readingTime = getReadingTime(html);

                return (
                  <StyledPost key={i}>
                    <StyledPostInner className="post-inner">
                      <StyledPostMeta>
                        <StyledDate dateTime={date}>
                          {d.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </StyledDate>
                        <StyledReadingTime>{readingTime}</StyledReadingTime>
                      </StyledPostMeta>

                      <StyledPostTitle className="post-title">
                        <Link to={slug}>{title}</Link>
                      </StyledPostTitle>

                      <StyledPostDescription>{description}</StyledPostDescription>

                      {tags && tags.length > 0 && (
                        <StyledTags>
                          {tags.map((tag, j) => (
                            <li key={j}>
                              <Link
                                to={`/pensieve/tags/${kebabCase(tag)}/`}
                                className="inline-link"
                              >
                                #{tag}
                              </Link>
                            </li>
                          ))}
                        </StyledTags>
                      )}
                    </StyledPostInner>
                  </StyledPost>
                );
              })
            ) : (
              <StyledEmpty>No posts found for &ldquo;{activeTag}&rdquo;</StyledEmpty>
            )}
          </div>
        </StyledGrid>
      </StyledMainContainer>
    </Layout>
  );
};

BlogPage.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default BlogPage;

export const pageQuery = graphql`
  {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/posts/" }, frontmatter: { draft: { ne: true } } }
      sort: { frontmatter: { date: DESC } }
    ) {
      edges {
        node {
          html
          frontmatter {
            title
            description
            slug
            date
            tags
            draft
          }
        }
      }
    }
  }
`;
