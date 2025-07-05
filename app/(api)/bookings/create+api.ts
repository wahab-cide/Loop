import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface CreateBookingRequest {
  clerkId: string;
  rideId: string;
  seatsRequested: number;
  paymentIntentId?: string; // Optional Stripe payment ID
}

export async function POST(request: Request) {
  console.log('Creating booking...');
  
  try {
    const body: CreateBookingRequest = await request.json();
    const { clerkId, rideId, seatsRequested, paymentIntentId } = body;

    // Validate required fields
    if (!clerkId || !rideId || !seatsRequested) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (seatsRequested <= 0 || seatsRequested > 8) {
      return Response.json({ error: 'Invalid number of seats' }, { status: 400 });
    }

    console.log('Booking request:', { clerkId, rideId, seatsRequested });

    // Get user's database ID from clerk_id
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const riderId = user.id;

    // Execute the booking creation without transaction for now (since Neon serverless has transaction limitations)
    console.log('Starting booking creation');

    // 1️⃣ Get ride information and validate
    const [ride] = await sql`
      SELECT 
        id,
        seats_available,
        price,
        currency,
        status,
        driver_id
      FROM rides 
      WHERE id = ${rideId}
    `;

    if (!ride) {
      throw new Error('Ride not found');
    }

    console.log('Found ride:', { 
      id: ride.id, 
      seatsAvailable: ride.seats_available, 
      status: ride.status 
    });

    // 2️⃣ Validate ride status and availability
    if (ride.status !== 'open') {
      throw new Error(`Ride is ${ride.status} and cannot accept bookings`);
    }

    if (ride.seats_available < seatsRequested) {
      throw new Error(`Only ${ride.seats_available} seats available, you requested ${seatsRequested}`);
    }

    // Prevent driver from booking their own ride
    if (ride.driver_id === riderId) {
      throw new Error('Driver cannot book their own ride');
    }

    // Check if user already has a booking for this ride
    const [existingBooking] = await sql`
      SELECT id FROM bookings 
      WHERE ride_id = ${rideId} 
      AND rider_id = ${riderId} 
      AND status IN ('pending', 'paid')
    `;

    if (existingBooking) {
      throw new Error('You already have a booking for this ride');
    }

    console.log('Validation passed, creating booking...');

    // 3️⃣ Insert booking with payment status
    const [booking] = await sql`
      INSERT INTO bookings (
        ride_id, 
        rider_id, 
        seats_booked,
        price_per_seat, 
        currency, 
        status
      ) VALUES (
        ${rideId}, 
        ${riderId}, 
        ${seatsRequested},
        ${ride.price}, 
        ${ride.currency}, 
        ${paymentIntentId ? 'paid' : 'pending'}
      ) RETURNING id, total_price, created_at
    `;

    console.log('Booking created:', booking);

    // 4️⃣ Update ride: decrease available seats and potentially mark as full
    const newSeatsAvailable = ride.seats_available - seatsRequested;
    const newStatus = newSeatsAvailable === 0 ? 'full' : ride.status;

    await sql`
      UPDATE rides
      SET 
        seats_available = ${newSeatsAvailable},
        status = ${newStatus},
        updated_at = NOW()
      WHERE id = ${rideId}
    `;

    console.log('Ride updated:', { 
      newSeatsAvailable, 
      newStatus,
      rideId 
    });

    // 5️⃣ Log the payment intent if provided
    if (paymentIntentId) {
      console.log('Payment intent associated:', paymentIntentId);
      // You could store this in a separate payments table if needed
    }

    const result = booking.id;

    const bookingId = result;

    console.log('Booking transaction completed successfully:', bookingId);

    // Return success response
    return Response.json({ 
      success: true, 
      bookingId,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    
    return Response.json({ 
      success: false,
      error: errorMessage 
    }, { status: 400 });
  }
}

// GET endpoint for testing
export async function GET() {
  return Response.json({ 
    message: 'Booking creation API is working',
    timestamp: new Date().toISOString()
  });
}