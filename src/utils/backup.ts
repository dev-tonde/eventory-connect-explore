import { supabase } from "@/integrations/supabase/client";

/**
 * Metadata for a backup export.
 */
interface BackupMetadata {
  timestamp: string;
  tables: string[];
  recordCount: number;
  size: string;
  version: string;
}

/**
 * Result of a backup operation.
 */
interface BackupResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export class BackupService {
  private static instance: BackupService;

  private constructor() {}

  /**
   * Singleton instance getter.
   */
  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Exports critical user data from the database.
   */
  async createDataExport(): Promise<BackupResult> {
    try {
      const exportData: Record<string, unknown[]> = {};
      let totalRecords = 0;
      const tables = ["profiles", "events", "tickets", "favorites"] as const;

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          throw new Error(`Failed to export ${table}: ${error.message}`);
        }
        exportData[table] = data;
        totalRecords += data?.length || 0;
      }

      const backupStr = JSON.stringify(exportData);
      const metadata: BackupMetadata = {
        timestamp: new Date().toISOString(),
        tables: [...tables],
        recordCount: totalRecords,
        size: `${(backupStr.length / 1024).toFixed(2)} KB`,
        version: "1.0.0",
      };

      const backup = {
        metadata,
        data: exportData,
      };

      return { success: true, data: backup };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      };
    }
  }

  /**
   * Triggers a download of the backup as a JSON file.
   * No user-supplied URLs are used, so no unvalidated URL redirection is possible.
   */
  async downloadBackup(): Promise<void> {
    const result = await this.createDataExport();

    if (!result.success) {
      throw new Error(result.error);
    }

    const dataStr = JSON.stringify(result.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    // Secure download: no user-supplied URLs or redirection
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eventory-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Validates the structure of a backup file.
   */
  validateBackup(backupData: {
    metadata?: BackupMetadata;
    data?: Record<string, unknown>;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!backupData.metadata) {
      errors.push("Missing backup metadata");
    }

    if (!backupData.data) {
      errors.push("Missing backup data");
    }

    const requiredTables = ["profiles", "events"];
    for (const table of requiredTables) {
      if (!backupData.data?.[table]) {
        errors.push(`Missing ${table} data`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const backupService = BackupService.getInstance();
