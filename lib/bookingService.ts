// File: lib/bookingService.ts
export interface CreateBookingParams {
  clerkId: string;
  rideId: string;
  seatsRequested: number;
  paymentIntentId?: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
  message?: string;
}

export const createBooking = async (params: CreateBookingParams): Promise<BookingResponse> => {
  try {
    console.log('Creating booking with params:', params);

    const response = await fetch('/(api)/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Booking creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking'
    };
  }
};

// Function to call after successful Stripe payment
export const confirmBookingPayment = async (
  bookingId: string, 
  paymentIntentId: string
): Promise<BookingResponse> => {
  try {
    const response = await fetch(`/(api)/bookings/${bookingId}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment'
    };
  }
};