import { useState, useCallback } from 'react';
import { ApiKey } from '@/types/apiTypes';
import { toast } from '@/hooks/use-toast';

export const useApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_abcd1234efgh5678ijkl9012',
      permissions: ['read', 'write'],
      createdAt: '2024-01-15T10:00:00Z',
      lastUsed: '2024-01-20T14:30:00Z',
      isActive: true,
      requestCount: 15420,
      monthlyLimit: 50000,
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_test_wxyz9876stuv5432pqrs1098',
      permissions: ['read'],
      createdAt: '2024-01-10T09:15:00Z',
      lastUsed: '2024-01-19T16:45:00Z',
      isActive: true,
      requestCount: 2341,
      monthlyLimit: 10000,
    },
  ]);

  const createApiKey = useCallback(async (
    name: string, 
    permissions: ('read' | 'write' | 'admin')[]
  ) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        name,
        key: `sk_live_${crypto.randomUUID().replace(/-/g, '').substring(0, 32)}`,
        permissions,
        createdAt: new Date().toISOString(),
        isActive: true,
        requestCount: 0,
        monthlyLimit: permissions.includes('admin') ? 100000 : 
                     permissions.includes('write') ? 50000 : 10000,
      };

      setApiKeys(prev => [...prev, newKey]);
      
      toast({
        title: "API Key created successfully",
        description: `Key "${name}" is ready to use`,
      });

      return newKey;
    } catch (error) {
      toast({
        title: "Failed to create API key",
        description: "Please try again or contact support",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const revokeApiKey = useCallback(async (keyId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(prev => 
        prev.map(key => 
          key.id === keyId 
            ? { ...key, isActive: false }
            : key
        )
      );

      toast({
        title: "API Key revoked",
        description: "Key has been deactivated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to revoke API key",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, []);

  const regenerateApiKey = useCallback(async (keyId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKeyValue = `sk_live_${crypto.randomUUID().replace(/-/g, '').substring(0, 32)}`;
      
      setApiKeys(prev => 
        prev.map(key => 
          key.id === keyId 
            ? { ...key, key: newKeyValue, requestCount: 0 }
            : key
        )
      );

      toast({
        title: "API Key regenerated",
        description: "New key has been generated successfully",
      });

      return newKeyValue;
    } catch (error) {
      toast({
        title: "Failed to regenerate API key",
        description: "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "API key has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the key manually",
        variant: "destructive",
      });
    }
  }, []);

  return {
    apiKeys,
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    copyToClipboard,
  };
};