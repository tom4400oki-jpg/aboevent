-- Enable delete policy for bookings
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

CREATE POLICY "Users can delete their own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);
