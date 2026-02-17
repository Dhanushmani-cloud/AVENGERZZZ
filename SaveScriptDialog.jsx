import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Save } from 'lucide-react';

export default function SaveScriptDialog({ open, onClose, onSave, defaultTitle = '' }) {
  const [title, setTitle] = useState(defaultTitle);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      setTitle('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Save Script</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm text-slate-400 mb-2">Script Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your script..."
            className="bg-slate-800/50 border-slate-700/50 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
