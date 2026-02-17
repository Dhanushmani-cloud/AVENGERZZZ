import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clapperboard, Download, Sparkles, FileText, Loader2, Plus, X, Save, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SaveScriptDialog from '../components/SaveScriptDialog';
import MyScripts from '../components/MyScripts';
import { toast } from 'sonner';

export default function Home() {
  const [characters, setCharacters] = useState(['']);
  const [situation, setSituation] = useState('');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentScriptId, setCurrentScriptId] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const scriptRef = useRef(null);
  const queryClient = useQueryClient();

  const addCharacter = () => {
    setCharacters([...characters, '']);
  };

  const removeCharacter = (index) => {
    if (characters.length > 1) {
      setCharacters(characters.filter((_, i) => i !== index));
    }
  };

  const updateCharacter = (index, value) => {
    const updated = [...characters];
    updated[index] = value;
    setCharacters(updated);
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => {
      if (id) {
        return base44.entities.Script.update(id, data);
      }
      return base44.entities.Script.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
      setCurrentScriptId(data.id);
      toast.success('Script saved successfully!');
      setShowSaveDialog(false);
    },
  });

  const handleSaveScript = (title) => {
    const validCharacters = characters.filter(c => c.trim());
    saveMutation.mutate({
      id: currentScriptId,
      data: {
        title,
        characters: validCharacters,
        situation,
        content: script,
      },
    });
  };

  const handleLoadScript = (savedScript) => {
    setCharacters(savedScript.characters || ['']);
    setSituation(savedScript.situation || '');
    setScript(savedScript.content || '');
    setCurrentScriptId(savedScript.id);
    setActiveTab('create');
    toast.success('Script loaded');
  };

  const handleNewScript = () => {
    setCharacters(['']);
    setSituation('');
    setScript('');
    setCurrentScriptId(null);
  };

  const generateScript = async () => {
    const validCharacters = characters.filter(c => c.trim());
    if (validCharacters.length === 0 || !situation.trim()) return;
    
    setIsGenerating(true);
    setScript('');
    
    const characterList = validCharacters.map((char, i) => `${i + 1}. ${char}`).join('\n');
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional screenwriter. Create a compelling, properly formatted screenplay script.

CHARACTERS:
${characterList}

SITUATION: ${situation}

Write a professional screenplay script (1-2 pages) that includes:
- Scene headings (INT./EXT. LOCATION - TIME)
- Action lines (present tense, visual descriptions)
- Character names centered before dialogue
- Dialogue with proper formatting
- Parentheticals where needed for delivery notes

Use ALL the characters listed above in the script. Format it exactly like a professional Hollywood screenplay. Make it dramatic, engaging, and emotionally resonant.`,
    });
    
    setScript(response);
    setIsGenerating(false);
  };

  const downloadPDF = async () => {
    if (!script) return;
    
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Script - ${characters.filter(c => c.trim()).join(' & ') || 'Script'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier Prime', 'Courier New', monospace;
            font-size: 12pt;
            line-height: 1.5;
            padding: 1in;
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            color: black;
          }
          
          .title {
            text-align: center;
            margin-bottom: 2em;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 14pt;
          }
          
          .meta {
            text-align: center;
            margin-bottom: 3em;
            font-size: 10pt;
            color: #666;
          }
          
          .script-content {
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          @media print {
            body {
              padding: 0.5in;
            }
          }
        </style>
      </head>
      <body>
        <div class="title">${characters.filter(c => c.trim()).join(' & ').toUpperCase() || 'SCRIPT'}</div>
        <div class="meta">A Screenplay</div>
        <div class="script-content">${script.replace(/\n/g, '<br>')}</div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25">
              <Clapperboard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
            Script<span className="text-amber-400 font-medium">Forge</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-light">
            Transform your ideas into professional screenplays with AI precision
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-slate-900/50 border border-slate-800/50 p-1">
                <TabsTrigger 
                  value="create" 
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Script
                </TabsTrigger>
                <TabsTrigger 
                  value="saved"
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  My Scripts
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="create">
              {currentScriptId && (
                <div className="mb-6 flex justify-center">
                  <Button
                    onClick={handleNewScript}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Script
                  </Button>
                </div>
              )}
              <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 md:p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-medium text-white">Create Your Script</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-slate-400 font-medium">
                        Characters
                      </label>
                      <Button
                        onClick={addCharacter}
                        variant="ghost"
                        size="sm"
                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 rounded-lg"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {characters.map((char, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={char}
                            onChange={(e) => updateCharacter(index, e.target.value)}
                            placeholder={`Character ${index + 1} (e.g., Detective Sarah Cole)`}
                            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 h-12 rounded-xl focus:ring-amber-500/50 focus:border-amber-500/50"
                          />
                          {characters.length > 1 && (
                            <Button
                              onClick={() => removeCharacter(index)}
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-12 w-12 rounded-xl flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2 font-medium">
                      Situation / Scene Description
                    </label>
                    <Textarea
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      placeholder="Describe the scenario, conflict, or scene you want to bring to life..."
                      rows={6}
                      className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 rounded-xl resize-none focus:ring-amber-500/50 focus:border-amber-500/50"
                    />
                  </div>

                  <Button
                    onClick={generateScript}
                    disabled={isGenerating || !characters.some(c => c.trim()) || !situation.trim()}
                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Crafting Your Script...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Script
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6 md:p-8 rounded-3xl h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-medium text-white">Your Script</h2>
                  </div>
                  
                  <AnimatePresence>
                    {script && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowSaveDialog(true)}
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10 rounded-xl"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={downloadPDF}
                            variant="outline"
                            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div 
                  ref={scriptRef}
                  className="flex-1 bg-slate-950/50 rounded-2xl p-6 overflow-auto min-h-[400px] max-h-[600px]"
                >
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full text-slate-500"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 border-2 border-amber-500/20 rounded-full" />
                          <div className="absolute inset-0 w-16 h-16 border-2 border-amber-500 rounded-full border-t-transparent animate-spin" />
                        </div>
                        <p className="mt-6 text-sm">Generating your screenplay...</p>
                      </motion.div>
                    ) : script ? (
                      <motion.div
                        key="script"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed"
                      >
                        {script}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-slate-600"
                      >
                        <Clapperboard className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-center text-sm">
                          Your generated script will appear here
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          </div>
            </TabsContent>

            <TabsContent value="saved">
              <MyScripts onLoadScript={handleLoadScript} />
            </TabsContent>
          </Tabs>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {[
              { title: 'Professional Format', desc: 'Industry-standard screenplay formatting' },
              { title: 'AI-Powered', desc: 'Intelligent dialogue and scene construction' },
              { title: 'Instant PDF', desc: 'Download ready-to-print scripts' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="text-center p-6 rounded-2xl bg-slate-900/30 border border-slate-800/30"
              >
                <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <SaveScriptDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveScript}
        defaultTitle={characters.filter(c => c.trim()).join(' & ') || ''}
      />
    </div>
  );
}
