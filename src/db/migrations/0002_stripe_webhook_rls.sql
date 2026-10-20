-- Stripe webhook event rows contain only operational IDs and processing state.
-- Webhook handlers set app.user_id from verified Stripe subscription metadata before writing.
CREATE POLICY stripe_webhook_events_authenticated_access ON stripe_webhook_events
  FOR ALL
  USING (app.current_user_id() IS NOT NULL)
  WITH CHECK (app.current_user_id() IS NOT NULL);
