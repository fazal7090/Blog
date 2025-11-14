import { GraphQLClient } from 'graphql-request'

export const graphqlClient = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
  {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
  }
)
