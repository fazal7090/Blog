import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const service = createAuthCallbackService(supabase);

  // Creates the Supabase session server-side
  const { nextPath } = await service.exchangeCodeForSession(request, {
    redirectPath: pathsConfig.app.home,
  });

  // Try to get the user - may need a slight delay
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  console.log('🔍 Auth callback - User:', user);
  console.log('🔍 Auth callback - Error:', userError);

  if (user) {
    console.log('✅ User found:', user.id, user.user_metadata);

    // Check if the author already exists
    const { data: existing, error: selectError } = await supabase
      .from("authors")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    console.log('🔍 Existing author:', existing);
    console.log('🔍 Select error:', selectError);

    // If missing → insert
    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from("authors")
        .insert({
          id: user.id,
          name: user.user_metadata.full_name ?? user.email?.split('@')[0] ?? "Anonymous",
          gender: "NA",
          age: 18,
        })
        .select();

      console.log('📝 Insert result:', inserted);
      console.log('❌ Insert error:', insertError);
    }
  } else {
    console.log('⚠️ No user found in callback');
  }

  return redirect(nextPath);
}