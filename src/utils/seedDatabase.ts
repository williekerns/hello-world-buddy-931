import { supabase } from '@/lib/supabase';

export const seedDatabase = async () => {
  try {
    // 1. Create category first
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Electronics & Tech',
        description: 'Phones, tablets, accessories and electronic gadgets',
        image_url: null,
        parent_id: null
      })
      .select()
      .single();

    if (categoryError && categoryError.code !== '23505') { // ignore duplicate key error
      console.error('Category error:', categoryError);
      return;
    }

    // 2. Create user profile (seller) - using a fixed ID for consistency
    const { data: profileData, error: profileError } = await supabase
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
      })
      .select()
      .single();

    if (profileError && profileError.code !== '23505') {
      console.error('Profile error:', profileError);
      return;
    }

    // 3. Create item
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440003',
        seller_id: '550e8400-e29b-41d4-a716-446655440002',
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Samsung Galaxy Wireless Earbuds - Like New in Box',
        description: 'Authentic Samsung Galaxy Buds Pro found in Amazon return bin. Original box, charging case, and all accessories included. Tested and working perfectly. Minor scuff on charging case but earbuds are pristine. Great sound quality with active noise canceling.',
        condition: 'like_new',
        starting_price: 25.00,
        reserve_price: null,
        buy_now_price: 89.99,
        retail_price: 149.99,
        shipping_cost: 5.99,
        weight: 0.5,
        dimensions: '4x4x2 inches'
      })
      .select()
      .single();

    if (itemError && itemError.code !== '23505') {
      console.error('Item error:', itemError);
      return;
    }

    // 4. Create auction
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (6 * 60 * 60 * 1000)); // 6 hours from now

    const { data: auctionData, error: auctionError } = await supabase
      .from('auctions')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        item_id: '550e8400-e29b-41d4-a716-446655440003',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        current_price: 35.00, // Someone already bid
        bid_count: 7,
        status: 'active',
        mode: 'both'
      })
      .select()
      .single();

    if (auctionError && auctionError.code !== '23505') {
      console.error('Auction error:', auctionError);
      return;
    }

    // 5. Create item analytics
    const { error: analyticsError } = await supabase
      .from('item_analytics')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440005',
        item_id: '550e8400-e29b-41d4-a716-446655440003',
        view_count: 47,
        watcher_count: 12
      });

    if (analyticsError && analyticsError.code !== '23505') {
      console.error('Analytics error:', analyticsError);
      return;
    }

    // 6. Create some realistic bids
    const bids = [
      { amount: 25.00, time_offset: -3600000 }, // 1 hour ago
      { amount: 27.50, time_offset: -2700000 }, // 45 min ago  
      { amount: 30.00, time_offset: -1800000 }, // 30 min ago
      { amount: 32.50, time_offset: -1200000 }, // 20 min ago
      { amount: 33.00, time_offset: -900000 },  // 15 min ago
      { amount: 34.00, time_offset: -600000 },  // 10 min ago
      { amount: 35.00, time_offset: -300000 }   // 5 min ago (current winning)
    ];

    for (let i = 0; i < bids.length; i++) {
      const bid = bids[i];
      const bidTime = new Date(Date.now() + bid.time_offset);
      
      await supabase
        .from('bids')
        .upsert({
          id: `550e8400-e29b-41d4-a716-44665544000${6 + i}`,
          auction_id: '550e8400-e29b-41d4-a716-446655440004',
          bidder_id: '550e8400-e29b-41d4-a716-446655440002', // Using seller as bidder for demo
          amount: bid.amount,
          is_winning: i === bids.length - 1, // Last bid is winning
          created_at: bidTime.toISOString()
        });
    }

    console.log('Database seeded successfully!');
    return {
      success: true,
      message: 'Created Samsung Galaxy Earbuds auction with 7 bids, 47 views, 12 watchers'
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
};