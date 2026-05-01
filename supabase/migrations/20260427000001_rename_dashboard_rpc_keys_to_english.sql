-- Rename all Spanish JSON keys in get_dashboard_summary to English.
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_from TIMESTAMPTZ DEFAULT NULL,
  p_to   TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_total_income   NUMERIC;
  v_total_expense  NUMERIC;
  v_count          BIGINT;
  v_series         JSONB;
  v_categories     JSONB;
BEGIN
  -- KPIs: totals and movement count
  SELECT
    COALESCE(SUM(CASE WHEN movement_type = 'INCOME' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN movement_type = 'EXPENSE' THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO v_total_income, v_total_expense, v_count
  FROM movements
  WHERE status = 'ACTIVE'
    AND (p_from IS NULL OR movement_date >= p_from)
    AND (p_to   IS NULL OR movement_date <= p_to);

  -- Monthly series: 'YYYY-MM' keys for JS-side locale formatting
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('month', month_key, 'income', income, 'expense', expense)
      ORDER BY month_trunc
    ),
    '[]'::jsonb
  )
  INTO v_series
  FROM (
    SELECT
      DATE_TRUNC('month', movement_date)                     AS month_trunc,
      to_char(DATE_TRUNC('month', movement_date), 'YYYY-MM') AS month_key,
      COALESCE(SUM(CASE WHEN movement_type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN movement_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
    FROM movements
    WHERE status = 'ACTIVE'
      AND (p_from IS NULL OR movement_date >= p_from)
      AND (p_to   IS NULL OR movement_date <= p_to)
    GROUP BY DATE_TRUNC('month', movement_date)
  ) AS monthly;

  -- Top-8 categories by total amount
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('category', category, 'total', total)
      ORDER BY total DESC
    ),
    '[]'::jsonb
  )
  INTO v_categories
  FROM (
    SELECT category, SUM(amount) AS total
    FROM movements
    WHERE status = 'ACTIVE'
      AND (p_from IS NULL OR movement_date >= p_from)
      AND (p_to   IS NULL OR movement_date <= p_to)
    GROUP BY category
    ORDER BY total DESC
    LIMIT 8
  ) AS cats;

  RETURN jsonb_build_object(
    'totalIncome',      v_total_income,
    'totalExpense',     v_total_expense,
    'movementCount',    v_count,
    'series',           v_series,
    'categoryBreakdown', v_categories
  );
END;
$$;
