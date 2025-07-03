import { users } from '@clerk/clerk-sdk-node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface DriverUpgradeRequest {
  clerkId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  vehiclePlate: string;
}

export async function POST(request: Request) {
  try {
    const body: DriverUpgradeRequest = await request.json();
    const { 
      clerkId, 
      vehicleMake, 
      vehicleModel, 
      vehicleYear, 
      vehicleColor, 
      vehiclePlate 
    } = body;

    // Validate required fields
    if (!clerkId || !vehicleMake || !vehicleModel || !vehicleYear || !vehicleColor || !vehiclePlate) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate year is reasonable
    const currentYear = new Date().getFullYear();
    if (vehicleYear < 1900 || vehicleYear > currentYear + 1) {
      return Response.json({ error: 'Invalid vehicle year' }, { status: 400 });
    }

    // Check if user exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId}
    `;

    if (!existingUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user to driver status in DB
    await sql`
      UPDATE users 
      SET 
        is_driver = TRUE,
        vehicle_make = ${vehicleMake},
        vehicle_model = ${vehicleModel},
        vehicle_year = ${vehicleYear},
        vehicle_color = ${vehicleColor},
        vehicle_plate = ${vehiclePlate},
        updated_at = NOW()
      WHERE clerk_id = ${clerkId}
    `;

    // Update Clerk publicMetadata
    await users.updateUser(clerkId, {
      publicMetadata: {
        is_driver: true,
      },
    });

    return Response.json({ success: true, message: 'Driver status updated successfully' });
  } catch (error) {
    console.error('Driver upgrade error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}