import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Gavel } from 'lucide-react';

const Auctions = () => {
  // Mock data for now - will connect to Supabase later
  const mockAuctions = [
    {
      id: 1,
      title: "Vintage Rolex Submariner",
      description: "Rare 1970s Rolex Submariner in excellent condition",
      currentBid: 15000,
      startingBid: 10000,
      endTime: "2024-12-20T18:00:00Z",
      viewCount: 247,
      bidCount: 12,
      category: "Watches",
      mode: "Standard",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Original iPhone (2007)",
      description: "First generation iPhone, sealed in original packaging",
      currentBid: 3500,
      startingBid: 1000,
      endTime: "2024-12-22T20:00:00Z",
      viewCount: 156,
      bidCount: 8,
      category: "Electronics",
      mode: "Reserve",
      image: "/placeholder.svg"
    }
  ];

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Live Auctions</h1>
        <p className="text-muted-foreground">Bid on unique items from around the world</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAuctions.map((auction) => (
          <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <img 
                src={auction.image} 
                alt={auction.title}
                className="w-full h-full object-cover"
              />
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2"
              >
                {auction.mode}
              </Badge>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2">
                  {auction.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {auction.viewCount}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">
                {auction.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {auction.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current bid</span>
                  <span className="font-semibold text-lg">
                    ${auction.currentBid.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Gavel className="w-3 h-3" />
                    {auction.bidCount} bids
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(auction.endTime)}
                  </div>
                </div>
              </div>
              
              <Button className="w-full" size="sm">
                View Auction
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Auctions;