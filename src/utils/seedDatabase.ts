import { supabase } from '@/lib/supabase';

export const seedDatabase = async () => {
  try {
    // 1. Create categories for all three types
    const categories = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Electronics & Tech',
        description: 'Phones, tablets, accessories and electronic gadgets'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Tools & Hardware',
        description: 'Power tools, hand tools, and hardware'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440021',
        name: 'Collectibles & Antiques',
        description: 'Vintage items, antiques, and collectibles'
      }
    ];

    for (const category of categories) {
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert(category);
      
      if (categoryError && categoryError.code !== '23505') {
        console.error('Category error:', categoryError);
      }
    }

    // 2. Create user profile (seller)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'willies.binstore@example.com',
        first_name: 'Willie',
        last_name: 'Johnson',
        phone: '270-555-0123',
        bio: 'Local bin store owner in Western Kentucky',
        avatar_url: null,
        is_verified: true,
        is_admin: true
      });

    if (profileError && profileError.code !== '23505') {
      console.error('Profile error:', profileError);
    }

    // 3. Create items for all three auction modes
    const now = new Date();
    const items = [
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        seller_id: '550e8400-e29b-41d4-a716-446655440002',
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Samsung Galaxy Wireless Earbuds - AUCTION ONLY',
        description: 'Brand new Samsung Galaxy Buds Pro with active noise cancellation. Never opened, still in original packaging. Bidding only - no buy now option!',
        condition: 'new',
        starting_price: 25.00,
        reserve_price: null,
        buy_now_price: null, // No buy now for auction only
        retail_price: 199.99,
        shipping_cost: 0,
        weight: 0.5,
        dimensions: '4x4x2 inches'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        seller_id: '550e8400-e29b-41d4-a716-446655440002',
        category_id: '550e8400-e29b-41d4-a716-446655440011',
        title: 'DeWalt Cordless Drill Set - BUY NOW ONLY',
        description: 'Professional grade DeWalt 20V MAX cordless drill with 2 batteries, charger, and carrying case. Ready to ship immediately!',
        condition: 'like_new',
        starting_price: 89.99,
        reserve_price: null,
        buy_now_price: 89.99,
        retail_price: 159.99,
        shipping_cost: 12.99,
        weight: 5.2,
        dimensions: '15x12x6 inches'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440023',
        seller_id: '550e8400-e29b-41d4-a716-446655440002',
        category_id: '550e8400-e29b-41d4-a716-446655440021',
        title: 'Vintage Cast Iron Skillet Set - BID OR BUY NOW',
        description: 'Authentic vintage Lodge cast iron skillet set (8", 10", 12"). Well-seasoned and ready to use. Perfect for collectors or serious cooks!',
        condition: 'good',
        starting_price: 35.00,
        reserve_price: null,
        buy_now_price: 125.00,
        retail_price: 189.99,
        shipping_cost: 8.50,
        weight: 12.0,
        dimensions: '14x14x4 inches'
      }
    ];

    for (const item of items) {
      const { error: itemError } = await supabase
        .from('items')
        .upsert(item);
      
      if (itemError && itemError.code !== '23505') {
        console.error('Item error:', itemError);
      }
    }

    // 4. Create auctions with different modes and timing
    const endSoon = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes (urgent)
    const endMedium = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours (yellow)
    const endLater = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours (green)

    const auctions = [
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        item_id: '550e8400-e29b-41d4-a716-446655440003',
        start_time: now.toISOString(),
        end_time: endSoon.toISOString(),
        current_price: 67.00,
        bid_count: 11,
        status: 'active',
        mode: 'auction_only'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        item_id: '550e8400-e29b-41d4-a716-446655440013',
        start_time: now.toISOString(),
        end_time: endMedium.toISOString(),
        current_price: 89.99,
        bid_count: 0,
        status: 'active',
        mode: 'buy_now_only'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440024',
        item_id: '550e8400-e29b-41d4-a716-446655440023',
        start_time: now.toISOString(),
        end_time: endLater.toISOString(),
        current_price: 78.00,
        bid_count: 18,
        status: 'active',
        mode: 'both'
      }
    ];

    for (const auction of auctions) {
      const { error: auctionError } = await supabase
        .from('auctions')
        .upsert(auction);
      
      if (auctionError && auctionError.code !== '23505') {
        console.error('Auction error:', auctionError);
      }
    }

    // 5. Create analytics with realistic social proof
    const analytics = [
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        item_id: '550e8400-e29b-41d4-a716-446655440003',
        view_count: 89,
        watcher_count: 23
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        item_id: '550e8400-e29b-41d4-a716-446655440013',
        view_count: 34,
        watcher_count: 8
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440025',
        item_id: '550e8400-e29b-41d4-a716-446655440023',
        view_count: 156,
        watcher_count: 31
      }
    ];

    for (const analytic of analytics) {
      const { error: analyticsError } = await supabase
        .from('item_analytics')
        .upsert(analytic);
      
      if (analyticsError && analyticsError.code !== '23505') {
        console.error('Analytics error:', analyticsError);
      }
    }

    // 6. Create realistic bid history
    const bids = [
      // Auction-only item (escalating towards urgent end)
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 25.00, offset: -600000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 28.00, offset: -540000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 35.00, offset: -480000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 42.00, offset: -420000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 48.00, offset: -360000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 55.00, offset: -300000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 61.00, offset: -240000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 64.00, offset: -180000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 66.00, offset: -120000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440004', amount: 67.00, offset: -60000 },
      
      // Both mode item (competitive bidding near buy-now price)
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 35.00, offset: -1800000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 40.00, offset: -1620000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 45.00, offset: -1440000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 52.00, offset: -1260000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 58.00, offset: -1080000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 63.00, offset: -900000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 68.00, offset: -720000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 72.00, offset: -540000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 75.00, offset: -360000 },
      { auction_id: '550e8400-e29b-41d4-a716-446655440024', amount: 78.00, offset: -180000 }
    ];

    for (let i = 0; i < bids.length; i++) {
      const bid = bids[i];
      const bidTime = new Date(Date.now() + bid.offset);
      
      await supabase
        .from('bids')
        .upsert({
          id: `550e8400-e29b-41d4-a716-44665544${1000 + i}`,
          auction_id: bid.auction_id,
          bidder_id: '550e8400-e29b-41d4-a716-446655440002',
          amount: bid.amount,
          is_winning: i === 9 || i === 19, // Last bid for each auction
          created_at: bidTime.toISOString()
        });
    }

    console.log('All auction modes seeded successfully!');
    return {
      success: true,
      message: 'Created 3 auctions: auction-only (urgent), buy-now-only, and both modes with realistic bid wars'
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
};