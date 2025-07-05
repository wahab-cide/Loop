// app/(api)/rides/feed+api.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const latitude = parseFloat(url.searchParams.get('latitude') || '0');
    const longitude = parseFloat(url.searchParams.get('longitude') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '50'); // Default 50km radius
    const clerkId = url.searchParams.get('clerkId');

    console.log('Fetching rides feed:', { latitude, longitude, radius, clerkId });

    if (!latitude || !longitude) {
      return Response.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    if (!clerkId) {
      return Response.json(
        { success: false, error: 'User clerkId is required' },
        { status: 400 }
      );
    }

    // Get user's UUID to exclude their own rides
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId}
    `;

    const userId = userResult.length > 0 ? userResult[0].id : null;

    // Fetch rides within radius using Haversine formula
    // This query finds rides where the origin is within the specified radius
    const nearbyRides = await sql`
      SELECT 
        r.id as ride_id,
        r.origin_label,
        r.destination_label,
        r.origin_lat,
        r.origin_lng,
        r.destination_lat,
        r.destination_lng,
        r.departure_time,
        r.arrival_time,
        r.price,
        r.currency,
        r.seats_total,
        r.seats_available,
        r.status,
        r.created_at,
        -- Driver details
        u.id as driver_id,
        u.clerk_id as driver_clerk_id,
        u.name as driver_name,
        u.avatar_url as driver_avatar,
        u.phone as driver_phone,
        u.rating_driver,
        -- Vehicle details
        u.vehicle_make,
        u.vehicle_model,
        u.vehicle_year,
        u.vehicle_color,
        u.vehicle_plate,
        -- Calculate distance using Haversine formula
        (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(r.origin_lat)) * 
            cos(radians(r.origin_lng) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(r.origin_lat))
          )
        ) as distance_km
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE 
        r.status = 'open'
        AND r.seats_available > 0
        AND r.departure_time > NOW()
        ${userId ? sql`AND r.driver_id != ${userId}` : sql``}
        -- Filter by radius using Haversine formula
        AND (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(r.origin_lat)) * 
            cos(radians(r.origin_lng) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(r.origin_lat))
          )
        ) <= ${radius}
      ORDER BY distance_km ASC, r.departure_time ASC
      LIMIT 50
    `;

    console.log(`Found ${nearbyRides.length} nearby rides`);

    // Transform the data
    const transformedRides = nearbyRides.map(ride => ({
      id: ride.ride_id,
      origin_address: ride.origin_label,
      destination_address: ride.destination_label,
      origin_latitude: parseFloat(ride.origin_lat),
      origin_longitude: parseFloat(ride.origin_lng),
      destination_latitude: parseFloat(ride.destination_lat),
      destination_longitude: parseFloat(ride.destination_lng),
      departure_time: ride.departure_time,
      arrival_time: ride.arrival_time,
      fare_price: parseFloat(ride.price),
      currency: ride.currency,
      seats_total: ride.seats_total,
      seats_available: ride.seats_available,
      status: ride.status,
      created_at: ride.created_at,
      distance_km: parseFloat(ride.distance_km),
      driver: {
        id: ride.driver_id,
        clerk_id: ride.driver_clerk_id,
        name: ride.driver_name,
        profile_image_url: ride.driver_avatar,
        phone: ride.driver_phone,
        rating: parseFloat(ride.rating_driver) || 5.0
      },
      car: ride.vehicle_make ? {
        make: ride.vehicle_make,
        model: ride.vehicle_model,
        year: ride.vehicle_year,
        color: ride.vehicle_color,
        plate: ride.vehicle_plate,
        seats: ride.seats_total
      } : null
    }));

    return Response.json({
      success: true,
      rides: transformedRides,
      count: transformedRides.length,
      userLocation: { latitude, longitude },
      radius
    });

  } catch (error) {
    console.error('Error fetching rides feed:', error);
    
    return Response.json(
      { 
        success: false,
        error: 'Failed to fetch rides feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}