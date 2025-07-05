import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get('id');
    
    if (!clerkId) {
      return Response.json({ error: 'Clerk ID required' }, { status: 400 });
    }

    const [user] = await sql`
      SELECT is_driver 
      FROM users 
      WHERE clerk_id = ${clerkId}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ isDriver: user.is_driver });
  } catch (error) {
    console.error('Driver status check error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}