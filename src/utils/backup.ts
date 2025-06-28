
import { supabase } from "@/integrations/supabase/client";

interface BackupMetadata {
  timestamp: string;
  tables: string[];
  recordCount: number;
  size: string;
}

export class BackupService {
  private static instance: BackupService;

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createDataExport(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Export critical user data
      const tables = ['profiles', 'events', 'tickets', 'favorites'];
      const exportData: any = {};
      let totalRecords = 0;

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          throw new Error(`Failed to export ${table}: ${error.message}`);
        }

        exportData[table] = data;
        totalRecords += data?.length || 0;
      }

      const backup = {
        metadata: {
          timestamp: new Date().toISOString(),
          tables,
          recordCount: totalRecords,
          version: '1.0.0'
        },
        data: exportData
      };

      return { success: true, data: backup };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  }

  async downloadBackup(): Promise<void> {
    const result = await this.createDataExport();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // Create downloadable file
    const dataStr = JSON.stringify(result.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  validateBackup(backupData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!backupData.metadata) {
      errors.push('Missing backup metadata');
    }
    
    if (!backupData.data) {
      errors.push('Missing backup data');
    }
    
    const requiredTables = ['profiles', 'events'];
    for (const table of requiredTables) {
      if (!backupData.data?.[table]) {
        errors.push(`Missing ${table} data`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const backupService = BackupService.getInstance();
