-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROW LEVEL SECURITY SETUP
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE "Dealer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StageTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OEM" ENABLE ROW LEVEL SECURITY;

-- Helper function to check OEM admin role
CREATE OR REPLACE FUNCTION is_oem_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'oem_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check super admin role
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DEALER TABLE POLICIES
-- ============================================================

-- Dealers can read their own record
CREATE POLICY "dealers_select_own" ON "Dealer"
  FOR SELECT USING (auth.uid()::text = "authId");

-- Dealers can update their own record
CREATE POLICY "dealers_update_own" ON "Dealer"
  FOR UPDATE USING (auth.uid()::text = "authId");

-- OEM admins can read all dealers
CREATE POLICY "oem_admin_select_all_dealers" ON "Dealer"
  FOR SELECT USING (is_oem_admin() OR is_super_admin());

-- Super admins can do everything
CREATE POLICY "super_admin_all_dealers" ON "Dealer"
  FOR ALL USING (is_super_admin());

-- Service role bypasses RLS (implicit with service_role key)

-- ============================================================
-- DOCUMENT TABLE POLICIES
-- ============================================================

CREATE POLICY "dealers_select_own_docs" ON "Document"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "Document"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "dealers_insert_own_docs" ON "Document"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "Document"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "dealers_update_own_docs" ON "Document"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "Document"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "oem_admin_select_all_docs" ON "Document"
  FOR SELECT USING (is_oem_admin() OR is_super_admin());

CREATE POLICY "super_admin_all_docs" ON "Document"
  FOR ALL USING (is_super_admin());

-- ============================================================
-- STAGE TRANSACTION POLICIES
-- ============================================================

CREATE POLICY "dealers_select_own_transactions" ON "StageTransaction"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "StageTransaction"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "oem_admin_all_transactions" ON "StageTransaction"
  FOR ALL USING (is_oem_admin() OR is_super_admin());

-- ============================================================
-- SITE ASSESSMENT POLICIES
-- ============================================================

CREATE POLICY "dealers_own_site" ON "SiteAssessment"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "SiteAssessment"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "oem_admin_all_sites" ON "SiteAssessment"
  FOR SELECT USING (is_oem_admin() OR is_super_admin());

-- ============================================================
-- CONTRACT POLICIES
-- ============================================================

CREATE POLICY "dealers_own_contracts" ON "Contract"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "Contract"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "oem_admin_all_contracts" ON "Contract"
  FOR ALL USING (is_oem_admin() OR is_super_admin());

-- ============================================================
-- STAFF MEMBER POLICIES
-- ============================================================

CREATE POLICY "dealers_own_staff" ON "StaffMember"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Dealer" d
      WHERE d.id = "StaffMember"."dealerId"
      AND d."authId" = auth.uid()::text
    )
  );

CREATE POLICY "oem_admin_all_staff" ON "StaffMember"
  FOR SELECT USING (is_oem_admin() OR is_super_admin());

-- ============================================================
-- OEM TABLE POLICIES
-- ============================================================

CREATE POLICY "oem_public_read" ON "OEM"
  FOR SELECT USING (true);

CREATE POLICY "super_admin_all_oem" ON "OEM"
  FOR ALL USING (is_super_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('dealer-documents', 'dealer-documents', false, 52428800, ARRAY['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/quicktime']),
  ('site-media', 'site-media', false, 104857600, ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Bucket policy: dealers upload to their own folder
CREATE POLICY "dealers_upload_own_folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dealer-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "dealers_read_own_docs" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('dealer-documents', 'site-media') AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "oem_admin_read_all_storage" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('dealer-documents', 'site-media') AND
    (is_oem_admin() OR is_super_admin())
  );

CREATE POLICY "dealers_upload_site_media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- advance_stage: ACID-safe stage progression
CREATE OR REPLACE FUNCTION advance_stage(p_dealer_id uuid, p_target_stage int)
RETURNS json AS $$
DECLARE
  v_dealer "Dealer"%ROWTYPE;
  v_unverified_count int;
  v_result json;
BEGIN
  -- Lock the dealer row
  SELECT * INTO v_dealer FROM "Dealer" WHERE id = p_dealer_id::text FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dealer not found: %', p_dealer_id;
  END IF;

  -- Validate target stage is exactly one above current
  IF p_target_stage != v_dealer."currentStage" + 1 THEN
    RAISE EXCEPTION 'Invalid stage transition: current=%, target=%', v_dealer."currentStage", p_target_stage;
  END IF;

  IF p_target_stage > 6 THEN
    RAISE EXCEPTION 'Maximum stage exceeded';
  END IF;

  -- Check all documents for current stage are verified
  SELECT COUNT(*) INTO v_unverified_count
  FROM "Document" d
  WHERE d."dealerId" = p_dealer_id::text
    AND d.stage = v_dealer."currentStage"
    AND d."verifyStatus" != 'verified';

  IF v_unverified_count > 0 THEN
    RAISE EXCEPTION 'Stage % has % unverified documents. All documents must be verified before advancing.',
      v_dealer."currentStage", v_unverified_count;
  END IF;

  -- Advance the stage
  UPDATE "Dealer"
  SET "currentStage" = p_target_stage,
      "updatedAt" = now(),
      status = CASE WHEN p_target_stage > 5 THEN 'live' ELSE status END
  WHERE id = p_dealer_id::text;

  -- Log the transaction
  INSERT INTO "StageTransaction" (id, "dealerId", stage, action, "triggeredBy", "createdAt")
  VALUES (gen_random_uuid()::text, p_dealer_id::text, p_target_stage, 'advance', 'system', now());

  v_result := json_build_object(
    'success', true,
    'dealerId', p_dealer_id,
    'newStage', p_target_stage
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_dashboard_stats: aggregate stats for OEM dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'totalDealers', (SELECT COUNT(*) FROM "Dealer"),
    'byStage', (
      SELECT json_object_agg(stage_label, cnt)
      FROM (
        SELECT
          'stage_' || "currentStage"::text AS stage_label,
          COUNT(*) AS cnt
        FROM "Dealer"
        WHERE "currentStage" BETWEEN 1 AND 5
        GROUP BY "currentStage"
      ) s
    ),
    'totalActive', (SELECT COUNT(*) FROM "Dealer" WHERE status = 'active'),
    'totalPending', (SELECT COUNT(*) FROM "Dealer" WHERE status = 'pending'),
    'totalLive', (SELECT COUNT(*) FROM "Dealer" WHERE status = 'live'),
    'recentSignups', (
      SELECT COUNT(*) FROM "Dealer"
      WHERE "createdAt" > now() - interval '7 days'
    ),
    'dealersByStage', (
      SELECT json_agg(row_to_json(s))
      FROM (
        SELECT "currentStage" as stage, COUNT(*) as count
        FROM "Dealer"
        GROUP BY "currentStage"
        ORDER BY "currentStage"
      ) s
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
