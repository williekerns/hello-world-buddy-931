import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Package, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
}

const Admin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    condition: 'good',
    retail_price: '',
    starting_price: '',
    buy_now_price: '',
    auction_mode: 'both',
    duration: '24'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createAuction = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create auctions",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.category_id || !formData.retail_price || !formData.starting_price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate end time
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (parseInt(formData.duration) * 60 * 60 * 1000));

      // 1. Create item first
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .insert({
          seller_id: user.id,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          condition: formData.condition,
          starting_price: parseFloat(formData.starting_price),
          retail_price: parseFloat(formData.retail_price),
          buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
          shipping_cost: 0,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // 2. Create auction
      const { error: auctionError } = await supabase
        .from('auctions')
        .insert({
          item_id: itemData.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          current_price: parseFloat(formData.starting_price),
          bid_count: 0,
          status: 'active',
          mode: formData.auction_mode
        });

      if (auctionError) throw auctionError;

      // 3. Create analytics entry
      await supabase
        .from('item_analytics')
        .insert({
          item_id: itemData.id,
          view_count: 0,
          watcher_count: 0
        });

      toast({
        title: "Auction Created Successfully!",
        description: `${formData.title} is now live`,
        variant: "default"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category_id: '',
        condition: 'good',
        retail_price: '',
        starting_price: '',
        buy_now_price: '',
        auction_mode: 'both',
        duration: '24'
      });

    } catch (error) {
      console.error('Error creating auction:', error);
      toast({
        title: "Error",
        description: "Failed to create auction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <p className="text-muted-foreground">Please log in to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-xl text-muted-foreground">Create new auction listings</p>
      </header>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Package className="w-6 h-6" />
            Create New Auction
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Item Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">Item Title *</Label>
              <Input
                id="title"
                placeholder="Enter item title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-lg py-3 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the item condition, features, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="text-lg mt-2 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-lg font-semibold">Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger className="text-lg py-3 mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-lg">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-lg font-semibold">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className="text-lg py-3 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" className="text-lg">New</SelectItem>
                    <SelectItem value="like_new" className="text-lg">Like New</SelectItem>
                    <SelectItem value="good" className="text-lg">Good</SelectItem>
                    <SelectItem value="fair" className="text-lg">Fair</SelectItem>
                    <SelectItem value="poor" className="text-lg">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Strategy
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="retail_price" className="text-lg font-semibold">Retail Price * (for savings calc)</Label>
                <Input
                  id="retail_price"
                  type="number"
                  placeholder="89.99"
                  value={formData.retail_price}
                  onChange={(e) => handleInputChange('retail_price', e.target.value)}
                  className="text-lg py-3 mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="starting_price" className="text-lg font-semibold">Starting Bid *</Label>
                <Input
                  id="starting_price"
                  type="number"
                  placeholder="25.00"
                  value={formData.starting_price}
                  onChange={(e) => handleInputChange('starting_price', e.target.value)}
                  className="text-lg py-3 mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="buy_now_price" className="text-lg font-semibold">Buy Now Price (optional)</Label>
                <Input
                  id="buy_now_price"
                  type="number"
                  placeholder="75.00"
                  value={formData.buy_now_price}
                  onChange={(e) => handleInputChange('buy_now_price', e.target.value)}
                  className="text-lg py-3 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Auction Settings
            </h3>
            
            <div>
              <Label className="text-lg font-semibold">Auction Mode</Label>
              <RadioGroup 
                value={formData.auction_mode} 
                onValueChange={(value) => handleInputChange('auction_mode', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="auction_only" id="auction_only" />
                  <Label htmlFor="auction_only" className="text-lg">Auction Only - Bidding wars maximize revenue</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="buy_now_only" id="buy_now_only" />
                  <Label htmlFor="buy_now_only" className="text-lg">Buy Now Only - Fixed price instant sale</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="text-lg">Both Options - Maximum conversion potential</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="duration" className="text-lg font-semibold">Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                <SelectTrigger className="text-lg py-3 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-lg">1 Hour</SelectItem>
                  <SelectItem value="3" className="text-lg">3 Hours</SelectItem>
                  <SelectItem value="6" className="text-lg">6 Hours</SelectItem>
                  <SelectItem value="24" className="text-lg">1 Day</SelectItem>
                  <SelectItem value="72" className="text-lg">3 Days</SelectItem>
                  <SelectItem value="168" className="text-lg">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Preview */}
          {formData.retail_price && formData.starting_price && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Price Psychology Preview:</h4>
              <div className="text-lg">
                <div className="line-through text-muted-foreground">Retail: ${parseFloat(formData.retail_price || '0').toLocaleString()}</div>
                <div className="text-green-600 font-bold text-xl">
                  Starting at: ${parseFloat(formData.starting_price || '0').toLocaleString()}
                </div>
                <div className="text-green-600 font-semibold">
                  Potential Savings: ${(parseFloat(formData.retail_price || '0') - parseFloat(formData.starting_price || '0')).toLocaleString()} 
                  ({Math.round(((parseFloat(formData.retail_price || '0') - parseFloat(formData.starting_price || '0')) / parseFloat(formData.retail_price || '1')) * 100)}% off!)
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={createAuction}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xl py-6"
            size="lg"
          >
            <Plus className="w-6 h-6 mr-3" />
            {loading ? 'Creating Auction...' : 'Create Auction'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;