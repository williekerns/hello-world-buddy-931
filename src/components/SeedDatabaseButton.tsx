import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/utils/seedDatabase';
import { Database, Loader2 } from 'lucide-react';

export const SeedDatabaseButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedDatabase();
      
      if (result.success) {
        toast({
          title: "Database Seeded!",
          description: result.message,
          variant: "default"
        });
        
        // Refresh the page to show new data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: "Seeding Failed",
        description: "Unable to create test auction data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
      size="lg"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Database className="w-5 h-5 mr-2" />
      )}
      {loading ? 'Creating Test Data...' : 'Create Test Auction'}
    </Button>
  );
};