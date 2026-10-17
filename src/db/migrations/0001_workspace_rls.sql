CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_clerk_user_id() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.clerk_user_id', true), '')
$$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_access ON users
  FOR SELECT USING (id = app.current_user_id());
CREATE POLICY users_bootstrap_insert ON users
  FOR INSERT WITH CHECK (clerk_user_id = app.current_clerk_user_id());
CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = app.current_user_id())
  WITH CHECK (id = app.current_user_id());

CREATE POLICY workspaces_member_access ON workspaces
  FOR SELECT USING (id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY workspaces_owner_insert ON workspaces
  FOR INSERT WITH CHECK (owner_user_id = app.current_user_id());
CREATE POLICY workspaces_owner_update ON workspaces
  FOR UPDATE USING (owner_user_id = app.current_user_id())
  WITH CHECK (owner_user_id = app.current_user_id());
CREATE POLICY workspaces_owner_delete ON workspaces
  FOR DELETE USING (owner_user_id = app.current_user_id());

CREATE POLICY workspace_members_self_or_owner_access ON workspace_members
  FOR SELECT USING (
    user_id = app.current_user_id()
    OR workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = app.current_user_id())
  );
CREATE POLICY workspace_members_owner_insert ON workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = app.current_user_id())
  );
CREATE POLICY workspace_members_owner_update ON workspace_members
  FOR UPDATE USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = app.current_user_id())
  ) WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = app.current_user_id())
  );
CREATE POLICY workspace_members_owner_delete ON workspace_members
  FOR DELETE USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_user_id = app.current_user_id())
  );

CREATE POLICY content_items_member_access ON content_items
  FOR SELECT USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY content_items_member_insert ON content_items
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY content_items_member_update ON content_items
  FOR UPDATE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  )) WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY content_items_owner_delete ON content_items
  FOR DELETE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
  ));

CREATE POLICY assets_member_access ON assets
  FOR SELECT USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY assets_member_insert ON assets
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY assets_member_update ON assets
  FOR UPDATE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  )) WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY assets_owner_delete ON assets
  FOR DELETE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
  ));

CREATE POLICY content_assets_member_access ON content_assets
  FOR SELECT USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY content_assets_member_insert ON content_assets
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id())
    AND EXISTS (SELECT 1 FROM content_items WHERE id = content_item_id AND workspace_id = content_assets.workspace_id)
    AND EXISTS (SELECT 1 FROM assets WHERE id = asset_id AND workspace_id = content_assets.workspace_id)
  );
CREATE POLICY content_assets_member_delete ON content_assets
  FOR DELETE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));

CREATE POLICY performance_metrics_member_access ON performance_metrics
  FOR SELECT USING (content_item_id IN (
    SELECT id FROM content_items WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
    )
  ));
CREATE POLICY performance_metrics_member_insert ON performance_metrics
  FOR INSERT WITH CHECK (content_item_id IN (
    SELECT id FROM content_items WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
    )
  ));
CREATE POLICY performance_metrics_member_update ON performance_metrics
  FOR UPDATE USING (content_item_id IN (
    SELECT id FROM content_items WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
    )
  )) WITH CHECK (content_item_id IN (
    SELECT id FROM content_items WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
    )
  ));
CREATE POLICY performance_metrics_owner_delete ON performance_metrics
  FOR DELETE USING (content_item_id IN (
    SELECT id FROM content_items WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
    )
  ));

CREATE POLICY subscriptions_member_access ON subscriptions
  FOR SELECT USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY subscriptions_owner_insert ON subscriptions
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
  ));
CREATE POLICY subscriptions_owner_update ON subscriptions
  FOR UPDATE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
  )) WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
  ));
CREATE POLICY subscriptions_owner_delete ON subscriptions
  FOR DELETE USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id() AND role = 'owner'
  ));

CREATE POLICY ai_usage_member_access ON ai_usage_events
  FOR SELECT USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id()
  ));
CREATE POLICY ai_usage_member_insert ON ai_usage_events
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = app.current_user_id())
    AND (user_id IS NULL OR user_id = app.current_user_id())
  );

CREATE POLICY privacy_consents_self_access ON privacy_consents
  FOR SELECT USING (user_id = app.current_user_id());
CREATE POLICY privacy_consents_self_insert ON privacy_consents
  FOR INSERT WITH CHECK (user_id = app.current_user_id());
CREATE POLICY privacy_consents_self_update ON privacy_consents
  FOR UPDATE USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());

-- Webhook ingestion runs with a dedicated privileged server role. Ordinary app
-- identities receive no access to these records through RLS.
