// queries/posts.ts
import { gql } from 'graphql-request'

export const GET_POSTS = gql`
  query GetPosts($limit: Int!, $offset: Int!) {
    postsCollection(
      filter: { published: { eq: true } }
      orderBy: [{ published_at: DescNullsLast }, { id: DescNullsLast }]
      first: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          title
          body
          published_at
          authors {
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_POST_BY_ID = gql`
  query GetPostById($id: UUID!) {
    postsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          body
          published_at
          authors {
            name
          }
        }
      }
    }
  }
`
export const CREATE_POST = gql`
  mutation CreatePost(
    $title: String!
    $body: String!
    $published: Boolean!
    $author_id: UUID!
  ) {
    insertIntopostsCollection(
      objects: {
        title: $title
        body: $body
        published: $published
        author_id: $author_id
      }
    ) {
      affectedCount
      records {
        id
        title
        body
        published
        published_at
        author_id
      }
    }
  }
`;