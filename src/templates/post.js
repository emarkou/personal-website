import React from 'react';
import { graphql, Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';

const StyledPostContainer = styled.main`
  max-width: 800px;
`;

const StyledPostHeader = styled.header`
  margin-bottom: 60px;
`;

const StyledMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const StyledDate = styled.time`
  color: var(--light-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
`;

const StyledReadingTime = styled.span`
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);

  &:before {
    content: '·';
    margin-right: 12px;
  }
`;

const StyledTags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 16px 0 0;
  list-style: none;

  li a {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
`;

const StyledPostContent = styled.div`
  margin-bottom: 80px;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--lightest-slate);
    margin: 2.5em 0 1em;
    line-height: 1.3;
  }

  h2 {
    font-size: var(--fz-heading);
  }

  h3 {
    font-size: var(--fz-xxl);
  }

  p {
    margin: 1.2em 0;
    line-height: 1.7;
    color: var(--light-slate);
  }

  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }

  ul,
  ol {
    padding-left: 2em;
    margin: 1em 0;
    color: var(--light-slate);

    li {
      margin-bottom: 0.5em;
      line-height: 1.7;
    }
  }

  blockquote {
    border-left: 3px solid var(--green);
    margin: 2em 0;
    padding: 1em 1.5em;
    background-color: var(--light-navy);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;

    p {
      margin: 0;
      font-style: italic;
    }
  }

  img {
    max-width: 100%;
    border-radius: var(--border-radius);
    margin: 2em 0;
  }

  hr {
    border: none;
    border-top: 1px solid var(--lightest-navy);
    margin: 3em 0;
  }
`;

const StyledPostFooter = styled.footer`
  padding-top: 40px;
  border-top: 1px solid var(--lightest-navy);
  margin-bottom: 40px;
`;

const getReadingTime = html => {
  const words = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
};

const PostTemplate = ({ data, location }) => {
  const { frontmatter, html } = data.markdownRemark;
  const { title, date, tags } = frontmatter;
  const readingTime = getReadingTime(html);

  return (
    <Layout location={location}>
      <Helmet title={title} />

      <StyledPostContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/blog">All posts</Link>
        </span>

        <StyledPostHeader>
          <h1 className="medium-heading">{title}</h1>

          <StyledMeta>
            <StyledDate dateTime={date}>
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </StyledDate>
            <StyledReadingTime>{readingTime}</StyledReadingTime>
          </StyledMeta>

          {tags && tags.length > 0 && (
            <StyledTags>
              {tags.map((tag, i) => (
                <li key={i}>
                  <Link to={`/pensieve/tags/${kebabCase(tag)}/`} className="tag">
                    #{tag}
                  </Link>
                </li>
              ))}
            </StyledTags>
          )}
        </StyledPostHeader>

        <StyledPostContent dangerouslySetInnerHTML={{ __html: html }} />

        <StyledPostFooter>
          <Link to="/blog" className="inline-link">
            &larr; Back to all posts
          </Link>
        </StyledPostFooter>
      </StyledPostContainer>
    </Layout>
  );
};

export default PostTemplate;

PostTemplate.propTypes = {
  data: PropTypes.object,
  location: PropTypes.object,
};

export const pageQuery = graphql`
  query ($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        description
        date
        slug
        tags
      }
    }
  }
`;
