
-- Create indexes for all unindexed foreign keys to improve performance

-- Communities table
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON public.communities(created_by);

-- Community members table
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);

-- Community messages table
CREATE INDEX IF NOT EXISTS idx_community_messages_community_id ON public.community_messages(community_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON public.community_messages(user_id);

-- Community polls table
CREATE INDEX IF NOT EXISTS idx_community_polls_community_id ON public.community_polls(community_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_created_by ON public.community_polls(created_by);

-- Email notifications table
CREATE INDEX IF NOT EXISTS idx_email_notifications_event_id ON public.email_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON public.email_notifications(user_id);

-- Error logs table
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);

-- Event analytics table
CREATE INDEX IF NOT EXISTS idx_event_analytics_user_id ON public.event_analytics(user_id);

-- Event approvals table
CREATE INDEX IF NOT EXISTS idx_event_approvals_admin_id ON public.event_approvals(admin_id);
CREATE INDEX IF NOT EXISTS idx_event_approvals_event_id ON public.event_approvals(event_id);

-- Event sentiment table
CREATE INDEX IF NOT EXISTS idx_event_sentiment_user_id ON public.event_sentiment(user_id);

-- Events table
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);

-- Favorites table
CREATE INDEX IF NOT EXISTS idx_favorites_event_id ON public.favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- Generated posters table
CREATE INDEX IF NOT EXISTS idx_generated_posters_template_id ON public.generated_posters(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_posters_user_id ON public.generated_posters(user_id);

-- Poll options table
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

-- Poll votes table
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON public.poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);

-- Pricing rules table
CREATE INDEX IF NOT EXISTS idx_pricing_rules_event_id ON public.pricing_rules(event_id);

-- Refund requests table
CREATE INDEX IF NOT EXISTS idx_refund_requests_ticket_id ON public.refund_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON public.refund_requests(user_id);

-- Scheduled posts table
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_poster_id ON public.scheduled_posts(poster_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);

-- Split payment participants table
CREATE INDEX IF NOT EXISTS idx_split_payment_participants_split_payment_id ON public.split_payment_participants(split_payment_id);

-- Split payments table
CREATE INDEX IF NOT EXISTS idx_split_payments_event_id ON public.split_payments(event_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_organizer_id ON public.split_payments(organizer_id);

-- Tickets table
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);

-- User notifications table
CREATE INDEX IF NOT EXISTS idx_user_notifications_event_id ON public.user_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);

-- User reports table
CREATE INDEX IF NOT EXISTS idx_user_reports_event_id ON public.user_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reviewed_by ON public.user_reports(reviewed_by);
