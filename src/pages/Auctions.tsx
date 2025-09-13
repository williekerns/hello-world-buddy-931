import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Eye, Gavel, Heart, DollarSign, Users, TrendingUp, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AuctionData {
  id: string;
  item_id: string;
  start_time: string;
  end_time: string;
  current_price: number;
  bid_count: number;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  item: {
    id: string;
    title: string;
    description: string;
    condition: string;
    starting_price: number;
    reserve_price: number | null;
    buy_now_price: number | null;
    retail_price: number | null;
    category: {
      name: string;
    };
  };
  analytics: {
    view_count: number;
    watcher_count: number;
  } | null;
}

const Auctions = () => {
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState<{[key: string]: string}>({});
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAuctions();
    
    // Set up real-time subscription for auction updates
    const channel = supabase
      .channel('auction-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auctions' },
        () => fetchAuctions()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => fetchAuctions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          item:items(
            *,
            category:categories(name)
          ),
          analytics:item_analytics(view_count, watcher_count)
        `)
        .eq('status', 'active')
        .order('end_time', { ascending: true });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast({
        title: "Error",
        description: "Failed to load auctions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (auctionId: string, amount: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place bids",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          bidder_id: user.id,
          amount: amount
        });

      if (error) throw error;

      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of $${amount.toFixed(2)} has been placed.`,
        variant: "default"
      });

      setBidAmounts(prev => ({ ...prev, [auctionId]: '' }));
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Bid Failed",
        description: "Unable to place bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addToWatchlist = async (auctionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add to watchlist",
        variant: "destructive"
      });
      return;
    }

    setWatchlist(prev => new Set(prev).add(auctionId));
    toast({
      title: "Added to Watchlist",
      description: "Item added to your watchlist",
      variant: "default"
    });
  };

  const buyNow = async (auctionId: string, price: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to buy now",
        variant: "destructive"
      });
      return;
    }

    try {
      await placeBid(auctionId, price);
      toast({
        title: "Purchase Successful!",
        description: `Item purchased for $${price.toFixed(2)}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error with buy now:', error);
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return { text: "Ended", color: "text-red-500", urgent: false };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    let color = 'text-green-600';
    let urgent = false;
    
    if (days > 1) {
      text = `${days}d ${hours}h`;
      color = 'text-green-600';
    } else if (days === 1) {
      text = `${days}d ${hours}h`;
      color = 'text-yellow-600';
    } else if (hours > 1) {
      text = `${hours}h ${minutes}m`;
      color = 'text-yellow-600';
    } else {
      text = `${hours}h ${minutes}m`;
      color = 'text-red-500';
      urgent = true;
    }
    
    return { text, color, urgent };
  };

  const getQuickBidAmounts = (currentPrice: number) => {
    if (currentPrice < 50) return [2, 5, 10];
    if (currentPrice < 200) return [5, 10, 25];
    if (currentPrice < 1000) return [10, 25, 50];
    return [25, 50, 100];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Live Auctions</h1>
        <p className="text-muted-foreground text-lg">Authentic items at unbeatable prices</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {auctions.map((auction) => {
          const timeRemaining = formatTimeRemaining(auction.end_time);
          const quickBids = getQuickBidAmounts(auction.current_price);
          const currentBid = bidAmounts[auction.id] || '';
          const minBid = auction.current_price + 1;
          const retailPrice = auction.item.retail_price;
          const savingsPercent = retailPrice ? Math.round(((retailPrice - auction.current_price) / retailPrice) * 100) : 0;

          return (
            <Card key={auction.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              {/* Price Anchoring Header */}
              {retailPrice && (
                <div className="bg-red-50 dark:bg-red-950 p-3 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground line-through">
                        Retail: ${retailPrice.toLocaleString()}
                      </span>
                      <div className="text-green-600 font-bold text-lg">
                        Save {savingsPercent}% (${(retailPrice - auction.current_price).toLocaleString()})
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-white">
                      SAVE BIG
                    </Badge>
                  </div>
                </div>
              )}

              {/* Item Image */}
              <div className="aspect-video bg-muted relative">
                <img 
                  src="/placeholder.svg" 
                  alt={auction.item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Urgency Badge */}
                <Badge 
                  variant={timeRemaining.urgent ? "destructive" : "secondary"}
                  className={`absolute top-3 right-3 ${timeRemaining.urgent ? 'animate-pulse' : ''}`}
                >
                  {timeRemaining.urgent && "🔥"} {timeRemaining.text}
                </Badge>

                {/* Scarcity Indicator */}
                <Badge variant="outline" className="absolute top-3 left-3 bg-white/90">
                  Only 1 available
                </Badge>

                {/* Watchlist Button */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white"
                  onClick={() => addToWatchlist(auction.id)}
                >
                  <Heart className={`w-4 h-4 ${watchlist.has(auction.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">
                    {auction.item.category?.name || 'Uncategorized'}
                  </Badge>
                  
                  {/* Social Proof */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {auction.analytics?.view_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {auction.analytics?.watcher_count || 0} watching
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-xl leading-tight font-bold">
                  {auction.item.title}
                </CardTitle>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {auction.item.description}
                </p>

                {/* Trust Signals */}
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Condition: {auction.item.condition}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    ✓ Verified
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Current Bid Display */}
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                  <div className="text-3xl font-bold text-primary">
                    ${auction.current_price.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Gavel className="w-4 h-4" />
                      {auction.bid_count} bids
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Hot item
                    </div>
                  </div>
                </div>

                {/* Quick Bid Buttons */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-center">Quick Bid</div>
                  <div className="grid grid-cols-3 gap-2">
                    {quickBids.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="text-lg font-bold py-3"
                        onClick={() => placeBid(auction.id, auction.current_price + amount)}
                      >
                        +${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Bid Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Min: $${minBid}`}
                      value={currentBid}
                      onChange={(e) => setBidAmounts(prev => ({ ...prev, [auction.id]: e.target.value }))}
                      className="text-lg"
                    />
                    <Button
                      onClick={() => {
                        const amount = parseFloat(currentBid);
                        if (amount >= minBid) {
                          placeBid(auction.id, amount);
                        }
                      }}
                      disabled={!currentBid || parseFloat(currentBid) < minBid}
                      className="px-6 text-lg font-bold"
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Bid
                    </Button>
                  </div>
                </div>

                {/* Buy Now Option */}
                {auction.item.buy_now_price && (
                  <Button
                    onClick={() => buyNow(auction.id, auction.item.buy_now_price!)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-3"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now - ${auction.item.buy_now_price.toLocaleString()}
                  </Button>
                )}

                {/* Urgency Message */}
                {timeRemaining.urgent && (
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-red-600 font-bold text-sm">
                      ⚡ ENDING SOON! Don't miss out!
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {auctions.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-muted-foreground">No active auctions</h3>
          <p className="text-muted-foreground mt-2">Check back soon for new listings!</p>
        </div>
      )}
    </div>
  );
};

export default Auctions;