'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Copy, Check, Share2, DollarSign } from 'lucide-react';

interface ReferralWidgetProps {
  userEmail?: string;
}

export function ReferralWidget({ userEmail }: ReferralWidgetProps) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    clicks: 0,
    conversions: 0,
    totalReward: 0
  });

  useEffect(() => {
    if (userEmail) {
      fetchOrCreateReferral();
    }
  }, [userEmail]);

  const fetchOrCreateReferral = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.referralCode);
        setReferralUrl(data.referralUrl);
      }
    } catch (error) {
      console.error('Failed to create referral:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `Get $5 off your first gift card purchase! Use my referral link: ${referralUrl}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(referralUrl);

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!userEmail) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Refer Friends & Earn
          </h3>
          <p className="text-text-secondary mb-4">
            Sign in to get your referral link and start earning rewards!
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading your referral link...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Refer Friends, Earn Together
            </h3>
            <p className="text-sm text-text-secondary">
              Give $5, Get $5 for each friend
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background-card rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 font-bold">
              1
            </div>
            <p className="text-sm text-text-secondary">Share your link</p>
          </div>
          <div className="text-center p-4 bg-background-card rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 font-bold">
              2
            </div>
            <p className="text-sm text-text-secondary">Friend makes purchase</p>
          </div>
          <div className="text-center p-4 bg-background-card rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 font-bold">
              3
            </div>
            <p className="text-sm text-text-secondary">You both get $5!</p>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Your Referral Code
          </label>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="flex-1 font-mono text-lg"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(referralCode)}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Referral URL */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(referralUrl)}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share buttons */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Share on Social Media
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOnSocial('facebook')}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOnSocial('twitter')}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOnSocial('whatsapp')}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.clicks}</p>
            <p className="text-xs text-text-secondary">Clicks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.conversions}</p>
            <p className="text-xs text-text-secondary">Referrals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">${stats.totalReward.toFixed(2)}</p>
            <p className="text-xs text-text-secondary">Earned</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

