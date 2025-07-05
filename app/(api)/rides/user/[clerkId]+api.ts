import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    // Extract clerkId from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const clerkId = pathParts[pathParts.length - 1]; // Get the last part of the path
    
    if (!clerkId) {
      return Response.json(
        { success: false, error: 'ClerkId parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching rides for user with clerkId:', clerkId);

    // First, get the user's UUID from clerk_id
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId}
    `;

    if (userResult.length === 0) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult[0].id;
    console.log('Found user ID:', userId);

    // Fetch user's bookings with ride and driver details
    const userRides = await sql`
      SELECT 
        b.id as booking_id,
        b.seats_booked,
        b.status as booking_status,
        b.price_per_seat,
        b.total_price,
        b.currency,
        b.created_at as booking_date,
        b.updated_at as booking_updated,
        r.id as ride_id,
        r.origin_label,
        r.destination_label,
        r.origin_lat,
        r.origin_lng,
        r.destination_lat,
        r.destination_lng,
        r.departure_time,
        r.arrival_time,
        r.price as ride_price,
        r.status as ride_status,
        r.seats_total,
        r.seats_available,
        r.created_at as ride_created_at,
        u.id as driver_id,
        u.clerk_id as driver_clerk_id,
        u.name as driver_name,
        u.avatar_url as driver_avatar,
        u.phone as driver_phone,
        u.rating_driver,
        u.vehicle_make,
        u.vehicle_model,
        u.vehicle_year,
        u.vehicle_color,
        u.vehicle_plate
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      JOIN users u ON r.driver_id = u.id
      WHERE b.rider_id = ${userId}
      ORDER BY b.created_at DESC
    `;

    console.log(`Found ${userRides.length} rides for user`);

    // Transform the data for frontend consumption
    const transformedRides = userRides.map(ride => ({
      bookingId: ride.booking_id,
      rideId: ride.ride_id,
      from: ride.origin_label,
      to: ride.destination_label,
      departureTime: ride.departure_time,
      arrivalTime: ride.arrival_time,
      bookingDate: ride.booking_date,
      lastUpdated: ride.booking_updated,
      seatsBooked: ride.seats_booked,
      pricePerSeat: parseFloat(ride.price_per_seat),
      totalPaid: parseFloat(ride.total_price),
      currency: ride.currency,
      bookingStatus: ride.booking_status, // pending, paid, completed, cancelled
      rideStatus: ride.ride_status, // open, full, completed, cancelled
      coordinates: {
        origin: {
          latitude: parseFloat(ride.origin_lat),
          longitude: parseFloat(ride.origin_lng)
        },
        destination: {
          latitude: parseFloat(ride.destination_lat),
          longitude: parseFloat(ride.destination_lng)
        }
      },
      driver: {
        id: ride.driver_id,
        clerkId: ride.driver_clerk_id,
        name: ride.driver_name,
        avatar: ride.driver_avatar,
        phone: ride.driver_phone,
        rating: parseFloat(ride.rating_driver) || 5.0
      },
      vehicle: ride.vehicle_make ? {
        make: ride.vehicle_make,
        model: ride.vehicle_model,
        year: ride.vehicle_year,
        color: ride.vehicle_color,
        plate: ride.vehicle_plate,
        displayName: `${ride.vehicle_year} ${ride.vehicle_make} ${ride.vehicle_model}`
      } : null,
      capacity: {
        total: ride.seats_total,
        available: ride.seats_available
      }
    }));

    return Response.json({
      success: true,
      rides: transformedRides,
      count: transformedRides.length
    });

  } catch (error) {
    console.error('Error fetching user rides:', error);
    
    return Response.json(
      { 
        success: false,
        error: 'Failed to fetch rides',
        details: error.message 
      },
      { status: 500 }
    );
  }
}