"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyDatabaseSetup, getSampleReferralCode } from "@/lib/verify-db"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function VerifyPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sampleReferralCode, setSampleReferralCode] = useState<string | null>(null)

  useEffect(() => {
    runVerification()
  }, [])

  const runVerification = async () => {
    setLoading(true)
    try {
      const dbResults = await verifyDatabaseSetup()
      setResults(dbResults)
      
      const code = await getSampleReferralCode()
      setSampleReferralCode(code)
    } catch (error) {
      console.error("Verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Verification</h1>
          <p className="text-gray-600">Verify that your database is properly set up for the referral system</p>
        </div>
        <Button onClick={runVerification} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Verifying...' : 'Rerun Verification'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Components</CardTitle>
            <CardDescription>Required tables and functions for the referral system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : results ? (
              <div className="space-y-3">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                    {Boolean(value) ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        OK
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4 mr-1" />
                        Missing
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to run verification. Please check the console for errors.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral System Test</CardTitle>
            <CardDescription>Use this to test the referral system</CardDescription>
          </CardHeader>
          <CardContent>
            {sampleReferralCode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Sample Referral Code</h3>
                  <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                    {sampleReferralCode}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Test Registration with Referral</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Use this link to test the referral system:
                  </p>
                  <div className="p-3 bg-gray-100 rounded-md font-mono text-xs break-all">
                    {`${window.location.origin}/register?ref=${sampleReferralCode}`}
                  </div>
                  <Button 
                    className="mt-3 w-full"
                    onClick={() => {
                      const url = `${window.location.origin}/register?ref=${sampleReferralCode}`;
                      window.open(url, '_blank');
                    }}
                  >
                    Open Registration Page
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p>No sample referral code found. Please make sure you have at least one user in the database.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Missing Database Functions</h3>
                <p className="text-sm text-gray-600 mb-2">
                  If process_referral or calculate_user_stats functions are missing, you need to run the database migrations.
                </p>
                <pre className="p-3 bg-gray-100 rounded-md text-xs">
{`-- Create process_referral function
CREATE OR REPLACE FUNCTION process_referral(
  referrer_id_param UUID,
  referred_user_id_param UUID,
  referral_code_param TEXT
) RETURNS void AS $$
BEGIN
  -- Create referral record
  INSERT INTO referrals (
    referrer_id,
    referred_user_id,
    referral_code,
    reward_points,
    status
  ) VALUES (
    referrer_id_param,
    referred_user_id_param,
    referral_code_param,
    500,
    'active'
  );
  
  -- Add activity for referrer
  INSERT INTO user_activities (
    user_id,
    activity_type,
    description,
    reward_points,
    metadata
  ) VALUES (
    referrer_id_param,
    'referral',
    'Someone joined using your referral code',
    100,
    jsonb_build_object(
      'referral_code', referral_code_param,
      'reward_amount', 500
    )
  );
  
  -- Update user stats for both users
  PERFORM calculate_user_stats(referrer_id_param);
  PERFORM calculate_user_stats(referred_user_id_param);
END;
$$ LANGUAGE plpgsql;

-- Create calculate_user_stats function
CREATE OR REPLACE FUNCTION calculate_user_stats(target_user_id UUID) RETURNS void AS $$
DECLARE
  total_refs INTEGER;
  successful_refs INTEGER;
  total_pts INTEGER;
  achievement_count INTEGER;
  credit_amount INTEGER;
BEGIN
  -- Count referrals
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO 
    total_refs,
    successful_refs
  FROM referrals
  WHERE referrer_id = target_user_id;
  
  -- Sum points from activities
  SELECT COALESCE(SUM(reward_points), 0)
  INTO total_pts
  FROM user_activities
  WHERE user_id = target_user_id;
  
  -- Count achievements
  SELECT COUNT(*)
  INTO achievement_count
  FROM achievements
  WHERE user_id = target_user_id;
  
  -- Calculate credits (₹500 per successful referral)
  credit_amount := successful_refs * 500;
  
  -- Update or insert stats
  INSERT INTO user_stats (
    user_id,
    total_referrals,
    successful_referrals,
    total_credits_earned,
    total_points,
    achievements_count,
    last_calculated_at
  ) VALUES (
    target_user_id,
    total_refs,
    successful_refs,
    credit_amount,
    total_pts,
    achievement_count,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_referrals = EXCLUDED.total_referrals,
    successful_referrals = EXCLUDED.successful_referrals,
    total_credits_earned = EXCLUDED.total_credits_earned,
    total_points = EXCLUDED.total_points,
    achievements_count = EXCLUDED.achievements_count,
    last_calculated_at = EXCLUDED.last_calculated_at;
END;
$$ LANGUAGE plpgsql;`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 