# Database Optimization Guide for High-Traffic Startup (1000+ Users)

## 🚀 **Critical Database Optimizations for Scale**

### **1. Essential Database Indexes**

```sql
-- Core indexes for user operations
CREATE INDEX CONCURRENTLY idx_users_user_type ON users(user_type);
CREATE INDEX CONCURRENTLY idx_users_location ON users(location) WHERE location IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_users_business_category ON users(business_category) WHERE business_category IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_users_followers_count ON users(followers_count DESC);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at DESC);

-- Critical indexes for follow operations
CREATE INDEX CONCURRENTLY idx_follows_follower_id ON follows(follower_id);
CREATE INDEX CONCURRENTLY idx_follows_following_id ON follows(following_id);
CREATE INDEX CONCURRENTLY idx_follows_created_at ON follows(created_at DESC);
CREATE UNIQUE INDEX CONCURRENTLY idx_follows_unique ON follows(follower_id, following_id);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_users_business_popular ON users(user_type, followers_count DESC) 
  WHERE user_type = 'business';
CREATE INDEX CONCURRENTLY idx_users_search_text ON users 
  USING gin(to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(business_name, '') || ' ' || coalesce(business_category, '')));

-- Performance indexes for joins
CREATE INDEX CONCURRENTLY idx_follows_with_user_data ON follows(following_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_follows_follower_data ON follows(follower_id, created_at DESC);
```

### **2. Database Schema Optimizations**

```sql
-- Optimize follows table structure
CREATE TABLE IF NOT EXISTS follows (
  id bigserial PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

-- Add materialized view for trending businesses
CREATE MATERIALIZED VIEW trending_businesses AS
SELECT 
  u.*,
  COALESCE(f.followers_count, 0) as computed_followers_count,
  COALESCE(recent_followers.recent_count, 0) as recent_followers_count
FROM users u
LEFT JOIN (
  SELECT following_id, COUNT(*) as followers_count
  FROM follows 
  GROUP BY following_id
) f ON u.id = f.following_id
LEFT JOIN (
  SELECT following_id, COUNT(*) as recent_count
  FROM follows 
  WHERE created_at > now() - interval '7 days'
  GROUP BY following_id
) recent_followers ON u.id = recent_followers.following_id
WHERE u.user_type = 'business'
ORDER BY computed_followers_count DESC, recent_followers_count DESC;

-- Create unique index on materialized view
CREATE UNIQUE INDEX ON trending_businesses (id);
CREATE INDEX ON trending_businesses (computed_followers_count DESC, recent_followers_count DESC);

-- Refresh materialized view every 30 minutes
```

### **3. High-Performance Database Functions**

```sql
-- Optimized batch follow check function
CREATE OR REPLACE FUNCTION batch_check_follows(
  p_follower_id uuid,
  p_following_ids uuid[]
) RETURNS TABLE(following_id uuid, is_following boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(p_following_ids) as following_id,
    EXISTS(
      SELECT 1 FROM follows 
      WHERE follower_id = p_follower_id 
      AND following_id = unnest(p_following_ids)
    ) as is_following;
END;
$$ LANGUAGE plpgsql STABLE;

-- Optimized search function with full-text search
CREATE OR REPLACE FUNCTION search_business_users(
  p_query text DEFAULT '',
  p_current_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
) RETURNS TABLE(
  id uuid,
  full_name text,
  business_name text,
  business_category text,
  business_description text,
  location text,
  profile_image_url text,
  followers_count integer,
  following_count integer,
  is_following boolean,
  created_at timestamptz
) AS $$
DECLARE
  search_vector tsvector;
BEGIN
  -- Use full-text search if query provided
  IF p_query IS NOT NULL AND length(trim(p_query)) > 0 THEN
    search_vector := plainto_tsquery('english', p_query);
    
    RETURN QUERY
    SELECT 
      u.id,
      u.full_name,
      u.business_name,
      u.business_category,
      u.business_description,
      u.location,
      u.profile_image_url,
      COALESCE(u.followers_count, 0)::integer,
      COALESCE(u.following_count, 0)::integer,
      COALESCE(f.is_following, false)::boolean,
      u.created_at
    FROM users u
    LEFT JOIN (
      SELECT following_id, true as is_following
      FROM follows 
      WHERE follower_id = p_current_user_id
    ) f ON u.id = f.following_id
    WHERE u.user_type = 'business'
    AND to_tsvector('english', 
      coalesce(u.full_name, '') || ' ' || 
      coalesce(u.business_name, '') || ' ' || 
      coalesce(u.business_category, '') || ' ' ||
      coalesce(u.location, '')
    ) @@ search_vector
    ORDER BY 
      ts_rank(to_tsvector('english', 
        coalesce(u.full_name, '') || ' ' || 
        coalesce(u.business_name, '') || ' ' || 
        coalesce(u.business_category, '')
      ), search_vector) DESC,
      u.followers_count DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
  ELSE
    -- Return trending businesses when no search query
    RETURN QUERY
    SELECT 
      u.id,
      u.full_name,
      u.business_name,
      u.business_category,
      u.business_description,
      u.location,
      u.profile_image_url,
      COALESCE(u.followers_count, 0)::integer,
      COALESCE(u.following_count, 0)::integer,
      COALESCE(f.is_following, false)::boolean,
      u.created_at
    FROM users u
    LEFT JOIN (
      SELECT following_id, true as is_following
      FROM follows 
      WHERE follower_id = p_current_user_id
    ) f ON u.id = f.following_id
    WHERE u.user_type = 'business'
    ORDER BY u.followers_count DESC NULLS LAST, u.created_at DESC
    LIMIT p_limit OFFSET p_offset;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Atomic counter update functions
CREATE OR REPLACE FUNCTION update_followers_count(p_user_id uuid, p_increment integer)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET followers_count = GREATEST(0, COALESCE(followers_count, 0) + p_increment),
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_following_count(p_user_id uuid, p_increment integer)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET following_count = GREATEST(0, COALESCE(following_count, 0) + p_increment),
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### **4. Connection Pool Configuration**

```sql
-- Supabase connection pool settings (via dashboard or CLI)
-- Max connections: 100-200 (depending on plan)
-- Pool mode: Transaction (recommended for high concurrency)
-- Default pool size: 25
-- Reserve pool: 5

-- For self-hosted PostgreSQL:
-- max_connections = 200
-- shared_buffers = 256MB (25% of RAM)
-- effective_cache_size = 1GB (75% of RAM)
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100
```

### **5. Query Optimization Patterns**

```sql
-- Use prepared statements for frequent queries
PREPARE get_user_follow_status(uuid, uuid) AS
SELECT EXISTS(
  SELECT 1 FROM follows 
  WHERE follower_id = $1 AND following_id = $2
);

-- Batch operations for better performance
INSERT INTO follows (follower_id, following_id, created_at)
VALUES 
  ($1, $2, now()),
  ($3, $4, now()),
  ($5, $6, now())
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Use LIMIT and OFFSET for pagination
SELECT * FROM users 
WHERE user_type = 'business'
ORDER BY followers_count DESC
LIMIT 20 OFFSET 0;
```

### **6. Monitoring and Maintenance**

```sql
-- Create monitoring views
CREATE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100  -- queries slower than 100ms
ORDER BY mean_time DESC;

-- Database maintenance script (run weekly)
-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY trending_businesses;

-- Update table statistics
ANALYZE users;
ANALYZE follows;

-- Reindex if needed (during low-traffic hours)
REINDEX INDEX CONCURRENTLY idx_users_followers_count;
```

### **7. Caching Strategy**

```sql
-- Enable query result caching
SET statement_timeout = '30s';
SET idle_in_transaction_session_timeout = '60s';

-- Use Redis/Memcached for:
-- - Search results (TTL: 5 minutes)
-- - User profiles (TTL: 30 minutes)
-- - Follow status (TTL: 1 minute)
-- - Trending data (TTL: 15 minutes)
```

### **8. Backup and Recovery**

```sql
-- Point-in-time recovery setup
-- Automated daily backups
-- Continuous WAL archiving
-- Cross-region backup replication

-- Performance monitoring queries
SELECT * FROM pg_stat_database WHERE datname = 'postgres';
SELECT * FROM pg_stat_user_tables WHERE relname IN ('users', 'follows');
SELECT * FROM pg_stat_user_indexes WHERE relname IN ('users', 'follows');
```

### **9. Scaling Recommendations**

#### **Immediate (1-1000 users):**
- Implement all indexes above
- Enable connection pooling
- Set up basic monitoring

#### **Short-term (1000-5000 users):**
- Add read replicas for search queries
- Implement materialized views
- Add query result caching

#### **Long-term (5000+ users):**
- Consider database sharding
- Implement CDC (Change Data Capture)
- Add full-text search engine (Elasticsearch)
- Use separate analytics database

### **10. Performance Benchmarks**

#### **Target Metrics:**
- **Search queries:** < 100ms average
- **Follow operations:** < 50ms average
- **User profile loads:** < 30ms average
- **Database CPU:** < 70% average
- **Connection pool:** < 80% utilization

#### **Monitoring Alerts:**
- Query time > 500ms
- Connection pool > 90%
- Database CPU > 85%
- Disk I/O > 80%
- Failed queries > 1%

### **11. Implementation Priority**

1. **Critical (Implement immediately):**
   - Core indexes on users and follows tables
   - Connection pooling configuration
   - Basic query optimization

2. **High Priority (Within 1 week):**
   - Database functions for common operations
   - Materialized views for trending data
   - Full-text search setup

3. **Medium Priority (Within 1 month):**
   - Advanced monitoring setup
   - Read replica configuration
   - Automated maintenance scripts

4. **Low Priority (Future scaling):**
   - Database sharding strategy
   - Advanced caching layers
   - Analytics database separation

This optimization guide will ensure your database can efficiently handle 1000+ concurrent users while maintaining fast response times and high availability. 