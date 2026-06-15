import Shell from '@/components/Shell';
import CommunityPostDetail from '@/components/CommunityPostDetail';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

interface CommunityPostPageProps {
  params: any;
}

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const [postResponse, commentsResponse] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, content, image_url, created_at, user_id, profiles(display_name), plants(name)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('comments')
      .select('id, content, created_at, user_id, profiles(display_name)')
      .eq('post_id', params.id)
      .order('created_at', { ascending: true })
  ]);

  const post = postResponse.data;
  const postError = postResponse.error;
  const comments = commentsResponse.data ?? [];

  if (postError || !post) {
    notFound();
  }

  return (
    <Shell>
      <div className="space-y-8">
        <CommunityPostDetail
          post={{
            id: post.id,
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at,
            user_id: post.user_id,
            plant: (post.plants as any) ?? null,
            profile: (post.profiles as any) ?? null
          }}
          initialComments={comments as any}
        />
      </div>
    </Shell>
  );
}
