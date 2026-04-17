/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Send, 
  Settings, 
  ChevronLeft, 
  Languages, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  MessageCircle,
  Coffee,
  Plane,
  Briefcase,
  History,
  GraduationCap,
  Hotel,
  Stethoscope,
  ShoppingBag,
  Home,
  Utensils,
  MapPin,
  Compass
} from 'lucide-react';
import { getTutorResponse } from './lib/gemini';
import { UserProficiency, Message, TutorResponse, PolishingFeedback } from './types';

const SCENARIOS = [
  { id: 'starbucks', name: '星巴克点单', icon: Coffee, desc: 'Ordering at Starbucks' },
  { id: 'airport', name: '机场海关', icon: Plane, desc: 'Passing Airport Customs' },
  { id: 'workplace', name: '职场汇报', icon: Briefcase, desc: 'Workplace Reporting' },
  { id: 'daily', name: '日常闲谈', icon: MessageCircle, desc: 'Casual Daily Conversation' },
  { id: 'hotel', name: '酒店入住', icon: Hotel, desc: 'Checking into a Hotel' },
  { id: 'doctor', name: '看医生', icon: Stethoscope, desc: 'Visiting a Doctor' },
  { id: 'shopping', name: '商场购物', icon: ShoppingBag, desc: 'Shopping at a Mall' },
  { id: 'renting', name: '租房咨询', icon: Home, desc: 'Inquiring about Renting' },
  { id: 'restaurant', name: '餐厅订座', icon: Utensils, desc: 'Making a Restaurant Reservation' },
  { id: 'directions', name: '问路', icon: MapPin, desc: 'Asking for Directions' },
  { id: 'interview', name: '求职面试', icon: GraduationCap, desc: 'Job Interview' },
  { id: 'travel_planning', name: '旅行计划', icon: Compass, desc: 'Travel Planning' },
];

const PROFICIENCIES: UserProficiency[] = ['A1 初级', 'A2 初级', 'B1 中级', 'B2 中高级', 'C1 高级'];

export default function App() {
  const [step, setStep] = useState<'setup' | 'chat'>('setup');
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [proficiency, setProficiency] = useState<UserProficiency>('A2 初级');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState<PolishingFeedback | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user' as const,
        parts: [{ text: m.content }]
      }));

      const res = await getTutorResponse(scenario.name, proficiency, messageContent, history);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: res.dialogue_action.foreign_teacher_reply,
        translation: res.dialogue_action.reply_translation,
        feedback: res.polishing_feedback,
        suggestions: res.app_control.suggested_next_topics
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto show feedback if there's an error or just for the first time
      if (res.polishing_feedback.has_error || messages.length < 2) {
        setShowFeedback(res.polishing_feedback);
      }
    } catch (error) {
      console.error(error);
      // Handle error UI if needed
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: `Hi! I'm your AI English coach. Let's practice ${scenario.desc}. How should we start?`,
        translation: `嗨！我是你的AI英语教练。让我们来练习${scenario.name}吧。我们该如何开始？`
      }
    ]);
    setStep('chat');
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans p-6 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
              <Sparkles className="text-orange-500 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">LinguistAI</h1>
            <p className="text-gray-500">顶尖AI英语外教与语料分析引擎</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
              <History className="w-4 h-4" /> 选择场景 Scenario
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                    scenario.id === s.id 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <s.icon className={`w-6 h-6 mb-2 ${scenario.id === s.id ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className="font-semibold text-sm">{s.name}</span>
                  <span className="text-[10px] opacity-60 uppercase">{s.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" /> 英语水平 Proficiency
            </label>
            <div className="flex flex-wrap gap-2">
              {PROFICIENCIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setProficiency(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    proficiency === p 
                    ? 'bg-[#141414] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startChat}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            开始对话 Start Practice <ChevronLeft className="rotate-180 w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div className="fixed inset-0 bg-[#F9F9F7] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => setStep('setup')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold">{scenario.name}</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{proficiency}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`
                  inline-block p-4 rounded-3xl shadow-sm
                  ${m.role === 'user' 
                    ? 'bg-[#141414] text-white rounded-tr-none' 
                    : 'bg-white text-[#141414] rounded-tl-none border border-gray-100'}
                `}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                
                {m.role === 'assistant' && m.translation && (
                  <div className="mt-2 flex items-start gap-1 justify-start">
                    <Languages className="w-3 h-3 text-gray-400 mt-1 shrink-0" />
                    <p className="text-xs text-gray-400 italic font-serif">{m.translation}</p>
                  </div>
                )}

                {m.role === 'assistant' && m.feedback && (
                  <button 
                    onClick={() => setShowFeedback(m.feedback!)}
                    className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> 查看纠错与地道表达
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-gray-100 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Control Panel */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 space-y-4 absolute bottom-0 left-0 right-0 z-20">
        {/* Quick Suggestions */}
        {!isLoading && lastAssistantMsg?.suggestions && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {lastAssistantMsg.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap bg-white border border-gray-200 px-4 py-2 rounded-full text-xs text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            />
            <button 
              onClick={() => handleSend()}
              className={`absolute right-2 top-2 p-2 rounded-xl transition-all ${input ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-gray-400'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <button className="w-[52px] h-[52px] bg-[#141414] text-white rounded-2xl flex items-center justify-center hover:bg-black transition-colors active:scale-95 shadow-xl shadow-gray-200">
            <Mic className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Feedback Modal Overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFeedback(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-orange-500 w-5 h-5" />
                    <h3 className="font-bold text-lg">AI Feedback</h3>
                  </div>
                  <button onClick={() => setShowFeedback(null)} className="text-gray-300 hover:text-gray-500">
                    <ChevronLeft className="rotate-90 w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Correction section */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                      {showFeedback.has_error ? <AlertCircle className="w-3 h-3 text-red-400" /> : <CheckCircle2 className="w-3 h-3 text-green-400" />}
                      语法与纠错 Grammar
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {showFeedback.grammar_correction || 'Expression is perfect! Keep it up.'}
                      </p>
                    </div>
                  </div>

                  {/* Idiomatic expressions */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#141414] mb-3">
                      <RefreshCw className="w-3 h-3 text-orange-500" />
                      地道润色 Native Polish
                    </div>
                    <div className="space-y-3">
                      {showFeedback.native_expressions.map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#141414] text-white shadow-lg">
                          <p className="font-mono text-sm mb-1 leading-snug">"{exp.phrase}"</p>
                          <p className="text-[10px] text-gray-400 font-serif leading-relaxed line-clamp-2">{exp.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowFeedback(null)}
                  className="w-full mt-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100"
                >
                  Got it! 继续练习
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

