import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Upload, FileJson, AlertCircle, CheckCircle2, 
  RefreshCw, Settings, Database, Info, FileText 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DataExportImportProps {
  password: string;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({ password }) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [importData, setImportData] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/export/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to export data');
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blyskcleaning-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('✅ Дані успішно експортовано!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('❌ Помилка експорту: ' + (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate structure
        if (!data.data) {
          throw new Error('Invalid backup file structure');
        }

        setImportData(data);
        
        // Generate preview
        const preview = {
          version: data.version,
          exportDate: data.exportDate,
          counts: {
            services: data.data.services?.length || 0,
            reviews: data.data.reviews?.length || 0,
            gallery: data.data.gallery?.length || 0,
            blog: data.data.blog?.length || 0,
            contacts: data.data.contacts ? 1 : 0,
            branding: data.data.branding ? 1 : 0,
            heroImages: data.data.heroImages ? 1 : 0,
            benefits: data.data.benefits ? 1 : 0,
            discount: data.data.discount ? 1 : 0,
            pricing: data.data.pricing ? Object.keys(data.data.pricing).length : 0,
            socialMedia: data.data.socialMedia ? 1 : 0,
          }
        };
        
        setImportPreview(preview);
        toast.success('✅ Файл завантажено та перевірено');
      } catch (error) {
        console.error('File parse error:', error);
        toast.error('❌ Невірний формат файлу');
        setImportData(null);
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData) {
      toast.error('❌ Спочатку виберіть файл для імпорту');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/import/all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: importData,
            mode: importMode,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to import data');
      }

      toast.success('✅ Дані успішно імпортовано!');
      
      // Show imported counts
      if (result.imported) {
        const counts = Object.entries(result.imported)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        toast.info(`Імпортовано: ${counts}`);
      }

      // Reset state
      setImportData(null);
      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('❌ Помилка імпорту: ' + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const totalItems = importPreview ? Object.values(importPreview.counts).reduce((a: any, b: any) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Експорт даних
          </CardTitle>
          <CardDescription>
            Завантажити всі налаштування сайту у форматі JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-blue-500/90">
              Експорт включає: послуги, контакти, брендинг, зображення, переваги, знижки, ціни, відгуки, галерею, блог та соцмережі.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
            size="lg"
          >
            {exporting ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Експортування...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Скачати всі дані (JSON)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Import Section */}
      <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Імпорт даних
          </CardTitle>
          <CardDescription>
            Завантажити налаштування з JSON файлу
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500/90">
              <strong>Увага!</strong> Імпорт може змінити або замінити існуючі дані. Рекомендуємо спочатку зробити експорт поточних даних.
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="import-file">Виберіть JSON файл</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
              />
            </div>
          </div>

          {/* Import Mode */}
          <div className="space-y-3">
            <Label>Режим імпорту</Label>
            <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as 'merge' | 'overwrite')}>
              <div className="flex items-start space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="merge" id="merge" />
                <div className="flex-1">
                  <Label htmlFor="merge" className="cursor-pointer">
                    <div className="font-medium">Об'єднати (рекомендовано)</div>
                    <div className="text-sm text-muted-foreground">
                      Додати нові дані, зберігши існуючі. Якщо ID співпадають - оновити.
                    </div>
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="overwrite" id="overwrite" />
                <div className="flex-1">
                  <Label htmlFor="overwrite" className="cursor-pointer">
                    <div className="font-medium text-destructive">Перезаписати (небезпечно)</div>
                    <div className="text-sm text-muted-foreground">
                      Видалити всі існуючі дані та замінити їх на нові з файлу.
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Preview */}
          <AnimatePresence>
            {importPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Separator />
                
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileJson className="w-4 h-4 text-primary" />
                  Попередній перегляд
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="text-xs text-muted-foreground">Версія</div>
                    <div className="text-sm font-medium">{importPreview.version}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="text-xs text-muted-foreground">Дата експорту</div>
                    <div className="text-sm font-medium">
                      {new Date(importPreview.exportDate).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="text-xs text-muted-foreground">Всього записів</div>
                    <div className="text-sm font-medium">{totalItems}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                  {Object.entries(importPreview.counts).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="flex items-center justify-between p-2 rounded bg-accent/30">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-medium">{value as number}</span>
                      </div>
                    )
                  ))}
                </div>

                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <AlertDescription className="text-green-500/90">
                    Файл перевірено та готовий до імпорту
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import Button */}
          <Button 
            onClick={handleImport}
            disabled={!importData || importing}
            className="w-full"
            size="lg"
            variant={importMode === 'overwrite' ? 'destructive' : 'default'}
          >
            {importing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Імпортування...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                {importMode === 'overwrite' ? '⚠️ Перезаписати дані' : 'Імпортувати дані'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-2 border-muted bg-card/30 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Інструкція
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Як редагувати дані в файлі:</strong>
            <ol className="mt-2 space-y-1 list-decimal list-inside ml-2">
              <li>Натисніть "Скачати всі дані (JSON)"</li>
              <li>Відкрийте файл у текстовому редакторі (Notepad++, VS Code, Sublime Text)</li>
              <li>Знайдіть потрібну секцію (services, contacts, branding тощо)</li>
              <li>Відредагуйте значення, зберігаючи структуру JSON</li>
              <li>Збережіть файл</li>
              <li>Завантажте назад через "Імпорт даних"</li>
            </ol>
          </div>
          
          <div className="pt-2">
            <strong className="text-foreground">Порада:</strong> Використовуйте онлайн валідатори JSON 
            (jsonlint.com) для перевірки правильності синтаксису після редагування.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
